# Raspberry Pi Voice Agent Device: Production-Ready Hardware and Software Architecture Research Brief

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

For a Raspberry Pi voice agent intended to work in real homes and offices, the best production-ready architecture in 2026 is not a "Pi does everything" design. The practical winning pattern is a **split front end / back end architecture**: a **far-field audio front end with dedicated DSP** for microphone processing and echo control, combined with a **Raspberry Pi 5** as the application host for orchestration, local wake word, local fallback speech/NLU, networking, telemetry, and policy enforcement.

The central reason is simple: the hardest part of a good voice device is still **audio capture under imperfect acoustic conditions**, not the LLM. Real rooms add TV audio, music playback, HVAC noise, reverb, keyboard clicks, fan noise, crosstalk, and speaker-to-mic echo. Current evidence from Home Assistant, XMOS, WebRTC, and production voice vendors points to the same conclusion: if the device cannot consistently deliver clean 16 kHz mono speech into the pipeline, every downstream component degrades. In production terms, this means microphone geometry, beamforming, AEC, gain control, and barge-in behavior matter more than squeezing the last few points of STT accuracy out of a large local model.

The strongest current reference design is: **Raspberry Pi 5 + XMOS-class audio front end + local wake word + local VAD + streaming-first pipeline + two-tier STT + streaming TTS + explicit confirmation policy for risky actions**. For most products, the best software stack is **hybrid** rather than purely local. Keep wake word, VAD, audio routing, confirmations, and a narrow command path on-device. Use either cloud STT/TTS for open-domain conversation or a local fallback path for privacy/offline continuity. A pure offline, open-ended, low-latency conversational agent on a Pi is still possible, but it remains a compromise in responsiveness, multilingual coverage, or accuracy.

The most decision-useful conclusion is this: if the goal is a dependable production device rather than an impressive demo, optimize for **deterministic audio behavior, interruption handling, recovery from partial failure, and policy-based confirmations**, not maximum local model size. The architecture should treat the voice stack as a real-time system with a strict latency budget, explicit degraded modes, and action gating for anything irreversible, ambiguous, or safety-sensitive.

## Assumptions and Scope

- **Primary use case:** always-on far-field voice agent for home/office ambient conditions, not a headset or push-to-talk device.
- **Hardware baseline:** Raspberry Pi 5 is the main compute target. Raspberry Pi 4 can work for narrower/offline pipelines, but it is not the strongest production default.
- **Environment:** typical room acoustics with reverberation, intermittent media playback, appliance/fan noise, and occasional overlapping speech.
- **Product goal:** reliable voice control/agent behavior, not merely local transcription benchmarks.
- **Privacy goal:** local-first where practical, but not strict air-gapped operation unless stated.
- **Uncertainty note:** some vendor performance claims, especially around latency and VAD accuracy, are self-reported. They are included where relevant and labeled as such.

## Current Landscape

### The architecture patterns that matter now

The market has converged on four broad patterns:

1. **Managed cloud voice stack**
   Devices keep local wake word and audio capture, then stream speech to a managed STT/TTS or speech-to-speech provider.
   Best when open-domain conversation, multilingual quality, and fast iteration matter more than strict privacy.

2. **Hybrid edge/cloud stack**
   Local wake word, VAD, routing, and command fallback stay on-device. Open-ended speech goes to cloud STT/TTS or Realtime voice APIs. This is currently the most practical pattern for Raspberry Pi products.

3. **Fully local command stack**
   Best for privacy-first home control and deterministic actions. Home Assistant's Speech-to-Phrase is the clearest recent example: on February 13, 2025, Home Assistant reported sub-second local command transcription on Home Assistant Green or Raspberry Pi 4, and about **150 ms per command on Raspberry Pi 5**, with the important limitation that it only supports constrained phrase domains rather than open-ended speech.

