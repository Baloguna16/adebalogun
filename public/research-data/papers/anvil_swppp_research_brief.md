# Reviewer-Side Deficiency Taxonomy for SWPPPs and Similar Engineering Submissions: Implications for Anvil

**Date:** March 26, 2026  
**Prepared for:** Anvil  
**Classification:** General Research

## Executive Summary

Stormwater Pollution Prevention Plans (SWPPPs), stormwater management plans, and related construction stormwater submissions are reviewed through a predictable but fragmented regime. Across NYC DEP, NYSDEC, EPA, DC DOEE, New Jersey soil conservation programs, and Pennsylvania DEP analogs, reviewers rarely reject plans for novel reasons. Instead, they reject or delay them for recurring classes of deficiencies: wrong jurisdictional pathway, incomplete submission packages, missing supporting forms, internal inconsistencies across plans and calculations, non-conforming erosion and sediment controls, unsupported hydrologic assumptions, insufficient post-construction design documentation, and weak long-term maintenance or certification artifacts.

The core market insight for Anvil is that this problem is productizable. Agencies increasingly publish reviewer-facing checklists, permit submission checklists, and process diagrams. NYC DEP now exposes a staged SWPTS process with explicit submission checklists and a January 21, 2026 process diagram. NYSDEC renewed its Construction General Permit as `GP-0-25-001`, effective January 29, 2025, and tied plan review more tightly to the July 31, 2024 Design Manual, local-government review pathways, and more explicit documentation of deviations or equivalency. DC DOEE goes even further by publishing the actual plan review checklists used by reviewers. This creates a strong basis for an upstream QA engine.

There is no single public dataset that codes reviewer comments into a standard deficiency taxonomy. That taxonomy must therefore be inferred from primary-source reviewer checklists, submission checklists, permit conditions, design manuals, and publicly posted process documents. That inference is strong enough to support a practical product because the same themes recur across jurisdictions and because reviewer checklists are highly structured.

For Anvil, the right product is not a generic “SWPPP validator.” It is a jurisdiction-aware pre-submission QA system that combines: `1)` applicability and pathway determination, `2)` package-completeness validation, `3)` plan-to-calculation consistency checks, `4)` rule-based design review against local manuals, `5)` evidence requirements for deviations and exceptions, and `6)` a scoring engine that estimates review risk and predicts likely reviewer comment categories before filing.

The highest-value near-term opportunity is NYC DEP + NYSDEC because the process is formalized, the requirements are public, the review sequence is explicit, and the pain of delay is high. A second tier is analogous urban jurisdictions with public checklists, especially DC DOEE. The main risks are regulatory drift, liability if users over-rely on scores, and the difficulty of validating engineering correctness from imperfect PDFs and CAD exports. Anvil should therefore position the product as pre-submission QA and reviewer-comment prevention, not as engineering-of-record automation.

## Background and Scope

This brief focuses on the **reviewer-side deficiency taxonomy** for:

- NYC DEP SWPPP and stormwater permit submissions
- NYSDEC construction stormwater permit and SWPPP requirements
- Comparable public-agency review frameworks that expose reviewer logic, especially DC DOEE, with supporting analogs from New Jersey and Pennsylvania

### Assumptions

- **No agency-wide public deficiency codebook exists** for NYC DEP or NYSDEC. The taxonomy below is inferred from public checklists, manuals, permit conditions, and process documents.
- “Comparable agencies” is interpreted as agencies that review stormwater, erosion/sediment, or post-construction runoff submissions through similar technical workflows, not necessarily agencies using the exact term “SWPPP.”
- Where public sources provide checklists but not frequency data, relative prevalence is an analytical judgment based on how prominently and repeatedly the issue appears across sources.

## Current Landscape

### 1. The regulatory architecture is layered, not single-agency

Most construction stormwater submittals sit inside a multi-layer review stack:

- A **state or federal permit framework** sets baseline SWPPP obligations and permit eligibility.
- A **local agency** may impose a separate submission, acceptance, or construction permit workflow.
- A **technical design manual** governs acceptable BMP selection, calculations, siting, and maintenance expectations.
- Separate forms handle **NOI/NOT**, easements, certifications, inspections, floodplain issues, utilities, wetlands, endangered species, and maintenance responsibilities.

