# Secure Remote-Control Architectures for Claude Code and Similar Coding Agents over SMS, Email, and Messaging Channels

**Date:** 2026-03-26  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

Remote-controlling a coding agent over SMS, email, or chat is feasible, but the secure design is not "let the agent trust the channel." The secure design is "treat the channel as an untrusted transport for intent signals, then bind those signals to a stronger control plane." That distinction is the central architectural conclusion of this brief.

The main reason is straightforward: SMS and email are weak identity channels relative to the privileges a coding agent can exercise. NIST SP 800-63B states that out-of-band authentication is not phishing-resistant, treats PSTN-based delivery as restricted, and explicitly says email must not be used for out-of-band authentication. For messaging platforms, authenticity is better than raw SMS or email when webhooks are signed or token-bound, but those mechanisms verify platform delivery, not necessarily the human sender's current authorization for a high-impact action.

The practical implication is that secure remote control should be split into three layers. First, a **transport adapter** receives inbound SMS/email/chat messages and verifies transport authenticity where possible. Second, a **policy and approval layer** resolves who the sender is, what they are allowed to do, and whether the requested action requires step-up approval. Third, an **execution layer** runs the coding agent in a sandbox with scoped filesystem, network, tool, and credential access, while producing durable audit logs. Systems that collapse these layers into a single "message in, command out" path are the highest-risk designs.

The vendor landscape is moving in the right direction. Anthropic, OpenAI, GitHub, OpenHands, and Cline all now expose increasingly explicit concepts for permissions, approvals, sandboxing, and observability. Anthropic has emphasized permission-based control, hooks, sandboxed bash, and OpenTelemetry-based monitoring for Claude Code. GitHub's Copilot coding agent runs in an ephemeral GitHub Actions environment with branch, workflow, and permission gates. OpenAI's Codex tooling distinguishes between suggest, auto-edit, and full-auto modes, and OpenAI's recent security writing frames prompt injection as a social-engineering problem that must be contained with system boundaries, not only input filtering. Open-source agents such as OpenHands and Cline also make the tradeoffs visible: they can be powerful, but unsafe modes and broad auto-approval quickly erase meaningful safety margins.

The bottom line is that remote control over low-trust channels should be limited to low-risk intents by default: status checks, queued-task creation, draft-plan requests, and approval of pre-rendered actions with strong secondary verification. High-impact actions such as shell execution, package installation, networked operations, credential use, branch push, or workflow execution should require stronger authentication, human confirmation on a trusted surface, and sandbox constraints that assume prompt injection or sender compromise will eventually occur.

## Scope, Assumptions, and Framing

This brief focuses on architectures for controlling coding agents such as Claude Code, OpenAI Codex, GitHub Copilot coding agent, OpenHands, and Cline through SMS, email, and messaging channels.

Assumptions:

- "Remote control" includes issuing instructions, approving actions, requesting status, and receiving notifications through channels such as SMS, email, Slack, Discord, and Telegram.
- The security objective is not merely preventing spoofed inbound messages; it is preventing unauthorized or unsafe agent actions even when prompts, channels, or external context are adversarial.
- Public vendor documentation provides more detail on controls than on actual deployment volumes. Where adoption scale is discussed below, conclusions are qualitative unless explicitly sourced.

## Background and Core Concepts

### Why this problem is different from ordinary chatbot integration

A coding agent is not just a text responder. It may read source code, edit files, execute shell commands, use external tools, access MCP servers, call APIs, and interact with CI/CD or Git hosting. That creates a compound trust boundary:

1. The **messaging channel** conveys a request.
2. The **policy engine** interprets and authorizes the request.
3. The **agent** plans actions.
4. The **tool layer** performs real operations.
5. The **environment** contains repositories, secrets, credentials, and network reachability.

Security failures can happen at any layer. Prompt injection is only one example. Others include sender spoofing, SIM-swap-mediated approvals, webhook forgery, command overbreadth, stale allowlists, unsafe hooks, overpowered MCP servers, and weak logging.

