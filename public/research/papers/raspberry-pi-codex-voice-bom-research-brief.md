# Raspberry Pi Codex-Enabled Voice Speaker/Mic BOM: Deep Research Brief

**Date:** March 26, 2026  
**Prepared for:** Local design and prototyping use  
**Classification:** General technical research

## Executive Summary

The strongest current reference architecture for a Raspberry Pi "Codex-enabled" voice speaker/mic endpoint is a **Raspberry Pi 5-based, mains-powered tabletop device** with a **USB microphone array / audio front end**, official **27W power**, and **active cooling**. For the microphone path, the current market center of gravity has shifted from older XVF3000-era boards to **XMOS XVF3800-based modules**, especially Seeed Studio's newer ReSpeaker family. The XVF3800 class is attractive because it offloads beamforming, AEC, noise suppression, dereverberation, AGC, and direction-of-arrival processing from the Pi, reducing software complexity and CPU overhead while improving far-field capture.

For a practical reference BOM, the best-balanced choice today is:

1. **Raspberry Pi 5 8GB**
2. **Raspberry Pi 27W USB-C Power Supply**
3. **Raspberry Pi Active Cooler**
4. **Seeed ReSpeaker XVF3800 USB 4-Mic Array**
5. **Visaton FRWS 5 - 4 Ohm full-range speaker**

The main reason to center the design on a USB mic-array front end instead of a bare I2S microphone plus separate DSP stack is integration risk. Raspberry Pi 5 is powerful enough to run networked voice UX, local orchestration, and device control, but the hard part in a voice product is still acoustics: echo cancellation, beamforming, gain behavior, and feedback avoidance. XVF3800-class modules move that risk into a purpose-built voice processor. That is materially safer than expecting the Pi alone to deliver production-grade far-field voice performance.

The biggest unresolved issue is the **speaker output path**. Seeed's XVF3800 documentation clearly exposes a 3.5mm AUX output and a JST speaker connector, but it does **not** cleanly specify the speaker connector's electrical output stage, exact allowable load, or full board mechanical drawing in the text-accessible materials reviewed here. That means the shortest path to a working prototype is to use the XVF3800 as the primary USB audio front end and validate speaker drive behavior on the bench before freezing a passive-speaker production design. If you need immediate low-risk output, use the board's documented audio output with an active speaker during bring-up; if you need a passive speaker inside an enclosure, verify the connector's real electrical behavior first.

## Scope and Assumptions

### Assumptions

- "Codex-enabled" means the Pi is acting as a network-connected voice endpoint for speech capture, orchestration, TTS playback, and agent interaction, not running a fully local LLM speech stack.
- The target device is **mains-powered**, not battery-powered.
- The target UX is **near-field to moderate far-field voice interaction** in a home/office environment, not open industrial space.
- Mono speaker output is acceptable for assistant-style voice playback.
- Where board-level data is missing from a vendor's accessible public text, assumptions are stated explicitly rather than guessed.

### Recommendation framing

- This brief recommends a **reference prototype BOM**, not the only valid architecture.
- If your goal is minimum cost or minimum idle power, a Pi Zero 2 W or MCU-centric design becomes more attractive.
- If your goal is production enclosure optimization, you may eventually replace the module-level BOM with a custom XMOS or codec design, but that is a second-phase decision.

## Recommended Reference BOM

| Part | Recommendation | Why it is recommended | Main constraint |
| --- | --- | --- | --- |
| Host compute | Raspberry Pi 5 8GB | Enough CPU/GPU headroom, best Pi I/O, mature Linux support | Needs 5V/5A for full USB power budget; can throttle thermally under sustained load |
| Power | Raspberry Pi 27W USB-C PSU | Official 5.1V/5A supply unlocks full downstream USB budget | Third-party multi-port PD supplies can renegotiate unexpectedly |
| Cooling | Raspberry Pi Active Cooler | Keeps Pi 5 below throttling under sustained voice/TTS/app workloads | Mechanical stack-up with HATs or enclosures must be validated |
| Mic/front end | Seeed ReSpeaker XVF3800 USB 4-Mic Array | Current XVF3800-based voice DSP, USB Audio Class 2.0, AEC/beamforming/DoA/AGC | Board documentation leaves some speaker-path details unclear |
| Speaker | Visaton FRWS 5 - 4 Ohm | Well-documented, compact, speech-suitable, easy to model acoustically | Needs verified amplifier/load match from chosen output stage |

## Current Landscape