This matters because many “technical” deficiencies are actually **workflow and package orchestration failures**.

### 2. NYC DEP is unusually process-explicit

NYC DEP’s current stormwater permitting page states that projects draining to a City-owned sewer and disturbing `20,000 sf` or more of soil, or adding `5,000 sf` or more of impervious area, may require a Stormwater Permit. DEP routes filings through the Stormwater Permitting and Tracking System (`SWPTS`) and publishes:

- a SWPPP submission checklist,
- permit initiation and permit pulling checklists,
- a SWPTS user manual,
- a process diagram, and
- the Unified Stormwater Rule / NYC Stormwater Manual materials.

The SWPPP submission checklist explicitly separates:

- optional pre-application materials,
- optional “SMP Conceptual Review,” and
- full submissions eligible for approval.

That distinction is important: NYC DEP is telling applicants that a submission can be reviewable yet still structurally ineligible for approval.

### 3. NYSDEC remains the state permit backbone in New York

NYSDEC’s Construction General Permit `GP-0-25-001` became effective on **January 29, 2025** and expires **January 28, 2030**. The permit and fact sheet show three current themes:

- stronger alignment with the **July 31, 2024 Stormwater Management Design Manual**,
- clearer documentation expectations for **equivalency**, **legacy designs**, and **deviations**, and
- more explicit interaction with **Traditional Land Use Control MS4 Operators** and governmental review pathways.

This means reviewer-side deficiencies are shifting from “did you include a SWPPP?” to “did you document the exact basis on which this SWPPP is allowed to use this design path?”

### 4. Comparable agencies increasingly publish reviewer logic

DC DOEE is the clearest example. Its Stormwater Management Guidebook page says it provides “the checklists reviewers use to conduct their plan reviews.” The public `SWMP Compliance Calculations Checklist` is effectively a reviewer rubric. It checks:

- activity type and trigger,
- permit and review type,
- vesting/transition status,
- required supporting forms,
- watershed and sewer-system context,
- floodplain and localized flooding issues,
- plan-format requirements,
- professional certification,
- component-level plan contents,
- hydrologic method selection,
- calculation assumptions,
- maintenance plans, covenants, and inspection schedules.

This is precisely the kind of artifact Anvil can productize.

### 5. Submission quality is becoming a larger bottleneck than pure engineering design

Across agencies, the review burden is increasingly driven by:

- cross-document consistency,
- complete digital package assembly,
- correct signatures/certifications,
- special-condition documentation,
- maintenance and post-construction lifecycle artifacts, and
- evidence that the designer followed the jurisdiction’s required reasoning path.

That is favorable for software. These are structured, repeated, and checkable defects.

## Key Players and Stakeholders

### Regulators

- **NYC DEP**: local stormwater permitting authority for covered NYC projects via SWPTS, with staged review and construction/maintenance permit workflows.
- **NYSDEC**: state permit authority through the SPDES Construction General Permit and Design Manual.
- **EPA**: federal baseline through the 2022 Construction General Permit and SWPPP guidance; also relevant where EPA is direct permitting authority.
- **DC DOEE**: strong comparable agency because it publishes reviewer checklists and plan review mechanics.
- **NJDA / Soil Conservation Districts**: relevant analog for erosion/sediment plan review and certification, especially around soil restoration, compaction mitigation, and district-certified plans.
- **Pennsylvania DEP**: relevant analog for NPDES construction/stormwater review and public-facing application artifacts.

### Private-Sector Participants

- Civil engineers and SWPPP preparers
- Environmental consultants
- Land-use counsel
- Developers and owners
- Expediter / permit-management teams
- Contractors and qualified inspectors
- Plan reviewers inside agencies or delegated districts

### Product Competitors and Adjacent Tools

There is no obvious dominant, reviewer-comment-prediction platform in this niche. The competitive set is more likely:

- internal consultant QA spreadsheets and checklists,
- permitting/project-management systems,
- CAD/hydrology design tools,
- document assembly tools, and
- generic AI document reviewers