### Core security concepts

**Transport authenticity**  
This means verifying the message came from the platform. Twilio signs inbound webhooks with `X-Twilio-Signature`; Slack signs requests with `X-Slack-Signature`; Discord uses `X-Signature-Ed25519` plus a timestamp; Telegram recommends a secret path for webhook validation. These controls are necessary, but they verify platform delivery rather than business authorization.

**Sender identity binding**  
A secure system must map the incoming message to an enrolled identity with a known risk posture. A phone number, email address, or chat handle is not enough for high-impact operations unless it is bound to stronger proof and current policy.

**Approval gating**  
Approvals are not binary. The meaningful distinction is between:

- No approval required for low-risk reads
- Inline approval for bounded edits
- Step-up approval for shell, network, package, credential, or deployment actions
- Two-person review for irreversible or production-impacting actions

**Command whitelisting**  
Remote control should almost never expose raw shell. It should expose a small intent vocabulary, such as `status`, `show diff`, `queue task`, `approve patch`, `run tests`, or `open PR`, with tight parameter validation and risk scoring.

**Sandboxing and least privilege**  
The execution environment must assume that a malicious prompt or mistaken approval will eventually happen. Sandboxes, filesystem boundaries, network restrictions, scoped credentials, read/write separation, and branch protections are what keep a single bad action from becoming a breach.

**Auditability**  
A secure remote-control system must answer: who requested this, through which channel, how was the sender verified, what policy allowed it, what the agent saw, what tools were called, what changed, and whether a human approved the side effects.

## Current Landscape

### 1. Agent platforms are adding explicit control surfaces

Anthropic's Claude Code uses a permission-based architecture with read-only defaults, explicit approvals for editing and commands, write restrictions to the working directory, command allowlisting, and optional sandboxed bash. Claude Code also supports hooks that can deny or rewrite tool inputs before execution. The same documentation surface now includes monitoring via OpenTelemetry, including user-prompt and tool-result events plus code-edit decision metrics. This is a strong fit for remote-control architectures because the platform already exposes the right control points.

OpenAI's Codex tooling also separates modes by autonomy. The OpenAI Help Center describes `Suggest`, `Auto Edit`, and `Full Auto`, with `Full Auto` executing autonomously inside a sandboxed, network-disabled environment scoped to the current directory. OpenAI's broader security guidance now explicitly frames prompt injection as a social-engineering problem and argues that defense must constrain impact even when some attacks succeed.

GitHub Copilot coding agent is more opinionated and more centralized. It runs in an ephemeral GitHub Actions-powered environment, has branch restrictions, workflow approval controls, and only responds to users with write permissions. This is one of the cleaner reference designs for asynchronous remote operation because GitHub already supplies identity, repo permissions, PR review, branch protection, and session logging.

OpenHands and Cline show the open-source end of the spectrum. OpenHands supports Docker, process, and remote sandboxes, and explicitly warns that process mode has no isolation. Cline exposes granular auto-approve settings but also ships a documented "YOLO mode" that auto-approves everything, including destructive commands. These tools are valuable for experimentation, but they make misconfiguration risk more visible.

### 2. Messaging transports differ sharply in security quality

**SMS** is useful for reachability and alerts, but weak for authorization. NIST says out-of-band authentication is not phishing-resistant and that PSTN-based delivery is restricted. It recommends considering risk indicators such as SIM change, device swap, and number porting.

**Email** is acceptable for notification and low-risk workflows, but poor as a sole control channel. NIST explicitly states email must not be used for out-of-band authentication. If email is used for approvals, it should carry signed or tokenized approval links that terminate in a stronger authenticated surface, not function as the authenticator itself.

**Signed webhook platforms** such as Slack and Discord are materially better than raw SMS/email for inbound authenticity because the application can verify signed requests. Telegram is weaker by default unless the implementer uses a secret path or equivalent compensating controls.