### Key players

- **Raspberry Pi Ltd.** supplies the host platform, power ecosystem, cooling, GPIO/I2S infrastructure, and the most predictable long-lifecycle SBC base.
- **Seeed Studio** is the most active maker-to-product bridge for Raspberry Pi-compatible voice modules today, especially through the ReSpeaker line.
- **XMOS** is the main specialist vendor in this design class for embedded voice front ends with integrated DSP, certification-oriented conferencing features, and reference tooling.
- **Analog Devices / Maxim** remains important for simple digital audio amplifier ICs such as MAX98357A when teams choose a discrete I2S playback path.
- **Speaker vendors such as Visaton and CUI Devices** matter because voice-device success depends heavily on transducer behavior, not just DSP.

### Core concepts that determine success

- **AEC is the make-or-break function** in a speaker/mic assistant. If the mic path does not get a clean playback reference, full-duplex voice UX will degrade quickly.
- **Beamforming and DoA are helpful, but enclosure acoustics still dominate**. Poor porting, grille design, vibration coupling, or speaker-to-mic leakage can overwhelm a good DSP front end.
- **USB audio is lower integration risk than raw I2S for the mic side** on Pi 5 because it avoids codec-overlay and clock-role complexity.
- **I2S remains useful for playback**, but Pi 5's RP1 architecture and OS-version-specific overlay behavior mean it should be treated as an integration surface, not a "just wire it up" detail.

### Recent developments

- **Raspberry Pi 5 product positioning changed materially in 2025-2026**: the current product brief now lists the 8GB model at **$125** and the 16GB model at **$205**, reflecting a meaningfully higher memory-cost environment than at launch.
- **Seeed formally refreshed the ReSpeaker line around XVF3800 in 2025**, replacing the older XVF3000 center of gravity with a more capable voice front end and newer tutorials around Home Assistant, TFLM, and embedded I2S modes.
- **XMOS XVF3800 documentation advanced in 2024-2025**, with firmware/document releases around v3.2.1 and a 2025 product brief, indicating an actively maintained platform rather than a frozen legacy part.
- **Pi 5 thermal guidance has matured**: official cooling data now makes it clearer when active cooling is optional versus prudent for sustained workloads.

## Part-by-Part Datasheet and Spec-Sheet Synthesis

## 1. Raspberry Pi 5 8GB

### Recommended role

Primary host computer for networked voice assistant logic, local service orchestration, UI, OTA/update management, and audio routing.

### Electrical

- **Input power:** 5V/5A via USB-C with PD support.
- **Typical bare-board active current:** about **800mA**.
- **USB peripheral budget:** **1.6A** only when using a 5A-capable 5V supply; otherwise the Pi 5 restricts downstream USB devices to **600mA**.
- **Low-voltage threshold behavior:** Raspberry Pi documents low-voltage detection below **4.63V ±5%**; poor cables or undersized supplies can create instability.

### Mechanical

- **Board size:** approximately **85 mm x 56 mm**.
- Standard Raspberry Pi 40-pin form factor and mounting-hole pattern remain relevant for enclosure planning.

### Interfaces

- BCM2712 quad-core Cortex-A76 at **2.4GHz**
- LPDDR4X-4267 SDRAM, with current options from **1GB to 16GB**
- **2 x USB 3.0**, **2 x USB 2.0**
- **Gigabit Ethernet** with **PoE+** capability via separate HAT
- **Dual-band 802.11ac Wi-Fi**
- **Bluetooth 5.0 / BLE**
- **2 x 4-lane MIPI camera/display transceivers**
- **PCIe 2.0 x1**
- Standard **40-pin header**

### Thermal

- **Operating temperature:** **0 C to 70 C**
- Raspberry Pi thermal-management limit is **85 C**, with progressive throttling between **80 C and 85 C**.
- Under sustained heavy load, active cooling is prudent if you want stable latency and no throttling surprises.

### Compatibility constraints

- For audio HATs and I2S devices, Raspberry Pi documents that GPIO **18/19/20/21** are the relevant I2S pins.
- RP1 introduces more than one I2S instance and explicit clock-producer/consumer behavior, which increases overlay sensitivity versus older Pis.
- For the mic side, USB Audio Class devices remain the least fragile route.

### Bottom line

Pi 5 8GB is the right default unless cost, power, or size pushes you to a smaller Pi. For a voice endpoint, the practical value is not the raw CPU alone; it is the combination of fast USB, mature Linux support, and headroom for streaming, buffering, and local services.

