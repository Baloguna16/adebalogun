# Raspberry Pi Codex Voice Device: Deep Research Brief and BOM

**Date:** March 26, 2026  
**Prepared for:** A Raspberry Pi-powered, Codex-enabled speaker/mic build for agentic voice prompting  
**Classification:** General research / build-planning brief

## Executive Summary

Building a Raspberry Pi powered speaker/mic that can accept spoken prompts and hand them off to Codex is technically straightforward, but only if the system is architected as two separate layers: an **audio interaction layer** and a **coding-agent layer**. That distinction matters because current Codex models are optimized for agentic coding in Codex-like environments and are not audio-native; OpenAI’s current Codex model docs describe text and image input, text output, and no audio support. In practice, the Raspberry Pi device should handle wake word, audio capture, playback, and local device orchestration, while speech recognition and Codex task execution are routed either through OpenAI APIs or a hybrid local/cloud pipeline.

The current hardware landscape is favorable. Raspberry Pi 5 is now the default platform for this class of build: it offers materially better CPU headroom than Pi 4, official 5V/5A power guidance, PCIe expansion, and a long availability window. For audio I/O, there are now three viable design patterns: a compact GPIO audio HAT path using Raspberry Pi Codec Zero, a legacy but still useful ReSpeaker Pi HAT path, and a stronger far-field USB microphone-array path using newer XMOS-based arrays such as Seeed’s ReSpeaker XVF3800. For a device meant to work across a desk or room and survive speaker echo, the USB mic-array path is the most robust.

The software landscape has also improved. Open-source voice infrastructure around Home Assistant, Wyoming, Piper, wake-word engines, and faster on-device recognition has matured rapidly. Home Assistant’s February 13, 2025 update is a useful signal: it reported sub-second local command recognition on low-power systems and about 150 ms per command on Raspberry Pi 5 for its constrained local `Speech-to-Phrase` path. That result does not directly solve open-ended “talk to Codex” prompts, but it shows that Pi 5-class hardware is no longer the bottleneck for the device-control portion of a voice pipeline.

The main design decision is therefore not “can a Pi do this?” but “which prompts stay local, and which prompts get escalated to cloud speech/Codex services?” A practical build should use local wake word + VAD + audio playback on-device, then route either to a cloud transcription + Codex path for open-ended coding requests, or to a local shortcut path for small fixed intents such as “status,” “mute,” “repeat,” or “start coding session.” That hybrid architecture gives the best latency, cost, privacy, and reliability balance.

Bottom line: if the goal is a usable voice front end for agentic coding, the best current reference build is **Raspberry Pi 5 + official cooling/power + USB far-field mic array + separate speaker amplifier path + local wake word + streamed/cloud STT + Codex via Responses API**. A compact all-GPIO build is possible, but it is better suited to near-field desktop use than room-grade hands-free operation.

## Scope and Assumptions

### Assumptions

1. **“Codex-enabled” means voice input is converted into text and then sent to OpenAI Codex-capable models or Codex workflows**, rather than trying to run a full coding agent locally on the Pi.
2. The primary use case is a **mains-powered desk or room device**, not a battery-powered wearable or portable product.
3. The desired interaction is **agentic prompting by voice** for software tasks, not only generic smart-home control.
4. Where current retail pricing is uncertain or vendor stock is unstable, this brief prioritizes **compatibility and architecture** over exact BOM pricing.

### Non-goals

- Fully offline open-ended coding-agent operation on Raspberry Pi alone
- Audiophile playback design
- Certified commercial product design, FCC/CE program, or injection-molded enclosure design

## Current Landscape

### Hardware Platform

Raspberry Pi 5 is the current default choice. Official Raspberry Pi materials describe it as 2-3x faster than the previous generation, with a 2.4 GHz quad-core Cortex-A76, up to 16 GB RAM, 5V/5A USB-C power, USB 3, Gigabit Ethernet, dual-band Wi-Fi, Bluetooth 5.0, and PCIe 2.0 x1 expansion. Raspberry Pi also states it will remain in production until at least January 2036, which matters if this moves from a one-off prototype into a repeatable build.

For this project, the most important Pi 5 advantages are:

- Enough CPU headroom for local wake word, VAD, audio buffering, and UI/network tasks without constant underruns.
- Better thermals and general responsiveness than Pi 4 under continuous audio workloads.
- More flexible I/O if you later add NVMe, a display, or hardware buttons/LEDs.

