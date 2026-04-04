# Converting Stormwater and Water Engineering Regulations into Executable Logic Trees

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

Converting stormwater and water engineering regulations into executable logic trees is feasible for a meaningful subset of requirements, but only if the system is designed around the true shape of the source material: layered federal/state/local rules, permit conditions, guidance, maps, engineering manuals, and site-specific professional judgment. In practice, the work is less "turn regulation into code" than "separate computable rules from discretionary rules, model both explicitly, and route uncertainty to humans."

The current landscape combines three partially overlapping fields. First is **rules-as-code / computable regulation**, led by public-sector initiatives such as New Zealand's Better Rules work, OECD analysis, and standards such as LegalRuleML. Second is **legislation-as-software tooling**, including projects like OpenFisca and Catala that show how exceptions, versioning, citations, and temporal changes can be encoded explicitly. Third is **automated compliance checking** from engineering and BIM, where recent 2025-2026 research has become more explicit about traceability, exception handling, and human-in-the-loop review. Stormwater-specific software mostly sits one layer lower: it automates inspections, calendars, SWPPP workflows, rainfall triggers, and records, but generally does not expose a rigorous formal rule model.

For stormwater and water engineering, the main technical difficulty is not syntax extraction. It is the prevalence of mixed rule types: hard thresholds ("disturbance of one acre or more"), scoped conditions ("if discharging to impaired waters"), open-textured standards ("maximum extent practicable," "technically sound practices"), and permit-authority discretion. A useful executable system therefore needs a **typed rule inventory**: deterministic rules, parameterized rules, geospatial applicability rules, evidentiary/documentation rules, defeasible exceptions, and discretionary standards. Logic trees can handle the first four well; the last two require explicit uncertainty labels, argument capture, and review queues.

The strongest near-term opportunity is operational, not fully autonomous compliance. Teams can already build systems that parse source texts into candidate rule objects, attach provenance, classify ambiguity, execute deterministic checks, and escalate uncertain items to engineers or permit specialists. The highest-value product may be a **traceable compliance copilot** that produces explainable determinations, not a black-box auto-approver. This is especially true in stormwater, where permit violations can turn on site conditions, receiving waters, timing, and regulator interpretation.

The bottom line: treat executable logic trees as a **decision-support layer over a versioned regulatory knowledge base**, not as a one-shot LLM conversion problem. The winning architecture will combine structured rule authoring, retrieval from authoritative sources, formal exception modeling, confidence scoring by rule type, and human review workflows with full provenance.

## Assumptions and Scope

- Assumption: there is still limited published literature specifically about converting **stormwater** regulations into executable logic trees. Where direct stormwater evidence is thin, this brief infers from adjacent computable-law and automated engineering compliance research.
- Assumption: the target use case is operational compliance support for U.S. stormwater and water-engineering contexts, especially NPDES/MS4/CGP/industrial stormwater programs plus local design manuals.
- Assumption: "executable logic tree" includes decision trees, decision tables, rule graphs, defeasible logic, and hybrid workflows that combine deterministic branching with human adjudication.

## Current Landscape

### Regulatory source landscape

Stormwater rules are structurally difficult to encode because obligations are distributed across:

- Federal regulations and permit programs under the Clean Water Act and NPDES stormwater framework.
- EPA-issued or delegated-state permits for construction, industrial, and MS4 discharges.
- Permit fact sheets, FAQs, templates, and mapping tools.
- State stormwater manuals and local engineering design criteria.
- Site-specific permit conditions, TMDLs, impaired-water overlays, and regulator correspondence.

EPA's current stormwater program still organizes obligations by discharge category and permit type rather than as a single harmonized rule set. Recent EPA materials also show continued churn: a proposed **2026 MSGP** for industrial stormwater, updated integrated planning resources, and ongoing rulemaking around Waters of the United States (WOTUS). Washington Ecology has already published a page for its next Construction Stormwater General Permit effective **January 1, 2026**, illustrating the normal reissuance/versioning cycle at the state level. North Carolina's DEQ page similarly exposes how the operative rule corpus spans statutes, session laws, temporary rules, and handbooks. For executable systems, this means rule logic must be versioned and jurisdiction-scoped from the start.

### Rules-as-code and computable-law landscape

The strongest public-sector framing still comes from New Zealand's **Better Rules - Better Outcomes** initiative and the OECD's **Cracking the Code** report. Better Rules explicitly describes a methodology that produces concept models, decision models, and rule statements so legislation can be developed in written language and software code at the same time. OECD's core point remains important: if prose is the only official form of rules, digital implementation becomes a repeated translation exercise with high error risk.