## 2. Raspberry Pi 27W USB-C Power Supply

### Recommended role

Primary power source for prototype and deployment.

### Electrical

- **Input:** **100-240VAC**, **50-60Hz**
- **Primary output:** **5.1V**, **5.0A**, **25.5W**
- Additional PD profiles: **9V/3A**, **12V/2.25A**, **15V/1.8A**, each capped within **27W**
- **Average active efficiency:** **89.0%**
- **Efficiency at 10% load:** **87.9%**
- **No-load power:** **0.1W**

### Mechanical

- **Connector:** USB-C
- **Cable:** **1.2m**, **17AWG**

### Compatibility constraints

- This supply is the cleanest way to unlock Pi 5's documented **1.6A USB downstream budget**.
- Raspberry Pi explicitly warns that some third-party multi-port PD supplies may renegotiate when another device is plugged in; that is avoidable design risk in a voice appliance.

### Bottom line

Use the official 27W supply unless there is a hard industrial or PoE requirement. It removes one of the most common voice-device failure modes: marginal 5V rail behavior during USB/audio peaks.

## 3. Raspberry Pi Active Cooler

### Recommended role

Thermal control for stable sustained performance.

### Electrical

- **Supply:** **5V DC** from Pi 5's 4-pin fan header
- **Control:** PWM speed control with tachometer

### Mechanical

- Single-piece anodized aluminum heatsink with blower fan
- Spring-loaded push-pin mounting onto Pi 5
- Pre-applied thermal pads

### Thermal / acoustic

- **Maximum airflow:** **1.09 CFM**
- **Maximum fan speed:** **8000 RPM +/- 15%**
- Official Pi testing shows the fan turns on around **60 C**, increases around **67.5 C**, and reaches full speed around **75 C**
- Official reported noise during load test: about **35-40 dB**

### Compatibility constraints

- Raspberry Pi recommends not removing and reusing it casually because push pins and thermal pads degrade.
- HATs can be stacked above it with extenders, but airflow degradation must be expected.

### Bottom line

For a voice device that may synthesize speech continuously, run local wake logic, and stream network audio, the Active Cooler is cheap insurance against performance jitter.

## 4. Seeed ReSpeaker XVF3800 USB 4-Mic Array

### Recommended role

Primary microphone array and voice DSP front end.

### Why this part, specifically

This is the most important part in the BOM from a user-experience perspective. The Pi can run software. The XVF3800 front end is what makes the device hear well enough to be usable in a room.

### Electrical

- Underlying XMOS XVF3800 typical core power consumption is listed as about **345mW in I2S mode** and **400mW in USB mode**
- USB Type-C is used for **power and data**

### Acoustic / signal-processing

- **4 high-performance PDM MEMS microphones** in a circular array
- **360-degree far-field voice capture up to 5 meters**
- DSP features called out by Seeed and XMOS include:
  - AEC
  - AGC
  - DoA
  - Beamforming
  - Noise suppression
  - Dereverberation
  - VAD
- Seeed calls out **60dB AGC range**

### Audio interfaces

- **USB Audio Class 2.0 compliant**
- **Dual operation modes:** USB plug-and-play and INT-Device / I2S mode
- **I2C and I2S headers** exposed for control/integration
- **3.5mm AUX output** for headphones or active speakers
- **JST speaker connector**, but the exact electrical output/load details require verification
- The board includes a **TLV320AIC3104** audio codec

### Control / UX hardware

- **12 x WS2812 RGB LEDs**
- Mute button
- Mute indicator LED
- Reset button
- Built-in unique serial number
- Exposed GPIO for amplifier enable and LED control

### Sample-rate and firmware constraints

- Seeed's out-of-box Audacity setup guidance shows **2-channel**, **16kHz**, **24-bit** recording as the standard USB usage path.
- Seeed also documents a **48kHz** Home Assistant-oriented I2S firmware path, which is relevant if you later move part of the voice pipeline to another host/controller.

### Mechanical

- Accessible text sources reviewed here do **not** provide a clean board mechanical drawing with dimensions.
- Assumption: reserve roughly the same order-of-magnitude circular footprint as prior ReSpeaker boards during early enclosure planning, but do **not** freeze the enclosure until the actual drawing or measured board is in hand.

### Thermal

- No board-level operating-temperature range was clearly exposed in the reviewed text.
- The XVF3800 IC itself is documented in a **7 mm x 7 mm, 60-pin QFN** package.

