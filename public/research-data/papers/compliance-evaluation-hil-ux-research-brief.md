# Design the Ideal Human-in-the-Loop UX for Compliance Evaluation Software Used by Licensed Engineers

**Date:** March 26, 2026  
**Prepared for:** Internal product and design strategy  
**Classification:** General research

## Executive Summary

The ideal human-in-the-loop UX for compliance evaluation software used by licensed engineers is not an "AI reviewer" UX. It is a **licensed-decision-maker UX**: the system should accelerate evidence gathering, issue triage, and consistency, while making it unmistakable that the engineer remains the accountable actor for code interpretation, engineering judgment, approval, and sealing. That principle is not just good practice; it is aligned with current professional guidance. NSPE's May 2024 Responsible Charge position states that engineering decisions must be personally made by the professional engineer or by others under the engineer's supervisory direction and control, and that post hoc review alone is insufficient. ASCE's July 18, 2024 policy likewise says AI cannot replace the judgment of a licensed Professional Engineer.

The market is moving in this direction, but unevenly. Incumbent permitting and plan-review platforms such as Accela, Tyler, OpenGov, Autodesk, and Solibri already provide workflow, document control, issue tracking, and rules-based review infrastructure. Newer AI-focused entrants such as UpCodes, Blitz AI, and PermitFlow are adding code research, submission sufficiency checks, plan-review assistance, and permitting automation. The strongest products increasingly emphasize transparency, citations, markups, configurability to local code amendments, and keeping final authority with reviewers. However, vendor claims on speed and accuracy are mostly self-reported; there is still no widely adopted, independent benchmark for real-world code-compliance review performance across jurisdictions and disciplines.

The core UX tension is this: users want speed, but the system must preserve defensibility. Research on human-AI reliance suggests that explanations alone can increase reliance on both correct and incorrect outputs, while sources and visible inconsistencies can reduce inappropriate reliance. For licensed engineers, that means the UX should avoid persuasive but weak "reasoning theater." It should present **verifiable evidence, calibrated uncertainty, coverage boundaries, and crisp escalation paths**, not just fluent summaries.

The best product pattern is a queue-and-case model. AI should create review-ready "cases" with cited findings, predicted severity, confidence or uncertainty signals, scope-of-check metadata, and recommended actions. Engineers should work through prioritized queues, inspect evidence in context, decide issue disposition, record rationale, and then approve, reject, delegate, or escalate. Every material action should produce an audit trail that is reconstructible months later in a claim, dispute, peer review, or regulator inquiry.

Bottom line: the ideal UX is less like chat and more like **case management for professional judgment**. The winning products over the next 12 months will pair fast evidence retrieval with stronger accountability patterns: clear machine-vs-human boundaries, better uncertainty communication, rigorous override logging, approval attestations, and audit packages designed for liability-sensitive environments.

## Scope and Assumptions

### Primary assumption

This brief assumes the main use case is **U.S. architecture, engineering, construction, and permitting workflows** involving licensed civil, structural, MEP, fire protection, or related engineers reviewing plans, calculations, specifications, and code compliance materials. That includes both private-side design review and public-side plan review where licensed professionals are involved.

### Secondary assumptions

- The software is **assistive**, not a fully autonomous approval authority.
- The system may use LLMs, retrieval, rule engines, BIM/model checking, and document AI together.
- The engineer or reviewer may need to defend decisions to employers, clients, plan examiners, insurers, boards, or courts.
- Performance numbers cited from vendors are generally **vendor-reported** unless stated otherwise.
- "Compliance evaluation" includes both deterministic checks and judgment-heavy interpretation, but those should be treated differently in the UX.

## Current Landscape

### 1. The market is converging around four layers

#### A. System-of-record permitting and community development platforms

These products manage applications, routing, approvals, inspections, statuses, public portals, and records.

- **Accela**: building, planning, fire, and civic workflows; in April 2025 it acquired ePermitHub to deepen electronic plan review and pursue AI-assisted plan review automation.
- **Tyler Technologies**: community development, permitting, inspections, and enforcement workflows with explicit positioning around reducing human error and agency liability.
- **OpenGov**: digital permitting, zoning, licensing, public works, reporting, and applicant self-service.

#### B. Engineering QA/QC and model-checking platforms