4. **Fully local open-ended assistant**
   Possible using Whisper-class STT plus local TTS and local LLMs, but still operationally difficult on Pi-class hardware for always-on, real-room use. Home Assistant explicitly noted in February 2025 that the then-recommended Whisper path took **at least 5 seconds on Raspberry Pi 4** for transcription and led them to recommend at least an Intel N100 for full local voice.

## Recent Developments

- **Reference hardware improved materially.** Home Assistant launched **Voice Preview Edition** on December 19, 2024 as a standardized open voice device with **dual microphones**, an **XMOS XU316** audio processor, physical mute, speaker, and open firmware. Its product page explicitly lists **echo cancellation, stationary noise removal, and auto gain control** in hardware.
- **Open local command speech improved materially.** Home Assistant's **Speech-to-Phrase** release on **February 13, 2025** changed the economics of local voice for smart-home command sets on Raspberry Pi-class hardware.
- **Satellite software is moving toward richer device protocols.** The older `wyoming-satellite` project is now archived and says it has been replaced by **Linux Voice Assistant** using the **ESPHome protocol**, adding newer features such as media playback, stop wake word, start/continue conversation, and timers.
- **Low-latency cloud voice APIs kept improving.** OpenAI positioned `gpt-realtime` as a production-ready voice model in 2025. Deepgram introduced **Flux** on **October 2, 2025** as a conversational STT model with integrated turn detection. Cartesia and ElevenLabs continued pushing low-latency streaming TTS. This makes hybrid architectures stronger than they were even 12 months ago.

## Key Players

### Hardware and audio front-end

- **Raspberry Pi**
  Pi 5 is the practical default compute base. Raspberry Pi says Pi 5 uses a **quad-core Cortex-A76 at 2.4 GHz**, is **2-3x faster than the previous generation**, and recommends a **5V/5A** supply for full peripheral headroom.

- **XMOS**
  XMOS is the most important enabler for production far-field audio at this scale. The **XVF3800** datasheet advertises 4-mic far-field processing, beamforming, de-reverberation, AGC, and full-duplex AEC. Home Assistant's Voice PE uses the **XMOS XU316** for on-device audio processing.

- **Open Home Foundation / Home Assistant**
  The most credible open reference stack for privacy-first voice satellites on inexpensive hardware. Important because it spans device firmware, wake words, transport, STT, TTS, and recent real-world iteration.

- **Seeed / ReSpeaker ecosystem**
  Still relevant as off-the-shelf microphone-array hardware for Pi prototypes, though the strongest production lesson from the last 18 months is to favor standardized, DSP-assisted front ends rather than raw USB microphones.

### Wake word and VAD

- **openWakeWord**
  Important open wake word engine. Home Assistant says it is their default wake-word engine and describes a training pipeline using Piper-generated synthetic speech plus augmentation for distance, room conditions, speed, and background noise.

- **microWakeWord**
  Increasingly relevant for smaller devices and the Home Assistant ecosystem. Home Assistant said in February 2025 it was adding a `microWakeWord` add-on and retraining models with more real-world samples.

- **Picovoice**
  The strongest commercial embedded specialist in this category. Picovoice markets **Porcupine** for wake word and **Cobra** for VAD. Their Cobra page claims deep-learning VAD with "doubling the accuracy of WebRTC VAD"; this is a vendor claim, but the positioning is consistent with their long-standing focus on edge deployment.

### STT

- **OpenAI Whisper ecosystem**
  Still the dominant open foundation for open-domain local STT, usually via `whisper.cpp` or `faster-whisper`, but on Raspberry Pi the tradeoff remains latency versus quality.

- **Vosk**
  Mature offline STT option, lighter and easier on edge hardware, usually weaker than Whisper for broad open speech but useful for constrained/offline fallback.

- **Home Assistant Speech-to-Phrase**
  Not a general STT engine, but extremely important as a production option for deterministic home-control speech on low-power hardware.

- **Deepgram, Google Cloud, Azure Speech**
  Strong cloud STT providers for hybrid architectures. Deepgram is particularly relevant for voice-agent-style streaming; Google and Azure remain enterprise defaults for broad language support and managed operations.

