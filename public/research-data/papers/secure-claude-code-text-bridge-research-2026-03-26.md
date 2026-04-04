# Designing a Secure System to Send Text Messages to Claude Code for Remote Task Execution

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

The most defensible way to let a user send text messages to Claude Code and have it execute tasks remotely is not to expose Claude Code directly to a messaging network. The safer pattern is a layered control plane: messaging channel -> authenticated command gateway -> policy engine -> isolated Claude Code runner -> audit and notification plane. This keeps the messaging transport replaceable and turns the real security boundary into code you control.

Three transport families are viable, but they have very different risk profiles. `Twilio SMS` is the broadest-reach option, but SMS itself is the weakest identity channel and adds carrier-compliance, spam, and fraud concerns. `Telegram` and `Discord` provide materially better application-layer controls because bots receive signed or secret-bearing webhooks and users can be scoped to private chats, server roles, or command permissions. `iMessage` is the least straightforward: Apple’s official path is Messages for Business, which is business-oriented and user-initiated, while consumer iMessage automation typically depends on unofficial bridges such as BlueBubbles or AirMessage and therefore carries supportability and policy risk.

For the execution substrate, Claude Code’s built-in permission system, hooks, and sandboxing are useful primitives but are not sufficient by themselves for remote operation. Anthropic’s documentation is clear that hooks run with the system user’s full permissions and that sandboxing must include both filesystem and network isolation. In practice, a production design should run each remote request inside an ephemeral worktree or container, force `plan` or tightly-scoped `acceptEdits` for most flows, disable bypass mode, and use `PreToolUse` hooks as a deterministic policy layer for command gating.

The recommended architecture for most teams is a `Telegram or Discord command bot` in front of a `job queue` and `isolated Claude Code runner`, with explicit allowlists, per-command approval classes, rate limits, immutable audit logs, and human escalation for high-risk operations. Twilio SMS is best used either as a notification/fallback channel or for a very small command vocabulary such as status, approve, cancel, and summarize. Unofficial iMessage bridges should be treated as experimental or personal-use systems, not a primary enterprise control surface.

Recent developments reinforce this design direction. Twilio’s US A2P 10DLC onboarding remains compliance-heavy and, as of March 2026, Twilio says campaign reviews are taking 10-15 days. Discord continues tightening app-command permissions behavior. Telegram continues evolving bot capabilities. Anthropic is also pushing toward more autonomous operation in Claude Code, including a new “auto mode” announced on March 25, 2026; that increases the importance of external policy enforcement and isolated environments rather than trusting model-side discretion alone.

## Background And Context

Remote agent control by text message sits at the intersection of three systems:

1. A messaging network that accepts user input and returns status.
2. A command-and-control layer that authenticates the sender and normalizes intent.
3. An execution environment where Claude Code can inspect code, edit files, run tools, and report results.

Historically, many “chatops” systems blurred these layers. That was acceptable when commands were low-risk, deterministic shell scripts. Claude Code changes the equation because the executor is an agentic tool that can read, write, browse, and run commands with a large action surface. The correct mental model is therefore not “SMS to script,” but “untrusted conversational input to privileged autonomous runner.”

This is why transport choice matters less than many teams assume. The real system design problem is how to constrain ambiguous natural-language input before it reaches a high-capability agent. Messaging merely adds operational constraints: delivery reliability, webhook authenticity, channel-level permissions, latency expectations, and user experience.

## Current Landscape

### Messaging Transport Options

#### 1. Twilio SMS

Twilio remains the most practical programmable SMS gateway for US-centric deployments. It supports inbound message webhooks, outbound delivery status callbacks, request signing, and mature operational tooling. The main advantage is universal reach: any phone can send and receive SMS.

The limitations are significant:

- SMS is not a strong authentication factor on its own.
- US A2P messaging requires registration and compliance overhead.
- SMS is vulnerable to SIM swaps, recycled numbers, phishing, and delivery ambiguity.
- Twilio warns that webhook parameters can evolve and callbacks can arrive out of order.