This is a fragmented field. Anvil’s advantage would come from **jurisdiction-specific review intelligence**, not generic document AI.

## Core Concepts

### SWPPP / SWMP review has four different layers of “correctness”

1. **Applicability correctness**  
Is the submission required, and is it being filed through the right pathway?

2. **Administrative completeness**  
Are all forms, signatures, fees, appendices, certifications, and supporting documents present?

3. **Technical conformance**  
Do controls, calculations, assumptions, and details comply with the applicable manual, permit, and special conditions?

4. **Lifecycle operability**  
Can the project be inspected, maintained, certified, amended, and closed out without compliance gaps?

Most agency review delays happen when a plan is locally “good enough engineering” but fails on one of the other three layers.

### Reviewers think in packages, not isolated documents

Agency artifacts consistently show that reviewers compare:

- narrative sections,
- drawing sets,
- drainage area maps,
- calculations,
- geotechnical reports,
- NOI/eNOI materials,
- certifications,
- maintenance documents,
- inspection schedules, and
- easement/covenant documents.

Anvil’s scoring engine should therefore evaluate **package coherence**, not just document completeness.

## Reviewer-Side Deficiency Taxonomy

Below is the most useful inferred taxonomy for product use. The categories are designed to be stable across agencies even when local form names differ.

### 1. Applicability and Jurisdiction Defects

Typical issues:

- wrong threshold determination
- wrong sewer-area or drainage-area classification
- project filed under wrong permit or review path
- incorrect assumption that project is exempt, vested, grandfathered, or transition-eligible
- failure to identify “larger common plan” implications

Evidence:

- NYC DEP thresholds and SWPTS pathway requirements
- DC DOEE checklist items on activity type, review type, and vesting
- NYSDEC permit eligibility structure

Why reviewers care:

If the filing is on the wrong pathway, all downstream review effort is wasted.

### 2. Submission Package Incompleteness

Typical issues:

- missing appendices or drawings
- absent NOI acknowledgement, permit IDs, or acceptance forms
- omitted geotechnical report
- missing construction details, certifications, or supporting calculations
- failure to include required cover letter for conceptual review or exception request

Evidence:

- NYC DEP SWPPP submission checklist explicitly enumerates sections, Appendix A drawings, and Appendices B-Z
- NYC DEP permit initiation checklist requires personnel registration, easement proof when applicable, and SPDES identifiers
- DC DOEE checklist includes extensive supporting-form requirements

Why reviewers care:

Review cannot proceed efficiently without a full package, and some packages are not even eligible for approval.

### 3. Party, Signature, and Certification Defects

Typical issues:

- wrong applicant entity
- required roles not registered or identified
- missing PE seal or maintenance-responsibility statement
- missing inspector or contractor credentials
- unsigned certification blocks or stale forms

Evidence:

- NYC DEP checklists for owner/developer, contractor, qualified inspector, and training records
- DC DOEE statement blocks and PE certification requirements

Why reviewers care:

Reviewers need accountable parties for construction, maintenance, and legal enforceability.

### 4. Existing Conditions and Site Characterization Defects

Typical issues:

- incomplete site description
- missing soils data, utility mapping, flood boundaries, hotspot designation, or natural features
- drainage areas not fully delineated
- off-site contributing flows ignored
- historical impervious or baseline-condition evidence missing

Evidence:

- NYC DEP Appendix A drawing list and site-constraints sections
- DC DOEE checklist items on soils, utilities, floodplain, off-site impacts, and land-cover delineation
- NJ soil restoration program emphasis on depicting areas subject to testing and restoration

Why reviewers care:

Bad inputs make every downstream hydraulic, BMP, and sequencing decision unreliable.

### 5. Erosion and Sediment Control (ESC) Design Defects

Typical issues:

- control measures not matched to phasing or disturbance areas
- non-conforming practices without justification
- sequencing plans missing or inconsistent with notes/details
- stabilization and pollution-prevention measures underdeveloped
- construction entrances, perimeter controls, stockpile management, or dewatering controls not addressed

Evidence:

- NYC DEP SWPPP sections on conforming/non-conforming ESC practices, pollution prevention, and phasing
- NYSDEC / EPA CGP frameworks that require documented control selection and implementation
- NJ erosion and sediment control standards and district-certified plans

Why reviewers care:

These are the most visible enforcement risks during active construction.

### 6. Hydrology and Hydraulic Methodology Defects

Typical issues:

- unacceptable model choice for site type/scale
- inconsistent drainage areas between plans and calculations
- wrong rainfall event, curve number, time of concentration, or routing assumption
- inadequate documentation of design storm criteria
- unsupported equivalence claim to a local design manual

Evidence:

- DC DOEE checklist identifies acceptable models and required calculation elements
- NYC DEP and NYSDEC require detailed calculations and design-manual conformance
- NYSDEC fact sheet highlights equivalence and legacy design documentation pathways

Why reviewers care:

A technically complete package can still fail if the calculation method is unacceptable or internally inconsistent.

### 7. Post-Construction BMP Selection and Siting Defects

Typical issues:

- BMP hierarchy not followed
- retention-first logic not demonstrated
- site constraints analysis incomplete
- infiltration proposed where geotechnical, hotspot, groundwater, or utility conditions make it problematic
- proprietary or non-standard practices submitted without adequate technical backup

Evidence:

- NYC Unified Stormwater Rule and Stormwater Manual emphasize retention-first BMP selection and site-constraint analysis
- DC DOEE checklists and special appendices for proprietary practices and hardship relief
- NYSDEC Design Manual integration and equivalency provisions

Why reviewers care:

This is where agencies test whether the design actually reflects the jurisdiction’s policy preferences, not just engineering feasibility.

### 8. Water Quality, Quantity, and Special-Condition Defects

Typical issues:

- required treatment or retention volume not shown correctly
- flood control / channel protection criteria omitted where applicable
- no-net-increase or sewer-operations requirements missed
- impaired waters, TMDL, hotspot, UIC, watershed, or floodplain special conditions not carried through the package
- off-site mitigation or credit trading not documented correctly

Evidence:

- NYC DEP sections on water quality, runoff reduction, sewer operations, NNI, flood/channel requirements, and UIC
- DC DOEE checklist on CSS/MS4 distinctions, floodplain controls, and off-site retention
- EPA / NYSDEC permit structures for special receiving-water and eligibility issues

Why reviewers care:

These are core regulatory outcomes. Missing them is not a minor drafting issue.

### 9. Deviation, Exception, and Legacy-Design Documentation Defects

Typical issues:

- departures from design standards not justified
- hardship / relief claims unsupported
- use of older manual version not documented under transition rules
- missing evidence that a local reviewing body already reviewed the SWPPP

Evidence:

- NYSDEC `GP-0-25-001` fact sheet explicitly discusses deviations, equivalence, and documentation for continuing to use 2015-manual designs under certain conditions
- DC DOEE relief-from-extraordinarily-difficult-site-conditions workflow
- NYC conceptual-review pathway and staged submissions

Why reviewers care:

Agencies may allow exceptions, but only if the applicant proves eligibility and provides the required record.

### 10. Construction Inspection and Corrective-Action Readiness Defects

Typical issues:

- inspection schedules missing or too generic
- qualified inspector not identified
- corrective-action procedures absent
- temporary stabilization / shutdown / restart procedures not documented
- no clear link between field observations and SWPPP amendment process

Evidence:

- NYC DEP active-construction guidance and permit initiation requirements
- NYSDEC fact sheet updates on inspection report contents, restart notifications, and corrective action timing
- EPA CGP inspection and corrective action templates

Why reviewers care:

Reviewers are increasingly looking past design approval to whether the project can actually remain compliant in the field.

### 11. Operations, Maintenance, Easement, and Close-Out Defects

Typical issues:

- O&M manual missing or generic
- maintenance responsibilities not assigned
- easement/covenant documents missing or not aligned with BMP footprint
- as-built certification path unclear
- close-out package requirements not anticipated during initial design

Evidence:

- NYC DEP requires draft maintenance easements, O&M materials, and later maintenance permit workflows
- DC DOEE checklist requires maintenance plans and declarations of covenants