In standards and formal representations, **LegalRuleML** remains the clearest general-purpose normative model. Its value is not operational simplicity; it is that it explicitly models obligations, permissions, prohibitions, defeasibility, context, authority, provenance, and multiple interpretations. For implementation, **Catala** and **OpenFisca** are the most practically useful reference points. Catala is strong on exceptions and priority logic. OpenFisca is strong on parameter trees, effective dates, references, and legislated calculations. Neither is stormwater-native, but both embody design patterns that map directly to permit logic.

### Product and vendor landscape

Stormwater software vendors such as **SW²**, **ComplianceGo**, **EnviroReport**, **ProMax Compliance**, **SAMS**, and **metaBMP** are evidence of real demand for digitized compliance operations. Their products focus on inspections, SWPPP records, rainfall triggers, forms, maps, document control, and reminders. That matters because it shows where the immediate market is: organizations will pay first for workflow reliability, auditability, and calendar automation.

However, based on publicly available product descriptions, most of this market appears to implement compliance as **configured workflow + templates + threshold reminders**, not as a transparent, formally versioned regulatory inference layer. That leaves a gap for systems that can trace a decision back to a specific permit clause, exception branch, map overlay, and evidence package.

## Key Players and Stakeholders

### Regulators and standards setters

- **U.S. EPA**: defines federal stormwater program structure, issues permits where EPA is the authority, publishes CGP/MSGP resources, BMP guidance, and digital tools.
- **Delegated state agencies** such as Washington Ecology and North Carolina DEQ: often control the operational rule corpus that permittees actually follow.
- **Local stormwater authorities and public works agencies**: add design manuals, post-construction BMP requirements, and maintenance obligations.
- **OASIS / LegalRuleML community**: provides the most developed general standard for machine-readable normative logic.
- **OECD and government rules-as-code initiatives**: shape public-sector methodology and legitimacy for computable regulation.

### Technical and research actors

- **Catala community**: strongest reference model for exception-heavy legal drafting.
- **OpenFisca community**: strongest reference model for parameterized legislation, temporal versioning, and code-reference linkage.
- **Computational law groups** such as MIT and related research communities: developing architectures for traceable automated compliance and hybrid AI + logic systems.
- **Automated compliance checking researchers** in AECO/BIM: currently producing the most operationally relevant work on semantic extraction, traceability, validation, and human review.

### Operators and users

- Municipal MS4 program managers.
- Construction stormwater compliance teams and SWPPP practitioners.
- Industrial environmental compliance managers.
- Civil and water engineers interpreting local manuals and runoff-control standards.
- Environmental counsel and permit specialists.

These users have different tolerance for automation. Field operators want reliable reminders and simple determinations. Engineers and legal reviewers need traceability, configurable assumptions, and the ability to override a machine interpretation with documented rationale.

## Core Concepts for Executable Logic Trees

### 1. Rule decomposition

The minimum useful unit is not a paragraph; it is a **typed rule object** with:

- source citation
- jurisdiction
- effective dates
- applicability conditions
- trigger
- action or consequence
- evidence required
- exception links
- unresolved ambiguity flags

This is where stormwater projects often fail. Teams try to extract one rule per sentence, but permit clauses often bundle applicability, exceptions, timing, and documentation into one provision. The correct pattern is to decompose each provision into atomic predicates and then reassemble them into a rule graph.

### 2. Normative modality

Executable systems should classify text at least into:

- **obligation**: must, shall, required to
- **prohibition**: may not, prohibited, no discharge
- **permission**: may, eligible, allowed
- **conditional permission / safe harbor**
- **documentation / reporting duty**
- **discretionary standard**

LegalRuleML's distinction between obligations, permissions, prohibitions, violations, and reparative obligations is useful here. Stormwater permits often contain not just a primary duty but a secondary duty after noncompliance, such as corrective action, notice, updated SWPPP records, or sampling follow-up.

### 3. Applicability and context

Applicability is usually multi-dimensional:

- jurisdiction
- permit type
- facility or project class
- acreage/disturbance threshold
- receiving water status
- impaired waters / TMDL / watershed overlays
- site conditions
- timing and phase of construction or operation

This means logic trees alone are often insufficient. A realistic implementation is a **logic tree plus parameter store plus geospatial context layer**.

### 4. Defeasibility and exception priority