**Enterprise action surfaces** are improving. Microsoft Outlook Actionable Messages require sender verification via SPF/DKIM or signed cards, and Microsoft recommends signed cards as fundamentally more secure because they do not rely on DNS records alone. Google and Microsoft have also tightened bulk email authentication requirements, increasing the baseline viability of email as a trustworthy notification channel, though not enough to make it a high-assurance approval channel by itself.

### 3. Recent developments that materially change the design space

- **April 2, 2025:** Microsoft published new Outlook.com requirements for high-volume senders, reinforcing SPF/DKIM/DMARC as baseline email trust signals.
- **May 19, 2025:** GitHub introduced Copilot coding agent, emphasizing sandboxed environments, workflow gating, branch restrictions, and compliance-oriented attribution.
- **October 20, 2025:** Anthropic published details on Claude Code sandboxing, stating internal use reduced permission prompts by 84% while adding filesystem and network isolation.
- **November 2025:** Gmail began ramping enforcement against non-compliant bulk email, including disruptions and rejections for senders that do not meet authentication requirements.
- **November 7, 2025 and March 11, 2026:** OpenAI published prompt-injection security guidance that increasingly treats agent compromise as a social-engineering and containment problem, not just a filtering problem.
- **2025-2026:** OWASP expanded practical guidance for agent security, including least-privilege tool design, human-in-the-loop controls, monitoring, and multi-agent communication concerns.

## Key Players and What They Contribute

### Agent vendors

**Anthropic / Claude Code**  
Strongest relevance for local or hybrid agent control. Key features: permissions hierarchy, hooks, deny/ask/allow rules, sandboxed bash, telemetry, and project-scoped write controls.

**OpenAI / Codex**  
Important reference for mode-based autonomy and sandboxed local/cloud execution. Strong recent public framing around prompt injection and containment.

**GitHub / Copilot coding agent**  
Best reference for repo-native asynchronous operation with built-in governance: write-permission checks, ephemeral environments, branch limits, workflow approval gates, and PR-based review.

**OpenHands**  
Useful for self-hosted architectures. Strongly illustrates the importance of selecting a safe sandbox provider; process mode is explicitly unsafe.

**Cline**  
Useful for understanding the outer edge of user-controlled autonomy. Strong permission controls exist, but unsafe auto-approval modes make governance essential.

### Channel and identity infrastructure

**Twilio**  
Dominant practical choice for SMS and inbound telephony. Provides webhook signatures and multi-channel verification tooling, but its own guidance acknowledges SMS is weaker than push or TOTP.

**Slack and Discord**  
Better choices than SMS for interactive remote control because inbound authenticity can be verified cryptographically and enterprise identity can be layered on top.

**Telegram**  
Operationally convenient, but security posture depends heavily on bot-token hygiene and webhook hardening.

**Google and Microsoft email ecosystems**  
Not agent vendors, but highly relevant because their sender-authentication requirements raise the floor for email trustworthiness and make spoofing harder at scale.

## Threat Model

### Primary threat actors

- External attacker spoofing or replaying inbound requests
- Adversary who compromises a phone number, mailbox, chat account, or bot token
- Insider with legitimate messaging access but excessive agent privileges
- Supply-chain attacker who injects malicious instructions into code, docs, issues, or web content the agent reads
- Prompt-injection attacker who tricks the agent into unsafe tool use
- Operator error caused by approval fatigue, vague commands, or unsafe automation defaults

### High-priority attack paths

**1. Channel spoofing or takeover**  
Examples: SIM swap, mailbox compromise, stolen Slack token, leaked Telegram bot token, forged webhook calls where signature validation is missing.

**2. Approval laundering**  
A low-friction channel is used to approve a high-risk action without showing the true blast radius. Example: "reply YES to continue" for an action that actually runs shell, installs packages, and pushes code.