Why reviewers care:

Permanent stormwater controls fail programmatically when ownership and maintenance are ambiguous.

### 12. Cross-Document Inconsistency Defects

Typical issues:

- narrative says one thing, plans show another
- appendices use different drainage-area IDs
- land-cover tables do not match site plans
- BMP sizes in calculations differ from detail sheets
- permit forms and plan sets disagree on acreage, impervious area, or discharge points

This category is not always called out explicitly in manuals, but it is one of the most common real-world review pain points. It should be a first-class Anvil category because software is well-suited to detect it.

## Recent Developments

### NYC DEP

- NYC DEP’s stormwater permit materials were refreshed across 2025 and early 2026, including the publicly posted SWPTS process diagram labeled **Version: January 21, 2026**.
- The City continues to operationalize the **Unified Stormwater Rule**, which aligns quantity and quality requirements more explicitly and emphasizes a retention-first approach in the current NYC Stormwater Manual.
- DEP is publishing stage-specific submission checklists, which is a strong signal that review efficiency and package completeness are active operational priorities.

### NYSDEC

- NYSDEC renewed the Construction General Permit as **GP-0-25-001**, effective **January 29, 2025**.
- The permit fact sheet ties current reviews to the **July 31, 2024 Design Manual** while creating documented pathways for certain projects designed to the earlier 2015 manual.
- NYSDEC also noted that it sought stakeholder input in 2024 on possible permit and manual changes related to **climate change impacts**, but further research and data gathering were still underway in the fact sheet. That suggests more climate-related review expectations may still come.

### Comparable Agencies

- DC DOEE finalized amendments to its stormwater regulations on **October 31, 2025**, according to its current stormwater rule page.
- DOEE continues to expose reviewer checklists publicly, which is a strong example of a regulator making reviewer logic machine-readable.

## Practical Opportunities for Anvil

### 1. Productize reviewer logic, not just code requirements

The best product wedge is a **review-risk engine** based on how agencies actually review packages:

- pathway eligibility
- completeness gates
- discipline-specific QA
- exception-evidence requirements
- lifecycle operability

### 2. Start with pre-submission QA for NYC + NYSDEC

This is the strongest launch market because:

- requirements are public and structured,
- local + state interaction is explicit,
- review delays are expensive,
- submissions are package-heavy, and
- there are enough deterministic rules to produce useful scores.

### 3. Use DC DOEE as a training and benchmarking jurisdiction

DOEE is valuable because public reviewer checklists reveal:

- actual reviewer categories,
- document expectations,
- exception paths,
- acceptable methodologies, and
- maintenance/legal artifacts reviewers look for.

This can help Anvil build a generalized ontology even if the first commercial market is New York.

### 4. Sell time-to-approval and comment-reduction

The commercial value proposition should be:

- fewer first-round disapprovals,
- fewer reviewer comments,
- faster approval cycles,
- less senior-engineer QA time,
- fewer package-resubmission errors,
- higher consistency across offices and subcontractors

### 5. Build the product in two layers

- **Deterministic layer**: rule checks, presence checks, cross-document validation, threshold logic, form/certification checks
- **Analytical layer**: risk scoring, likely reviewer comment prediction, ambiguity detection, “needs engineer judgment” flagging

## Proposed Pre-Submission QA Checklist for Anvil

The checklist below is designed as a product object model, not just a PDF checklist.

### A. Intake and Applicability

- Confirm jurisdiction, sewer area, watershed/MS4/CSS status, and receiving-water context.
- Determine project trigger thresholds: disturbance area, new impervious area, larger common plan, redevelopment status.
- Determine filing path: local SWPPP acceptance, state NOI, local construction permit, maintenance permit, exemption, or transition path.
- Flag any required related permits or external clearances.

### B. Submission Package Completeness

- Verify all required narrative sections are present.
- Verify all required drawing sheets are present.
- Verify all required appendices/supporting documents are present.
- Verify submission-stage requirements: conceptual review versus approval-eligible package.
- Verify current versions of forms, blocks, and templates.

### C. Parties, Credentials, and Certifications

