# Research Brief: For a Raspberry Pi voice agent device, research the best production-ready hardware and software architecture for always-on wake word, VAD, STT, TTS, echo cancellation, latency management, and fail-safe confirmations under real home/office conditions.

- Queue ID: 11
- Generated: 2026-03-26T14:16:48+00:00

Created the research brief at [raspberry-pi-voice-agent-research-brief.md](/Users/adekunlebalogun/Projects/raspberry-pi-voice-agent-research-brief.md).

It includes an executive summary, current landscape, key players, core concepts, recent developments, risks, opportunities, open questions, a `What to monitor in the next 12 months` section, and numbered `Actionable next steps`. The core recommendation is a hybrid production architecture: `Raspberry Pi 5` as orchestrator, `XMOS`-class DSP audio front end, local wake word/VAD, two-tier STT, streaming TTS, explicit AEC strategy, and risk-based confirmations.

If you want, I can also turn this into a tighter 1-2 page decision memo or a vendor comparison matrix next.