The main hardware choice is then whether audio I/O should live on GPIO/I2S or USB.

### Audio Hardware Landscape

There are three realistic classes of audio hardware today:

### 1. Compact GPIO codec boards

Raspberry Pi Codec Zero remains the cleanest official compact audio I/O HAT. Raspberry Pi documents that it provides bi-directional I2S audio, a built-in MEMS microphone, support for an external electret mic, and a 1.2W 8 ohm mono speaker output. This is attractive for a compact enclosure and simple wiring, but it is fundamentally a **near-field** option. Its built-in mic and 1.2W mono output are not the right starting point for a room-grade, always-listening agent.

### 2. Legacy Pi-specific mic HATs

Seeed’s ReSpeaker 2-Mics Pi HAT and ReSpeaker 4-Mic Array for Raspberry Pi remain common in DIY voice builds. The 4-mic board is explicitly marketed as a Raspberry Pi voice UI board with 4 analog microphones, AC108 codec, VAD, DOA, and keyword spotting, and Seeed still lists it at $24.90. The caveat is software friction: Seeed’s current v2 documentation explicitly warns that older driver installation methods no longer work on the latest Raspberry Pi OS, and the wiki had to be reissued for newer OS releases. That is a manageable prototyping risk, but not ideal if you want the lowest-maintenance build.

### 3. USB far-field arrays with onboard DSP

Newer XMOS-based arrays are currently the strongest fit for hands-free room use. Seeed’s ReSpeaker XVF3800 USB 4-Mic Array is a representative example: the vendor documents AEC, AGC, beamforming, VAD, noise suppression, dereverberation, direction-of-arrival, and up to 5 m 360-degree capture, with both USB plug-and-play and integration modes. This class of device offloads the ugly parts of voice capture, especially acoustic echo cancellation, from the Pi itself.

For a speaker/mic device that will play responses aloud while remaining able to hear the next command, **USB array + separate speaker path** is the current best hardware pattern.

### Software Voice Stack Landscape

The open voice stack has matured meaningfully:

- **Wake word:** openWakeWord, Picovoice Porcupine, Home Assistant microWakeWord
- **Speech-to-text:** OpenAI cloud transcription/realtime, Whisper-derived stacks, Vosk, constrained local speech-to-phrase systems
- **Text-to-speech:** Piper, OpenAI speech generation, system TTS
- **Pipeline orchestration:** Wyoming, Home Assistant Assist, custom Python/Node services

Recent open-source momentum matters because this project does not need a monolithic “assistant framework.” It needs modular pieces:

- reliable wake word
- VAD/AEC/noise control
- transcription
- prompt routing
- spoken response

That modularity is now normal rather than exotic.

### Codex / OpenAI Integration Landscape

Current Codex models are not the same thing as realtime voice models. OpenAI’s current model docs state:

- `GPT-5-Codex` is optimized for agentic coding tasks in Codex-like environments
- it is available in the Responses API only
- audio is not supported

OpenAI’s newer `GPT-5.3-Codex` docs make the same architectural point even more clearly: it is optimized for agentic coding, supports text and image input, and does **not** support audio. Separately, OpenAI’s Realtime API docs show that realtime conversations accrue cost across text, audio, and image tokens and support voice-focused connection patterns such as WebRTC and SIP.

The implication is simple: a Pi voice device should **not** try to treat Codex as the direct speech endpoint. Instead:

1. audio is captured and optionally streamed to a speech/realtime service,
2. speech becomes text,
3. the text is routed into a Codex task or Responses API workflow,
4. the resulting textual status/answer is summarized back to speech.

That separation is the core architecture decision for the BOM.

## Core Concepts

### 1. Near-field vs far-field capture

Near-field means the user is close to the microphone, usually desktop distance. Far-field means across a room. This is the single biggest hardware fork:

- Near-field can work with Codec Zero or a simple 2-mic HAT.
- Far-field strongly benefits from 4-mic or better arrays with onboard DSP and AEC.

### 2. AEC, beamforming, VAD, and AGC

These are not optional buzzwords. They determine whether the device works in practice.

- **AEC:** prevents the device’s own speaker output from retriggering or corrupting input.
- **Beamforming:** improves pickup of the active speaker direction.
- **VAD:** decides when speech is actually present.
- **AGC:** levels out quiet and loud speech.

If your mic hardware does not solve most of this, you end up doing painful DSP tuning in software.