- Confirm applicant, owner, developer, PE, qualified inspector, contractor, and maintenance-responsible party are identified.
- Confirm seals, signatures, training credentials, and registration status where required.
- Confirm certifications are current and match the correct project entity.

### D. Site Characterization

- Confirm soils, groundwater, utilities, floodplain, hotspots, natural features, off-site drainage, and baseline conditions are documented.
- Reconcile site area, disturbance area, impervious area, and drainage-area tables across all documents.
- Confirm geotechnical support is present where infiltration or subsurface constraints matter.

### E. ESC and Construction Controls

- Confirm ESC measures are shown, dimensioned where needed, and mapped to construction phases.
- Confirm pollution-prevention measures, stabilization, material handling, and non-stormwater discharges are addressed.
- Confirm sequencing, phasing, and temporary conditions are coherent across narrative and plans.

### F. Hydrology, Hydraulics, and Calculations

- Validate accepted method/model for jurisdiction and project size.
- Reconcile drainage areas, curve numbers, time of concentration, and storm-event assumptions.
- Confirm treatment, retention, detention, channel-protection, and flood-control calculations are complete where applicable.
- Flag any unsupported manual deviation or equivalency claim.

### G. Post-Construction BMP Review

- Confirm hierarchy/siting analysis was performed.
- Confirm BMP selection reflects site constraints and policy priorities.
- Confirm detail sheets, sections, and specifications match calculation assumptions.
- Confirm proprietary or non-standard practices include required backup.

### H. Special Conditions and Exceptions

- Check watershed/floodplain/hotspot/UIC/impaired-water/TMDL and local special-condition requirements.
- Check grandfathering, vesting, relief, hardship, or legacy-design documentation.
- Ensure all off-site mitigation, credit trading, or relief claims are supported.

### I. Inspection, O&M, and Close-Out Readiness

- Confirm inspection schedule and corrective-action workflow.
- Confirm O&M manual, responsible party, and maintenance frequency.
- Confirm easement/covenant/as-built/close-out artifacts are anticipated and spatially aligned with the design.

### J. Cross-Document Consistency

- Compare all key project facts across narrative, plans, calculations, forms, and appendices.
- Flag mismatches in areas, BMP names, dimensions, drainage IDs, permit IDs, and discharge points.
- Require resolution before “ready to file” status.

## Proposed Scoring Engine for Anvil

### Design Principles

- Score **review risk**, not engineering merit in the abstract.
- Treat **gating defects** separately from weighted quality defects.
- Surface **confidence** and **assumptions** explicitly.
- Make every score explainable and tied to evidence.

### Scoring Structure

Use three layers:

1. **Eligibility Gate**
   Pass / fail on jurisdiction, trigger, filing path, and mandatory package components.

2. **Category Scores**
   Score 0-100 for each taxonomy category:
   - applicability
   - package completeness
   - certifications
   - site characterization
   - ESC
   - hydrology/hydraulics
   - post-construction BMPs
   - special conditions / exceptions
   - inspection & corrective action
   - O&M / close-out
   - cross-document consistency

3. **Composite Review Risk Score**
   Convert category scores into:
   - `Ready`
   - `Ready with engineer review`
   - `High risk of comments`
   - `Not approval-eligible`

### Suggested Weighting

Suggested starting weights for NYC DEP / NYSDEC:

- Applicability and pathway: `15%`
- Package completeness: `15%`
- Certifications and parties: `8%`
- Site characterization: `10%`
- ESC: `10%`
- Hydrology / hydraulics: `15%`
- Post-construction BMP design: `12%`
- Special conditions / exceptions: `5%`
- Inspection readiness: `3%`
- O&M / close-out: `3%`
- Cross-document consistency: `4%`

### Severity Logic

- **Critical**: blocks filing or approval eligibility
- **Major**: likely to trigger substantive reviewer comments or revision cycles
- **Moderate**: likely to trigger clarification comments
- **Minor**: drafting, formatting, or low-risk omissions

### Illustrative Rule Examples