This makes SMS suitable for low-bandwidth control messages, but weak as the sole trust anchor for authorizing code execution.

#### 2. Telegram Bot

Telegram offers a straightforward bot platform with either polling or webhooks. For security, `setWebhook` supports a `secret_token` that is echoed back in the `X-Telegram-Bot-Api-Secret-Token` header. Bots also support private chats, which simplifies per-user allowlisting compared with group contexts.

Strengths:

- Cleaner bot UX than SMS.
- Rich command structure and attachments.
- First-class private-chat bot interactions.
- Lower per-message cost than carrier SMS at scale.

Weaknesses:

- Bot token custody becomes critical.
- Telegram’s ecosystem has persistent scam and trust concerns.
- Identity assurance is only as strong as the Telegram account, unless you add your own second factor.

#### 3. Discord App / Slash Commands

Discord is strong when the user already operates inside a team server. Its interaction webhooks are signed with `X-Signature-Ed25519` and `X-Signature-Timestamp`, and command use can be constrained with `default_member_permissions`, app-level permissions, command-level permissions, and role-based guild controls.

Strengths:

- Good authorization model in servers.
- Signed interaction payloads.
- Rich UX for approvals, buttons, and follow-up threads.
- Better support for multi-user operations and review flows.

Weaknesses:

- More complex permission model than Telegram.
- Server admins can still change effective permissions.
- Best for teams, less ideal for one-to-one “text me from anywhere” usage.

#### 4. iMessage / Messages for Business / Unofficial Bridges

Apple’s official supported channel is `Messages for Business`, not generic personal iMessage bot automation. Apple states that only the user can start the conversation and that businesses do not receive the user’s phone number; Apple instead uses an `Opaque ID`. Apple also states that messages are encrypted between the device and Apple’s servers, then relayed to the business over TLS 1.2.

That creates an important architectural constraint: an official Apple route is business-facing, privacy-preserving, and not designed as a general-purpose personal remote shell for Claude Code.

As a result, consumer iMessage automation usually relies on unofficial bridges such as BlueBubbles or AirMessage, which run on a Mac tied to an iMessage account. These can work for personal setups, but they add material risk:

- They depend on a continuously running Mac.
- They may require elevated OS permissions such as Full Disk Access.
- They may use third-party tunnels or notification services.
- They are subject to Apple platform changes and ecosystem breakage.

### Claude Code Execution Landscape

Anthropic provides strong local primitives, but they are primitives:

- Sandboxing can enforce filesystem and network isolation.
- Settings support explicit `allow`, `ask`, and `deny` rules.
- `disableBypassPermissionsMode` can prevent bypass mode.
- Hooks can run before and after tool execution and can deny or ask for approval.

This is promising for remote execution because it enables deterministic policy checks outside the model itself. The downside is that hooks run as shell commands with the full permissions of the system user unless the host environment constrains them.

## Key Players And Stakeholders

### Anthropic

Anthropic controls the execution substrate. Claude Code’s security model is centered on permissions, hooks, and sandboxing. Anthropic is the key enabler for safe policy enforcement, but also the source of feature churn as autonomy increases.

### Twilio

Twilio is the most mature SMS connectivity provider here. It matters because it determines webhook authenticity mechanics, status telemetry, and compliance burden for US messaging.

### Apple

Apple controls the official iMessage-adjacent path through Messages for Business and indirectly controls the viability of unofficial bridges. Apple’s product and policy choices create the largest uncertainty for any iMessage-based design.

### Telegram

Telegram is important because it offers low-friction bot deployment and a private-chat UX that maps well to personal remote control. Its security is adequate for a bot transport if you add your own application-layer authorization.

### Discord

Discord matters for team workflows where remote execution is shared, observable, and role-scoped. Its permissioning model is stronger than SMS for collaborative operations.

