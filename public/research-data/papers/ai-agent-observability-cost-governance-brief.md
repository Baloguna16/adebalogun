# Full Observability and Cost-Governance Stack for AI Agent Workflows Spanning OpenAI and Claude

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

Enterprises running agent workflows across OpenAI and Anthropic now have enough provider-native telemetry to build serious FinOps and observability foundations, but not enough to rely on provider dashboards alone. OpenAI exposes organization usage and cost APIs, project-level rate limits, and project budget alerts. Anthropic exposes an Admin Usage & Cost API with near-real-time freshness, explicit breakdowns for cached input, output, workspace, service tier, and some server-side tool costs. Both providers also expose pricing structures that materially change economics depending on caching, batch usage, tool invocation, long-context requests, and premium service tiers. The result is that "token count x list price" is no longer an adequate accounting model for agent systems.

The right stack is therefore a layered one: provider ingestion for billable truth, in-app tracing for session and business attribution, a normalized cost ledger for model/tool economics, an anomaly layer for spend and quality regressions, budget controls at organization/project/workspace boundaries, and a feedback loop that closes the loop between cost, latency, tool success, and output quality. The core design principle is to separate three records of truth: provider billing truth, application execution truth, and business outcome truth. Most failures in AI governance happen when those are collapsed into one dataset or when one is missing entirely.

The market has also moved quickly over the last 12 months. On March 11, 2025, OpenAI released the building blocks of its new Agents platform, including the Responses API, built-in tools, an Agents SDK, and tracing. On May 22, 2025, Anthropic launched Claude 4 and positioned it explicitly for coding and agentic workflows; by August 5, 2025, Anthropic released Claude Opus 4.1. OpenTelemetry's GenAI semantic conventions and agent/tool span models continue to mature, making vendor-neutral instrumentation more feasible. Commercial observability vendors such as Datadog, LangSmith, Arize Phoenix, Helicone, Grafana Cloud, and Langfuse increasingly compete not just on tracing, but on evaluation, experimentation, and routing feedback loops.

The practical implication is straightforward: the winning architecture is not "pick one dashboard." It is to instrument all agent runs with vendor-neutral traces, ingest provider-native usage/cost data on a schedule, reconcile them into a cost-aware session ledger, and use that ledger to drive routing, prompting, caching, tool policy, and budget enforcement. Teams that do this well will improve margin, reliability, and model-selection speed. Teams that do not will overpay for agent loops they cannot explain.

## Scope and Explicit Assumptions

### Scope

This brief focuses on production AI agent workflows that:

- call both OpenAI and Anthropic APIs directly
- use tool calls, multi-step orchestration, or multi-agent handoffs
- need session-level attribution, budget controls, and continuous model/tool optimization

### Assumptions

- Assumption: the stack is built for API usage, not just ChatGPT or Claude app subscriptions.
- Assumption: "session attribution" means mapping one end-user interaction or business workflow to one trace/thread/session key across multiple model and tool calls.
- Assumption: the organization wants a vendor-neutral telemetry layer and does not want to be locked into either provider's native dashboard.
- Assumption: exact vendor feature availability can vary by account tier, geography, and enterprise contract.
- Assumption: provider prices, rate limits, and model catalogs are current as of March 26, 2026 and can change.

Where provider behavior is uncertain or contract-specific, this brief labels recommendations as design assumptions rather than facts.

## Current Landscape

### What is true right now

The observability and cost-governance stack for agent systems now has six distinct layers:

1. **Provider-native usage and billing telemetry**
2. **Application tracing and session attribution**
3. **Normalized economics and chargeback**
4. **Quality, safety, and tool-performance evaluation**
5. **Budgeting and rate governance**
6. **Closed-loop optimization for routing and prompting**

OpenAI and Anthropic both now expose enough native telemetry to support serious reconciliation workflows, but the coverage differs:

- **OpenAI**
  - Organization Usage API and Costs endpoint
  - project-level rate limits via API
  - project budgets and notification thresholds in platform settings
  - Responses API and Agents SDK with tracing support
  - pricing differences for standard, batch, prompt-cached, realtime, search, computer use, and hosted container execution