Stormwater rules are full of "general rule, unless..." structures. Catala is a strong model here because it treats exceptions as first-class priority relationships rather than ad hoc booleans. For water regulations, the key implementation idea is to model exceptions as a **directed priority graph**:

- base rule
- exception to base rule
- exception to the exception
- emergency or grandfathering override
- regulator-approved alternative compliance path

Without explicit priority, conflicts are inevitable, especially when a local manual, a state permit, and a site-specific condition all touch the same control measure.

## Parsing Patterns That Work

### Deterministic patterns

These are the easiest to encode and should be separated early:

- threshold rules: acreage, discharge volume, slope, setback, rainfall amount
- eligibility rules: permit coverage yes/no
- frequency rules: inspect weekly, within X hours after rain, annually
- formula rules: sizing, detention, treatment volume, loading calculations
- deadline rules: notice, report, stabilization, maintenance

OpenFisca's parameter-tree pattern is valuable for these because many engineering rules are stable formulas with changing coefficients, dates, references, or jurisdictional parameters.

### Semi-structured legal patterns

These usually require decomposition but are still tractable:

- "if A and B, then C unless D"
- "where feasible/practicable, do X"
- "implement BMPs sufficient to..."
- "submit documentation demonstrating..."
- "if located in [overlay], additional requirements apply"
- cross-referenced incorporation by reference

Here, a hybrid of clause segmentation, semantic role extraction, and rule templates works better than free-form generation. Recent 2026 human-in-the-loop compliance-checking work in building regulations suggests the best results come from combining semantic extraction with grammar/constraint validation and expert adjudication, not LLM extraction alone.

### Hard patterns

These should be tagged for assisted interpretation, not full automation:

- open-textured standards: reasonable, adequate, practicable, technically sound
- regulator discretion: as approved by the permitting authority
- purpose clauses: minimize, protect, avoid to the maximum extent practicable
- conflicting cross-jurisdiction requirements
- factual determinations needing professional judgment

In stormwater, EPA materials themselves show this challenge. The MS4 program's "maximum extent practicable" standard is intentionally flexible and often resolved permit-by-permit. EPA's BMP materials also emphasize that BMP menus are not exhaustive and that other technically sound practices may be used. These are not bugs in the regulations; they are deliberate policy choices that preserve discretion. A logic engine should surface them as review items, not collapse them into fake certainty.

## Ambiguity Handling

### Main ambiguity classes

1. **Lexical ambiguity**: terms like "feasible," "stabilized," "adequate," "significant."
2. **Scope ambiguity**: which clause a condition or exception modifies.
3. **Cross-reference ambiguity**: unclear inheritance across permit sections, manuals, and incorporated documents.
4. **Temporal ambiguity**: which permit version applies, and whether transitional provisions control.
5. **Jurisdictional ambiguity**: federal baseline vs. delegated-state vs. local stricter requirement.
6. **Factual ambiguity**: missing or uncertain site data, such as impaired-water status or soil infiltration suitability.

### Recommended treatment

- Do not force a single parse when the text supports multiple plausible interpretations.
- Store multiple candidate interpretations with provenance and an explicit review status.
- Separate **text uncertainty** from **fact uncertainty**. The first is about what the rule means; the second is about whether the site satisfies it.
- Add an "interpretation owner" field so that legal, engineering, and permit operations teams can each own specific ambiguity classes.

LegalRuleML is useful conceptually because it supports multiple semantic annotations and provenance. That is a better fit for regulation than pretending every clause has one canonical machine interpretation.

## Exception Modeling

### Recommended exception types

- eligibility exception
- geographic exception
- temporal/grandfathering exception
- emergency exception
- alternative compliance pathway
- regulator-approved equivalent measure
- de minimis / waiver / infeasibility exception
- corrective-action reparation rule

### Modeling approach

- Represent rules as nodes and exception relations as prioritized edges.
- Require each exception to specify its legal basis, scope, trigger, and superseded rule.
- Distinguish **true exceptions** from **narrower subcases** and from **manual overrides**.
- Log unresolved conflicts as first-class objects; do not silently choose a branch.

Catala's explicit exception chains are a strong model for this. In water regulation, this matters because permits commonly include branch structures such as: a general inspection rule, a modified rule for dormant sites, a different rule for frozen conditions, and an override when a storm event exceeds a threshold.

## Soft-Language Treatment

Soft language is unavoidable in stormwater. EPA's MS4 materials and BMP guidance repeatedly preserve flexibility by allowing communities to use practices that are "technically sound" and by framing requirements around "maximum extent practicable." Executable systems should therefore classify soft-language clauses into one of four buckets:

### 1. Convertible soft language

These can be operationalized if the organization adopts a policy interpretation.

Examples:

- "where feasible" -> feasible if no listed blocking conditions apply
- "adequate stabilization" -> use approved vegetation or cover criteria in local manual

### 2. Policy-bound language

These require a configurable organizational interpretation approved by counsel or engineering leadership.

Examples:

- "minimum necessary"
- "sufficient to protect water quality"

### 3. Evidence-based discretionary language

These should produce a required evidence package, not a yes/no automation.

Examples:

- "maximum extent practicable"
- "technically sound practices"
- "equivalent protection"

### 4. Non-computable narrative language

Purpose recitals and generalized policy statements should inform guidance and explanations but not become executable predicates unless a reviewer maps them to a local policy rule.

The practical design rule is simple: **soft language should usually generate a reviewable claim, not a silent branch outcome**.

## Confidence Scoring

Confidence scoring should not be a single model probability. It should be a composite score over the entire rule-determination chain.

### Recommended confidence dimensions

- **source confidence**: official source, citation integrity, version certainty
- **parse confidence**: how well the text matched a known rule template
- **semantic confidence**: certainty in modality, condition, and exception extraction
- **fact confidence**: quality/completeness of site inputs
- **execution confidence**: whether all referenced parameters and overlays were resolved
- **policy confidence**: whether the rule depends on a human-approved interpretation

### Example confidence bands

- **High**: deterministic threshold/formula/deadline rule from current authoritative source; no unresolved exceptions; complete facts.
- **Medium**: rule required template-based parsing or organizational interpretation, but conflict-free.
- **Low**: ambiguous text, unresolved cross-reference, missing facts, or discretionary standard.

Recent 2025 traceable knowledge-graph validation research and 2026 human-in-the-loop compliance-checking work both reinforce the same operational lesson: confidence must be tied to traceability and evidence, not just model self-assessment. A useful score should degrade sharply when the system cannot point to the exact supporting text or when multiple interpretations survive.

## Human-Review Workflows

Human review should be designed as part of the operating model, not as an afterthought.

### Recommended workflow

1. **Ingest and normalize sources**  
   Collect current permit text, manuals, fact sheets, map layers, FAQs, and dated references.

2. **Machine extraction to candidate rule objects**  
   Use rules, NLP, or LLMs to propose clause decomposition, modality, conditions, and citations.

3. **Automatic rule typing**  
   Tag each rule as deterministic, parameterized, geospatial, evidentiary, discretionary, or unresolved.

4. **Confidence-based routing**  
   Auto-approve only high-confidence deterministic rules. Route medium and low confidence rules to reviewers.

5. **Reviewer adjudication**  
   Legal or engineering reviewers choose between candidate parses, approve policy interpretations, or mark non-computable clauses.

6. **Promotion into executable library**  
   Only reviewed rules enter the production rule base.

7. **Runtime decision support**  
   The system executes approved logic, produces an explanation tree, and flags assumptions.

8. **Feedback and drift monitoring**  
   Track which rules cause repeated overrides or regulator disputes; retrain or rewrite them.

### Review roles

- **Permit analyst / legal reviewer**: text meaning, hierarchy, exception priority.
- **Engineer**: formulas, design assumptions, feasibility interpretations.
- **Program manager**: operational workflow, evidence requirements, escalation policy.
- **Data steward**: map layers, reference data, version control.

The strongest pattern from adjacent engineering-compliance research is that expert review is most efficient when it is targeted: reviewers should adjudicate only the hard edges, not re-read everything.

## Recent Developments

### 1. Stormwater regulation is still changing

- EPA's page for the **proposed 2026 MSGP** confirms active reissuance for industrial stormwater permits, with public-comment materials and webinar documentation posted in 2025.
- EPA's integrated planning materials were updated in **March 2026**, indicating ongoing interest in more coordinated municipal compliance management.
- EPA and the Army Corps unveiled a new WOTUS proposal in **March 2026**, showing that even threshold jurisdictional concepts may shift.
- Washington Ecology has posted a next Construction Stormwater General Permit effective **January 1, 2026**, reinforcing the need for temporal versioning.

### 2. Computable-regulation methods are getting more operational

- Better Rules continues to frame legislation as concept models, decision models, and rule statements rather than only prose.
- LegalRuleML remains available as an OASIS standard for rich normative representation.
- Catala and OpenFisca continue to demonstrate mature approaches to exceptions, parameters, references, and time-based change management.