### TTS

- **Piper**
  The strongest open local TTS option in this segment. Its README describes it as a fast local neural TTS system "optimized for the Raspberry Pi 4," with arm64 and armv7 binaries and broad language coverage.

- **ElevenLabs and Cartesia**
  Strong cloud TTS providers when low latency and naturalness matter more than local execution. ElevenLabs documents **~75 ms** latency for `Flash v2.5`; Cartesia documents **90 ms model latency** for `sonic-2` and claims **as low as 40 ms** for `sonic-turbo`.

### Realtime voice orchestration

- **OpenAI Realtime API**
  Important for speech-to-speech or tightly integrated low-latency cloud agents.

- **Deepgram Flux**
  Important because it collapses some of the traditional STT + VAD + endpointing complexity into a conversation-focused STT model.

- **Home Assistant / Wyoming / ESPHome protocol stack**
  Important for local/home deployments and for modularity across wake word, STT, TTS, and satellites.

## Core Concepts

### 1. Far-field capture is the real bottleneck

In real rooms, the quality of the microphone signal entering wake word and STT dominates the system outcome. DSP front-end quality has first-order impact on:

- wake-word false accepts and false rejects
- VAD onset/offset quality
- barge-in reliability during TTS playback
- STT latency, because noisy streams require more backend recovery
- user trust, because repeated "sorry, I didn't catch that" failures quickly destroy adoption

### 2. Echo cancellation is a system problem, not a single feature

AEC only works well when the device has clean access to:

- the rendered playback reference
- stable latency between render and capture paths
- known microphone and speaker geometry
- consistent sample rate and buffering

This is why **hardware DSP or tightly integrated audio routing** consistently beats ad hoc user-space piping. PulseAudio's `module-echo-cancel` and WebRTC AEC remain useful, and Linux Voice Assistant explicitly recommends WebRTC AEC through PulseAudio, but the most robust design is to do as much AEC as possible in the front-end DSP or a tightly controlled audio stack.

### 3. Wake word and VAD should be local

For an always-on device, shipping raw continuous audio to a server before local gating is a poor default unless there is a specific product reason. Local wake word and local VAD reduce:

- network dependence
- privacy exposure
- server load
- perceived latency

They also make degraded/offline modes easier to implement.

### 4. STT should usually be two-tier

A production device should not send every utterance through the same path. A better approach:

- **Tier 1:** fast local constrained parser for device/home commands
- **Tier 2:** richer open-domain STT for long-tail or conversational queries

This materially improves both latency and reliability. Home Assistant's new local-first command routing is a strong validation of this pattern.

### 5. Confirmation policy must be explicit

"Are you sure?" should not be treated as a UI afterthought. The device needs a formal **action risk policy**:

- no confirmation for low-risk idempotent actions
- soft confirmation for ambiguous actions
- hard confirmation for high-cost, destructive, security-sensitive, or safety-sensitive actions

Without this, a voice agent may feel smooth in demos but unsafe in production.

## Recommended Production Architecture

## Hardware Architecture

### Recommended baseline

- **Main compute:** Raspberry Pi 5, preferably **8 GB** for hybrid/open-ended stacks and **4 GB** for narrower command-centric stacks.
- **Storage:** SSD over PCIe or high-quality storage; avoid cheap SD-only deployments for production reliability.
- **Power:** use Raspberry Pi's recommended **5V/5A** class supply, especially if powering USB audio accessories.
- **Cooling:** active cooling. Sustained voice workloads are not heavy like vision inference, but thermal throttling still creates latency variance.

### Recommended audio front end

Best production path:

- **Separate audio front end with DSP**, ideally XMOS-class, exposing clean mono PCM to the Pi.
- **2-mic minimum**, **4-mic preferred** if enclosure size and cost allow.
- **Physical mute switch** that cuts microphone power, not merely software mute.
- **Dedicated playback reference path** for AEC.