- **Anthropic**
  - Admin Usage & Cost API for organizations
  - grouping by model, workspace, API key, service tier, and context window
  - token visibility across uncached input, cache creation, cached input, and output
  - spend and rate limits at organization and workspace levels
  - pricing differences for standard, batch, prompt caching, long-context Sonnet 4, web search, and code execution

The ecosystem around those APIs has consolidated around two implementation styles:

- **Observability-native platforms**: Datadog, Grafana Cloud, Honeycomb
- **LLM engineering platforms**: LangSmith, Langfuse, Arize Phoenix, Helicone

The main architectural divide is no longer "do we trace?" It is "what is the system of record for economics and control?" Mature teams increasingly use provider APIs as the financial source of truth and use observability platforms as the operational source of truth.

## Core Concepts

### 1. Provider billing truth vs. execution truth vs. business truth

- **Billing truth**: what OpenAI or Anthropic says you owe
- **Execution truth**: what happened inside the agent trace
- **Business truth**: who triggered the spend and what business result it produced

These must be modeled separately, then reconciled.

### 2. Session attribution

Every request path should carry:

- `session_id`: user-visible conversation or workflow ID
- `trace_id`: distributed tracing root
- `thread_id`: conversation thread identifier if multi-turn
- `tenant_id` or `workspace_id`: chargeback boundary
- `user_id` or actor ID
- `agent_id`, `agent_version`, `prompt_version`
- `tool_call_id` for each tool execution

Without these keys, cross-provider costs cannot be mapped back to a user session or workflow.

### 3. Model-level economics

For agent systems, the relevant unit is not cost per token in isolation. It is:

`expected task cost = model tokens + cached token effects + tool charges + retries + handoffs + eval cost + observability/storage cost`

This is the unit that should drive routing decisions.

### 4. Tool-adjusted total cost

Server-side tools and hosted runtimes change the economics materially. A cheap base model can become expensive if it loops into search or code execution. Tool calls therefore need first-class cost accounting, not just token accounting.

### 5. Quality-adjusted cost

The right optimization target is usually not "lowest cost" or "highest quality." It is something like:

`quality-adjusted unit cost = total workflow cost / successful outcomes`

This is the metric that allows rational model and tool selection.

## Key Players

### Providers

- **OpenAI**: strongest native momentum around agent primitives, tracing, evals, and project governance; weaker than Anthropic on explicit admin usage granularity in some cases, but improving rapidly.
- **Anthropic**: strong cost and usage reporting for org admins, strong caching and service-tier economics, strong positioning for long-running coding and agent workflows.

### Standards and open instrumentation

- **OpenTelemetry**: emerging default wire format and schema direction for GenAI metrics and agent/tool spans.
- **OpenInference**: AI-specific semantic layer on top of OpenTelemetry, widely used by Arize Phoenix and adjacent tooling.

### Commercial and open-source observability/evaluation platforms

- **Datadog LLM Observability**: strongest fit if the organization already standardizes on Datadog and wants AI traces correlated with APM, infra, security, and service ownership.
- **LangSmith**: strongest fit for LangChain/LangGraph-heavy teams and for online/offline evaluation workflows tightly linked to traces.
- **Arize Phoenix**: strong open-source and OTEL-native posture; good for teams wanting fewer lock-in constraints and stronger eval experimentation.
- **Langfuse**: strong open-source LLM engineering platform with cost tracking, prompt management, and tracing.
- **Helicone**: gateway-centric approach, good for teams that want interception, logging, and fallback behavior with minimal code changes.
- **Grafana Cloud**: improving AI observability story, especially for teams already operating on Grafana and OTEL.
- **Honeycomb**: strongest conceptual fit for high-cardinality event analysis and deep debugging; increasingly positioning for agent-era observability.

## Recent Developments

### Exact-date developments that matter

