# Evaluating SWPPP & Engineering Documents: Failure Modes, Knowledge Extraction, and UX Strategy

**Date:** March 25, 2026
**Prepared for:** Ade Balogun, Project Anvil
**Classification:** Product Strategy Research

---

## Executive Summary

Evaluating a SWPPP (or any engineering compliance document) means answering one question: **does this project's design satisfy every applicable regulatory requirement?** This sounds simple, but it's a minefield. The information needed to answer it is scattered across flat PDF drawings, specification tables, engineering calculations, and tacit knowledge in the engineer's head. No single source has the full picture.

The critical finding from this research is that **~40-50% of SWPPP evaluation data is project-knowledge that interviews capture well** (construction phasing, material handling, BMP maintenance plans, responsible personnel). Another **~30-40% is spatial/geometric data locked in engineering drawings** (drainage patterns, BMP locations, grading contours) that current AI cannot reliably extract from rasterized PDFs. The remaining **~15-20% requires field observation** and is out of scope for a pre-submission tool.

This means Anvil's interview-first approach is architecturally correct -- it captures the half of the data that's hardest to extract automatically. The drawing data should come via a hybrid approach: extract what's feasible (title blocks, BMP schedules, general notes), interview for the rest (the engineer already knows their drainage areas and soil types), and defer true spatial reasoning until the technology matures or BIM adoption catches up.

On the review/return question: **SWPPP submissions are returned at alarmingly high rates.** NYC DEP's process involves a 5-phase lifecycle where deficiencies at any point send the applicant back. Common rejections include incomplete site maps, missing BMP specifications, inadequate erosion control sequencing, and outdated design manual references -- the 2025 NYSDEC permit (GP-0-25-001) introduced new requirements around climate resilience and electronic filing that have created a fresh wave of non-compliance. A tool that catches these deficiencies before submission would be immediately valuable.

**The bottom line:** Don't try to "read" engineering drawings with AI. Instead, build an evaluation engine that combines structured interview data with targeted document extraction, applies regulatory rules as formal logic, and presents deficiency reports in a format that mirrors what reviewers produce -- so engineers can fix issues before they submit.

---

## Background: How SWPPP Evaluation Works Today

### The Reviewer's Workflow

A SWPPP reviewer (at NYC DEP, NYSDEC, or a delegated MS4 operator) works through a structured checklist. Based on the NYC DEP submission checklist and NYSDEC Construction Stormwater Toolbox, they evaluate:

1. **Administrative completeness** -- Is the NOI filed electronically? Are all forms present? Is the correct design manual referenced (2024 version required for new projects as of GP-0-25-001)?
2. **Site characterization** -- Does the SWPPP describe existing conditions, soil types, drainage patterns, receiving waters? Are site maps present with north arrows and water body locations?
3. **Stormwater management design** -- Do proposed SMPs (Stormwater Management Practices) meet the Runoff Reduction criteria? Are engineering calculations provided? Do designs reference the correct standards?
4. **Erosion & sediment control plan** -- Are BMPs specified for each construction phase? Is there a sequencing plan? Are the BMPs appropriate for the site's soil erodibility and slope?
5. **Post-construction requirements** -- Is there an Operations & Maintenance Manual? Is a Stormwater Maintenance Easement addressed? Are inspection schedules defined?
6. **Climate resilience (NEW in 2025)** -- Does the plan address future climate risks per the Community Risk and Resiliency Act?

The NYC DEP process is a **5-phase lifecycle**:
- **Phase I:** SWPPP Application (design review)
- **Phase II:** Pre-Construction (construction permit)
- **Phase III:** Active Construction (amendments, inspections)
- **Phase IV:** Construction Close-Out (as-builts, O&M manual)
- **Phase V:** Post-Construction (maintenance certifications)

Deficiencies at any phase send the applicant back. The entire cycle from Phase I submission to construction authorization can take **months**, with each round-trip adding weeks.

**Anecdote: The NYC workshop pipeline.** NYC DEP runs monthly workshops (last Tuesday of each month) specifically to help applicants understand submission requirements -- the fact that they need recurring workshops tells you how often submissions come in wrong. [Source: NYC DEP Stormwater Permits page]

### The NYSDEC 2025 Permit Shakeup

The new GP-0-25-001 (effective January 29, 2025) introduced several changes that are actively creating confusion:
- **Electronic NOI filing required** -- no more paper submissions
- **2024 Design Manual mandatory** -- projects under review before July 31, 2024 can use 2015 manual with documentation, but everything else must use the new standard
- **Climate resilience requirements** -- new section requiring projects to address temperature, precipitation, sea-level rise, and storm surge impacts
- **45-day transition window** -- existing permit holders had until February 28, 2025 to file a Request to Continue Coverage
- **5-acre disturbance process** -- new standardized procedure for requesting >5 acres of simultaneous disturbance