**3. Prompt injection via remote content**  
The remote request asks the agent to inspect an issue, PR, document, or webpage that contains hidden instructions. OpenAI's recent guidance argues this is increasingly social engineering rather than simple string-based prompt override.

**4. Tool overreach**  
The agent has raw bash, broad network access, secrets in environment variables, writable home directories, or unrestricted MCP tools. A single bad step becomes host compromise or data exfiltration.

**5. Weak auditability**  
The team cannot reconstruct who approved what, whether the approval was step-up authenticated, what diff was shown, or which tool invocation produced the side effect.

## Secure Architecture Patterns

### Pattern A: Notification-only remote control

Use case: status updates, completion alerts, approval-needed notices.

Security posture:

- Safest pattern
- Channel only carries notifications
- All approvals happen on a trusted surface such as local terminal, GitHub PR, or authenticated web console

Recommendation: make this the default starting point.

### Pattern B: Low-risk remote commands over messaging

Use case: `status`, `show current task`, `pause`, `resume queued task`, `summarize diff`, `open PR draft`.

Security posture:

- Acceptable if requests are authenticated and mapped to an enrolled identity
- Commands must be selected from a fixed intent catalog
- No raw shell, no arbitrary file paths, no arbitrary URLs

Recommended controls:

- Signed webhook verification
- Sender allowlist plus enterprise identity mapping
- Per-command risk classification
- Session expiration and replay protection
- Immutable audit log

### Pattern C: Two-step approval architecture

Use case: remote approval from SMS/email/chat for actions already prepared elsewhere.

Security posture:

- Good balance of usability and safety
- Message contains a summary plus signed deep link
- Actual approval occurs on a stronger authenticated surface

Recommended controls:

- Channel message is informational, not authoritative
- Approval page shows exact diff, commands, tool scopes, and expiry
- Step-up auth for risky operations
- Bind approval to a specific action hash, actor, and time window

### Pattern D: Fully remote high-autonomy control

Use case: issue a command by SMS or chat and let the agent edit, run tests, and push autonomously.

Security posture:

- High risk
- Only reasonable in tightly sandboxed, disposable, low-sensitivity environments

Required controls if attempted:

- Ephemeral sandbox or VM per task
- No host credentials; use short-lived scoped tokens
- Strict branch/workflow protections
- Narrow domain allowlist or no network
- Tool denylist and allowlist
- Automatic rollback or checkpointing
- Human review before merge or deployment

## Authentication and Approval Patterns

### Recommended auth hierarchy

1. **Best:** enterprise identity-backed messaging plus signed requests plus step-up approval on a trusted surface
2. **Good:** signed webhook platform plus enrolled sender identity plus per-action confirmation links
3. **Weak but sometimes acceptable for low-risk actions:** SMS/email as notification and low-risk command transport only
4. **Not recommended:** treating SMS reply, email reply, or Telegram chat handle as sufficient authorization for shell or code-changing actions

### Practical approval taxonomy

**Allow without approval**

- Status queries
- Read-only summaries
- Viewing logs, diffs, and task state

**Single approval**

- Draft patch generation
- Read-only test planning
- Opening a PR draft without workflow execution

**Step-up approval**

- Running shell commands
- Installing dependencies
- Network access
- Accessing MCP servers
- Writing outside project scope
- Using secrets or cloud credentials

**Dual control**

- Merging to protected branches
- Triggering production deployment
- Rotating credentials
- Executing destructive repo or infrastructure actions

## Sandboxing, Whitelists, and Auditability

### Sandboxing

The secure default is an ephemeral, disposable execution environment with:

- project-scoped filesystem access
- network disabled or domain-allowlisted
- short-lived credentials injected only when needed
- no access to operator home directories or developer workstation state
- branch-level rather than repo-wide write capability

GitHub Copilot coding agent and cloud Codex tasks provide the clearest product examples. Claude Code can approximate this with sandboxed bash plus strict permissions and hooks. OpenHands should use Docker or remote sandbox, not process mode, for anything beyond controlled testing.