These products excel at deterministic or semi-deterministic checks on BIM/data structures.

- **Solibri**: mature rule-based BIM validation and custom rulesets.
- **Autodesk Construction Cloud / Autodesk Docs / BIM Collaborate / Forma**: issue management, document control, clash and quality workflows, analytics, and audit-trace infrastructure more than direct code interpretation.

#### C. AI-native compliance research and plan-review tools

These tools are trying to shorten research and review time with retrieval, synthesis, and document analysis.

- **UpCodes**: AI-assisted building code research, project-aware code assistance, and citation-forward compliance research. UpCodes reports more than 800,000 monthly active users and 6,400+ organizations on its 2025 site.
- **Blitz AI**: municipal plan review assistance with cited findings, sheet location references, redlines, and explicit messaging that final authority remains with human reviewers.
- **PermitFlow**: AI-assisted preconstruction and permitting operations, especially around requirements research, submissions, coordination, and permit lifecycle management rather than licensed engineering judgment itself.

#### D. Adjacent regulated-workflow AI platforms

Outside engineering, sectors such as banking and healthcare are already building stronger human-review and auditability patterns. Those sectors matter because they are further ahead on liability-aware AI UX.

- Financial compliance vendors such as **Greenlite** emphasize audit-ready narratives, support logs, human review escalation, and regulatory-first model governance.
- Clinical AI and model-risk-management literature provides useful evidence on overreliance, explanation design, and review traceability.

### 2. Current products are strong on workflow, weaker on defensible judgment support

The strongest existing tools are usually good at one or two of the following:

- intake completeness and routing
- document versioning and markup
- issue lists and comments
- deterministic rule checking
- code research with citations
- applicant communication
- reporting and dashboards

The common gaps are:

- calibrated uncertainty display
- explicit scope-of-check boundaries
- disciplined separation of deterministic findings vs interpretive suggestions
- override analytics
- approval UX built for licensed accountability
- audit outputs designed for claims, disputes, and board scrutiny

## Key Players

### Public-sector permitting and plan review

- **Accela**: major civic workflow incumbent; its April 21, 2025 ePermitHub acquisition is a clear signal that plan review is moving closer to AI-assisted document and code analysis.
- **Tyler Technologies**: strong fit for government permitting and enforcement; value proposition includes reduced human error and liability management.
- **OpenGov**: strong on integrated community development workflows, public portal clarity, and operational transparency.
- **ePermitHub**: now part of Accela; important as a plan-room and version-engine capability layer.

### Engineering design QA/QC and construction controls

- **Solibri**: long-standing leader in rules-based BIM and information quality checking.
- **Autodesk**: broad AEC operating layer with issue management, document management, analytics, and trusted AI governance infrastructure.

### AI-native code/compliance assistance

- **UpCodes**: building code research and AI assistance with citations; important for text-heavy code interpretation workflows.
- **Blitz AI**: one of the clearest public examples of AI-assisted municipal plan review with citations, redlines, and reviewer-centered due diligence.
- **PermitFlow**: operational permitting automation at scale; likely to matter more on intake, coordination, and permit operations than on signed engineering judgment.

## Core Concepts

### Responsible charge must be visible in the product

This is the single most important concept. NSPE's current Responsible Charge statement and ASCE's 2024 AI policy both point in the same direction: the engineer must remain substantively engaged and accountable. UX implication: the product should never imply that the machine "approved" a design, "confirmed" code compliance, or "owns" the engineering conclusion.

### Deterministic checks and judgment calls must be separated

The UI should clearly distinguish:

- **Deterministic checks**: file completeness, missing sheets, schema validation, explicit dimensional rules, clash detection, simple threshold checks.
- **Interpretive checks**: code applicability, exceptions, equivalencies, alternate means and methods, mixed-use edge cases, local amendments, and discipline coordination judgment.

Users should be able to sort and filter findings by this distinction because liability is different.

### Appropriate reliance matters more than generic trust

Research in human-AI decision support consistently shows that better team performance depends on users understanding when the model is likely to fail, not just whether it is usually accurate. Explanations alone can increase reliance even when the answer is wrong; source-linked evidence and visible inconsistency cues are more useful for preventing overreliance.

### Traceability is not an admin feature; it is part of the safety case

