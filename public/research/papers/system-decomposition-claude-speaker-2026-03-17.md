# System Decomposition: Claude Speaker

**Date:** 2026-03-17
**Mode:** Greenfield
**Author:** Ade + Claude

---

## 1. Purpose

Enable hands-free, voice-driven interaction with Claude Code through a physical speaker unit so the user can accomplish any task Claude Code can do -- without looking at or touching a computer.

---

## 2. Domain Model

### Objects

| Object | Properties | Description |
|--------|-----------|-------------|
| **User** | voice profile, preferences, confirmation rules | The human speaking |
| **Speaker Unit** | device ID, network address, mic state, speaker state, wake word | The physical Raspberry Pi hardware (mic + speaker + wake word detector) |
| **Brain** | Claude Code instance, session state, working directory | The Pi5 running Claude Code -- the compute engine |
| **Session** | state (idle/listening/processing/speaking), conversation history, context | An active voice interaction |
| **Utterance** | raw audio, transcript, timestamp, confidence | A captured voice input after wake word |
| **Task** | type, status, result, confirmation_required, risk_level | Something Claude is executing |
| **Response** | text, audio bytes, type (answer/question/confirmation_request/notification) | Claude's output to be spoken |

### Links

```
User --speaks to--> Speaker Unit
Speaker Unit --captures--> Utterance
Speaker Unit --sends transcript--> Brain
Brain --processes via--> Claude Code
Brain --produces--> Response
Brain --sends audio--> Speaker Unit
Speaker Unit --plays to--> User
Task --may require--> Confirmation (voice yes/no from User)
```

### Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| `wake` | Wake word detected | Transition from idle to listening |
| `capture` | Post-wake silence detection | Record audio until user stops speaking |
| `transcribe` | Capture complete | Convert audio to text |
| `process` | Transcript received | Send to Claude Code, execute task |
| `confirm` | High-risk action detected | Ask user for voice approval before executing |
| `synthesize` | Response text ready | Convert text to speech audio |
| `play` | Audio ready | Output through speaker |
| `notify` | Claude-initiated | Proactive audio output (task complete, error, etc.) |
| `sleep` | Silence timeout | Return to idle, listening only for wake word |

---

## 3. Functional Decomposition

### 1.0 Wake Word Detection
Continuously listen for wake word using minimal resources. Must run 24/7 with low CPU/power.
- **Input:** Raw mic audio stream
- **Output:** Wake event trigger
- **Resource:** ~5% CPU continuously

### 2.0 Audio Capture
After wake, record the user's speech until they stop.
- **Input:** Wake trigger, raw mic audio
- **Output:** Audio segment (WAV/PCM)
- 2.1 Voice Activity Detection (VAD) -- detect when user starts/stops speaking
- 2.2 Noise filtering -- handle ambient noise, echo from speaker output
- 2.3 Segment extraction -- clip the relevant audio

### 3.0 Speech-to-Text
Convert audio segment to text transcript.
- **Input:** Audio segment
- **Output:** Text transcript + confidence score
- 3.1 API call to OpenAI Whisper API (same vendor as TTS, simplifies billing/integration)
- 3.2 Future: swap to local whisper.cpp (base.en) to eliminate STT API cost if needed

### 4.0 Command Processing
Send transcript to Claude Code and manage execution.
- **Input:** Text transcript, session context
- **Output:** Response text, task status
- 4.1 Session management -- maintain conversation context across turns
- 4.2 Claude Code invocation -- `claude -p` with session context
- 4.3 Confirmation routing -- detect high-risk actions, interrupt for approval
- 4.4 Task execution -- let Claude Code do its thing (code, research, email, etc.)

### 5.0 Text-to-Speech
Convert Claude's response to natural-sounding audio.
- **Input:** Response text
- **Output:** Audio stream/file
- 5.1 API call to TTS service (OpenAI tts-1 recommended for quality/cost)
- 5.2 Streaming -- start playing audio before full response is synthesized
- 5.3 Fallback to Piper (local) if network unavailable