### Command and tool whitelists

Whitelists should be intent-based, not shell-based. For example:

- `run_tests` maps to a repo-specific safe command set
- `format_changed_files` maps to approved formatters
- `open_pull_request` maps to Git host API calls with branch restrictions

Avoid exposing arbitrary:

- shell command strings
- file globs outside repo policy
- URLs for fetch/scrape
- MCP tool names unless each tool is separately risk-rated

### Auditability

A mature system should log:

- inbound message metadata and verified sender identity
- channel verification result
- normalized intent and policy decision
- approval artifact shown to user
- step-up auth result
- agent plan and tool calls
- sandbox ID and credential scope
- diff, branch, commit, PR, and workflow outcomes

Claude Code's telemetry model is notable here: it includes user-prompt events, tool-result events, and code-edit decision metrics with session identifiers and account attributes. That makes it suitable as a component in a larger audit pipeline.

## Practical Opportunities

- **Executive or on-call control plane:** approve safe queued tasks, pause jobs, request summaries, and triage results without opening an IDE.
- **Asynchronous engineering management:** route issues into agent work queues and receive PR drafts or risk summaries over messaging.
- **Secure review workflows:** use messaging for attention-routing and trusted surfaces for final approval.
- **Field operations:** enable non-developers to request bounded actions such as "generate incident timeline from repo and logs" without granting repo shell access.
- **Compliance and forensics:** combine agent telemetry, PR logs, and messaging metadata for stronger reconstruction of autonomous actions.

## Risks and Open Questions

### Risks

- Approval fatigue will cause humans to bless unsafe operations unless prompts are collapsed into high-signal previews.
- Organizations will overestimate SMS/email identity assurance.
- Remote control will encourage broader auto-approve configurations than teams would accept in local usage.
- MCP and browser tools expand the attack surface beyond code execution into data exfiltration and third-party actions.
- Hooks improve policy enforcement but are themselves powerful code that can exfiltrate data if misconfigured.

### Open questions

- What is the right standard approval artifact for agent actions across vendors?
- How should prompt-injection risk be surfaced to approvers in a way they can actually evaluate?
- Can vendors provide cryptographically signed action manifests so approvals are bound to exact tool plans and diffs?
- How much audit detail is enough without exposing sensitive code or prompts into central logs?
- Which controls should be implemented in the agent, in the orchestration layer, and in the runtime platform?

## What to Monitor in the Next 12 Months

- Whether Claude Code, Codex, and Copilot expose more first-class enterprise policy APIs for approvals, tool restrictions, and audit export.
- Adoption of signed action manifests or tamper-evident approval tokens for agent actions.
- More vendor guidance on MCP security, especially permission scoping and server provenance.
- Further tightening of email authentication enforcement by Google and Microsoft, which will improve notification-channel trust but not eliminate the need for stronger approval surfaces.
- Whether prompt-injection defenses shift from mainly model-side mitigations to more explicit architectural controls such as data provenance labeling, trust zones, and execution containment.
- Security disclosures involving coding agents operating over chat or browser channels; these will likely clarify the real-world failure modes faster than documentation alone.
- Expansion of agent observability standards, especially OpenTelemetry schemas for tool calls, approvals, and rollback events.

## Actionable Next Steps

1. Define a strict remote intent catalog and ban arbitrary shell over SMS, email, and chat.
2. Split the system into transport, policy, and execution layers; do not let messaging handlers call the agent runtime directly.
3. Treat SMS and email as low-trust channels for notification and low-risk requests, not as sole authenticators for high-impact approvals.
4. Require signed webhook verification for Slack, Discord, and Twilio integrations, and compensate for weaker Telegram defaults with secret-path or equivalent controls.
5. Make high-risk actions terminate on a stronger approval surface that shows the exact diff, tool scopes, and expiry before approval.
6. Run agent tasks in ephemeral sandboxes with project-scoped filesystem access, no host credentials, and network disabled or tightly allowlisted.
7. Implement per-tool and per-command policy with deny/ask/allow semantics, plus repo-specific wrappers for safe operations.
8. Add durable audit logging that links inbound request, identity proof, policy decision, approval artifact, sandbox session, tool calls, and code outputs.
9. Start with notification-only or low-risk remote control, then expand only after measuring approval quality, false positives, and rollback frequency.
10. Red-team the full path for spoofing, replay, SIM swap, prompt injection, approval laundering, and exfiltration before enabling broader autonomy.