For licensed engineering workflows, the audit trail is part of the product's core value. EU AI Act requirements for high-risk systems emphasize logging, detailed documentation, and human oversight. NIST AI RMF and the Playbook emphasize documenting what is measured, what is not measured, overrides, incident response, and independent assessment.

## Recent Developments

### Standards, governance, and policy

- **July 26, 2024:** NIST published the AI RMF Generative AI Profile, explicitly addressing confabulation, human-AI configuration risk, interpretability, and documenting overrides.
- **February 6, 2025:** NIST's AI RMF Playbook page shows a 2025 update cadence, reinforcing that documentation, override measurement, auditability, and independent assessment are active, not static, governance topics.
- **July 18, 2024:** ASCE adopted Policy Statement 573, stating that AI cannot replace the professional judgment of a licensed engineer.
- **March 2025:** ASCE published an ethics-focused article warning that overreliance on AI can push engineers beyond competence and lead to safety-threatening decisions.
- **August 1, 2025:** EU rules for GPAI obligations started applying, and the broader AI Act implementation process continued to move toward human oversight, logging, documentation, and transparency obligations.
- **October 2025:** the European Commission launched the AI Act Service Desk and Single Information Platform.
- **Late 2025:** AI Act standardization work advanced, including public enquiry for prEN 18286, an AI quality management standard for EU AI Act regulatory purposes.

### Market and product developments

- **April 21, 2025:** Accela acquired ePermitHub and announced AI-driven plan review automation ambitions.
- **June 18, 2025:** Blitz announced San Mateo County selected it for AI-driven plan review services.
- **2025:** Blitz continued to publicly position itself around complete transparency, cited findings, and final human authority.
- **December 2, 2025:** PermitFlow announced a $54 million Series B, signaling continued capital formation behind AI-assisted preconstruction and permitting workflows.

### Research developments most relevant to UX

- **CHI 2025:** Kim et al. found that explanations increase reliance on both correct and incorrect LLM responses, while sources and visible inconsistencies reduce reliance on incorrect outputs.
- **2025-2026 explainability studies in medical and high-stakes settings:** newer evidence continues to show that explanations can increase confidence without reliably improving appropriate reliance or decision quality for every user.

## The Ideal Human-in-the-Loop UX

### 1. Review queues should be case-based, not chat-based

The main workspace should be a prioritized queue of review cases. Each case should have:

- project and jurisdiction
- discipline
- document/version under review
- review stage
- severity
- due date / SLA
- finding count
- uncertainty score
- scope-of-check coverage
- reviewer assignment
- blocker status

The queue should support separate views for:

- new AI-generated findings
- unreviewed critical items
- engineer overrides
- escalations awaiting senior signoff
- items reopened after design revision
- items outside model coverage

### 2. Every finding should have a stable issue object

Each finding should be an addressable object with:

- unique ID
- linked sheet/model location
- linked code citations
- finding type: deterministic / interpretive / coordination / missing information
- machine claim
- evidence bundle
- uncertainty indicators
- reviewer disposition
- reviewer rationale
- revision history

This avoids the common failure mode where AI output is ephemeral and cannot be defended later.

### 3. Uncertainty handling should be multi-dimensional

Do not compress uncertainty into one confidence number. Show at least four dimensions:

- **retrieval confidence**: was the right jurisdiction/version/amendment set used?
- **classification confidence**: how likely is the detected issue pattern correct?
- **coverage confidence**: did the system actually check the full relevant scope?
- **interpretation risk**: is this a judgment-heavy rule where precedent or local practice matters?

Recommended UI pattern:

- a compact uncertainty badge on each issue
- expandable detail panel explaining why uncertainty is high
- automatic routing of high-uncertainty or low-coverage findings into human-first review

High uncertainty should change workflow behavior, not just styling. For example:

- block auto-generated comment text from being sent to applicants until a reviewer confirms
- require senior review for high-severity, high-uncertainty issues
- auto-label findings as "research assist" instead of "deficiency" when evidence is incomplete

### 4. Citation display should be first-class

Citation UX should allow the reviewer to inspect:

- exact code section
- amendment history if available
- jurisdiction applicability
- effective date
- excerpted language
- linked plan location or model element
- machine explanation of why the citation is relevant

The crucial design choice is that the citation should be easier to inspect than the prose summary is to accept. If a reviewer can approve an issue faster than they can verify the citation, the product will systematically induce overreliance.