- **March 11, 2025:** OpenAI released the new Agents platform building blocks: Responses API, built-in tools, Agents SDK, and tracing.
- **May 22, 2025:** Anthropic launched Claude Opus 4 and Claude Sonnet 4, explicitly targeting coding and agent workflows.
- **June 10, 2025:** Datadog announced expanded LLM observability capabilities for agentic AI, including agent monitoring and LLM experiments.
- **August 5, 2025:** Anthropic released Claude Opus 4.1 with improvements on agentic tasks and coding.
- **2025-2026 period:** OpenTelemetry GenAI semantic conventions and GenAI agent/tool span conventions continued maturing, improving the feasibility of vendor-neutral instrumentation.
- **March 26, 2025:** Grafana announced GA support for Anthropic models in its LLM plugin, reflecting broader cross-provider observability demand.

### Why these changes matter

- Native agent tracing is now part of the provider platform conversation, not just a third-party add-on.
- Cross-provider cost governance is harder, not easier, because pricing has become more nuanced.
- The market is shifting from passive dashboards to active optimization loops: experiments, evals, route selection, and policy enforcement.

## Recommended Reference Architecture

## 1. Usage Ingestion Layer

### Design

Build a scheduled ingestion service with three data pipelines:

- **Provider billing ingestion**
  - OpenAI organization usage and costs
  - Anthropic organization usage and cost reports
- **Application trace ingestion**
  - OTLP traces from app services, agent orchestrators, tool services, and worker queues
- **Metadata ingestion**
  - project/workspace catalog
  - API keys to service mapping
  - agent versions, prompt versions, release versions

### Polling pattern

- Poll Anthropic Admin Usage & Cost API every 1 to 5 minutes for dashboards and hourly reconciliation jobs for durable accounting.
- Poll OpenAI Usage and Costs endpoints on a similar schedule, but treat financial reconciliation as end-of-day or invoice-period authoritative.
- Store raw provider responses immutably before normalization.

### Data model

Use three tables as the minimum:

1. `provider_usage_fact`
2. `provider_cost_fact`
3. `trace_span_fact`

Then build derived tables:

4. `session_fact`
5. `workflow_cost_fact`
6. `model_economics_fact`
7. `budget_status_fact`

### Why this matters

Provider APIs are necessary for reconciliation. They are insufficient for attribution because they do not know your user, business unit, release train, or success outcome.

## 2. Session Attribution Layer

### Design principle

Do not infer sessions from provider data after the fact. Stamp attribution keys at request time.

### Required attributes on every model call and tool call

- `session_id`
- `trace_id`
- `tenant_id`
- `user_id`
- `agent_name`
- `agent_version`
- `prompt_version`
- `tool_name`
- `tool_version`
- `provider`
- `model`
- `service_tier`
- `environment`

### Trace structure

Represent each end-user workflow as one root trace with nested spans for:

- inbound request
- planner/model call
- tool selection
- each tool execution
- retries/backoffs
- subordinate agent handoffs
- final answer
- human feedback or downstream business outcome, if available

Use OpenTelemetry GenAI conventions where possible and extend with internal attributes where not.

### Reconciliation rule

When provider usage arrives, reconcile to traces in this order:

1. exact request ID or response ID, if stored
2. exact timestamp window plus model plus project/workspace/API key
3. fallback heuristic matching, flagged as non-authoritative

Heuristic-only attribution should never be used for finance-grade chargeback without caveats.

## 3. Model-Level Economics Layer

### OpenAI economics to account for

- input tokens
- cached input tokens
- output tokens
- reasoning-token billing effects where applicable
- hosted tool charges such as containers/code execution
- search/computer-use-specific charges where applicable
- Batch API discount
- project- and org-level rate and usage limits

### Anthropic economics to account for

- uncached input tokens
- cache creation input tokens
- cached input tokens
- output tokens
- web search charges
- code execution charges
- long-context premium pricing for Sonnet 4 requests over 200K tokens
- Batch API discount
- Priority Tier usage, noting that Priority Tier costs are not included in Anthropic's cost endpoint

### Recommended metrics

- cost per session
- cost per successful session
- cost per tool-assisted answer
- tool cost share of total workflow cost
- cache hit rate by prompt family
- retry cost rate
- model-switch uplift: quality delta per added dollar
- abandon rate after high-latency or high-cost sessions

### Current pricing snapshot to anchor design assumptions

As of the provider pricing pages available on March 26, 2026:

- **OpenAI**
  - `gpt-5`: $1.25 / 1M input tokens, $0.125 / 1M cached input tokens, $10 / 1M output tokens
  - `gpt-5-mini`: $0.25 / 1M input tokens, $0.025 / 1M cached input tokens, $2 / 1M output tokens
  - Web search: $10 / 1K calls plus search-content tokens at model rates for most configurations
  - Code Interpreter: starts at $0.03 per 1 GB container

- **Anthropic**
  - `Claude Opus 4.1`: $15 / 1M input tokens, $1.50 / 1M cache reads, $75 / 1M output tokens
  - `Claude Sonnet 4`: $3 / 1M input tokens, $0.30 / 1M cache reads, $15 / 1M output tokens
  - Web search: additional per-search pricing applies
  - Code execution: additional usage-based charges apply

These examples are not the whole pricing picture. They are included to show why routing, caching, and tool governance can easily dominate overall economics.

### Recommended formula

`total_workflow_cost = provider_token_cost + provider_tool_cost + hosted_runtime_cost + retry_cost + eval_cost + observability_cost_allocation`

For operational routing, keep a second measure:

`marginal_inference_cost = next model/tool call expected incremental cost`

This is the number the router should optimize on.

## 4. Anomaly Detection Layer

### What to detect

- sudden cost-per-session spikes
- sudden token-per-session spikes
- cache hit-rate collapse
- tool loop explosions
- model mix drift
- increased retry/replay rate
- error-rate spikes by provider/model/tool
- latency regressions that correlate with route changes
- quality regressions that appear after prompt or model changes

### Recommended methods

- static thresholds for emergency controls
- rolling z-score or EWMA for spend and token anomalies
- change-point detection on route mix and cache-hit rate
- cohort-based baselines by workflow type, tenant, and agent version
- paired pre/post release comparisons for model routing changes

### Important nuance

Many "cost anomalies" are actually attribution anomalies, cache anomalies, or tool-loop anomalies. Detect those categories separately.

## 5. Budgeting and Governance Layer

### Native controls

- **OpenAI**: project monthly budgets and notification thresholds are useful, but documented as soft alerts rather than hard spend caps.
- **OpenAI**: project-level model rate limits can be adjusted via API.
- **Anthropic**: organization spend limits exist by tier; workspace-level lower limits can be configured for protection and fairness.
- **Anthropic**: workspace-level spend/rate controls are more useful than many teams realize for chargeback and blast-radius reduction.

### Recommended governance model

- hard internal budgets per product, tenant, or workflow class
- soft vendor budgets and alerts as secondary guardrails
- policy engine that can:
  - downgrade model
  - disable expensive tools
  - force batch mode for asynchronous jobs
  - tighten max output tokens
  - require human approval above cost thresholds

### Governance boundaries

Use at least four budget lenses:

- organization
- product or business unit
- environment
- tenant or customer

This prevents profitable use cases from being masked by wasteful ones.

## 6. Feedback Loops for Model and Tool Selection

### Objective

Continuously select the cheapest model and toolset that still meets latency, quality, and safety targets.

### Closed-loop design

1. log trace, cost, latency, and quality signals
2. score outcomes using automated evals and human feedback
3. aggregate by workflow, prompt version, model, and tool policy
4. compare route variants on quality-adjusted unit cost
5. update routing policy or prompt/tool policy
6. monitor for regressions

### Routing policy examples

- Start with `gpt-5-mini` or Claude Haiku-class routes for low-risk tasks, escalate only if confidence is low.
- Use Sonnet 4 or GPT-5 class routes for higher-complexity tool planning.
- Force batch mode for offline scoring, enrichment, summarization, and eval workloads.
- Prefer cached prompt families for repetitive enterprise tasks with large static prefixes.
- Penalize tools with high failure cost or low contribution to success rate.

### Data needed for the loop

- trace-level quality scores
- human feedback labels
- tool success/failure outcomes
- downstream business metrics
- marginal cost estimates
- route policy version

Without policy versioning, routing experiments become impossible to audit.

## Opportunities

