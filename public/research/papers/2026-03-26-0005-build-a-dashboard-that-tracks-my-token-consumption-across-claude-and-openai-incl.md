# Research Brief: Build a dashboard that tracks my token consumption across Claude and OpenAI, including per-model usage, daily/weekly/monthly trends, estimated cost, project/session breakdowns, and a proposed ingestion architecture for both providers' usage data.

- Queue ID: 5
- Generated: 2026-03-26T11:25:29+00:00

# Cross-Provider Token Consumption Dashboard: Research Brief
**Date:** March 26, 2026

## Executive Summary
A useful dashboard for Claude and OpenAI usage is now feasible with mostly provider-native telemetry, but only if you separate two jobs: provider reconciliation and internal attribution. OpenAI and Anthropic both now expose organization-level usage and cost data with enough granularity to support per-model, daily/weekly/monthly, and project or workspace reporting. However, neither provider gives you a complete, finance-grade, session-aware view out of the box.

The key design decision is this: use provider APIs as the source of truth for billed or near-billed usage, and use your own request-side event stream for session, feature, customer, and workflow attribution. OpenAI can group usage by model and project, and Anthropic can group by model, workspace, API key, service tier, and context window. But “session” is still fundamentally your application’s concept, not the provider’s.

The landscape has improved materially in the last 12 months. Anthropic launched its Usage & Cost Admin API on August 18, 2025. OpenAI expanded its dashboard and usage surfaces with better project filters, finer intervals, budget alerts, and a stronger admin/control-plane model. The result is that a pragmatic architecture today is not “one giant dashboard query”; it is a normalized warehouse model with two ingestion paths: provider polling plus app-side request telemetry.

## Scope and Assumptions
Assumption: this brief is about **API consumption**, not end-user ChatGPT or Claude subscription usage.

Assumption: “project/session breakdown” means a mix of provider-native dimensions (`project_id` for OpenAI, `workspace_id` for Anthropic) plus your own internal dimensions such as app session, customer, workflow, or feature.

Assumption: “estimated cost” should be near-real-time and model-specific, but final finance reconciliation should still use provider cost endpoints or invoices where available.

## Current Landscape
OpenAI now offers an organization Usage API plus a separate Costs endpoint, and its dashboard supports project filtering and 1-minute usage intervals. Important caveats: dashboard timestamps are UTC; Scale Tier bundle costs are attributed at the org level rather than project level; and OpenAI explicitly distinguishes granular usage from finance-grade spend reconciliation. OpenAI also does not consolidate cost or usage across organizations/sub-orgs automatically.

Anthropic’s posture is similar but slightly different operationally. Its Admin API exposes usage and cost reporting at org scope, with grouping by model, workspace, API key, service tier, and context window. Usage and cost data typically appears within 5 minutes, and sustained polling once per minute is supported. But the Admin API is unavailable to individual accounts, and Priority Tier costs are not included in Anthropic’s cost endpoint, which means some reconciliation logic must remain provider-specific.

The broader ecosystem has split into three layers. First are provider-native dashboards and admin APIs. Second are observability products such as Helicone and Langfuse, which are useful for request/session tracing and developer analysis. Third are metering/billing products such as OpenMeter/Konnect and CloudZero, which are useful if the dashboard will also drive chargebacks, customer billing, or margin analysis.

## Key Players
- **OpenAI**: strong org/project telemetry, separate usage vs cost surfaces, fast-changing pricing and product catalog.
- **Anthropic / Claude**: strong workspace and model telemetry, explicit cache/service-tier dimensions, newer but useful Admin API.
- **Helicone**: proxy-style multi-provider observability with explicit session grouping.
- **Langfuse**: trace-centric instrumentation with `session_id`, `usage_details`, and `cost_details`.
- **OpenMeter / Konnect Metering & Billing**: event-based usage metering and billing layer for AI tokens and other usage.
- **CloudZero**: positioned by Anthropic as a partner for usage and cost observability.

## Core Concepts
A good dashboard needs to normalize five things.

First, **token classes**: input, output, cached input, cache creation/write, cache read/hit, audio/image/tool-related usage, and provider-specific extras such as web search or code execution.