### 5. Reasoning display should be evidence-led, not chain-of-thought-led

The product should not expose free-form hidden model reasoning as if it were authoritative. It should show:

- claim
- evidence used
- rule mapping
- assumptions made
- alternatives considered, if relevant
- explicit missing information

Recommended label set:

- `Verified evidence`
- `Model inference`
- `Assumption`
- `Not checked`
- `Needs human interpretation`

This is more defensible than presenting persuasive but unverifiable "reasoning."

### 6. Approvals should be staged and liability-aware

The approval UX should distinguish among:

- **Reviewed**: human inspected the issue and agrees the finding merits action.
- **Accepted deficiency**: reviewer confirms a deficiency exists.
- **Dismissed**: reviewer rejects the finding, with reason code.
- **Deferred / needs more info**: applicant, designer, or another reviewer must supply more evidence.
- **Escalated**: senior engineer, discipline lead, legal, or AHJ consultation required.
- **Approved for issuance / sealed deliverable**: final disposition after all required human checks.

For any step tied to sealing, stamping, or formal approval, require:

- named accountable reviewer
- date/time
- license identifier where appropriate
- attestation text
- unresolved-high-risk-item disclosure
- residual risk acknowledgment when applicable

### 7. Audit trails should be reconstructible, exportable, and narrative-ready

The audit trail should record:

- documents and versions reviewed
- model/version and ruleset used
- jurisdiction data pack used
- prompts or configuration inputs if relevant
- citations retrieved
- outputs shown to the user
- user actions, edits, overrides, and comments
- escalations and approvals
- timestamps and identities
- diffs between review rounds

The system should export two artifacts:

- **Machine-readable audit package** for internal analytics and integration
- **Human-readable review narrative** for claims, client disputes, internal QA, or regulator requests

### 8. Liability-aware interaction patterns should actively slow the user down at the right moments

The best UX is not uniformly fast. It is selectively frictional.

Add friction when:

- the issue is severe and uncertain
- the citation set is incomplete
- the system is outside trained coverage
- a prior human overrode similar findings repeatedly
- the finding would materially support a denial, rejection, or signed certification

Useful friction patterns:

- mandatory citation inspection before acceptance
- explicit attestation for final approvals
- forced selection of disposition rationale for overrides
- conflict banners when local amendments or discipline rules disagree
- "coverage gap" banners when only part of a code path was checked

## Recommended Product Architecture for the UX

### Layer 1: Intake and normalization

- ingest PDFs, BIM, calculations, specs, forms, and prior comments
- normalize jurisdiction, discipline, project type, and code year
- validate completeness before deeper review

### Layer 2: Evidence generation

- deterministic rule engine
- retrieval against code corpus and local amendments
- document AI for sheet/object extraction
- cross-document consistency checks

### Layer 3: Review case creation

- transform machine outputs into issue objects
- attach evidence, coverage data, and uncertainty metadata
- assign severity and routing recommendations

### Layer 4: Human review and decision

- queue triage
- issue inspection
- rationale capture
- escalation and disposition
- approval attestation

### Layer 5: Audit and learning

- override analysis
- false-positive / false-negative review
- drift monitoring
- policy and ruleset updates
- audit package generation

## Practical Opportunities

### 1. Turn AI from answer engine into evidence engine

This is the cleanest product opportunity. Engineers do not mainly need eloquent answers; they need fast access to the right code, right version, right plan location, and right precedent.

### 2. Build jurisdiction-specific compliance packs

The market still lacks strong products that treat local amendments, department interpretations, and agency comment history as first-class knowledge assets. A product that operationalizes local practice without obscuring formal code hierarchy can be sticky and defensible.

### 3. Measure reviewer overrides as a product signal

Override logs are not just governance overhead. They are training data for:

- ruleset refinement
- uncertainty calibration
- queue prioritization
- coverage-gap detection
- organizational knowledge capture

### 4. Create audit packages as a premium feature

In liability-sensitive environments, "show me exactly why this decision was made" is often more valuable than marginal gains in issue detection. Many current products underinvest here.

### 5. Separate speed modes from signoff modes

There is room for a two-mode UX:

- **Fast exploration mode** for research and early-stage internal review
- **Defensible signoff mode** for formal dispositions, applicant comments, and sealed deliverables