### Compatibility constraints

- Strong compatibility with **Raspberry Pi OS** as a USB audio host
- Strong compatibility with USB-first prototyping workflows
- If you move to I2S firmware, you inherit more host-clocking, firmware-flashing, and overlay complexity
- The board documentation is explicit that firmware-switching method differs between USB, I2S, and safe-mode images

### Critical integration note

If you split capture and playback across unrelated audio devices, you risk weakening the AEC story. The cleanest AEC architecture is the one where the voice front end has a well-defined playback reference. That pushes prototyping toward using the XVF3800-centered audio path first, then optimizing later.

## 5. Visaton FRWS 5 - 4 Ohm Speaker

### Recommended role

Compact mono transducer for voice-first output in a small enclosure.

### Electrical / acoustic

- **Nominal impedance:** **4 ohm**
- **Rated power:** **4W**
- **Maximum power:** **10W**
- **Frequency response:** **150Hz to 20kHz**
- **Mean SPL:** **84dB (1W/1m)**
- **Resonance frequency:** **250Hz**
- **DC resistance:** **3.6 ohm**

### Mechanical

- **5 cm (2 inch)** full-range driver
- **Cutout diameter:** **45 mm**
- **Net weight:** **0.1 kg**
- Solder-lug connections

### Thermal / environmental

- **Temperature range:** **-25 C to 70 C**

### Compatibility constraints

- Acoustic fit is reasonable for assistant-style speech output, but do not expect strong low-frequency output.
- Amplifier/load matching must be confirmed against the actual output stage you use.
- If using the ReSpeaker XVF3800 speaker connector, verify whether the connector is intended for a passive load, powered speaker module, or a vendor-specific assembly before treating this as production-ready.

### Bottom line

This is a sensible voice-first speaker for a small enclosure because it is documented, compact, and not oversized for assistant use. But it is only as good as the enclosure and amplifier pairing.

## Compatibility and Integration Constraints

### Power-budget constraints

- Pi 5 plus USB mic array plus cooling is well within the official 27W supply envelope.
- The official PSU is not optional if you want deterministic USB headroom.

### Audio-path constraints

- The safest mic path is **USB UAC** via ReSpeaker XVF3800.
- A separate Pi I2S playback amp is possible, but it creates more software and echo-reference risk.
- If you use Pi GPIO I2S for playback, those pins are **GPIO 18/19/20/21** and should be treated as dedicated.

### Thermal constraints

- Sustained LLM-adjacent workloads, TTS, and browser/UI usage can push Pi 5 into thermal throttling without cooling.
- Enclosures must preserve airflow around both Pi and mic array; voice devices fail quietly when heat causes clock instability or fan noise spills into the microphones.

### Mechanical constraints

- Pi 5 board geometry is known; XVF3800 board text-accessible geometry is not.
- Do not lock industrial design until the XVF3800 board, cable bend radii, and speaker cavity are physically measured.

### Acoustic constraints

- Speaker-to-mic leakage path matters more than most software teams expect.
- Grille, foam, porting, stand-offs, and internal vibration coupling should be tested before assuming DSP will save the design.

## Practical Opportunities

- **Fast prototype velocity:** Pi 5 + USB XVF3800 gives a low-friction path to an actual working assistant.
- **Reduced DSP burden on the Pi:** more CPU budget remains for UX, networking, and orchestration.
- **Path to productization:** XVF3800-class modules support both USB and I2S modes, so early prototypes do not dead-end the architecture.
- **Strong ecosystem fit:** Raspberry Pi, Seeed, and XMOS all have active documentation and accessory ecosystems.

## Risks

- **Speaker-path ambiguity on the XVF3800 board:** the reviewed docs are not yet sufficient for a production speaker-interface freeze.
- **AEC degradation if playback routing is wrong:** this is the single highest system-level risk.
- **Pi 5 thermal throttling without cooling:** affects latency, responsiveness, and potentially audio timing.
- **OS / overlay drift for Pi audio paths:** I2S integrations are more fragile than USB audio, especially across newer OS releases.
- **Mechanical/acoustic overconfidence:** breadboard success often does not survive enclosure integration.

## Open Questions

- What exactly is the XVF3800 board's JST speaker connector electrical expectation: passive speaker load, powered speaker module, or board-level amplified output?
- What is the board's exact mechanical outline, mounting-hole pattern, and keep-out region?
- What is the preferred audio-reference routing when using the board's AEC in the target firmware?
- Is 16kHz capture sufficient for the exact STT/TTS stack you intend to ship, or do you want a 48kHz path end to end?
- Does the final product need local wake-word inference on the front end, or is cloud-triggered turn-taking acceptable?