Most production-ready reference choices:

1. **Home Assistant Voice Preview Edition-class design**
   Dual mics, XMOS XU316, built-in speaker, mute switch, open firmware. Best current open reference for "works in the home" product behavior.

2. **Custom or semi-custom XMOS XVF3800-class front end**
   Best if the goal is a commercial product with more control over industrial design and stronger far-field performance.

3. **Raw USB microphone arrays without DSP**
   Acceptable for prototyping, not the best default for production if the device will speak while listening.

### Microphone and speaker guidance

- Put microphones on the top or forward edge, not recessed beside a noisy fan or rear speaker port.
- Keep the speaker acoustically separated from the mic array as much as enclosure constraints allow.
- If media playback matters, prefer an external speaker path or better enclosure tuning; otherwise the device's own TTS playback becomes the hardest echo source.

## Software Architecture

### Pipeline overview

1. **Capture layer**
   DSP front end outputs 16 kHz mono PCM to the Pi.

2. **Local wake layer**
   Run local wake word continuously.
   Default open option: `openWakeWord` or `microWakeWord`.
   Commercial option: Picovoice Porcupine.

3. **Local VAD / endpointing**
   Use local VAD to gate streaming and endpoint turns.
   Open option: Silero/WebRTC-derived path.
   Commercial option: Picovoice Cobra.

4. **Session router**
   Decide whether the utterance goes to:
   - local constrained command path
   - cloud or local open-domain STT
   - direct duplex speech-to-speech path

5. **STT/NLU layer**
   - **Constrained command path:** Speech-to-Phrase-like parser, or equivalent local grammar/intent path.
   - **Open path:** managed streaming STT or local Whisper-class decoder if latency is acceptable.

6. **Policy engine**
   Normalize intent, attach confidence, detect ambiguity, and apply action confirmation rules.

7. **TTS layer**
   Stream first audio as soon as possible.
   Local default: Piper.
   Cloud premium path: ElevenLabs, Cartesia, or equivalent if naturalness/latency justify dependency.

8. **Playback / barge-in layer**
   Support interruption while TTS is playing.
   On barge-in, pause/duck playback, preserve playback reference for AEC, and reopen VAD quickly.

9. **Telemetry and degraded-mode controller**
   Track wake misses, false accepts, endpointer errors, AEC divergence, STT timeout, network failure, and fallback rates.

## Recommended Component Choices

### Wake word

**Best open/local default:** `openWakeWord`  
Why:

- proven in real Home Assistant deployments
- tunable/customizable
- modular via Wyoming/open ecosystem tooling
- suitable for Pi-class hardware

**Best commercial embedded choice:** Picovoice Porcupine  
Why:

- strong reputation for edge deployment
- easier commercial support path
- simpler vendor accountability for wake-word quality

### VAD and endpointing

**Best default for open stack:** Silero or WebRTC-style VAD, tuned conservatively  
**Best commercial option:** Picovoice Cobra

Practical recommendation: use VAD for **endpointing and stream gating**, but do not trust it alone for action finalization. Pair it with timeout rules, partial transcripts, and interruption heuristics.

### STT

#### Best production pattern

- **Local narrow command STT** for fast deterministic home/device commands
- **Streaming cloud STT** for open-ended queries, dictation, and conversational agent turns

This is better than trying to make a single local STT engine serve every case on a Pi.

#### If offline-first

- **Constrained commands:** Speech-to-Phrase-style local grammar approach
- **Open-domain fallback:** `whisper.cpp`, `faster-whisper`, or Vosk depending on acceptable latency

#### If hybrid/cloud-first

- Use a managed streaming STT provider for the open-domain path
- Keep local fallback for commands such as lights, timers, mute/unmute, stop, cancel, and emergency local actions

### TTS

**Best local default:** Piper  
Why:

- open
- proven on Pi-class devices
- fast enough for practical local prompts
- good fit for deterministic confirmations and short responses