- Missing NYC Appendix D geotechnical report where infiltration BMPs are proposed -> `Critical`
- NOI acknowledgement letter absent where state coverage is required -> `Critical`
- Drainage area acreage mismatch between calculation appendix and plan set -> `Major`
- PE seal missing from D.C. statement block -> `Critical`
- Older design-manual path used without required evidence of prior governmental review -> `Major`
- O&M responsible party named in narrative but not in covenant/easement materials -> `Major`

### Output Format

For each issue, Anvil should produce:

- issue title
- taxonomy category
- severity
- evidence excerpt or detected mismatch
- affected files/pages/sheets
- likely reviewer concern
- recommended fix
- whether licensed-engineer judgment is required

## Risks and Challenges

### Product and Legal Risks

- Users may treat the score as approval assurance.
- Engineering correctness cannot always be validated from document review alone.
- Local interpretation can vary by reviewer, borough, district, or project type.

### Data Risks

- No standardized historical comment corpus may be available.
- Many submissions live in PDFs, scans, or non-normalized drawing exports.
- Public checklists can lag actual reviewer practice.

### Regulatory Drift

- NYC DEP forms, SWPTS workflows, and checklists are actively updated.
- NYSDEC may continue climate-related permit/manual revisions.
- Comparable agencies may revise manuals, forms, and relief pathways with limited notice.

### Change-Management Risks

- Firms may resist workflows that expose QA gaps before internal review.
- Senior engineers may distrust black-box scoring.

## Open Questions

- Can Anvil obtain anonymized historical reviewer comment letters from partner firms to calibrate weights?
- Which file types will be first-class inputs: PDF only, or CAD, GIS, spreadsheets, and calculation workbooks as well?
- Will Anvil support only pre-submission QA, or also amendment, construction-phase, and close-out workflows?
- Can the product reliably detect jurisdictional applicability from parcel/location data alone?
- How should Anvil separate deterministic failures from “engineer judgment required” cases to avoid false precision?
- Can it ingest local manual tables and update rule packs quickly enough to track regulatory drift?

## What to Monitor in the Next 12 Months

- **NYC DEP** updates to SWPTS workflows, submission checklists, and Unified Stormwater Rule guidance.
- **NYSDEC** follow-through on climate-related changes signaled during the 2024 ANPP process and any revisions or clarifications tied to the 2024 Design Manual.
- **Agency digitization** trends, especially publication of machine-readable forms, reviewer checklists, or API-accessible permit status data.
- **Comparable-agency checklist publication** by other urban regulators; DOEE is a strong precedent and may not remain unique.
- **Judicial or administrative developments** affecting deference to local stormwater review discretion.
- **Market signals from engineering firms** on willingness to share anonymized reviewer comments for model training.
- **Growth in alternative compliance pathways** such as off-site retention, credits, hardship relief, or legacy-design transitions, which tend to create documentation-heavy review burdens.

## Actionable Next Steps

1. Build an initial **jurisdiction ontology** for NYC DEP and NYSDEC that maps triggers, submission stages, required artifacts, roles, and review gates.
2. Implement a **deterministic rules engine** first for package completeness, pathway eligibility, signatures/certifications, and cross-document consistency.
3. Use DC DOEE’s public reviewer checklists as a **reference benchmark** to normalize category names and issue types for a multi-jurisdiction taxonomy.
4. Create an Anvil **issue schema** with `category`, `severity`, `agency basis`, `evidence`, `fix recommendation`, and `engineer judgment required` fields.
5. Pilot with **10-20 historical NYC/NYSDEC projects** from one or two design firms to compare Anvil findings against real reviewer comments and tune weights.
6. Add a **submission-stage mode** so the tool distinguishes conceptual reviews from approval-eligible packages and does not over-flag intentional early-stage omissions.
7. Develop a **document reconciliation layer** that compares project facts across narrative sections, plans, calculations, appendices, and forms before introducing more advanced AI review.
8. Position the product commercially as **comment reduction and cycle-time compression**, not as automatic permit approval.

## Bottom Line