### 6.0 Audio Playback
Output audio through the speaker.
- **Input:** Audio stream/file
- **Output:** Sound waves
- 6.1 Volume management
- 6.2 Interrupt handling -- stop playback if user says wake word mid-response
- 6.3 Notification sounds -- distinct tones for wake acknowledgment, errors, task completion

### 7.0 Network Communication
Handle data flow between Speaker Unit and Brain (if separate devices), or between subsystems on same device.
- **Input/Output:** Transcripts, audio, commands, status
- 7.1 API server on Brain for receiving transcripts
- 7.2 Audio streaming from Brain to Speaker Unit
- 7.3 Health checks and reconnection

---

## 4. Interface Map

### N² Analysis

```
             | 1.Wake | 2.Capture | 3.STT | 4.Process | 5.TTS | 6.Play | 7.Network |
-------------|--------|-----------|-------|-----------|-------|--------|-----------|
1. Wake      |   --   | trigger   |       |           |       |        |           |
2. Capture   |        |    --     | audio |           |       |        |           |
3. STT       |        |           |  --   | transcript|       |        | (API call)|
4. Process   |        |           |       |    --     | text  |        | (claude)  |
5. TTS       |        |           |       |           |  --   | audio  | (API call)|
6. Play      | (int.) | (int.)    |       |           |       |  --    |           |
7. Network   |        |           | resp  | resp      | resp  | stream |    --     |
```

### Key Findings

**Tightly coupled cluster: 1-2-3 (Audio Input Pipeline)**
Wake -> Capture -> STT is a linear, tightly-sequenced pipeline. These three functions share the microphone resource and must coordinate on audio stream ownership. Natural subsystem.

**Tightly coupled cluster: 5-6 (Audio Output Pipeline)**
TTS -> Playback share the speaker resource and benefit from streaming integration. Natural subsystem.

**Hub component: 4.Process**
Command Processing connects to everything. It receives from STT, sends to TTS, manages sessions, invokes Claude Code. This is the orchestrator -- the single most critical component.

**Hub component: 7.Network**
If using two devices, Network touches STT (API calls), Process (Claude Code), and TTS (API calls). But if everything runs on one Pi5, this component simplifies dramatically.

**Interrupt feedback loop: 6.Play -> 1.Wake**
If the user says the wake word while Claude is speaking, playback must stop and the system must re-enter listening mode. This is the trickiest interaction -- the mic must filter out the speaker's own audio (acoustic echo cancellation).

**Orphan check:** No orphans. All components have connections.

---

## 5. Subsystem Boundaries

Based on the N² analysis, three natural subsystems emerge:

### Subsystem A: Audio Input
Components: 1.0 Wake, 2.0 Capture, 3.0 STT
- Owns the microphone resource
- Responsibility: convert ambient sound into text transcripts
- Interface out: sends transcript string to Orchestrator

### Subsystem B: Orchestrator
Components: 4.0 Process, 7.0 Network
- Owns the Claude Code connection and session state
- Responsibility: receive transcripts, invoke Claude Code, manage confirmations, route responses
- Interface in: transcript from Audio Input
- Interface out: response text to Audio Output

### Subsystem C: Audio Output
Components: 5.0 TTS, 6.0 Play
- Owns the speaker resource
- Responsibility: convert text responses into audible speech
- Interface in: response text from Orchestrator
- Can be triggered by Orchestrator proactively (notifications)

### Architecture Decision: One Device vs. Two

The N² analysis reveals that if we use two separate Pi devices, Network (7.0) becomes a load-bearing component touching every subsystem. This adds latency, failure modes, and complexity.