## Risks

### 1. Overreliance on persuasive output

The clearest UX risk is that reviewers mistake fluent model output for vetted engineering judgment. Research suggests explanation text can worsen this if not paired with verifiable sources and uncertainty signals.

### 2. False precision from confidence scores

Single-number confidence displays can mislead reviewers, especially when retrieval scope, jurisdiction matching, and code interpretation uncertainty are all different problems.

### 3. Hidden coverage gaps

If the user does not know what the system did **not** check, the interface creates silent liability transfer to the human reviewer.

### 4. Erosion of responsible charge

If the workflow encourages "approve after scan" behavior, the product may operationally undermine the very professional responsibilities it claims to support.

### 5. Audit logs that are technically complete but legally weak

Many systems log events without producing a coherent decision narrative. That may be insufficient in disputes where sequence, rationale, and human involvement matter.

### 6. Model or ruleset drift after updates

Human reviewers build mental models of system strengths and weaknesses. Product updates that shift behavior without visible versioning or change communication can reduce team performance even when model accuracy improves.

## Open Questions

### 1. What is the right benchmark?

The industry still lacks a broadly accepted benchmark for real-world engineering compliance review performance across jurisdictions, disciplines, and amendment regimes.

### 2. How much explanation is enough?

Too little explanation reduces inspectability; too much creates cognitive overload or false persuasion. The right answer likely varies by issue severity and reviewer expertise.

### 3. What should be attested by the human?

Should the human attest only to final disposition, or also to having inspected citations, reviewed coverage gaps, and accepted residual risk?

### 4. How should mixed deterministic-LLM systems be disclosed?

Users need to know whether a finding comes from explicit rules, retrieval plus synthesis, precedent lookup, or a generative guess.

### 5. Where should organizational precedent live?

Internal interpretations, prior comments, and accepted equivalencies are valuable, but they can also ossify bad habits or conflict with updated code.

## What to Monitor in the Next 12 Months

- Adoption of AI-assisted plan review by additional counties, cities, and state agencies, especially whether deployments stay assistive or move closer to approval automation.
- Whether Accela materially productizes AI-assisted plan review after the ePermitHub acquisition beyond document automation and intake validation.
- Whether UpCodes, Blitz, or similar vendors publish stronger independent evidence on accuracy, false-positive rates, or jurisdictional coverage.
- EU AI Act implementation for high-risk systems beginning in **August 2026**, especially how logging, documentation, and human oversight expectations are operationalized.
- Progress of harmonized AI standards in Europe, including prEN 18286 and related work on documentation, quality management, and human oversight.
- Any U.S. state engineering board, NCEES, NSPE, or discipline society guidance that becomes more explicit about AI use in sealed work products, disclosures, or responsible charge.
- Vendor movement from generic chat UX toward case-management UX with source inspection, override analytics, and formal approval attestations.
- Emergence of insurer, broker, or claims-handler expectations around AI-generated engineering review artifacts and audit evidence.
- Independent research on calibrated uncertainty and appropriate reliance in expert workflows, especially evidence from medicine, law, and engineering.

## Actionable Next Steps

1. Define the product boundary explicitly: the system prepares evidence and recommendations; the licensed engineer owns interpretation, disposition, and signoff.
2. Redesign the primary interaction model around queues and issue objects, not free-form chat.
3. Implement multi-dimensional uncertainty display with workflow consequences, not cosmetic confidence badges.
4. Make citations inspectable in one click, with jurisdiction, code year, amendment, and source context always visible.
5. Separate deterministic findings from interpretive suggestions everywhere in the UI, data model, and reporting.
6. Add structured reviewer dispositions and reason codes for every accept, dismiss, defer, and override action.
7. Introduce staged approvals with explicit attestations for any action tied to permit decisions, formal comments, or sealed deliverables.
8. Build audit export as a first-class feature: one package for machines, one narrative for humans.
9. Track override frequency, disagreement patterns, and coverage gaps as product-quality metrics reviewed monthly.
10. Pilot the system with a narrow, high-volume workflow first, such as intake sufficiency or a limited ruleset, before expanding into judgment-heavy code interpretation.
11. Establish an independent review loop so domain experts who did not build the model or ruleset can evaluate quality, failure modes, and organizational drift.
12. Prepare a change-management plan for users that teaches "when to doubt the system," not just how to use it quickly.