Second, **billing truth vs estimated truth**: request-level estimated cost is useful for real-time product decisions; provider cost endpoints are the right source for reconciliation, invoices, and finance.

Third, **organizational dimensions**: OpenAI uses org/project/user/API key and sometimes line items; Anthropic uses org/workspace/API key/service tier/context window and cost descriptions.

Fourth, **application dimensions**: session, conversation, customer, feature, route, experiment, agent, and internal project. These are not reliably recoverable from provider admin data alone.

Fifth, **time grain**: minute-level for incident detection, daily for reconciliation, weekly/monthly for management reporting.

## Provider Comparison
| Provider | Native usage dimensions | Native cost dimensions | Important gaps |
|---|---|---|---|
| OpenAI | `model`, `project_id`, `user_id`, `api_key_id`, `batch`; `1m/1h/1d` usage buckets | `project_id`, invoice `line_item`; daily cost buckets | No true session dimension; sub-orgs not consolidated; usage and spend can differ |
| Anthropic | `model`, `workspace_id`, `api_key_id`, `service_tier`, `context_window`; `1m/1h/1d` usage buckets | `workspace_id`, `description`; daily cost buckets | No true session dimension; Admin API only for orgs; Priority Tier cost not in cost endpoint |

## Recent Developments
- **February 25, 2025**: OpenAI updated its API Usage Dashboard with project selection, finer intervals, and broader service-tier/product support.
- **April 30, 2025**: OpenAI launched enhanced API budget alerts and auto-recharge limits.
- **June 27, 2025**: OpenAI added Priority processing, increasing pricing complexity for any estimator.
- **August 20, 2025**: OpenAI released the Conversations API, which helps application-level conversation modeling but still does not replace internal session attribution.
- **August 18, 2025**: Anthropic launched the Usage & Cost API for administrators.
- **May 22, 2025**: Anthropic added minute/hour granularity and 429-rate visibility to the Console Usage page.
- **June 23, 2025**: Anthropic expanded Console Cost-page access to the Developer role.
- **August 13, 2025**: Anthropic made 1-hour prompt-cache duration generally available.
- **August 12, 2025 onward**: Anthropic’s 1M-context and long-context pricing/rate behavior became materially more important for cost tracking.

## Proposed Ingestion Architecture
Use a dual-path design.

**Path 1: Provider polling**
Poll OpenAI Usage and Costs, plus Anthropic Usage Report and Cost Report, into raw landing tables. Preserve raw payloads, polling timestamps, provider request IDs, and pagination cursors. This path produces finance and reconciliation facts.

**Path 2: Request-side instrumentation**
Emit one event per model call from your app or gateway with: provider, model, internal project, internal session ID, user/customer/tenant, workflow name, feature flag or experiment, request start/end, provider request ID, prompt cache flags, and immediate token usage from the response. This path produces session and product analytics facts.

**Normalization layer**
Build canonical warehouse tables such as `fact_llm_request`, `fact_provider_usage_bucket`, `fact_provider_cost_bucket`, `dim_model_price`, `dim_project`, `dim_workspace`, and `dim_session`. Join request-side events to provider buckets using provider, model, time window, API key/project/workspace, and request IDs where available.

**Pricing layer**
Maintain a versioned price catalog by provider, model, modality, service tier, cache class, and effective date. Do not hardcode pricing into analytics queries. Estimated cost should be recomputed from this catalog; billed cost should be trueed up from provider cost data.

**Serving layer**
Use pre-aggregated views for:
- daily, weekly, monthly usage and spend
- per-model and per-provider comparisons
- project/workspace/customer/session breakdowns
- cache efficiency and cost avoided
- anomaly and budget alerting

## Practical Opportunities
- Real-time cost visibility by model can improve routing, prompt design, and cache strategy within days.
- Session-aware analytics can expose expensive workflows that provider dashboards cannot see.
- A normalized price catalog lets you compare “same task, different provider/model” economics.
- Finance and engineering can finally use the same system: engineering for optimization, finance for reconciliation.
- If you later monetize usage, the same event model can feed chargebacks or customer billing.