**Best premium cloud path:** Cartesia or ElevenLabs for low-latency natural voice

Practical split:

- use **Piper** for confirmations, timers, short command replies, and offline mode
- use **cloud streaming TTS** for longer assistant responses if the product values voice quality

### Echo cancellation and noise handling

Best production order of operations:

1. **DSP-front-end AEC** where available
2. **Tightly managed software AEC** using WebRTC/PulseAudio/PipeWire path if needed
3. **Noise suppression / AGC only after validating STT impact**

Do not stack too many aggressive enhancers by default. Over-suppression can harm wake word and STT more than it helps.

## Latency Management

### Target latency budget

For a device to feel responsive in the home, a reasonable target is:

- **Wake tone / listening cue:** under 150 ms after wake detection
- **Start of transcript or command execution:** under 500 ms for local command path
- **Time to first TTS audio:** under 700 ms for short command replies, under 1.2 s for open-domain cloud path

These are design targets, not universal limits, but beyond this range the system starts to feel noticeably sluggish.

### How to hit the budget

- keep wake word and VAD local
- stream audio immediately after wake or VAD trigger
- use partial transcripts
- execute deterministic commands before full LLM completion when policy allows
- stream TTS chunks instead of waiting for the full sentence
- keep audio formats simple and stable: typically 16 kHz mono for capture, then resample only when necessary
- avoid excess IPC hops and re-encoding between services

### Operational reality

Many teams focus on model latency and ignore:

- ALSA/PulseAudio/PipeWire buffering
- Wi-Fi jitter
- Python scheduling jitter
- SD card stalls
- thermal throttling
- sample-rate mismatches

On Raspberry Pi, these "boring" issues often matter more than the STT model choice.

## Fail-Safe Confirmations Under Real Conditions

### Recommended confirmation matrix

**No confirmation**

- low-risk, reversible actions
- example: turn on a light, pause music, tell the weather

**Soft confirmation**

- moderate ambiguity or moderate cost
- example: "Did you mean the office lamp or office fan?"
- use when ASR confidence is marginal, entity resolution is ambiguous, or multiple devices match

**Hard confirmation**

- security-sensitive, safety-sensitive, financially meaningful, or destructive actions
- example: unlock doors, open garage, disable alarm, delete data, purchase/order, change HVAC in sensitive settings

### Best practice in spoken UX

- confirm **the interpreted action**, not just "yes/no"
- keep confirmation phrasing short
- if risk is high, require a repeated intent, button press, or second factor
- when STT confidence is low, offer a constrained confirmation choice rather than an open question

Example:

- Bad: "Are you sure?"
- Better: "Do you want me to unlock the front door?"

### Fail-safe behavior under uncertainty

If the system detects any of the following, it should default to a safer path:

- overlapping speech
- strong playback echo during a risky action
- low-confidence entity match
- network timeout after command interpretation but before confirmation
- inconsistent transcript revisions across partials/final

In those cases:

- restate the action
- request a short confirmation
- or refuse and require app/button confirmation

## Opportunities

- **Open voice hardware is now credible.** Home Assistant's Voice PE is the clearest sign that open, local-first voice hardware has moved beyond hobby demos.
- **Pi 5 is finally good enough for serious orchestration.** It is not the best place to run the entire open-ended conversational stack locally, but it is good enough to host a robust hybrid voice appliance.
- **Speech-to-Phrase-style command paths are underrated.** For device control, they provide a materially better user experience than routing everything through heavyweight open STT.
- **Hybrid architectures are commercially attractive.** They let teams start with managed STT/TTS quality while preserving a local control path and privacy story.
- **Open ecosystem modularity is improving.** Wyoming, ESPHome protocol work, Piper, microWakeWord, and Home Assistant's voice iterations make it easier to replace weak components without rebuilding the whole stack.

## Risks and Challenges

### Technical risks