### 3. Automated compliance checking research is moving toward traceability and human oversight

- A 2026 *Automation in Construction* paper proposes a framework focused on transparency, traceability, validation, and human-in-the-loop oversight.
- A 2026 MDPI paper reports a human-in-the-loop semantic rule-base workflow with explicit auto-accept thresholds and expert review for the remainder.
- A 2026 systematic review in *Automation in Construction* describes the field's evolution from hard-coded rules toward AI-, ontology-, and LLM-driven systems, with interoperability and scalability still unresolved.

## Practical Opportunities

- **Permit intake and applicability screening**: automate permit-type and overlay determinations before a human ever opens the file.
- **Clause-level traceable compliance copilots**: show which permit clauses apply, why, and what evidence is missing.
- **Exception-aware checklists**: replace static forms with decision paths that incorporate waiver and infeasibility branches.
- **Version-diff monitoring**: detect what changed between permit reissuances and identify downstream logic affected.
- **Engineering design support**: connect local manual formulas, BMP siting rules, and geospatial constraints to design workflows.
- **Audit defense**: preserve a machine-generated but human-verified chain from source text to compliance decision.

## Risks

- **False precision**: treating flexible standards as deterministic logic will create brittle and legally risky outputs.
- **Jurisdiction drift**: outdated permit versions or map layers will silently poison results.
- **Citation breakage**: if rule objects are not tied to stable source references, explanations become non-defensible.
- **Hidden policy choices**: local interpretations of "feasible" or "equivalent" may get encoded as if they were law.
- **Cross-document conflict**: federal, state, local, and site-specific rules can diverge.
- **Overreliance on LLM extraction**: high fluency can mask mis-scoped conditions or missed exceptions.
- **Operational ownership gaps**: nobody owns the interpretation decisions, so the rule base decays.

## Open Questions

- What share of a real stormwater rule corpus is truly machine-executable versus permanently review-bound?
- What is the best representation for mixed legal and engineering logic: decision tables, defeasible rules, knowledge graphs, or hybrid graph + code?
- How should organizations encode regulator correspondence, enforcement history, or informal practice without overstating its legal force?
- Can geospatial overlays and environmental data be treated as authoritative inputs, or must they always be reviewer-confirmed?
- What governance model is needed when legal, engineering, and operations stakeholders disagree on an interpretation?

## What to Monitor in the Next 12 Months

- Finalization of EPA's **2026 MSGP** and any new electronic-reporting or data-structure expectations.
- Additional state permit reissuances that expose reusable logic patterns for construction, industrial, and MS4 workflows.
- WOTUS rule changes or litigation that alter jurisdictional applicability logic.
- Whether stormwater software vendors begin exposing formal rule engines, explanation trees, or source-level traceability.
- More 2026-2027 research on LLM-based compliance checking, especially papers that report not just accuracy but traceability and adjudication metrics.
- Adoption signals for LegalRuleML, Catala, OpenFisca, or similar representations outside benefits/tax use cases.
- AI governance requirements that increase documentation expectations for automated compliance systems, especially around human oversight and auditability.

## Actionable Next Steps

1. Build a **typed rule inventory** for one narrow corpus first, such as a single construction general permit plus one local design manual, rather than attempting all stormwater regulations at once.
2. Define a **rule taxonomy** up front: deterministic, parameterized, geospatial, evidentiary, discretionary, exception, and non-computable narrative.
3. Adopt a **source-of-truth schema** that stores citation, jurisdiction, effective date, supersession status, and reviewer approval with every rule object.
4. Encode exceptions as **priority relationships**, not as free-text notes or one-off booleans.
5. Treat soft language as a separate product surface: require policy interpretations, evidence packages, or human review rather than automatic pass/fail.
6. Implement **composite confidence scoring** across source, parse, fact, and execution layers; do not rely on raw model confidence.
7. Create a **review queue by ambiguity class** so legal, engineering, and operations reviewers see only the issues they are best equipped to resolve.
8. Instrument the system for **traceability and override analytics**; repeated overrides are the best signal that a rule was encoded badly or belongs in the discretionary bucket.
9. Add **version-diff tooling** before scaling; permit and manual updates are guaranteed, and maintaining logic over time is harder than the first parse.
10. Measure success on **review-time reduction, explanation quality, and dispute rate**, not just extraction accuracy.

## Key Takeaways