### 3. Wake word engine vs push-to-talk

Always-listening wake word is convenient but creates:

- privacy concerns
- idle CPU load
- false wake risk
- acoustic tuning work

For a first prototype, a physical push-to-talk button is still the fastest route to a usable build. Wake word should be treated as a second-phase feature, unless hands-free use is the primary requirement.

### 4. Local STT vs cloud STT

Local STT improves privacy and can reduce recurring cost, but open-ended transcription quality and latency on a Pi remain constrained relative to cloud models. Home Assistant’s February 2025 work shows excellent performance for constrained command recognition on Pi 5, but that same post explicitly notes such systems are intended for home-control style phrases, not LLM-style open-ended prompts.

For open-ended agentic prompts such as “open the repo, inspect the auth flow, and explain why the OAuth callback is timing out,” cloud transcription is still the safer default.

### 5. Voice UI is not the same as coding execution

The device should confirm intent and state in speech, but most real coding output should still land somewhere visual:

- terminal
- PR comment
- GitHub issue
- Slack/Discord
- local web dashboard

Long spoken diffs are a bad UX. The speaker should be treated as a **control and status surface**, not the primary artifact surface.

## Key Players

### Raspberry Pi

Provides the core compute platform, official audio HATs, power accessories, and long lifecycle support. Their official audio board lineup is still relevant for compact builds, especially Codec Zero and DigiAMP+.

### Seeed Studio / ReSpeaker

Still one of the most visible DIY voice hardware vendors for Pi-compatible microphone arrays. Strength: accessible hardware options. Weakness: some products show driver/docs friction and uneven freshness across generations.

### XMOS

Important enabler rather than end-user brand. XMOS-based far-field arrays increasingly define the “works in a room” tier because they package beamforming, AEC, and DSP more cleanly than many legacy maker boards.

### OpenAI

Provides the current coding-agent endpoint and cloud voice options. The key product split is between realtime/audio APIs and Codex-oriented coding models.

### Home Assistant / Open Home Foundation

Not the required end platform here, but currently one of the strongest proof points for open modular voice pipelines on affordable hardware. Their Wyoming, Piper, wake-word work, and recent voice releases are useful indicators of what is feasible on Pi-class systems.

### Picovoice / openWakeWord / Vosk / Piper / whisper.cpp ecosystem

These projects cover wake word, offline STT, and local TTS. The most important practical distinction is:

- Picovoice: polished, efficient, commercial-style wake word path
- openWakeWord: open-source and flexible, good Pi performance
- Vosk: lightweight offline STT
- Piper: practical local TTS
- Whisper-derived stacks: stronger open transcription quality, but heavier

## Recent Developments

### 1. Open voice systems became more modular and practical

Home Assistant’s February 13, 2025 “Speech-to-Phrase” update is notable because it reported under-one-second local transcription on low-power hardware and roughly 150 ms command processing on Raspberry Pi 5 for constrained phrases. The important signal is not that you should use that exact stack for Codex prompts; it is that the device-control side of voice UX can now live locally on Pi-class hardware with acceptable latency.

### 2. Open voice hardware moved toward ecosystem thinking

Home Assistant’s December 19, 2024 voice launch and 2025 updates show a shift from one-off gadgets toward a reusable voice ecosystem: satellites, open protocols, local/cloud split processing, and broader language support. That matters because your Pi speaker/mic can adopt the same compositional approach instead of depending on one monolithic assistant.

### 3. Codex productization accelerated

OpenAI introduced Codex as a cloud-based software engineering agent in May 2025, expanded availability in June 2025, and continued shipping Codex upgrades through late 2025 and early 2026. The important architectural takeaway is that Codex is increasingly a background task engine that fits well behind a voice front end. Voice starts the task; Codex does the work asynchronously; the device speaks status and next-step summaries.

### 4. USB far-field arrays are the safer default than Pi-specific mic HATs

This is less a single announcement than a pattern. The combination of newer USB arrays and the maintenance burden around old I2S driver paths makes USB more attractive than it was 2-3 years ago.

## Recommended System Architecture

The most robust current design is:

1. **Wake/trigger layer on-device**
2. **Audio capture and playback on-device**
3. **Optional local noise gating / button / LED state machine**
4. **Speech recognition via cloud or hybrid pipeline**
5. **Prompt router**
6. **Codex task invocation via Responses API / Codex workflow**
7. **Short spoken acknowledgement + longer visual artifact elsewhere**