**Recommendation: Run everything on the Pi5.** The Pi5 has 8GB RAM and a quad-core A76. It can handle wake word detection, OpenAI Whisper API/OpenAI API calls, and Claude Code simultaneously. A second device only makes sense for multi-room setups (which we've scoped out).

This **deletes component 7.0 entirely** for v1. Subsystems communicate via local function calls or Unix pipes, not network.

---

## 6. Algorithm Pass (Eliminations)

### Step 1: Question Every Requirement

| Requirement | Question | Disposition |
|-------------|----------|-------------|
| Separate speaker controller device | Do we need two Pis? Pi5 can run everything. | **DELETE** -- one device, no network overhead |
| Local STT fallback (Whisper on Pi) | Will user really use this offline? Claude Code needs internet anyway. | **DELETE** -- if internet is down, nothing works. Don't build offline fallback for v1. |
| Local TTS fallback (Piper) | Same reasoning. | **DELETE for v1** -- revisit if latency is a problem |
| Voice Activity Detection | Can we use a simpler approach? | **SIMPLIFY** -- use silence detection (e.g., 1.5s of silence = done speaking) rather than sophisticated VAD |
| Noise filtering | Is this needed for a home environment? | **SIMPLIFY** -- rely on the ReSpeaker's onboard DSP for noise suppression, don't build custom |
| Volume management | Can speaker just be set once? | **DELETE** -- use OS-level volume, don't build a custom volume system |
| Notification sounds | Do we need custom tones? | **SIMPLIFY** -- a simple beep for "I'm listening" and "I'm done." Two sounds total. |
| Multi-turn session context | How much history to maintain? | **SIMPLIFY** -- use Claude Code's built-in session management rather than building custom |
| Network health checks | Deleted with the two-device architecture. | **DELETE** |

### Step 2: Deleted Components

| Deleted | Reason | Impact |
|---------|--------|--------|
| Second Pi device | Pi5 handles everything; eliminates network complexity | Saves ~$35+ hardware, removes entire Network subsystem |
| Component 7.0 (Network) | No separate devices | Eliminates latency, failure modes, ~30% of codebase |
| Local STT fallback | Claude Code needs internet anyway | Simpler audio pipeline, no Whisper dependency |
| Local TTS fallback | Same reasoning | Simpler output pipeline |
| Volume management system | OS handles this | Less code |
| Network health/reconnection | No network between devices | Less code |

**10% add-back check:** We deleted 6 items. If we add back 1, we're at ~17%. We may want to add back local TTS (Piper) later if API latency proves annoying -- but not for v1.

### Step 3: Simplifications

| Before | After |
|--------|-------|
| Sophisticated VAD with ML | Silence detection: 1.5s quiet = done |
| Custom noise filtering pipeline | ReSpeaker onboard DSP handles it |
| Custom notification sound system | Two beeps: "listening" and "done" |
| Custom session management | Claude Code's built-in conversation context |
| Complex confirmation system | Simple: Claude says the action + price/vendor, waits for "yes" or "no" |

### Step 4: Acceleration Opportunities

**Critical path:** Wake -> Capture -> STT -> Claude Code -> TTS -> Play

The bottleneck is **sequential waiting**. Opportunities to parallelize:

1. **Stream TTS while Claude is still generating.** Don't wait for the full Claude response. Send the first sentence to TTS while Claude generates the rest.
2. **Stream audio playback while TTS generates.** Don't wait for full audio file. Play chunks as they arrive.
3. **Pre-warm STT connection.** Open the OpenAI Whisper API WebSocket on wake, before capture is complete, so transcription starts as the user speaks.

With streaming: Wake (~0ms) -> Capture (user speaking) -> STT streams in real-time (~300ms after speech ends) -> Claude Code (1-3s) -> TTS streams first chunk (~300ms) -> Playback begins.

**Estimated end-to-end: 2-4 seconds from end of speech to first audio response.** This is conversational speed.

### Step 5: Automation Candidates

| What | When |
|------|------|
| Auto-start on boot | Systemd service, from day 1 |
| Auto-reconnect STT/TTS on API failure | Retry with backoff, from day 1 |
| Scheduled notifications | Later -- "remind me at 5pm" type features |

---

## 7. Risk/Value Assessment

| Subsystem | Value | Risk | Quadrant | Rationale |
|-----------|-------|------|----------|-----------|
| **Audio Input (Wake + Capture + STT)** | HIGH | MEDIUM | Build first | Core functionality. Wake word + STT are well-understood, but mic hardware + echo cancellation has unknowns. |
| **Orchestrator (Claude Code integration)** | HIGH | HIGH | Build first | The entire value prop. `claude -p` should work but session management, streaming, and confirmation flow are unproven. |
| **Audio Output (TTS + Play)** | HIGH | LOW | Build second | Essential but straightforward. API call + aplay. Streaming adds some complexity. |
| **Confirmation System** | MEDIUM | LOW | Build second | Important for safety (purchases) but simple logic once orchestrator exists. |
| **Interrupt Handling (wake during playback)** | MEDIUM | HIGH | Defer to v2 | Acoustic echo cancellation is hard. For v1, user can wait for Claude to finish. |
| **Streaming Pipeline** | HIGH | MEDIUM | Build after skeleton | Huge UX improvement but not required for basic functionality. |

---

## 8. Dependency Map

```
[Audio Input] ──────> [Orchestrator] ──────> [Audio Output]
     |                      |                      |
     |                      v                      |
     |              [Confirmation]                 |
     |                      |                      |
     └──── depends on ──> [Hardware Setup] <── depends on ───┘
```

- **Hardware Setup** blocks everything -- need mic + speaker + Pi working
- **Audio Input** and **Audio Output** are independent of each other, can be built in parallel
- **Orchestrator** depends on Audio Input (needs transcripts to process)
- **Confirmation** depends on Orchestrator + Audio Output (needs both to ask and hear answers)
- **Streaming** is an enhancement to the basic pipeline, not a blocker

---

## 9. Build Plan

### Phase 0: Walking Skeleton
**Goal:** Prove the full loop works end-to-end, even ugly.

Build the thinnest possible slice: speak into mic -> get text -> send to Claude Code -> get response -> play through speaker. No wake word. No streaming. No confirmations. Just the raw pipe.

```bash
# The entire walking skeleton as a bash script:
# 1. Record 5 seconds of audio
arecord -D plughw:1,0 -f cd -t wav -d 5 /tmp/input.wav
# 2. Transcribe via OpenAI Whisper API
TRANSCRIPT=$(curl -s -X POST "https://api.openai.com/v1/audio/transcriptions" \
  -H "Authorization: Bearer $OPENAI_KEY" \
  -F model="whisper-1" \
  -F file="@/tmp/input.wav" | jq -r '.text')
# 3. Send to Claude Code
RESPONSE=$(echo "$TRANSCRIPT" | claude -p)
# 4. Synthesize speech via OpenAI TTS
curl -s -X POST "https://api.openai.com/v1/audio/speech" \
  -H "Authorization: Bearer $OPENAI_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"tts-1\",\"input\":\"$RESPONSE\",\"voice\":\"onyx\"}" \
  --output /tmp/response.mp3
# 5. Play it
mpv /tmp/response.mp3
```

**What this proves:**
- Mic captures usable audio on the Pi
- OpenAI Whisper API transcribes accurately
- Claude Code responds via `-p`
- OpenAI TTS produces good audio
- Speaker plays back clearly

**What this does NOT prove (and that's fine):**
- Wake word detection
- Streaming latency
- Multi-turn conversations
- Confirmation flow

**Gravel road:** This is literally a bash script. Ship it in an afternoon.

### Phase 1: Core Loop
**Subsystems:** Audio Input + Orchestrator + Audio Output as a Python application

**Scope:**
- openWakeWord running continuously, triggers capture
- OpenAI Whisper API streaming STT (transcribes as user speaks)
- Orchestrator sends transcript to `claude -p`, captures response
- OpenAI TTS generates audio, plays through speaker
- Simple beep on wake ("I'm listening") and on response start
- Basic error handling (API failures, mic issues)

**Key risks:**
- openWakeWord accuracy and false positive rate on Pi5
- Acoustic echo: speaker output triggering false wake words
- `claude -p` latency and output format handling

**Gravel road:** Single Python script with an event loop. Not a framework, not microservices. One file, sequential flow.

### Phase 2: Conversational Flow
**Subsystems:** Session management + Confirmation system

**Scope:**
- Multi-turn conversation: Claude remembers context within a session
- Session timeout: returns to idle after 2 minutes of silence
- Confirmation flow: Claude identifies purchases/destructive actions, asks "Should I proceed? That's $X from Y", waits for yes/no
- "Cancel" / "Stop" voice commands

**Gravel road:** Add session state to the Python script. Use Claude Code's `--resume` or conversation ID for multi-turn.

### Phase 3: Streaming and Polish
**Subsystems:** Streaming pipeline + UX improvements

**Scope:**
- Stream Claude's response to TTS in chunks (sentence-by-sentence)
- Stream TTS audio to speaker as chunks arrive
- Pre-warm OpenAI Whisper API WebSocket on wake
- Target: first audio response < 2 seconds after user stops speaking
- Interrupt: user can say wake word to stop Claude mid-response (basic version: pause playback, restart listening)

**Gravel road:** Swap batch API calls for streaming WebSocket/SSE connections.

### Phase 4: Robustness (if needed)
**Scope (only build if problems emerge):**
- Acoustic echo cancellation (if false wakes are a real problem)
- Local STT/TTS fallback (if API reliability is a problem)
- Scheduled tasks / proactive notifications
- Multiple wake words or "Hey Claude" custom training

---

## 10. Open Questions

1. **OpenAI Whisper API latency** -- need to validate round-trip time from Pi5 with the walking skeleton. If too slow, can swap to local whisper.cpp or try Deepgram for streaming STT.

2. **OpenAI TTS voice selection** -- "onyx" is a good default male voice, "nova" for female. User should pick during Phase 1.

3. **Wake word phrase** -- "Hey Claude"? "Claude"? Something else? openWakeWord may have a pre-trained model, or we may need to train a custom one.

4. **Claude Code session management** -- need to verify `claude -p` supports `--resume` or equivalent for multi-turn. If not, we may need the SDK instead.

5. **Power/heat** -- Pi5 running 24/7 with continuous wake word detection. Need to verify thermals are acceptable. A fan/heatsink case is probably needed.

6. **Enclosure** -- 3D printed case? Off-the-shelf Pi case + external speaker? This is a hardware design question outside the software decomposition.

7. **API costs** -- OpenAI Whisper API (~$0.0043/min of audio) + OpenAI TTS (~$0.015/1K chars). For moderate daily use (30 min audio in, ~50K chars out), estimate ~$1-2/day. Acceptable?

---

## Hardware Shopping List (Minimal MVP)

| Item | Purpose | Est. Cost |
|------|---------|-----------|
| Raspberry Pi 5 (8GB) | Brain -- already owned | $0 |
| USB microphone | Voice capture | ~$20 |
| USB speaker | Audio output | ~$15 |
| Pi5 active cooler or heatsink case | Thermal management for 24/7 operation | ~$10-15 |
| microSD card (32GB+) | OS + application | ~$10 |
| USB-C power supply (27W) | Pi5 power | ~$12 |
| **Total (excluding Pi5)** | | **~$70** |

**Future upgrade path:** ReSpeaker USB Mic Array (~$35) for far-field pickup + HiFiBerry DAC2 Pro (~$35) + quality speaker for better audio. But prove the concept first with cheap USB peripherals.

## Estimated API Costs

| Service | Rate | Daily estimate (moderate use) | Monthly |
|---------|------|-------------------------------|---------|
| OpenAI Whisper API (STT) | $0.006/min | ~$0.18 (30 min input) | ~$5.40 |
| OpenAI TTS (tts-1) | $0.015/1K chars | ~$0.75 (50K chars output) | ~$22.50 |
| Claude Code (Anthropic API) | usage-based | varies by task complexity | varies |
| **Total (excl. Claude)** | | **~$1/day** | **~$28/mo** |

Future cost reduction: swap OpenAI Whisper API for local whisper.cpp to cut STT cost to $0.