- **Margin improvement through routing**: many teams can shift a significant share of traffic to cheaper models or batch lanes once quality thresholds are measured instead of assumed.
- **Prompt-caching leverage**: both vendors now make caching financially meaningful for repeated long-context workflows.
- **Tool-cost reduction**: explicit accounting often reveals that poorly controlled search/code-execution loops cost more than model tokens.
- **Faster procurement and chargeback**: finance teams respond better to workspace/project/session-based chargeback than aggregate "AI spend."
- **Release confidence**: tying traces to evals enables safer model upgrades and prompt changes.
- **Vendor optionality**: normalized telemetry reduces switching cost and improves negotiating leverage.

## Risks

- **False precision**: provider usage and internal traces will not always line up perfectly in real time.
- **Soft budgets mistaken for hard controls**: especially on OpenAI project budgets.
- **Attribution gaps**: missing `session_id`, `tenant_id`, or prompt/tool versioning will make costs operationally useless.
- **Sensitive-data leakage in traces**: prompts, tool inputs, retrieved docs, and outputs often contain customer data.
- **Over-collection of telemetry**: tracing every token-rich payload at full fidelity can create a second observability cost problem.
- **Routing regressions**: cheaper models can increase retries, failures, or tool loops, destroying expected savings.
- **Provider-specific blind spots**: Anthropic Priority Tier cost handling and OpenAI tool/container billing details require explicit normalization logic.

## Open Questions

- Will provider-native agent tracing become rich enough to reduce reliance on third-party observability, or will teams continue to prefer OTEL-native systems for multi-vendor parity?
- Will OpenTelemetry GenAI conventions stabilize quickly enough to prevent schema churn across vendor SDKs and observability products?
- Will providers introduce hard budget APIs, not just soft alerts and limit pages?
- How should organizations allocate shared prompt-cache benefits across tenants fairly?
- What is the right retention policy for traces that contain both operational value and regulated content?
- How should organizations price internal AI platform usage when one workflow consumes premium tools and another consumes only cached tokens?

## What to Monitor in the Next 12 Months

- whether OpenAI expands project governance from soft budget alerts to enforceable spend controls
- whether Anthropic expands cost reporting to cover Priority Tier economics directly
- the stabilization status of OpenTelemetry GenAI semantic conventions and agent/tool span schemas
- how quickly third-party observability vendors converge on OTEL-compatible, portable data models
- pricing shifts for server-side tools, especially search, code execution, containers, and computer-use style capabilities
- whether long-context premiums become common across more models and providers
- whether evaluation products become first-class routing controllers rather than offline dashboards
- whether providers expose stronger IDs for request-level cost reconciliation across traces and billing datasets
- the market split between gateway-first products and instrumentation-first products
- trace-retention economics as teams begin storing more multimodal and tool-rich agent telemetry

## Actionable Next Steps

1. **Make tracing mandatory before optimization.** Instrument every agent workflow with OTEL-compatible traces and stamp `session_id`, `tenant_id`, `agent_version`, `prompt_version`, and `tool_version` on every model and tool span.
2. **Build a provider-cost ingestion service.** Pull OpenAI usage/cost data and Anthropic usage/cost data into immutable raw tables, then normalize into shared `provider_usage_fact` and `provider_cost_fact` models.
3. **Create a finance-grade session ledger.** Join provider cost facts with trace facts to produce `cost_per_session`, `cost_per_success`, `tool_cost_share`, and `cache_hit_rate` by workflow and tenant.
4. **Separate dashboards by purpose.** Keep one operational dashboard for latency/errors/tool health, one economics dashboard for spend and chargeback, and one optimization dashboard for route quality versus cost.
5. **Implement a policy engine, not just alerts.** Add automated controls that can downgrade models, disable tools, lower output-token ceilings, or shift workloads to batch when budgets or anomaly thresholds are breached.
6. **Version every routing and prompt decision.** Log route policy version, model version, prompt version, and tool policy version so experiments and regressions can be audited.
7. **Measure quality-adjusted cost.** Use offline and online evals, plus human feedback where possible, to compare workflows on success-per-dollar rather than token cost alone.
8. **Exploit caching deliberately.** Restructure prompts so static instructions, tool schemas, and large shared context blocks are prefix-stable; track cache read/write economics by prompt family.
9. **Contain blast radius with budget partitions.** Use OpenAI projects and Anthropic workspaces as governance boundaries, but enforce your own hard caps internally because provider-native controls are incomplete.
10. **Plan for schema and pricing churn.** Treat model catalogs, tool prices, and telemetry schemas as configuration, not hard-coded assumptions.