[Source: NYSDEC GP-0-25-001 analysis by Jack Williams, CPESC, CPMSM]

This is a **perfect storm for Anvil** -- the regulatory landscape just shifted, engineers are confused about new requirements, and the existing tooling hasn't caught up.

---

## Common Deficiencies: Why SWPPPs Get Returned

Based on research across EPA guidance, NYSDEC inspection manuals, and industry analysis, the top deficiency categories are:

### Tier 1: Frequent Returns (>50% of rejected submissions)

1. **Incomplete or generic site plans** -- Missing north arrows, receiving water locations, or drainage delineations. Engineers use template SWPPPs that "don't account for site-specific drainage patterns, materials exposure, or pollutant sources." [Source: Conversion Technology stormwater BMP analysis]

2. **Inadequate BMP specifications** -- BMPs listed but not designed. Missing sediment basin sizing calculations, improper silt fence placement details, or unstabilized slopes without erosion control sequencing.

3. **Missing or outdated design manual references** -- Especially acute now with the 2024 Design Manual transition. Projects referencing the 2015 manual without documented justification get returned.

4. **Incomplete erosion control sequencing** -- The SWPPP describes what controls will be used but not when they'll be installed relative to construction phases. Sequencing and phasing plans now "require distinct documentation approaches." [Source: GP-0-25-001]

### Tier 2: Common Returns (20-50%)

5. **Insufficient inspection and maintenance plans** -- No defined inspection schedule, missing corrective action procedures, or no maintenance protocols for post-construction SMPs.

6. **Missing personnel/training documentation** -- No CESCL (Certified Erosion and Sediment Control Lead) identified, no training plan for site workers.

7. **Incorrect receiving water classification** -- Discharge to MS4 vs. direct to waters requires different treatment standards. Getting this wrong invalidates the entire design basis.

### Tier 3: Emerging Returns (New with 2025 permit)

8. **No climate resilience analysis** -- Brand new requirement, most templates don't include it yet.

9. **Paper submission** -- Electronic filing is now mandatory, but some applicants are still submitting paper NOIs.

10. **Inadequate vegetation management** -- The standard is "70-75% density for perennial foliage" with "straw/mulch for areas idle three weeks, and temporary seeding for longer disturbances." Many plans lack this specificity. [Source: 7 Common Stormwater Inspection Mistakes analysis]

### The Evaluation Rating System

NYSDEC inspectors use a three-tier classification: **Satisfactory, Marginal, or Unsatisfactory.** This is notable because it implies a tolerance for imperfection -- a "Marginal" rating doesn't necessarily kill the submission but requires corrective action. This maps directly to a traffic-light UI pattern (green/yellow/red) that Anvil should adopt.

---

## Failure Modes in Automated Evaluation

### The False Negative Problem (AI says compliant, but it's not)

This is the nightmare scenario for compliance software. In financial compliance, industry analysis shows that **"false negatives represent the hidden risk"** -- when an AI system clears something that should have been flagged, the consequences compound downstream. [Source: Fintech Global, 2025]