- **Echo cancellation remains fragile.** This is still the largest practical failure mode for speaker-equipped satellites.
- **Wake/VAD tuning is environment-specific.** The same thresholds do not behave equally in kitchens, offices, and bedrooms.
- **Local open-ended STT remains borderline on Pi-only deployments.**
- **Latency variance is often worse than mean latency.** Users notice inconsistency more than benchmark averages.

### Product risks

- **False accepts destroy trust quickly**, especially if they trigger device actions.
- **False rejects lead to abandonment**, especially if users must repeat wake words.
- **Too many confirmations make the device feel dumb**, while too few make it unsafe.

### Operational risks

- field deployments will expose sample-rate bugs, USB power issues, and Wi-Fi instability
- open-source component churn can break integrations
- Linux desktop-audio assumptions often do not translate cleanly to appliance deployments

## Open Questions

- How much of the wake/VAD/endpointing stack should be consolidated into newer conversational STT services such as Deepgram Flux versus kept modular on-device?
- Will Home Assistant's Linux Voice Assistant mature fast enough to become the default open Linux satellite stack, or will teams still need custom glue for production?
- Can the next generation of small NPUs on Pi-class devices materially improve local STT/TTS economics, or will audio remain mostly CPU-bound due to runtime and memory bottlenecks?
- How much multilingual wake-word quality can open projects achieve without large-scale real-world data collection?
- What is the best barge-in architecture when the device is also a media player rather than just a TTS endpoint?

## What to Monitor in the Next 12 Months

- **Home Assistant / Open Home Foundation voice roadmap**
  Especially Linux Voice Assistant maturity, microWakeWord quality, broader Speech-to-Phrase language coverage, and richer local-first routing.

- **Real-world wake-word data programs**
  Wake Word Collective and similar efforts matter because open wake-word quality is still constrained by real usage data.

- **Cloud voice-agent APIs**
  Watch OpenAI Realtime, Deepgram Flux, Google, Azure, and vendor moves around integrated turn detection, interruption handling, and cost.

- **Low-latency TTS competition**
  Cartesia and ElevenLabs are pushing the bar for conversational TTS responsiveness; if local TTS does not improve similarly, hybrid stacks become even more attractive.

- **Embedded audio DSP reference modules**
  Especially XMOS ecosystem evolution and any newer off-the-shelf mic-array modules that simplify AEC and beamforming integration.

- **Raspberry Pi and edge accelerator ecosystem**
  Monitor whether Pi-adjacent accelerators meaningfully help audio inference rather than only vision/LLM demos.

- **PipeWire / PulseAudio / WebRTC AEC integration maturity**
  Linux audio plumbing quality directly affects whether software AEC is viable without heavy custom engineering.

## Actionable Next Steps

1. **Choose a hybrid architecture as the default.** Keep wake word, VAD, confirmations, and narrow command handling local; use managed streaming STT/TTS for open-ended conversation unless strict offline operation is mandatory.

2. **Base the first production prototype on Raspberry Pi 5 plus a DSP-assisted mic front end.** Use Home Assistant Voice PE as the open reference or an XMOS-class custom front end if building bespoke hardware.

3. **Implement a two-tier speech path immediately.** Use a fast local command path for deterministic actions and a separate open-domain path for long-tail queries.

4. **Treat AEC as a top-level engineering track, not a tuning task.** Validate speaker placement, playback reference routing, end-to-end latency stability, and barge-in before investing heavily in model improvements.

5. **Define a formal confirmation policy before user testing.** Classify actions by reversibility, ambiguity, and safety impact; enforce soft or hard confirmation accordingly.

6. **Instrument the full pipeline.** Log wake misses, false accepts, VAD onset/offset timing, endpointer behavior, partial/final transcript divergence, TTS time-to-first-byte, and fallback rates.

7. **Test in actual rooms early.** Include TV playback, music, keyboard noise, HVAC noise, speakerphone cross-talk, and users speaking off-axis from different distances.

8. **Ship with explicit degraded modes.** Examples: offline local-command mode, cloud-open-query mode unavailable notice, no-risk-actions-only mode when confidence is low, and button-confirmation fallback for high-risk operations.

