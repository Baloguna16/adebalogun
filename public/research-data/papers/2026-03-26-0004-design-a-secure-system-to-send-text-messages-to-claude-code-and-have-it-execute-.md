# Research Brief: Design a secure system to send text messages to Claude Code and have it execute tasks remotely, including architecture options (iMessage, Twilio SMS, Telegram/Discord bridge), auth/authorization, command gating, audit logging, sandboxing, failure handling, and step-by-step implementation plan.

- Queue ID: 4
- Generated: 2026-03-26T11:21:07+00:00

The brief is saved at [secure-claude-code-text-bridge-research-2026-03-26.md](/Users/adekunlebalogun/Projects/secure-claude-code-text-bridge-research-2026-03-26.md).

It starts with an executive summary and covers the current landscape, key players, core concepts, recent developments, architecture options across iMessage/Twilio SMS/Telegram/Discord, and a concrete security design for auth, authorization, command gating, audit logging, sandboxing, failure handling, monitoring, and implementation steps.

Bottom line: the brief recommends `Telegram or Discord -> policy gateway -> isolated Claude Code runner` as the safest default, with SMS mainly for notifications or narrow approvals, and unofficial iMessage bridges treated as experimental due to supportability and security risk.