## Key Takeaways

1. The secure pattern is not "trust the channel"; it is "treat the channel as a low-trust transport and bind it to a stronger control plane."
2. SMS and email are useful for reachability, but weak as sole authorization channels for powerful coding agents.
3. The most important controls are approval design, least-privilege tool access, sandboxing, and auditability, not prompt filtering alone.
4. Vendor platforms are converging on the right primitives: permission modes, branch restrictions, hooks, sandboxing, and telemetry.
5. The best early deployment pattern is notification plus trusted-surface approval, not direct autonomous execution from a text message.
6. Open-source agents can match many capabilities, but unsafe modes and weak defaults make governance more important, not less.
7. Remote control should expand only as fast as the organization can verify identity, constrain execution, and reconstruct failures.

## Sources and Further Reading

### Primary Sources

- Anthropic Claude Code Security: https://docs.anthropic.com/en/docs/claude-code/security
- Anthropic Claude Code Settings: https://docs.anthropic.com/en/docs/claude-code/settings
- Anthropic Claude Code Hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
- Anthropic Claude Code Monitoring: https://docs.anthropic.com/en/docs/claude-code/monitoring-usage
- Anthropic engineering post on sandboxing: https://www.anthropic.com/engineering/claude-code-sandboxing
- OpenAI Codex CLI getting started: https://help.openai.com/en/articles/11096431-openai-codex-ci-getting-started
- OpenAI prompt injection guidance: https://openai.com/safety/prompt-injections/
- OpenAI designing agents to resist prompt injection: https://openai.com/index/designing-agents-to-resist-prompt-injection/
- GitHub Copilot coding agent docs: https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent
- OpenHands sandbox overview: https://docs.openhands.dev/openhands/usage/sandboxes/overview
- OpenHands process sandbox warning: https://docs.openhands.dev/openhands/usage/sandboxes/process
- Cline auto-approve and YOLO mode: https://docs.cline.bot/features/auto-approve
- Twilio webhook security: https://www.twilio.com/docs/usage/webhooks/webhooks-security
- Twilio verification best practices: https://www.twilio.com/docs/verify/developer-best-practices
- Slack signed request verification: https://docs.slack.dev/authentication/verifying-requests-from-slack/
- Discord interaction signature verification: https://docs.discord.com/developers/interactions/overview
- Telegram bot webhook authenticity guidance: https://core.telegram.org/bots/faq
- NIST SP 800-63B: https://pages.nist.gov/800-63-4/sp800-63b.html
- Microsoft security requirements for actionable messages: https://learn.microsoft.com/en-us/outlook/actionable-messages/security-requirements
- Google email sender guidelines FAQ: https://support.google.com/a/answer/14229414

### Standards and Security Guidance

- OWASP AI Agent Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html
- OWASP Prompt Injection: https://owasp.org/www-community/attacks/PromptInjection
- OWASP MCP Top 10 prompt-injection item: https://owasp.org/www-project-mcp-top-10/2025/MCP06-2025%E2%80%93Prompt-InjectionviaContextual-Payloads

### Useful Market and Product References

- OpenAI introducing Codex: https://openai.com/index/introducing-codex/
- GitHub Copilot coding agent announcement: https://github.com/newsroom/press-releases/coding-agent-for-github-copilot
- Microsoft Outlook high-volume sender requirements: https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730