### Unofficial Bridge Projects: BlueBubbles, AirMessage, Beeper-style approaches

These projects matter because they are the practical route for “iMessage me and run something.” They are also the least supportable option. BlueBubbles explicitly warns that its QR code contains the server password and Firebase credentials, and it may rely on third-party proxies like ngrok or Cloudflare unless fully self-hosted.

## Core Concepts For A Secure Design

### 1. Separate Transport Identity From Execution Authorization

The sender’s phone number, Telegram account, or Discord identity should not automatically authorize code execution. Treat transport identity as just one signal. Real authorization should require:

- A mapped internal principal.
- Device/channel enrollment.
- A scoped policy profile.
- Optional second-factor confirmation for privileged commands.

### 2. Use Command Classes, Not Free-Form Natural Language, For High-Risk Actions

The safest design is mixed-mode:

- Natural language allowed for read-only tasks and planning.
- Structured commands required for state-changing tasks.

Example command classes:

- `read-only`: summarize logs, explain diff, run status checks.
- `bounded-write`: create branch, edit in sandboxed worktree, run tests.
- `sensitive`: secrets access, deploy, git push, production operations.

Only the first class should be broadly available over text without additional steps.

### 3. Put a Policy Engine In Front Of Claude Code

The gateway should normalize each request into a policy object:

- principal
- transport
- repo/environment
- requested intent
- risk class
- required approval mode
- execution budget

Claude Code should then run with a precomputed policy envelope rather than deciding its own authority.

### 4. Sandboxing Must Be Real, Not Cosmetic

Anthropic’s sandboxing docs explicitly say effective sandboxing requires both filesystem and network isolation. For remote text-driven execution, that implies:

- ephemeral workspace or git worktree per request
- read-only base image where possible
- allowlisted filesystem paths
- denylisted secret files
- explicit network egress allowlist
- short-lived credentials

If a system cannot enforce those controls, it should not permit autonomous write operations from a text channel.

### 5. Audit Logging Must Be Immutable And Correlated

At minimum, log:

- inbound message payload and normalized command
- transport verification result
- principal mapping result
- approval actions and approvers
- Claude session ID and transcript path
- tool calls, denials, and policy decisions
- artifact outputs and final status

Claude Code hooks expose `session_id` and `transcript_path`, which are useful anchor fields for correlation.

## Recommended Reference Architecture

### Preferred Design: Messaging Gateway + Policy Engine + Isolated Runner

```text
User
  -> Messaging Channel (Telegram/Discord/Twilio/iMessage bridge)
  -> Webhook Receiver / Bot Handler
  -> AuthN/AuthZ Service
  -> Command Parser + Risk Classifier
  -> Approval Engine
  -> Job Queue
  -> Isolated Claude Code Runner
  -> Audit/Event Store
  -> Reply/Notification Service
```

### Component Responsibilities

#### Messaging Gateway

- Verify webhook authenticity.
- Normalize inbound text, metadata, and attachments.
- Deduplicate retries.
- Rate-limit per principal and per channel.

#### AuthN/AuthZ Layer

- Map sender to internal principal.
- Enforce allowlist and per-channel enrollment.
- Require step-up approval for high-risk commands.
- Bind each principal to allowed repos, branches, and environments.

#### Command Gating Layer

- Accept a small command DSL for sensitive actions.
- Route free-form requests to `plan-only` unless promoted.
- Reject prompts containing disallowed actions before execution.

#### Isolated Runner