Recommended prompt routing:

- “Mute,” “volume up,” “repeat,” “status,” “cancel task” -> local control
- “Ask Codex to inspect the repo,” “fix failing test,” “summarize PR” -> transcribe and route to Codex
- “Read the result” -> fetch latest task state and speak a concise summary

## Reference BOMs

### BOM A: Best Overall for a Real Voice Device

This is the recommended build if you want something that works reliably in a room and can be improved incrementally.

| Subsystem | Recommended Part | Why it belongs in the BOM | Notes |
|---|---|---|---|
| Compute | Raspberry Pi 5 (4 GB or 8 GB) | Best current balance of CPU headroom, I/O, and lifecycle | 8 GB is safer if you expect heavier local services |
| Power | Official Raspberry Pi 27W USB-C power supply | Pi 5 officially recommends a high-quality 5V/5A supply | Avoid marginal USB-C supplies |
| Cooling | Official Pi 5 case with fan or Active Cooler | Continuous audio/network workloads benefit from sustained clocks | Required for reliability more than peak speed |
| Storage | High-endurance microSD or SSD boot | Always-on logging and updates wear cheap cards | SSD is preferable for long-lived deployments |
| Mic array | USB far-field 4-mic array, preferably XMOS-based such as ReSpeaker XVF3800 | Best fit for AEC, beamforming, noise suppression, and room use | Highest-value audio component in the system |
| Audio output | Small USB DAC or Pi audio HAT feeding class-D amp | Separates playback from mic-array choice | Avoid tying output path to weaker mic HATs |
| Amplifier | Small class-D mono/stereo amp board sized to speaker choice | Needed for intelligible spoken output at room volume | Match to speaker impedance/power |
| Speaker | 1 x full-range 3-5 inch speaker or 2 x small passive speakers | Speech intelligibility matters more than bass | Mono is often sufficient |
| Controls | Momentary push button, mute switch, status LED or RGB ring | Needed for privacy, push-to-talk fallback, and clear state | Strongly recommended |
| Network | Wi‑Fi is sufficient; Ethernet preferred for fixed desk build | Reduces cloud STT/Codex jitter | Ethernet if stationary |
| Enclosure | Vented enclosure with acoustic separation between mic and speaker | Reduces self-noise and echo path problems | Often overlooked, often decisive |

### Why BOM A is the best current default

- It avoids old I2S driver pain where possible.
- It treats the microphone path as the critical subsystem.
- It keeps output flexible.
- It can start with push-to-talk and graduate to wake word later.

### BOM B: Compact Desktop Prototype

This is the fastest route to “I have a small Codex voice appliance on my desk,” but it is not the best room device.

| Subsystem | Recommended Part | Why it belongs in the BOM | Notes |
|---|---|---|---|
| Compute | Raspberry Pi 5 | Same reasons as BOM A | Pi 4 works for prototyping but is not preferred now |
| Power / cooling | Same as BOM A | Pi 5 still needs stable power and cooling | Do not skip |
| Audio I/O | Raspberry Pi Codec Zero | Official, compact, built-in mic, simple mono output | Best for near-field only |
| Speaker | Small 8 ohm mono speaker | Codec Zero explicitly supports 1.2W 8 ohm mono speaker output | Modest volume |
| Optional mic | External electret mic | Codec Zero supports an additional external mono electret mic | Useful if enclosure placement is awkward |
| Controls | Button + LEDs | Easy to integrate with Codec Zero GPIO features | Good for push-to-talk |
| Enclosure | Desktop enclosure | Keeps cable complexity low | Acoustic isolation still matters |

### When BOM B makes sense

- Desk-only use
- User is typically within 0.5 to 1 meter
- You want the fewest parts and fastest assembly
- You accept weaker far-field pickup and less sophisticated echo handling

### BOM C: Legacy ReSpeaker Pi-HAT Prototype

This is viable if you already own the parts, but it is not the cleanest fresh build.

| Subsystem | Recommended Part | Why it belongs in the BOM | Notes |
|---|---|---|---|
| Compute | Raspberry Pi 5 | Still the best Pi base | Verify kernel/driver path first |
| Mic input | ReSpeaker 2-Mics Pi HAT v2 or ReSpeaker 4-Mic Array for Raspberry Pi | Low-cost DIY voice hardware | Watch software compatibility carefully |
| Output | Separate amp/speaker path | The 4-mic array is input-focused | Output path still needed |
| Controls / case / power | Same as above | No special change | Driver validation is the main extra task |