## Bottom Line

The full stack should treat OpenAI and Anthropic as billing providers, not as the sole observability system. The durable architecture is: provider-native usage ingestion, OTEL-based trace attribution, normalized economics, anomaly detection, policy-based budgets, and evaluation-driven routing. Teams that implement this stack will be able to answer the questions that matter in production: who spent the money, which session caused it, which model and tool path produced it, whether it worked, and what route should be used next time.

## Sources and Further Reading

### Primary sources

- OpenAI Usage API and Costs endpoint: https://platform.openai.com/docs/api-reference/usage/costs
- OpenAI pricing: https://platform.openai.com/docs/pricing/
- OpenAI Agents SDK: https://platform.openai.com/docs/guides/agents-sdk/
- OpenAI Responses API: https://platform.openai.com/docs/guides/migrate-to-responses
- OpenAI Batch API: https://platform.openai.com/docs/guides/batch
- OpenAI prompt caching: https://platform.openai.com/docs/guides/prompt-caching
- OpenAI agent evals: https://platform.openai.com/docs/guides/agent-evals
- OpenAI trace grading: https://platform.openai.com/docs/guides/trace-grading
- OpenAI project rate limits: https://platform.openai.com/docs/api-reference/project-rate-limits
- OpenAI project budgets/help article: https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform
- Anthropic Usage & Cost API: https://docs.anthropic.com/en/api/data-usage-cost-api
- Anthropic API pricing: https://docs.anthropic.com/en/docs/about-claude/pricing
- Anthropic public pricing page: https://www.anthropic.com/pricing
- Anthropic rate limits: https://docs.anthropic.com/en/api/rate-limits
- Anthropic service tiers: https://docs.anthropic.com/en/api/service-tiers
- Anthropic prompt caching docs: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Anthropic Claude 4 announcement: https://www.anthropic.com/news/claude-4
- Anthropic Claude Opus 4.1 announcement: https://www.anthropic.com/news/claude-opus-4-1
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- OpenTelemetry GenAI agent spans: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- OpenTelemetry GenAI metrics: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/
- OpenInference specification: https://arize-ai.github.io/openinference/spec/

### Commercial and ecosystem sources

- Datadog LLM Observability product page: https://www.datadoghq.com/product/llm-observability/
- Datadog OpenAI Agents monitoring announcement: https://www.datadoghq.com/blog/openai-agents-llm-observability/
- Datadog agentic AI observability announcement: https://www.datadoghq.com/about/latest-news/press-releases/datadog-expands-llm-observability-with-new-capabilities-to-monitor-agentic-ai-accelerate-development-and-improve-model-performance
- LangSmith observability overview: https://docs.langchain.com/langsmith/observability
- LangSmith observability concepts: https://docs.langchain.com/langsmith/observability-concepts
- LangSmith cost tracking: https://docs.langchain.com/langsmith/cost-tracking
- LangSmith online evaluations: https://docs.langchain.com/langsmith/online-evaluations
- Arize Phoenix overview: https://arize.com/docs/phoenix
- Arize Phoenix OpenAI tracing: https://www.arize.com/docs/ax/llm-tracing/tracing-integrations-auto/openai
- Arize Phoenix Anthropic tracing: https://arize.com/docs/ax/integrations/llm-providers/anthropic/anthropic-tracing
- Helicone docs: https://docs.helicone.ai/
- Grafana Cloud GenAI observability setup: https://grafana.com/docs/grafana-cloud/monitor-applications/ai-observability/genai/observability/setup/
- Grafana AI and observability page: https://grafana.com/products/cloud/ai-tools-for-observability/
- Honeycomb observability introduction: https://docs.honeycomb.io/get-started/basics/observability/introduction