## Sources and Further Reading

### Primary and official sources

- NIST, **AI Risk Management Framework**: https://www.nist.gov/itl/ai-risk-management-framework
- NIST, **AI RMF Generative AI Profile** (July 26, 2024): https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- NIST AI RMF Playbook: https://airc.nist.gov/airmf-resources/playbook/
- NSPE, **Responsible Charge** (latest revision May 2024): https://www.nspe.org/nspe-advocacy/explore-issues/professional-policies-and-position-statements/responsible-charge
- NSPE, **Liability of Employed Engineers**: https://www.nspe.org/nspe-advocacy/explore-issues/professional-policies-and-position-statements/liability-employed
- ASCE, **Policy Statement 573 - Artificial Intelligence and engineering responsibility**: https://www.asce.org/advocacy/policy-statements/ps573---artificial-intelligence-and-engineering-responsibility/
- European Commission, **AI Act overview and implementation pages**: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- European Commission, **AI Act standardisation**: https://digital-strategy.ec.europa.eu/en/policies/ai-act-standardisation

### Market and vendor landscape

- Accela, **ePermitHub acquisition** (April 21, 2025): https://www.accela.com/press-releases/accela-acquires-epermithub-to-enhance-its-civic-platform-and-develop-ai-driven-plan-review-automation/
- Accela, **Building solution**: https://www.accela.com/solutions/building/
- Tyler Technologies, **Enterprise Community Development**: https://www.tylertech.com/products/enterprise-permitting-licensing/enterprise-community-development
- OpenGov, **Community Development software**: https://opengov.com/products/permitting-and-licensing/community-development-software/
- Solibri, **ruleset/model checking examples**: https://www.solibri.com/articles/creating-rulesets-in-smc-v9-8
- Autodesk, **Trusted AI**: https://www.autodesk.com/trust/trusted-ai
- Autodesk Construction Cloud, **Issues**: https://construction.autodesk.com/tools/issues-software/
- Autodesk Construction Cloud, **Document management / audit trail**: https://construction.autodesk.com/tools/construction-document-management/
- UpCodes, **home / usage claims**: https://cms.up.codes/home-2025
- UpCodes, **Copilot introduction**: https://cms.up.codes/a/introducing-upcodes-copilot
- Blitz AI, **platform**: https://blitzpermits.ai/
- Blitz AI, **code compliance review workflow**: https://blitzpermits.ai/product-code-compliance-review
- Blitz AI, **San Mateo County announcement** (June 18, 2025): https://blitzpermits.ai/news/sanmateo-county-plan-review
- PermitFlow, **platform**: https://www.permitflow.com/
- PermitFlow, **About / scale claims**: https://www.permitflow.com/about-us

### Research and analysis

- Kim et al., **Fostering Appropriate Reliance on Large Language Models** (CHI 2025): https://www.microsoft.com/en-us/research/publication/fostering-appropriate-reliance-on-large-language-models-the-role-of-explanations-sources-and-inconsistencies/
- Princeton record for the same CHI 2025 paper: https://collaborate.princeton.edu/en/publications/fostering-appropriate-reliance-on-large-language-models-the-role-/
- Bansal et al., **Beyond Accuracy: The Role of Mental Models in Human-AI Team Performance**: https://www.microsoft.com/en-us/research/publication/beyond-accuracy-the-role-of-mental-models-in-human-ai-team-performance/
- Lemus et al., **How Displaying AI Confidence Affects Reliance and Hybrid Human-AI Performance**: https://ebooks.iospress.nl/volumearticle/63335
- ASCE, **Mishandling AI tools puts civil engineers at risk for ethical violations** (March 2025): https://www.asce.org/publications-and-news/civil-engineering-source/civil-engineering-magazine/issues/magazine-issue/article/2025/03/mishandling-ai-tools-puts-civil-engineers-at-risk-for-ethical-violations/

## Final Assessment

If this product category matures well, it will not look like autonomous compliance judgment. It will look like **structured professional oversight software**: machine-generated evidence, human-controlled decisions, persistent traceability, and explicit handling of residual uncertainty. For licensed engineering workflows, that is the correct design center technically, operationally, and legally.