### Why BOM C is third choice

The hardware is inexpensive and proven in maker projects, but documentation and driver maintenance are more brittle than the USB array path. It is a fine prototype path, not the lowest-risk production path.

## Practical Opportunities

### 1. A voice front end for asynchronous coding work

The strongest use case is not “talk to a coding model continuously like a smart speaker.” It is:

- launch a task hands-free
- clarify scope
- receive progress/status
- hear a concise result summary

That matches how Codex itself is evolving as a long-running agent.

### 2. Hybrid local/cloud optimization

You can keep:

- wake word
- mute control
- local logs
- device status
- basic UX

on the Pi, while only paying cloud cost for the speech and coding steps that actually need it.

### 3. Reusable open voice infrastructure

A build based on standard Linux audio + USB array + modular services is easy to repurpose later for:

- general voice agent use
- home lab operations
- CI/CD status endpoints
- GitHub/Slack incident voice console

## Risks

### 1. Acoustic self-interference

This is the biggest practical risk. Many DIY voice devices fail because the speaker path bleeds into the mic path. AEC helps, but enclosure geometry, speaker placement, and gain staging still matter.

### 2. Overestimating local STT for open-ended prompts

Constrained local recognition is now good. Open-ended coding speech is a different problem. If you try to keep the full speech pipeline local on Pi too early, you may spend time on transcription quality instead of the actual product.

### 3. Wake word false triggers or misses

Always-listening systems create persistent tuning work. Noise sources, TV audio, keyboard clicks, and your own TTS output can all degrade wake performance.

### 4. Software stack sprawl

It is easy to accidentally build five systems:

- wake word daemon
- STT service
- router
- Codex task runner
- TTS daemon
- local web UI

This should be designed intentionally as a small pipeline with clear boundaries.

### 5. Security and privacy

This device is always near a microphone, and if it can also trigger coding agents, it may have access to repositories, tokens, or infrastructure. A physical mute switch, network segmentation, and careful token scoping are not optional.

## Open Questions

1. Should the first version be **push-to-talk** or **wake-word first**? Push-to-talk dramatically reduces risk.
2. Is the device expected to speak only **short acknowledgements**, or should it support **long spoken summaries**?
3. Should coding tasks run directly through the OpenAI API, through Codex CLI on another machine, or through a custom broker service?
4. Does the device need to be fully useful when offline, or is offline mode limited to local controls and cached status?
5. Is the right form factor a **desktop puck**, a **small bookshelf unit**, or a **satellite + external speaker** arrangement?

## What to Monitor in the Next 12 Months

### 1. OpenAI voice/coding convergence

Monitor whether OpenAI narrows the gap between realtime voice agents and Codex-oriented coding models. The moment a coding-capable endpoint becomes meaningfully audio-native, the architecture could simplify.

### 2. Pi-class local speech quality

Watch improvements in:

- Whisper-derived ARM inference
- Vosk successors
- Home Assistant speech-to-phrase generalization
- on-device wake word accuracy

If open-ended STT quality on Pi 5 or Pi successors improves enough, cloud cost and privacy tradeoffs change materially.

### 3. Mic-array hardware refresh cycles

Monitor whether XMOS-based USB arrays become more available and whether Raspberry Pi or third parties release newer official voice-oriented HATs with better maintained software stacks.

### 4. Codex workflow primitives

Track OpenAI changes to:

- Responses API tooling
- background task support
- voice-agent interoperability
- Codex task orchestration and status hooks

Those changes will shape whether the device should call APIs directly or talk to a broker service.

### 5. Open-source voice orchestration standards

Wyoming, MCP-enabled voice integrations, and related protocols are worth tracking because they may reduce custom glue code over the next year.

## Actionable Next Steps