For SWPPP specifically, a false negative means:
- An engineer submits a deficient plan believing it's compliant
- The reviewer catches it (wasting their time and the engineer's)
- Or worse, the reviewer doesn't catch it, construction proceeds with inadequate controls, and there's an actual pollution event

**The asymmetry is clear: false negatives are far worse than false positives in compliance evaluation.** A false positive (flagging something that's actually fine) is annoying but safe. A false negative is potentially catastrophic. This means the system should be **biased toward caution** -- when uncertain, flag for human review rather than passing.

### The Ambiguous Requirement Problem

Regulatory text is full of qualifiers: "where practicable," "as appropriate," "to the maximum extent practicable." The current extraction pipeline already detects soft language (the system found 11 instances in testing). But **evaluating** whether a project meets a "where practicable" standard requires professional judgment about what's practicable for this specific site.

**Anecdote from Harvey AI (legal compliance):** Harvey, the legal AI company, found that "scaling evaluation through expertise" meant building human expert review into the loop, not trying to make AI handle ambiguity alone. Their approach: AI handles clear-cut cases, humans handle judgment calls, and the system learns from human decisions over time. [Source: Harvey AI blog]

### The Cascading Error Problem

When parameter extraction gets one thing wrong, it can cascade through the evaluation. Example:
- System extracts "disturbed area = 0.8 acres" (actually 1.2 acres)
- This puts the project below the 1-acre threshold for certain requirements
- Several BMP requirements are incorrectly marked "not applicable"
- The entire evaluation is structurally wrong

**Mitigation:** Every extracted parameter that feeds into threshold decisions must have explicit confidence scoring, and threshold-adjacent values should be flagged for human confirmation. If the extracted area is anywhere near 1 acre, the system should ask rather than assume.

### The RAG Hallucination Paradox

Research from Google shows a concerning pattern: **RAG systems that provide more context to the model make it more confident but not always more accurate.** The model loses its ability to say "I don't know" when given lots of relevant-seeming context. For compliance evaluation, this means the system might confidently evaluate a requirement it doesn't actually understand, rather than flagging uncertainty. [Source: Google Research -- Role of Sufficient Context in RAG]

---

## Extracting Knowledge from Engineering Drawings: What's Actually Feasible

### The 80% Ceiling

Even with AI-augmented Intelligent Document Processing (IDP), only **~80% of required data can be extracted from engineering drawings.** The remaining 20% needs human input. [Source: Infrrd engineering diagram OCR analysis]

The failure modes are specific:
- **Character confusion** -- OCR reads 6 as 8, 1 as 7, especially handwritten annotations
- **Rotated/angled text** -- engineering drawings have labels at every orientation
- **Contextual blindness** -- OCR reads characters but can't understand what a drainage arrow means
- **Scale inconsistency** -- varying scales within a single document
- **50-60% of OCR implementation cost goes to error correction** on engineering drawings [Source: Infrrd]

### What AI CAN Extract Reliably

| Data Type | Extraction Feasibility | Method |
|-----------|----------------------|--------|
| Title block info (project name, engineer, date) | High (~95%) | LLM vision or OCR |
| General notes text | High (~90%) | LLM text extraction |
| BMP schedule tables | Medium-High (~85%) | LLM table parsing |
| Specification references | High (~90%) | Text matching |
| Plan sheet labels/titles | High (~90%) | OCR + LLM |
| Drainage area calculations (from text) | Medium (~75%) | LLM extraction |

### What AI CANNOT Reliably Extract

| Data Type | Why It Fails |
|-----------|-------------|
| Drainage flow directions | Requires spatial reasoning on arrows/contours |
| BMP locations relative to discharge points | Requires understanding of spatial relationships |
| Grading/slope calculations from contour lines | Requires topographic interpretation |
| Property boundaries and setbacks | Requires dimensional reasoning |
| Pipe network connectivity | Requires graph reasoning over the drawing |

**Key insight from Autodesk Research (CAD-LLM project):** Even their purpose-built system requires a hybrid approach -- the LLM specifies high-level geometry + constraints, and an external solver handles geometric validity. Pure LLM spatial reasoning is not production-ready. [Source: Autodesk Research]

### BIM is Not an Option (Yet)

You might think "just use the BIM model" -- but **IFC lacks distinct entities for stormwater components.** IFC 4.3 (now ISO 16739) is the future standard, but tooling is incomplete. PCSWMM is still building IFC 4.3 import/export. In practice, stormwater deliverables are **overwhelmingly flat PDFs.** [Source: ASCE IFC-Based Stormwater Drainage Modeling paper]

This is important for product strategy: don't build around BIM availability. Build for PDFs today, add BIM as a premium input when the ecosystem catches up.

### The Recommendation: Interview for Spatial Data

The engineer already knows:
- Their total disturbed area
- Soil types on site
- Whether they're in a floodplain
- Drainage discharge points
- BMP types selected and why

Asking them is **faster, cheaper, and more reliable** than trying to extract this from a rasterized PDF. The interview approach Anvil already uses is not a stopgap -- it's the correct architecture for the current state of technology.

---

## Should We Pull Entirely from Interviews?

**No -- but interviews should be primary, with targeted document extraction for verification and enrichment.**

### The Hybrid Strategy

1. **Interview-primary data (40-50% of fields):**
   - Project description, scope, phasing
   - Construction schedule
   - Responsible personnel (CESCL, etc.)
   - Spill prevention procedures
   - Training plans
   - Maintenance schedules
   - Material storage plans

2. **Document-extracted data (20-30% of fields, high-confidence extraction only):**
   - Title block metadata
   - Design manual references
   - BMP schedule tables
   - Engineering calculation results
   - Specification cross-references
   - General notes and conditions

3. **Interview for confirmation of spatial data (15-20%):**
   - "Your drawings show approximately 2.3 acres of disturbance -- does that match your understanding?"
   - "I see references to a sediment basin -- what's the design capacity?"
   - The system extracts what it can, then asks the engineer to confirm rather than re-enter

4. **Out of scope for pre-submission tool (~15%):**
   - Field observations
   - Inspection records
   - As-built conditions

### Why This Works Better Than Pure Extraction

**Anecdote: The Articulate benchmark.** Articulate, a leading AI drawing analysis platform, claims 85-95% issue detection on engineering drawings vs. 60-70% for manual review. But their system costs $50-200 per review and takes 15-30 minutes per 100-page plan set. For SWPPP compliance, where you need near-100% accuracy on threshold decisions, that 5-15% miss rate is unacceptable for automated pass/fail. It IS acceptable as a first-pass screen that humans then verify. [Source: Articulate 2026 Construction AI Report]

---

## Minimizing the Return Rate

### The Deficiency Prevention Strategy

Instead of evaluating after the SWPPP is complete, evaluate **during the intake process.** Each parameter answer should trigger real-time compliance checking:

- Engineer says "disturbed area = 1.2 acres" -> system immediately shows: "This triggers NYSDEC GP-0-25-001 full permit requirements. The following BMPs are required..."
- Engineer says "no CESCL identified" -> system flags: "A qualified CESCL is required per Part II.B. This will cause rejection."
- Engineer selects "2015 Design Manual" -> system warns: "The 2024 Design Manual is required for all new SWPPPs as of July 31, 2024, unless documented justification is provided."

This is a **shift-left strategy** -- catch deficiencies before they're baked into the submission document, not after.

### Specific High-Impact Interventions

Based on the deficiency analysis, these automated checks would prevent the most returns:

1. **Checklist completeness gate** -- Before allowing submission, verify every item on the NYC DEP submission checklist has a corresponding response. This alone would eliminate the "incomplete submission" category.

2. **Design manual version check** -- Verify the referenced design manual matches the permit effective date.

3. **BMP-to-condition matching** -- For each site condition (soil type, slope, proximity to water), verify appropriate BMPs are specified. Flag missing controls.

4. **Sequencing validation** -- Verify erosion controls are scheduled before grading begins, and that each construction phase has associated BMPs.

5. **Climate resilience prompt** -- New requirement. Simply asking "How does your design address future climate risks (temperature, precipitation, sea-level rise, storm surge)?" and requiring a response would prevent this new return category entirely.

---

## UI/UX Patterns for the Evaluation Interface

### Pattern 1: Traffic Light Scoring (Satisfactory / Marginal / Unsatisfactory)

Mirror the NYSDEC inspector rating system. For each requirement:
- **Green (Satisfactory):** Requirement met with high confidence. Show evidence.
- **Yellow (Marginal):** Requirement partially met or low confidence. Show what's missing or uncertain.
- **Red (Unsatisfactory):** Requirement not met or critical information missing.

**Implementation insight from Carbon Design System:** IBM's design system has extensive guidance on status indicators -- "different shapes AND colors enable users to quickly assess severity." Use both color and icon/shape to avoid accessibility issues with color-only indicators. [Source: Carbon Design System - Status Indicator Pattern]

### Pattern 2: Progressive Disclosure

Don't show 100 requirement evaluations at once. Layer it:
1. **Summary dashboard** -- "23/30 requirements met, 4 marginal, 3 deficient"
2. **Category drill-down** -- Erosion Control (5/7), Sediment Control (3/4), etc.
3. **Individual requirement** -- Full evaluation with evidence, source references, and remediation guidance

This matches how Mastt.com structures their construction project RAG dashboards -- high-level status rolls up from individual items, and users drill down only where attention is needed. [Source: Mastt Project RAG Status Dashboard]

### Pattern 3: Side-by-Side Evidence View

For each evaluation, show:
- **Left panel:** The regulatory requirement text (with condition highlighting)
- **Right panel:** The project's response (parameter values, document references, interview answers)
- **Bottom:** Evaluation result with confidence and reasoning

This is how legal AI tools present case law analysis -- the regulation (analogous to case law) alongside the project facts (analogous to case facts), with the AI's assessment clearly separated from the evidence.

### Pattern 4: Deficiency Report as Deliverable

The evaluation output should look like what a DEP reviewer would produce -- a deficiency letter. This serves two purposes:
1. **Pre-submission:** Engineer uses it to fix issues before submitting
2. **Familiarity:** When the actual reviewer's feedback comes back, it looks like what the tool already showed -- reducing cognitive load

### Pattern 5: Confidence-Gated Automation

Borrow from IDP industry practice:
- **High confidence (>0.9):** Auto-evaluate, show result
- **Medium confidence (0.6-0.9):** Auto-evaluate but flag for review with yellow indicator
- **Low confidence (<0.6):** Don't evaluate. Instead, show "Could not determine -- please verify [specific data point]"

**Critical:** Never auto-pass a requirement at low confidence. The asymmetry of false negatives means uncertain evaluations should always surface to the user.

---

## Key Takeaways

1. **The interview-first architecture is correct.** ~40-50% of SWPPP data is project-knowledge best captured via conversation. Don't apologize for this approach -- it's the right call given current AI limitations on spatial data.

2. **Don't try to read engineering drawings for spatial data.** The 80% extraction ceiling and contextual blindness of OCR/LLMs on rasterized plans means you'll spend enormous effort for unreliable results. Extract title blocks, tables, and notes. Interview for the rest.

3. **Evaluate during intake, not after.** Shift-left: every parameter answer triggers real-time compliance checking. This prevents deficiencies from being baked in, rather than catching them post-hoc.

4. **Bias toward false positives over false negatives.** When uncertain, flag for review. An overly cautious tool that occasionally flags compliant items is infinitely better than one that misses actual deficiencies.

5. **Mirror the reviewer's output.** The evaluation UI should produce something that looks like a DEP deficiency letter. This makes the tool's output immediately actionable and familiar to engineers who've been through the review process.

6. **The 2025 permit change is your market opportunity.** GP-0-25-001 introduced new requirements (climate resilience, electronic filing, 2024 Design Manual) that existing workflows don't handle. A tool that incorporates these automatically has immediate differentiation.

7. **Confidence scoring is non-negotiable.** Every extracted value and every evaluation must carry explicit confidence. Threshold-adjacent values (near 1 acre, near 5 acres) must be flagged regardless of confidence. The RAG hallucination paradox means more context can make AI more confident without being more accurate.

---

## Sources & Further Reading

**Primary Sources:**
- [NYC DEP Stormwater Permits](https://www.nyc.gov/site/dep/water/stormwater-permits.page) -- 5-phase process, templates, checklists
- [NYSDEC GP-0-25-001 Construction General Permit](https://dec.ny.gov/environmental-protection/water/water-quality/stormwater) -- 2025 permit requirements
- [NYSDEC Construction Stormwater Toolbox](https://dec.ny.gov/environmental-protection/water/water-quality/stormwater) -- Blue Book, Design Manual, inspection checklists
- [EPA SWPPP Development Guide](https://www.epa.gov/npdes/developing-stormwater-pollution-prevention-plan-swppp)

**Expert Analysis:**
- [Articulate 2026 Construction AI Drawing Analysis Report](https://usearticulate.com/press-release/2026-construction-ai-drawing-analysis-report) -- 85-95% detection rates, cost benchmarks
- [Infrrd: Why OCR Can't Read Engineering Diagrams](https://www.infrrd.ai/blog/why-cant-ocr-read-your-engineering-diagrams) -- 80% extraction ceiling, failure modes
- [Autodesk Research: CAD-LLM](https://www.research.autodesk.com/publications/ai-lab-cad-llm/) -- Hybrid LLM + solver approach
- [Google Research: RAG Sufficient Context](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/) -- Hallucination paradox
- [Harvey AI: Scaling Evaluation Through Expertise](https://www.harvey.ai/blog/scaling-ai-evaluation-through-expertise)
- [ASCE: RAG for Construction Regulatory Compliance](https://ascelibrary.org/doi/abs/10.1061/JMENEA.MEENG-6444)

**Data & Reports:**
- [Conversion Technology: Storm Water BMP Implementation Mistakes](https://www.conversiontechnology.com/storm-water-best-management/) -- Common violations
- [ASCE: IFC-Based Stormwater Drainage Modeling](https://ascelibrary.org/doi/10.1061/9780784485231.056) -- BIM/IFC limitations
- [Vellum: LLMs vs OCR for Document Extraction](https://www.vellum.ai/blog/document-data-extraction-llms-vs-ocrs) -- Cost comparison (Gemini Flash $1.67 vs GPT-4V $50-100 per 10K pages)

**UX Patterns:**
- [Carbon Design System: Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/) -- Shape + color pattern
- [Mastt: Project RAG Status Dashboard](https://www.mastt.com/blogs/project-rag-status-dashboard) -- Progressive disclosure in construction

**Tools & Competitors:**
- [CivCheck](https://www.civcheck.ai/) -- AI automated building plan review
- [PermitFlow](https://www.permitflow.com/) -- Construction permitting automation
- [Accela](https://www.accela.com/solutions/building/) -- Government permitting platform
