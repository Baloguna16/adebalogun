# Research Brief: Research secure remote-control architectures for Claude Code and similar coding agents over SMS, email, and messaging channels, with a focus on threat models, auth patterns, approval gating, command whitelists, sandboxing, and auditability.

- Queue ID: 12
- Generated: 2026-03-26T15:11:02+00:00

The brief is saved at [secure-remote-control-coding-agents-research-brief.md](/Users/adekunlebalogun/Projects/secure-remote-control-coding-agents-research-brief.md).

The main conclusion is that SMS, email, and chat should be treated as low-trust transport channels, not as the primary trust anchor for a coding agent. The safer architecture is a three-layer design: transport verification, policy/approval control plane, and sandboxed execution with durable audit logs. Where the evidence is less certain, especially on actual deployment scale, the brief states the assumptions explicitly.