1. Stormwater regulations are partly computable, not fully computable; the winning design distinguishes deterministic clauses from discretionary standards.
2. The core problem is not extraction alone but versioning, applicability, exception priority, and evidence capture across a fragmented rule corpus.
3. LegalRuleML, Catala, and OpenFisca provide transferable design patterns even though they are not stormwater-specific.
4. Soft language such as "maximum extent practicable" should usually trigger structured human review, not silent automation.
5. Confidence must be tied to provenance and traceability, not just LLM output probability.
6. The practical near-term product is a traceable compliance copilot with human adjudication, not a fully autonomous regulator-in-code.
7. Maintaining the rule base through permit reissuances and jurisdiction changes will be a larger long-term challenge than initial parsing.

## Sources and Further Reading

### Primary sources

- U.S. EPA, Construction General Permit FAQs: https://www.epa.gov/npdes/construction-general-permit-cgp-frequent-questions
- U.S. EPA, Construction General Permit resources and tools: https://www.epa.gov/npdes/construction-general-permit-resources-tools-and-templates
- U.S. EPA, Stormwater rules and notices: https://www.epa.gov/npdes/stormwater-rules-and-notices-final-rules
- U.S. EPA, Proposed 2026 MSGP: https://www.epa.gov/npdes/stormwater-discharges-industrial-activities-epas-proposed-2026-msgp
- U.S. EPA, NPDES stormwater program: https://www.epa.gov/npdes/npdes-stormwater-program
- U.S. EPA, Integrated planning for municipal stormwater and wastewater: https://www.epa.gov/npdes/integrated-planning-municipal-stormwater-and-wastewater
- U.S. EPA / Army Corps, WOTUS proposal (March 12, 2026): https://www.epa.gov/newsreleases/epa-army-corps-unveil-clear-durable-wotus-proposal
- Washington State Department of Ecology, Construction Stormwater General Permit: https://ecology.wa.gov/regulations-permits/permits-certifications/stormwater-general-permits/construction-stormwater-general-permit
- North Carolina DEQ, Stormwater rules and regulations: https://www.deq.nc.gov/about/divisions/energy-mineral-and-land-resources/stormwater/stormwater-program/stormwater-rules-and-regulations
- Better Rules - Better Outcomes, overview: https://www.betterrules.govt.nz/about
- Better Rules resources: https://www.betterrules.govt.nz/resource
- OECD, *Cracking the Code*: https://www.oecd.org/en/publications/cracking-the-code_3afe6ba5-en.html
- OASIS, LegalRuleML Core Specification v1.0: https://docs.oasis-open.org/legalruleml/legalruleml-core-spec/v1.0/os/legalruleml-core-spec-v1.0-os.html
- Catala documentation: https://book.catala-lang.org/en/
- OpenFisca documentation: https://openfisca.readthedocs.io/en/latest/key-concepts/parameters.html

### Expert analysis and research

- Merigoux et al., "Catala: A Programming Language for the Law," Microsoft Research / ICFP 2021: https://www.microsoft.com/en-us/research/publication/catala-a-programming-language-for-the-law/
- MIT Computational Law Report, "The Dawn of a New Era of Compliance" (Feb. 24, 2025): https://law.mit.edu/pub/thedawnofaneweraofcompliance
- *Automation in Construction* (2026), "Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation": https://www.sciencedirect.com/science/article/abs/pii/S0926580525006387
- *Automation in Construction* (2026), "Automated compliance checking across the building lifecycle: Systematic and semantic review integrating PRISMA and deep search": https://www.sciencedirect.com/science/article/pii/S0926580526001007
- *Automation in Construction* (2026), "Leveraging large language models for BIM-based automated compliance checking": https://www.sciencedirect.com/science/article/pii/S0926580525007472
- *Buildings* (2026), "Human-in-the-Loop Semantic Rule Base Generation and Dynamic Updating for Automated BIM Compliance Checking: A Knowledge Graph Approach": https://www.mdpi.com/2075-5309/16/4/719
- *Information Processing & Management* (2025), "Traceable LLM-based validation of statements in knowledge graphs": https://www.sciencedirect.com/science/article/pii/S0306457325000706
- SSRN / Institute for Law & AI (Jan. 5, 2026), "Automated Compliance and the Regulation of AI": https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6017756

### Market and workflow indicators

- SW²: https://sw2.net/
- EnviroReport: https://www.enviro.report/
- ComplianceGo: https://compliancego.com/home
- ProMax Compliance: https://promaxcompliance.com/
- SAMS stormwater software: https://njbsoft.com/sams-storm-water/
- metaBMP: https://metabmp.com/