## What to Monitor in the Next 12 Months

- **Seeed XVF3800 documentation maturity:** especially mechanical drawings, schematic details, and clarified speaker-interface guidance.
- **XMOS XVF3800 firmware revisions:** changes to tuning tools, firmware images, and host-control utilities.
- **Raspberry Pi OS audio regressions or fixes:** especially anything affecting Pi 5 I2S, overlays, and multi-device audio routing.
- **Pi 5 pricing and memory market effects:** BOM costs are materially different from early-launch assumptions.
- **Alternative voice front ends:** newer ReSpeaker variants, smarter USB speakerphone modules, or certified conferencing front ends may become more attractive than custom acoustics work.

## Actionable Next Steps

1. Build the first prototype around **Pi 5 8GB + official 27W PSU + Active Cooler + ReSpeaker XVF3800 in USB mode**. Do not start with raw I2S microphones.
2. During bring-up, keep playback on the **same audio front end path** whenever possible so AEC behavior can be evaluated honestly.
3. Before choosing a passive internal speaker, get the **actual XVF3800 board drawings or scope the speaker connector** to verify load expectations, max output, and distortion behavior.
4. Use the **Visaton FRWS 5 - 4 Ohm** only after amplifier/load validation; otherwise use an active speaker temporarily for software and acoustics development.
5. Run an enclosure test plan that measures **wake-word/STT performance**, **echo during playback**, **fan-noise pickup**, **thermal stability**, and **speaker feedback margin**.
6. Freeze on **Raspberry Pi OS Bookworm-class known-good audio behavior** before moving to newer releases; treat audio-stack upgrades as a regression-tested change.
7. If the product is headed toward production volume, decide early whether phase two will stay module-based or move to a **custom XMOS / codec board**, because that drives enclosure and certification decisions.

## Sources and Further Reading

### Primary sources

- Raspberry Pi 5 product brief: https://datasheets.raspberrypi.com/rpi5/raspberry-pi-5-product-brief.pdf
- Raspberry Pi power documentation: https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
- Raspberry Pi 27W USB-C Power Supply: https://www.raspberrypi.com/products/27w-power-supply/
- Raspberry Pi Active Cooler: https://www.raspberrypi.com/products/active-cooler/
- Raspberry Pi thermal article for Pi 5: https://www.raspberrypi.com/news/heating-and-cooling-raspberry-pi-5/
- Raspberry Pi audio board GPIO usage: https://www.raspberrypi.com/documentation/accessories/audio.html
- RP1 overview: https://www.raspberrypi.com/documentation/computers/io-controllers.html
- RP1 peripherals PDF: https://datasheets.raspberrypi.com/rp1/rp1-peripherals.pdf
- Seeed ReSpeaker XVF3800 wiki: https://wiki.seeedstudio.com/respeaker_xvf3800_introduction/
- Seeed ReSpeaker XVF3800 store page: https://www.seeedstudio.com/ReSpeaker-XVF3800-USB-Mic-Array-p-6488.html
- XMOS XVF3800 product page: https://www.xmos.com/xvf3800/
- XMOS XVF3800 documentation index: https://www.xmos.com/develop/xvf3800
- Analog Devices MAX98357A product page: https://www.analog.com/en/products/max98357a.html
- Adafruit MAX98357A Raspberry Pi usage guide: https://learn.adafruit.com/adafruit-max98357-i2s-class-d-mono-amp/raspberry-pi-usage
- Visaton FRWS 5 - 4 Ohm: https://www.visaton.de/en/products/drivers/fullrange-systems/frws-5-4-ohm

### Secondary / contextual sources

- XMOS launch announcement for XVF3800: https://www.xmos.com/xmos-launches-the-xvf3800-high-performance-voice-processor-for-collaboration-applications/
- Seeed ReSpeaker family overview: https://wiki.seeedstudio.com/respeaker/

## Source Confidence Notes

- Raspberry Pi, XMOS, Analog Devices, and Visaton sources were treated as highest-confidence for electrical and mechanical claims.
- Seeed's public wiki is useful and current, but some board-level speaker and mechanical details remain underspecified in the text-accessible materials reviewed here.
- Where the source set was incomplete, assumptions were marked explicitly instead of inferred as facts.