- Launch Claude Code in ephemeral worktree/container.
- Apply restrictive `settings.json`.
- Disable bypass mode.
- Register `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, and `SessionEnd` hooks.
- Stream status back through the channel.

#### Audit Plane

- Store normalized events in append-only storage.
- Hash or sign log records if tamper evidence matters.
- Retain transcripts, diffs, approvals, and status callbacks.

## Architecture Options Compared

| Option | Security posture | Operational complexity | UX quality | Recommended use |
| --- | --- | --- | --- | --- |
| Twilio SMS -> gateway -> Claude runner | Medium-low without extra MFA; medium with strong gating | Medium | Low-medium | Universal access, low-risk commands, approvals/fallback |
| Telegram bot -> gateway -> Claude runner | Medium-high | Low-medium | High | Best default for personal or small-team remote control |
| Discord slash-command bridge -> gateway -> Claude runner | High in team environments | Medium | High | Best for shared team workflows and reviewable approvals |
| Official Apple Messages for Business -> gateway -> Claude runner | Medium, but business/product constrained | High | Medium | Niche business workflow, not ideal for personal remote control |
| Unofficial iMessage bridge -> gateway -> Claude runner | Low-medium | Medium-high | High for Apple-centric users | Personal/experimental only |

## Authentication And Authorization Design

### Authentication

Recommended layered approach:

1. Verify channel authenticity.
2. Match sender to enrolled identity.
3. Require a second factor for privileged operations.
4. Issue a short-lived execution token for the approved job.

Channel-specific notes:

- `Twilio`: validate `X-Twilio-Signature`; do not trust phone number alone.
- `Telegram`: require webhook secret token and allowlisted chat IDs.
- `Discord`: verify Ed25519 signature and restrict command contexts.
- `iMessage bridge`: treat bridge credentials as weak unless backed by your own approval service.

### Authorization

Model permissions by tuple:

`principal x repo x environment x command_class x channel`

Examples:

- Alice may run `read-only` on repo A from Telegram private chat.
- Alice may run `bounded-write` on repo A only after approve-from-mobile plus desktop passkey.
- Nobody may run `sensitive` from SMS.

## Command Gating And Approval Patterns

### Recommended Gating Rules

- Default all free-form prompts to `plan` mode.
- Promote to execution only through explicit verbs like `run`, `apply`, or `open-pr`.
- Require structured confirmation for writes, for example: `approve job-482 apply`.
- Never allow raw shell passthrough from a text channel.
- Deny deploy, secret access, and arbitrary network calls by default.

### Claude Code Controls To Use

- `allow` rules only for narrowly safe tools.
- `ask` rules for medium-risk operations.
- `deny` rules for secret files, network tools, package publishing, and git push.
- `disableBypassPermissionsMode` enabled.
- `PreToolUse` hooks to deny dangerous file paths and command patterns.
- `PostToolUse` and `PostToolUseFailure` hooks to record outcomes and trigger rollback/escalation.

## Audit Logging, Observability, And Forensics

A production system should preserve a complete chain of custody:

- message received
- webhook verified
- principal resolved
- policy selected
- approval granted
- runner started
- Claude session ID assigned
- each material tool action logged
- output returned
- job closed

Twilio status callbacks should also be logged because delivery order is not guaranteed. Discord and Telegram webhook metadata should be persisted with raw headers for forensic validation. Claude transcript references should be copied or snapshotted because local transcript paths alone are not durable retention.

## Failure Handling

### Expected Failure Modes

- webhook replay or signature failure
- duplicate inbound messages
- channel delivery failure
- model refusal or tool denial
- sandbox escape attempt blocked by policy
- host failure during long-running task
- unofficial iMessage bridge disconnect or Mac sleep

### Handling Strategy

- idempotency keys on inbound events
- job state machine: `received -> verified -> queued -> running -> awaiting_approval -> completed/failed/canceled`
- resumable status updates
- explicit timeout budgets per command class
- safe fallback responses such as “plan created, execution requires approval”
- dead-letter queue for malformed or unverifiable inputs
- periodic reconciliation for outbound message status

## Practical Opportunities

- Personal “remote operator” workflow for code review, triage, or issue summarization while away from a laptop.
- Team chatops workflow for PR prep, CI triage, log investigation, and patch generation.
- Approval-by-text workflow where the channel approves a job but execution happens in a more secure runner.
- Incident response assistant for read-only observability tasks before a human opens a privileged shell.

The highest-value early use cases are read-heavy and bounded-write tasks, not general remote coding.

## Risks And Challenges

### Technical Risks

- Prompt injection through pasted logs, URLs, or issue text.
- Over-permissive hooks or host credentials.
- Inadequate network isolation enabling exfiltration.
- Hidden coupling between transport retries and job re-execution.

### Security Risks

- SIM swap or compromised messaging account.
- Bot token leakage.
- iMessage bridge compromise via QR code, Mac compromise, or tunnel compromise.
- Transcript leakage if logs contain secrets or proprietary code.

### Product And Policy Risks

- Apple can break or constrain unofficial iMessage workflows.
- Discord permission semantics are evolving.
- Anthropic autonomy features may change operator expectations faster than controls mature.

### Compliance Risks

- SMS record retention, consent, and A2P rules.
- Export-controlled code or customer data crossing channels.
- Message content entering provider logs or third-party tunnel services.

## Open Questions

- Do you need “text me from any phone,” or only “message me from an enrolled app account”?
- Is the system for one user, a small engineering team, or production support staff?
- Are write operations required at launch, or can phase 1 be read-only plus approvals?
- Must the channel itself carry sensitive data, or only references and summaries?
- Is Apple ecosystem affinity important enough to justify unofficial bridge risk?

## Recent Developments

- **Claude Code autonomy is increasing.** On March 25, 2026, The Verge reported Anthropic’s new Claude Code “auto mode,” a research-preview feature intended to mediate permissions decisions. This likely improves usability, but it does not remove the need for external sandboxing and policy gates.
- **Twilio SMS compliance remains a lead-time issue.** Twilio’s A2P 10DLC documentation says US campaign reviews are currently taking 10-15 days as of March 2026, which affects rollout timelines.
- **Discord permission behavior is changing.** Discord’s recent developer changelog describes changes to how app-level, command-level, and `default_member_permissions` interact, reducing accidental permission escalation but increasing the need to test guild-specific behavior.
- **Telegram bot capabilities continue to expand.** Telegram’s Bot API changelog shows continued active development through 2025 and 2026; this is good for product flexibility, but security assumptions should be reviewed when the platform changes.
- **Anti-fraud controls in SMS are improving.** Twilio has made SMS pumping protection and related fraud tooling more prominent. That matters if SMS is used for approvals or OTP-style confirmations.

## What To Monitor In The Next 12 Months

- Anthropic changes to Claude Code permission modes, hooks, sandboxing, and any official remote/SDK execution patterns.
- Real-world behavior of Claude Code auto mode after broader release beyond research preview.
- Discord app-permission rollout and whether guild-level overrides introduce operational surprises.
- Telegram bot API changes affecting private chats, webhooks, or identity features.
- Twilio A2P registration lead times, fees, and anti-fraud defaults.
- Apple policy or platform changes affecting Messages for Business and unofficial iMessage bridges.
- Any new enterprise-grade “agent control plane” products that add policy, identity, and audit layers around coding agents.

## Actionable Next Steps

1. **Choose the trust model first.** Decide whether this is a personal convenience tool, an internal team tool, or a production-support system. That decision should drive the channel choice more than user preference.
2. **Start with Telegram or Discord, not iMessage.** They provide better bot ergonomics and clearer webhook security. Use SMS only for fallback notifications or narrow approval flows unless universal reach is mandatory.
3. **Launch phase 1 as read-only plus approvals.** Permit planning, summarization, diff explanation, CI triage, and job approval. Do not allow direct state-changing free-form prompts in the first release.
4. **Build a command gateway before connecting Claude Code.** Implement transport verification, principal mapping, risk classification, rate limiting, and idempotency first.
5. **Run Claude Code only in isolated runners.** Use ephemeral worktrees or containers, deny broad network access, mount only required directories, and inject only short-lived credentials.
6. **Enforce policy through Claude Code settings and hooks.** Enable deny rules for sensitive files and commands, disable bypass mode, and use `PreToolUse` hooks as the hard control point.
7. **Require step-up approval for writes.** Use a separate approval verb or second factor before any file modification, git push, deploy, or external network action.
8. **Implement full-fidelity audit logging from day one.** Persist raw inbound events, normalized commands, approvals, runner metadata, transcript references, and result artifacts.
9. **Test failure modes explicitly.** Simulate webhook replay, duplicate delivery, bot-token leak, runner crash, tunnel outage, and model refusal before broad rollout.
10. **Treat iMessage bridging as optional and experimental.** If you later add BlueBubbles or a similar bridge, isolate it as a separate transport adapter behind the same gateway and policy engine.

## Bottom-Line Recommendation

If the goal is a secure, supportable system rather than a hobby project, build a `Telegram or Discord bot -> policy gateway -> isolated Claude Code runner` architecture and keep SMS as a notification or approval side-channel. Use iMessage only if the user experience benefit is so important that you explicitly accept unofficial bridge risk. The design center should be deterministic authorization, strong sandboxing, and tamper-evident audit logs, not convenience at the transport layer.

## Assumptions And Uncertainties

- This brief assumes the system is for internal use, not an external customer-facing product.
- It assumes remote operations will target development or staging assets first, not production systems.
- It infers that official Apple-supported messaging paths are not a good fit for generic personal remote agent control because Apple’s documented path is Messages for Business, not consumer bot automation.
- It treats unofficial iMessage bridges as operationally fragile based on their architecture and dependency patterns; exact breakage risk is inherently uncertain because it depends on Apple changes and project maintenance.
- It treats the March 25, 2026 Claude Code “auto mode” news as current reporting, not as a substitute for primary Anthropic documentation.

## Sources And Further Reading

### Primary Sources

- Anthropic Claude Code sandboxing: https://code.claude.com/docs/en/sandboxing
- Anthropic Claude Code settings: https://code.claude.com/docs/en/settings
- Anthropic Claude Code hooks: https://code.claude.com/docs/en/hooks
- Anthropic Claude Code overview: https://docs.anthropic.com/en/docs/claude-code/overview
- Twilio security: https://www.twilio.com/docs/usage/security
- Twilio webhook security: https://www.twilio.com/docs/usage/webhooks/webhooks-security
- Twilio A2P 10DLC: https://www.twilio.com/docs/messaging/compliance/a2p-10dlc
- Twilio status callbacks: https://www.twilio.com/docs/messaging/guides/track-outbound-message-status
- Twilio delivery logging best practices: https://www.twilio.com/docs/messaging/guides/outbound-message-logging
- Telegram Bot API: https://core.telegram.org/bots/api
- Telegram bots overview: https://core.telegram.org/bots
- Discord interactions overview: https://docs.discord.com/developers/interactions/overview
- Discord application commands: https://docs.discord.com/developers/interactions/application-commands
- Discord developer changelog: https://docs.discord.com/developers/change-log
- Apple Messages for Business: https://www.apple.com/ios/business-chat/
- Apple platform security for Messages for Business: https://support.apple.com/en-asia/guide/security/sec1c603aab4/web

### Secondary Sources

- BlueBubbles FAQ: https://bluebubbles.app/faq/
- The Verge on Claude Code auto mode, March 25, 2026: https://www.theverge.com/ai-artificial-intelligence/900201/anthropic-claude-code-auto-mode
- The Verge on Telegram third-party verification, January 2, 2025: https://www.theverge.com/2025/1/2/24334132/telegram-third-party-verification-combat-scams
- The Verge on Beeper’s combined app and on-device messaging direction, February 25, 2025: https://www.theverge.com/news/619018/beeper-texts-com-combined-app-update-automattic