The reviewer-side deficiency landscape for SWPPPs is more structured than it looks. NYC DEP, NYSDEC, and comparable agencies all review against a repeated pattern of pathway, completeness, technical-conformance, and lifecycle-operability checks. The absence of a public universal deficiency codebook is a constraint, but not a blocker. The public materials are already rich enough to support a high-value Anvil product: a jurisdiction-aware pre-submission QA checklist and scoring engine that catches likely reviewer objections before filing.

## Sources and Further Reading

### Primary Sources

- NYC DEP Stormwater Permits: https://www.nyc.gov/site/dep/water/stormwater-permits.page
- NYC DEP SWPPP Submission Checklist: https://www.nyc.gov/assets/dep/downloads/pdf/water/stormwater/ms4/swppp-submission-checklist.pdf
- NYC DEP Permit Initiation Submission Checklist: https://www.nyc.gov/assets/dep/downloads/pdf/water/stormwater/ms4/construction-permit-initiation-submission-checklist.pdf
- NYC DEP Permit Pulling Request Submission Checklist: https://www.nyc.gov/assets/dep/downloads/pdf/water/stormwater/ms4/construction-permit-pulling-request-submission-checklist.pdf
- NYC DEP Stormwater Permitting Process Summary Diagram, version dated January 21, 2026: https://www.nyc.gov/assets/dep/downloads/pdf/water/stormwater/ms4/permit-process-summary.pdf
- NYC DEP Unified Stormwater Rule / Stormwater Manual page: https://www.nyc.gov/site/dep/water/unified-stormwater-rule.page
- NYC DEP Stormwater Manual PDF: https://www.nyc.gov/assets/dep/downloads/pdf/water/stormwater/unified-stormwater-rule/uswr_nyc_stormwater_manual.pdf
- NYC DEP Applicant’s Guide to SWPPP in the Watershed: https://www.nyc.gov/assets/dep/downloads/pdf/watershed-protection/regulations/applicants-guide-to-swppp.pdf
- NYSDEC Construction Activity Permit page: https://dec.ny.gov/environmental-protection/water/water-quality/stormwater/construction-activity-permit
- NYSDEC ENB notice for `GP-0-25-001`: https://dec.ny.gov/news/environmental-notice-bulletin/2025-01-29/statewide-state-pollutant-discharge-elimination-system-spdes-general-permit-for-stormwater-discharges-from-construction-activity-permit-no-gp-0-25-001-construction-general-permit-cgp
- NYSDEC Fact Sheet for `GP-0-25-001`: https://dec.ny.gov/sites/default/files/2025-01/fs_cgp_gp-0-25-001.pdf
- NYSDEC ENB notice for 2024 Design Manual: https://dec.ny.gov/news/environmental-notice-bulletin/2024-07-31/statewide-availability-of-the-new-york-state-stormwater-management-design-manual-july-31-2024-2024-design-manual
- DC DOEE Stormwater Management Guidebook page: https://doee.dc.gov/swguidebook
- DC DOEE SWMP Compliance Calculations Checklist: https://doee.dc.gov/sites/default/files/dc/sites/ddoe/page_content/attachments/SWMP%20Compliance%20Calculations%20Checklist.pdf
- DC DOEE Stormwater Management Rule and Guidebook page: https://doee.dc.gov/swregs
- NJ Soil Erosion and Sediment Control Program: https://www.nj.gov/agriculture/divisions/anr/nrc/njerosion.shtml
- NJ Pinelands Stormwater Checklist and Reference Guide: https://www.nj.gov/pinelands/appli/tools/new%20forms/Stormwater%20Management%20Plan%20Checklist%20and%20Reference%20Guide.pdf
- EPA 2022 Construction General Permit page: https://www.epa.gov/npdes/2022-construction-general-permit-cgp
- EPA SWPPP development resources: https://www.epa.gov/npdes/developing-stormwater-pollution-prevention-plan-swppp
- EPA construction permit resources and templates: https://www.epa.gov/npdes/construction-general-permit-resources-tools-and-templates

### Notes on Source Quality

- Highest weight was given to agency permit pages, permit fact sheets, official manuals, and public reviewer checklists.
- Where the taxonomy goes beyond exact agency wording, it is presented as an inference from recurring official requirements rather than as a quoted agency classification system.