1. **Start with BOM A, but build version 1 as push-to-talk.** This removes wake-word tuning from the critical path and proves the rest of the system faster.
2. **Choose the microphone first, not the speaker.** For this product, mic quality and AEC matter more than playback fidelity.
3. **Implement a split pipeline:** local trigger/audio control on Pi; cloud transcription and Codex task execution off-device or via API.
4. **Limit spoken output to acknowledgements, task status, and concise summaries.** Put diffs, code, and long explanations on a screen or chat surface.
5. **Prototype with a USB mic array before attempting a pure GPIO/I2S design.** The USB path is lower risk and easier to debug.
6. **Add a hardware mute control and visible state indicator in the first hardware revision.** This is both a privacy and usability requirement.
7. **Instrument latency at every stage:** wake/trigger, capture, STT, Codex dispatch, first spoken acknowledgement, final result. Without this, tuning decisions become guesswork.
8. **Run A/B tests on prompt routing.** Compare open-ended cloud STT + Codex against a local shortcut path for fixed commands.
9. **Treat enclosure design as part of the BOM, not an afterthought.** Acoustic layout can make a better microphone look bad.
10. **Only invest in wake word after push-to-talk and remote task execution are stable.** Otherwise you optimize the wrong subsystem.

## Key Takeaways

1. The correct architecture is a **voice device in front of Codex**, not Codex running directly as a voice device.
2. Raspberry Pi 5 is the current best base platform because it removes many of the performance compromises that shaped older Pi voice builds.
3. For hands-free use, **USB far-field mic arrays with onboard DSP** are a better default than older Pi-specific mic HATs.
4. Local voice processing on Pi is now good enough for fixed intents and device UX, but open-ended coding prompts still favor cloud transcription.
5. The most failure-prone part of the build is acoustics, not CPU.
6. Push-to-talk is the fastest path to a credible prototype; wake word should be a second-phase feature.
7. The best product experience is spoken control plus visual artifacts elsewhere, not fully spoken coding output.

## Sources and Further Reading

### Primary Sources

- Raspberry Pi 5 product page: https://www.raspberrypi.com/products/raspberry-pi-5/?variant=raspberry-pi-5-4gb
- Raspberry Pi Audio docs: https://www.raspberrypi.com/documentation/accessories/audio.html
- Raspberry Pi Codec Zero product page: https://www.raspberrypi.com/products/codec-zero/
- Raspberry Pi DigiAMP+ product page: https://www.raspberrypi.com/products/digiamp-plus/
- Seeed ReSpeaker 2-Mics Pi HAT v2 wiki: https://wiki.seeedstudio.com/respeaker_2_mics_pi_hat_raspberry_v2/
- Seeed ReSpeaker 4-Mic Array for Raspberry Pi product page: https://www.seeedstudio.com/ReSpeaker-4-Mic-Array-for-Raspberry-Pi.html
- Seeed ReSpeaker XVF3800 wiki: https://wiki.seeedstudio.com/ja/respeaker_xvf3800_introduction/
- OpenAI `GPT-5-Codex` model docs: https://developers.openai.com/api/docs/models/gpt-5-codex
- OpenAI `GPT-5.3-Codex` model docs: https://developers.openai.com/api/docs/models/gpt-5.3-codex
- OpenAI Realtime cost guide: https://developers.openai.com/api/docs/guides/realtime-costs
- OpenAI Realtime SIP guide: https://developers.openai.com/api/docs/guides/realtime-sip
- OpenAI “Introducing Codex”: https://openai.com/index/introducing-codex/

### Open Voice / Ecosystem Sources

- Home Assistant voice control docs: https://www.home-assistant.io/voice_control/
- Home Assistant “Voice Chapter 8 - Assist in the home today” (Dec 19, 2024): https://www.home-assistant.io/blog/2024/12/19/voice-chapter-8-assist-in-the-home/
- Home Assistant “Speech-to-Phrase brings voice home” (Feb 13, 2025): https://www.home-assistant.io/blog/2025/02/13/voice-chapter-9-speech-to-phrase/
- Home Assistant wake word approach: https://www.home-assistant.io/voice_control/about_wake_word/
- Home Assistant Voice initiative page: https://www.home-assistant.io/voice_control/contribute-voice/

### Component and Stack References

- openWakeWord: https://github.com/dscripka/openWakeWord
- Piper: https://github.com/WEBDIENSTE/rhasspy-piper
- Vosk API: https://github.com/alphacep/vosk-api
- Picovoice Porcupine docs: https://picovoice.ai/docs/porcupine/

## Notes on Evidence Quality

- Raspberry Pi, OpenAI, Home Assistant, and Seeed/XMOS materials were weighted most heavily as primary sources.
- Some component availability and pricing are volatile; this brief therefore emphasizes architecture and compatibility over exact cost accounting.
- Where this brief recommends USB mic arrays over legacy Pi HATs, that is an inference from current documentation maturity, DSP capabilities, and integration risk rather than a single source claiming universal superiority.