9. **Use local TTS for short operational speech even if cloud TTS is available.** This protects confirmations, timers, and failure messages when the network or cloud path is degraded.

10. **Reassess the architecture after 6-9 months.** If local command coverage, local TTS quality, and open satellite software improve on current trajectories, more of the stack may move on-device without harming the product experience.

## Bottom Line

The best production-ready Raspberry Pi voice agent in 2026 is a **real-time hybrid appliance**, not a monolithic local AI box. Use the Pi 5 as the orchestrator, but rely on a **DSP-grade far-field audio front end**, keep **wake word/VAD local**, split **commands from open conversation**, stream **TTS and partial results**, and enforce a **risk-based confirmation policy**. That combination is the most defensible way to achieve low latency, reliability, and safe behavior in the messy acoustic reality of homes and offices.

## Sources and Further Reading

### Primary sources

- Home Assistant Voice Preview Edition product page: https://www.home-assistant.io/voice-pe/
- Home Assistant announcement, December 19, 2024: https://www.home-assistant.io/blog/2024/12/19/voice-Preview-edition-the-era-of-open-voice/
- Home Assistant Voice Chapter 9, February 13, 2025: https://www.home-assistant.io/blog/2025/02/13/voice-chapter-9-speech-to-phrase/
- Home Assistant Year of the Voice Chapter 4, October 12, 2023: https://www.home-assistant.io/blog/2023/10/12/year-of-the-voice-chapter-4-wakewords/
- OHF Voice / Linux Voice Assistant: https://github.com/OHF-Voice/linux-voice-assistant
- Rhasspy Wyoming Satellite README and deprecation notice: https://github.com/rhasspy/wyoming-satellite
- Wyoming protocol package page: https://pypi.org/project/wyoming/
- Piper README: https://github.com/OHF-Voice/piper1-gpl
- Speech-to-Phrase repository: https://github.com/OHF-Voice/speech-to-phrase
- microWakeWord repository: https://github.com/OHF-Voice/micro-wake-word
- Raspberry Pi 5 product page: https://www.raspberrypi.com/products/raspberry-pi-5/
- Raspberry Pi USB power guidance: https://www.raspberrypi.com/documentation/hardware/keyboard_mouse/raspberry-pi-5.html
- XMOS XVF3800 datasheet: https://www.xmos.com/download/XVF3800-Device-Datasheet%283_0_0%29.pdf/
- Picovoice Cobra VAD: https://picovoice.ai/platform/cobra/
- PulseAudio module-echo-cancel documentation: https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Modules/
- WebRTC AEC blog: https://webrtc.github.io/webrtc-org/blog/2011/07/11/webrtc-improvement-optimized-aec-acoustic-echo-cancellation.html

### Cloud voice and recent developments

- OpenAI `gpt-realtime` announcement: https://openai.com/index/introducing-gpt-realtime/
- Deepgram Flux changelog, October 2, 2025: https://developers.deepgram.com/changelog/2025/10/2
- Deepgram Nova-3 changelog, February 12, 2025: https://developers.deepgram.com/changelogs/speech-to-text-changelog/2025/2/12
- Google Cloud Speech-to-Text docs: https://cloud.google.com/speech-to-text/docs
- ElevenLabs TTS overview: https://elevenlabs.io/docs/overview/capabilities/text-to-speech
- Cartesia TTS docs: https://docs.cartesia.ai/build-with-cartesia/models/tts
- Cartesia Sonic 3 docs: https://docs.cartesia.ai/build-with-cartesia/tts-models/latest

### Notes on evidence quality

- Home Assistant, Raspberry Pi, XMOS, PulseAudio, and vendor documentation are treated as primary sources.
- Some latency and accuracy claims from commercial vendors are self-reported and should be validated in your target acoustic environment.
- Benchmarks from home-control stacks do not automatically generalize to open-domain conversational agents.