## Risks
- **False precision**: estimated per-request cost can diverge from billed cost because provider billing rules include bundle pricing, service tiers, tool pricing, long-context premiums, and delayed reconciliation.
- **Attribution gaps**: provider-native APIs do not give a durable cross-provider session concept.
- **Model churn**: model aliases, deprecations, and pricing updates can silently break dashboards if price/version mapping is static.
- **Org topology issues**: OpenAI sub-org fragmentation and Anthropic workspace/default-workspace behavior can distort totals.
- **Access control**: Anthropic Admin API and OpenAI org-level views require elevated credentials, so least-privilege design matters.
- **Latency mismatches**: near-real-time usage may appear before final cost, especially when tools or special tiers are involved.

## Open Questions
- Do you need **finance reconciliation**, **engineering observability**, or both on day one?
- Are “projects” your product’s projects, or should they mirror provider-native projects/workspaces?
- Will the dashboard include only direct API calls, or also proxy/gateway traffic and offline batch jobs?
- Do you want one “session” definition across providers, or separate concepts for chat thread, workflow run, and end-user visit?
- How should Scale Tier, Priority Tier, long-context premiums, and tool charges be allocated internally when providers do not expose perfectly symmetric cost dimensions?

## What to Monitor in the Next 12 Months
- Provider changes to usage and cost APIs, especially new grouping dimensions and reconciliation behavior.
- Model and pricing churn, including deprecations, alias changes, and new service tiers.
- Prompt-caching economics, because both providers are making caching more central to cost control.
- Long-context pricing and 1M-context adoption, which can radically change unit economics.
- Tool pricing expansion for search, code execution, file search, containers, and agent features.
- Native conversation/session metadata support from providers; if this appears, it could simplify the architecture.
- Governance features such as RBAC, admin APIs, data residency, and auditability.
- Whether Anthropic adds Priority Tier cost visibility to the cost endpoint.

## Actionable Next Steps
1. Build the dashboard around a **canonical event schema** first, not around provider dashboards.
2. Implement **provider pollers** for OpenAI usage/cost and Anthropic usage/cost as the reconciliation layer.
3. Add **request-side instrumentation** immediately with your own `session_id`, internal project ID, customer/tenant ID, and workflow metadata.
4. Create a **versioned price catalog** with effective dates, cache rules, service tiers, and tool pricing so cost estimates remain correct as models change.
5. Define two metrics from day one: **estimated real-time cost** and **provider-reconciled cost**. Do not mix them.
6. Launch the first dashboard with five views only: provider summary, per-model trends, project/workspace breakdown, session/workflow breakdown, and cost anomalies.
7. Add alerts for budget thresholds, sudden model mix shifts, cache-hit collapse, and unexplained divergence between estimated and reconciled cost.
8. Decide early whether observability tooling like Helicone or Langfuse is a supplement to your custom dashboard or your primary request-side telemetry layer.

## Sources
**Primary sources**
- OpenAI API Usage Dashboard help: https://help.openai.com/en/articles/10478918-api-usage-dashboard
- OpenAI legacy usage/dashboard + Usage API/Costs API overview: https://help.openai.com/en/articles/8554956-understanding-the-usage-dashboard
- OpenAI Usage API reference: https://developers.openai.com/api/reference/resources/organization/subresources/audit_logs/subresources/usage
- OpenAI pricing: https://developers.openai.com/api/docs/pricing
- OpenAI changelog: https://developers.openai.com/api/docs/changelog
- OpenAI cookbook example for Usage API and Cost API: https://developers.openai.com/cookbook/examples/completions_usage_api
- Anthropic Usage & Cost API: https://platform.claude.com/docs/en/build-with-claude/usage-cost-api
- Anthropic pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Anthropic models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Anthropic release notes: https://platform.claude.com/docs/en/release-notes/overview
- Anthropic Messages API usage examples: https://platform.claude.com/docs/en/build-with-claude/working-with-messages

**Ecosystem / tooling**
- Helicone sessions: https://docs.helicone.ai/features/sessions
- Helicone cost tracking: https://docs.helicone.ai/guides/cookbooks/cost-tracking
- Langfuse SDK reference: https://python.reference.langfuse.com/langfuse
- OpenMeter AI metering: https://openmeter.io/use-cases/ai

If you want, I can turn this into a saved `research-brief.md` file in the workspace or convert it into a more implementation-heavy design doc with schemas and endpoint-by-endpoint ingestion notes.
