# System Decomposition: Anvil (Pivot) — v2

**Date:** 2026-03-18
**Mode:** Brownfield / Pivot
**Author:** Ade + Claude
**Previous versions:** v0 = PFD editor (deprecated), v1 = naive doc generation (revised after failure mode analysis)
**Revision note:** v2 incorporates structural failure mode analysis. Key shift: product optimizes for *defensible completeness under uncertainty* and *review speed*, not autonomous document generation.

> **If you are a future Claude reading this:** This is the authoritative spec for Anvil. The product is a compliance documentation accelerator for water engineers. The core value is structured requirements extraction + logic-based applicability evaluation + engineer-validated review, with document generation as the final step (not the first). Do not build features that bypass engineer review or present unvalidated output as complete.

---

## 1. Purpose

Reduce the time water engineers spend on compliance documentation from days to hours by structuring regulatory requirements as evaluable logic, automating cross-referencing against project design data, and generating draft narratives only after the engineer has validated the compliance mappings.

**What this is NOT:** An autonomous document generator. Engineers are liable for the final document (their PE stamp is on it). The product must be designed so that *validating Anvil's work is faster than doing it from scratch* — that is the value threshold.

---

## 2. Known Failure Modes (Design Constraints)

These failure modes were identified during design review and shape every architectural decision below. They are not theoretical — they are the ways this product fails in practice if not addressed.

| # | Failure Mode | How It Manifests | Design Response |
|---|-------------|-----------------|-----------------|
| FM1 | Requirements aren't flat lists | Nested clauses, conditional logic, cross-references, soft language ("where practicable"). Over-splitting or under-splitting creates false confidence. | Represent requirements as **logic trees** with conditions, exceptions, and cross-references — not flat text. |
| FM2 | Citation ≠ correctness | A correct citation with a wrong interpretation creates high-confidence wrong output — worse than obvious AI slop. | Provide **reasoning chains**, not just citations. "Applies because [explicit logic tied to site data + clause]." |
| FM3 | Applicability is multi-step reasoning | Not a 0-1 score. It's a logical evaluation: jurisdiction? project type? phase? site constraints? | Use **ternary evaluation**: ✅ Applicable / ❌ Not applicable / ⚠️ Uncertain. With explicit reasoning for each. |
| FM4 | Unknown unknowns | Local reviewer preferences, unwritten norms, adjacent regulations not in the PDF. | Acknowledge explicitly. "These sections had low parsing confidence." Don't pretend to be complete. Engineer adds what they know. |
| FM5 | Regulatory drift | Regulations change constantly. Outdated parsed database + confident citations = silent killer. | Track **document version and parse date**. Flag when source document may be outdated. |
| FM6 | Engineers need defensible positions | "Applicability score: 0.82" is useless. They need reasoning they can defend to a reviewer. | Every evaluation includes a **reasoning chain** tied to specific site data and specific clause text. |
| FM7 | Information overload | Dumping 120 "requirements" — even if correct — leads to tool abandonment. | **Prioritize and filter.** Show applicable first, uncertain second, not-applicable collapsed. Optimize for review speed. |
| FM8 | Liability stays with engineer | Engineer is liable regardless. Tool becomes reference, not replacement. | Design for *review speed*: "validate in 10 minutes instead of 2 hours." Don't try to replace the engineer. |

---

## 3. Domain Model

### Objects

| Object | Properties | Description |
|--------|-----------|-------------|
| **Project** | name, location, site area, disturbed area, soil types, receiving waters, sewer type, phasing, slope data | A construction or design project |
| **Regulatory Source** | jurisdiction, document name, version, effective date, parse date, url/file, confidence notes | A regulatory document that has been parsed (e.g., "NYC DEP Stormwater Rules, Rev 2024") |
| **Requirement** | id (section ref), text, conditions[], exceptions[], cross_references[], soft_language (boolean), category, source_page | A single requirement extracted as a **logic tree**, not flat text |
| **Condition** | parameter, operator, value, unit, source_text | A condition that determines applicability (e.g., "disturbed area > 1 acre") |
| **Requirements Set** | regulatory_source, requirements[], unparsed_sections[], parse_confidence | A parsed collection of requirements with explicit gaps noted |
| **Design Parameter** | name, value, unit, source_document, source_page, extraction_confidence | A specific aspect of the engineer's design |
| **Design Document** | type, file, extracted_parameters[], extraction_notes | An uploaded file containing design information |
| **Applicability Evaluation** | requirement → status (applicable/not_applicable/uncertain), reasoning_chain, missing_inputs[], site_data_used[] | The logic evaluation of whether a requirement applies to this project |
| **Compliance Mapping** | requirement → design_parameter(s), status (met/not_met/partial/gap), response_narrative, engineer_validated (boolean) | How an applicable requirement is addressed by the design |
| **Deliverable** | type (SWPPP/BODR/TM/PER), project, sections[], status | The document being generated |
| **Section** | heading, generated_narrative, compliance_mappings_used[], tables[], appendix_refs, engineer_approved (boolean) | A section of the deliverable |
| **Email/RFI** | from, date, content, extracted_context | Supplementary project context |

### Links

```
Project --has--> Design Parameters (extracted from Design Documents)
Project --subject to--> Regulatory Sources (1 or more jurisdictions)
Regulatory Source --contains--> Requirements Set --contains--> Requirements
Requirement --has--> Conditions (logic tree)
Requirement --has--> Exceptions
Requirement --cross-references--> other Requirements

Applicability Evaluation --evaluates--> Requirement against Project
Applicability Evaluation --uses--> Design Parameters as evidence

Compliance Mapping --links--> applicable Requirement to Design Parameter(s)
Compliance Mapping --validated by--> Engineer

Deliverable --contains--> Sections
Section --built from--> validated Compliance Mappings
```

### Key Domain Insight

The central object is not the Deliverable (the output document). It's the **Applicability Evaluation** — the logical determination of whether a requirement applies and why. This is where trust is built or broken. The document is downstream output; the evaluation is the product.

---

## 4. Functional Decomposition

### The Revised Pipeline

```
PARSE ──> EVALUATE ──> REVIEW ──> GENERATE
  │           │          │            │
  │           │          │            └─ Only after engineer validates
  │           │          └─ Engineer in the loop (THE product)
  │           └─ Logic-based, not scoring
  └─ Logic trees, not flat lists
```

### 1.0 Requirements Parsing
Extract regulatory requirements as structured logic trees from PDFs.
- **Input:** Regulatory PDF (municipal/state/federal)
- **Output:** Requirements Set with logic-tree requirements + explicit unparsed/low-confidence sections

- 1.1 **PDF text and structure extraction** — extract text, tables, section hierarchy, page numbers
- 1.2 **Requirement identification** — LLM identifies individual requirements within regulatory text
- 1.3 **Logic tree construction** — for each requirement, extract:
  - Conditions (parameter + operator + value): "if disturbed area > 1 acre"
  - Exceptions: "unless infeasible due to site constraints"
  - Cross-references: "see Section 4.1 for alternative measures"
  - Soft language flags: "where practicable", "as necessary"
  - Category tags: erosion control, water quality, post-construction, etc.
- 1.4 **Gap flagging** — identify sections that couldn't be parsed or had low confidence; mark explicitly
- 1.5 **Requirements persistence** — store parsed requirements for reuse across projects in same jurisdiction; track source document version and parse date

### 2.0 Project Setup
Capture project-specific parameters and design inputs.
- **Input:** Engineer's project information, uploaded design documents, emails/RFIs
- **Output:** Structured project with design parameters

- 2.1 **Project creation** — structured form: name, location, site area, disturbed area, soil types, slopes, receiving waters, sewer type, phasing
- 2.2 **Design document upload** — accept PDFs, spreadsheets, model outputs (HydroCAD, SWMM, Civil 3D)
- 2.3 **Design data extraction** — LLM extracts key parameters with confidence levels and source page references
- 2.4 **Email/RFI upload** — accept supplementary context
- 2.5 **Context extraction** — pull relevant decisions and constraints from correspondence

### 3.0 Applicability Evaluation
Evaluate each requirement against project data using logic-based reasoning.
- **Input:** Requirements Set + Project data (design parameters + site characteristics)
- **Output:** Evaluated requirements with ternary status + reasoning chains

- 3.1 **Condition evaluation** — for each requirement's conditions, check against project data:
  - All conditions met → ✅ Applicable
  - Any condition clearly not met → ❌ Not applicable
  - Missing data to evaluate a condition → ⚠️ Uncertain (specify what's missing)
- 3.2 **Reasoning chain generation** — for each evaluation, produce explicit reasoning:
  - "Applies because site disturbs 2.3 acres (> 1 acre threshold per Section 3.2.1) and grading plan shows exposed soil in phases 1-3 (per Drawing C-102)"
  - "Does not apply because project is on separate storm sewer system, not combined (Section 5.1 applies only to combined sewer areas)"
  - "Uncertain — requirement applies to slopes > 3:1, but slope data not provided. Please confirm site slopes."
- 3.3 **Exception handling** — evaluate exception clauses; flag where exceptions may apply
- 3.4 **Cross-reference resolution** — follow cross-references to related requirements; flag circular or unresolvable references
- 3.5 **Prioritized presentation** — sort and group:
  - ✅ Applicable (N) — engineer must address these
  - ⚠️ Uncertain (M) — engineer must resolve these
  - ❌ Not applicable (P) — collapsed, available for review
  - 📋 Unparsed/low-confidence sections — explicitly flagged

### 4.0 Engineer Review (THE PRODUCT)
The core interaction. Engineer validates applicability evaluations, resolves uncertainties, and confirms compliance mappings.
- **Input:** Evaluated requirements
- **Output:** Engineer-validated applicability determinations + compliance mappings

This is not a passive review step. This is the product's primary UI. Design for speed:

- 4.1 **Applicability review** — for each applicable requirement, engineer confirms or overrides with one click. Reasoning chain visible. Override captures engineer's rationale.
- 4.2 **Uncertainty resolution** — for each uncertain requirement, engineer provides missing data or makes determination. System re-evaluates with new data.
- 4.3 **Compliance mapping** — for each confirmed-applicable requirement, engineer maps to design elements: "Addressed by silt fence along N and E boundaries (Drawing C-201) and sediment basin at SW discharge (Calc Appendix B)"
- 4.4 **Quick compliance mapping** — LLM suggests compliance mappings based on design parameters; engineer validates/edits. This is where LLM assists but doesn't replace.
- 4.5 **Gap identification** — requirements marked applicable but with no mapped design response are flagged as gaps. These are real findings — the engineer needs to address them in design, not just documentation.

### 5.0 Document Generation
Generate deliverable sections from validated compliance mappings. Happens ONLY after Phase 4.
- **Input:** Validated compliance mappings, project data, document template
- **Output:** Draft document with section-by-section narrative

- 5.1 **Template application** — map compliance mappings to appropriate document sections (SWPPP structure)
- 5.2 **Section narrative generation** — LLM produces narrative for each section, citing specific requirements, design responses, and evidence. Every claim traceable to a validated mapping.
- 5.3 **Comparison table generation** — auto-populate requirement vs. design tables from validated mappings
- 5.4 **Appendix assembly** — organize uploaded calcs, model outputs, regulatory excerpts
- 5.5 **Internal consistency check** — verify values are consistent across sections

### 6.0 Review and Export
Engineer reviews, edits, and exports the final document.
- **Input:** Draft document
- **Output:** Final deliverable (Word/PDF)

- 6.1 **Section-by-section editor** — rich text editing of generated sections
- 6.2 **Regeneration** — re-generate a section with different instructions or additional context
- 6.3 **Version tracking** — auto-save, list of previous versions
- 6.4 **Export to Word** — .docx with proper formatting, headers, TOC, page numbers
- 6.5 **Export to PDF** — from final document

---

## 5. Interface Map

### N² Analysis (Revised)

```
             | 1.Parse | 2.Project | 3.Evaluate | 4.Review | 5.Generate | 6.Export |
-------------|---------|-----------|------------|----------|------------|---------|
1. Parse     |   --    |           | req trees  |          |            |         |
2. Project   |         |    --     | site data  |          | proj data  |         |
3. Evaluate  |         |           |     --     | eval'd   |            |         |
4. Review    |         |  (update) |  (re-eval) |   --     | validated  |         |
5. Generate  |         |           |            |          |     --     | draft   |
6. Export    |         |           |            |          |            |   --    |
```

### Key Changes from v1

**Feedback loop: 4.Review → 3.Evaluate.** When the engineer provides missing data during review (resolving uncertainties), the system re-evaluates affected requirements. This is a controlled feedback loop — it only triggers on explicit engineer input, not autonomously.

**Feedback loop: 4.Review → 2.Project.** Engineer may add design parameters during review that weren't in the original uploads. This updates the project data.

**Gate: 4.Review → 5.Generate.** Document generation is gated on engineer validation. No section is generated until its underlying compliance mappings are engineer-approved. This is the trust mechanism.

### Hub Component: 4.0 Review

In v1, the hub was the Compliance Engine (3.0). In v2, the hub is **Engineer Review (4.0)**. It connects to everything — receives from Evaluate, feeds back to Project and Evaluate, gates Generate. This is correct: the product's value lives at the review step, not the automation step.

---

## 6. Subsystem Boundaries (Revised)

### Subsystem A: Knowledge Base (1.0)
- Parse and store regulatory requirements as logic trees
- Shared across all projects in a jurisdiction
- Tracks source document versions and parse dates
- Flags unparsed/low-confidence sections explicitly
- Interface out: structured requirements sets with logic trees

### Subsystem B: Project Workspace (2.0)
- Per-project: captures all inputs specific to this project
- Uploads, parameter extraction, email context
- Interface out: structured project data + design parameters with provenance

### Subsystem C: Evaluation Engine (3.0)
- Logic-based applicability evaluation (not scoring)
- Produces ternary determinations with reasoning chains
- Designed to be conservative: when in doubt, mark ⚠️ Uncertain
- Interface out: evaluated requirements ready for review

### Subsystem D: Review Interface (4.0) — THE PRODUCT
- The core user-facing product
- Optimized for review speed, not information density
- Handles engineer validation, uncertainty resolution, compliance mapping
- Gates all downstream generation
- Interface out: engineer-validated compliance mappings

### Subsystem E: Document Engine (5.0, 6.0)
- Generates, edits, and exports deliverables
- Only consumes engineer-validated data
- Every generated claim traceable to a validated mapping
- Interface out: finished documents

---

## 7. Algorithm Pass (Eliminations)

### Step 1: Questioned Requirements (Revised)

All v1 eliminations still hold (PFD editor, WebSocket, Pyodide, etc.). New questions:

| Requirement | Source | Question | Disposition |
|-------------|--------|----------|-------------|
| Applicability scoring (0-1) | v1 design | Do engineers need a probability score? | **DELETE** — engineers need reasoning, not scores. Replace with ternary + reasoning chain. |
| Autonomous document generation | v1 design | Should Claude generate the full doc without review? | **DELETE** — generates trust erosion. Gate generation on engineer validation. |
| "Complete" extraction claims | v1 design | Should the tool claim to have extracted all requirements? | **DELETE** — flag gaps explicitly. "These sections were not parsed / low confidence." |
| Compliance mapping without validation | v1 design | Should LLM-generated compliance mappings go directly into the document? | **DELETE** — LLM suggests, engineer validates. Every mapping has an `engineer_validated` flag. |
| Exhaustive requirement display | v1 design | Show all 120 requirements equally? | **DELETE** — prioritize. Show applicable first, uncertain second, not-applicable collapsed. |

### Step 2: Deleted from v1 Design

| Deleted | Why |
|---------|-----|
| Applicability scores (0-1 float) | Meaningless in this domain. Engineers need defensible reasoning, not probabilities. |
| Auto-generate without review gate | Creates high-confidence wrong output — the worst failure mode. |
| Implicit completeness claims | Trust erosion when engineer discovers something missing. Better to be explicitly conservative. |
| Flat text requirement extraction | Loses conditional logic, exceptions, cross-references. Must be logic trees. |

### Step 3: Simplifications (Revised)

| Before | After |
|--------|-------|
| Complex scoring model | Ternary: applicable / not applicable / uncertain |
| Free-form compliance narrative | Structured mapping: requirement → design element → evidence → reasoning |
| All requirements shown equally | Prioritized: applicable → uncertain → not applicable |
| LLM decides what's complete | System explicitly flags what it couldn't parse |

### Step 4: Acceleration Opportunities (Revised)

**New critical path:** Upload PDF → parse requirements → enter project data → evaluate applicability → **engineer reviews** → generate sections → edit → export

**The bottleneck shifted.** In v1, the bottleneck was PDF parsing. In v2, the bottleneck is **engineer review speed**. The entire product must be optimized to minimize time spent in step 4.

**Review speed optimizations:**
- One-click confirm/override for each requirement
- LLM-suggested compliance mappings (engineer validates, not writes)
- Keyboard shortcuts for rapid review (j/k to navigate, y/n to confirm)
- Batch operations: "Mark all erosion control requirements as applicable"
- Smart ordering: most likely applicable first, least likely last
- Progressive disclosure: show reasoning only on expand, not by default

**Parallelization:**
- Parse requirements (1.0) and project setup (2.0) are independent — parallel
- Section generation (5.2) can parallelize across sections after review is complete
- Within evaluation (3.0), each requirement can be evaluated independently — parallel

---

## 8. Risk/Value Assessment (Revised)

| Subsystem | Value | Risk | Quadrant | Rationale |
|-----------|-------|------|----------|-----------|
| **Review Interface (4.0)** | HIGHEST | HIGH | Build first | This IS the product. If review isn't fast enough, nothing else matters. Must prove engineers will use it. |
| **Evaluation Engine (3.0)** | HIGHEST | HIGH | Build first | Logic-based applicability is the core intelligence. Must prove ternary evaluation + reasoning chains work. |
| **Requirements Parsing (1.0)** | HIGH | HIGH | Build first | Logic tree extraction is unproven at the quality needed. Must validate with real regulatory PDFs. |
| **Document Generation (5.0)** | HIGH | LOW | Build second | Narrative generation is more proven. But only valuable after review is working. |
| **Project Workspace (2.0)** | MEDIUM | LOW | Build second | Straightforward engineering. Forms and file upload. |
| **Export (6.0)** | MEDIUM | LOW | Build third | Word export is a library problem. |
| **Multi-jurisdiction** | HIGH (later) | LOW | Defer | Architecture supports it. Don't build until NYC is proven. |

---

## 9. Dependency Map (Revised)

```
[Requirements Parsing] ──┐
                          ├──> [Evaluation Engine] ──> [Review Interface] ──> [Document Generation] ──> [Export]
[Project Workspace] ──────┘           ↑                       │
                                      └───── re-evaluate ─────┘
                                         (when engineer provides
                                          missing data)

Build order:
  Phase 0: Walking skeleton (prove the parse → evaluate → review loop)
  Phase 1: Full review interface + evaluation engine
  Phase 2: Document generation + export
  Phase 3: Scale (jurisdictions, doc types)
```

---

## 10. Build Plan (Revised)

### Phase 0: Walking Skeleton
**Goal:** Prove the PARSE → EVALUATE → REVIEW loop works with a real regulatory PDF. Document generation is NOT in this phase.

**The test:** Take one actual NYC regulatory PDF. Can Anvil extract requirements as logic trees and evaluate applicability against manually-entered site data, producing a review interface that an engineer can validate faster than reading the PDF themselves?

```
Input:
  1. NYC DEP stormwater requirements PDF (uploaded)
  2. Site parameters (manually entered: area, soil, receiving water, etc.)

Process:
  1. Claude reads PDF → extracts requirements as structured objects with conditions
  2. Claude evaluates each requirement against site data → ternary determination + reasoning
  3. Results displayed in a simple review UI

Output:
  Structured list:
    ✅ 23 applicable (with reasoning)
    ⚠️ 8 uncertain (with what's missing)
    ❌ 89 not applicable (collapsed)
    📋 3 sections unparsed (flagged)
```

**What to build:**
- Upload page: accept regulatory PDF + project parameter form
- Backend: Claude prompt that extracts requirements as JSON logic trees
- Backend: Claude prompt that evaluates each requirement against site data
- Frontend: simple three-panel review UI (applicable / uncertain / not applicable)
- Each requirement shows: section ref, requirement text, conditions, status, reasoning chain

**What this proves:**
- Can Claude extract requirements as logic trees from a real regulatory PDF?
- Are the ternary evaluations + reasoning chains accurate enough that an engineer trusts them?
- Is reviewing the structured output faster than reading the PDF manually?

**What this does NOT prove (and that's fine):**
- Document generation (intentionally excluded)
- Design document upload/extraction
- Compliance mapping UI
- Word export

**Gravel road:** A two-page app. Page 1: upload PDF + fill in site params. Page 2: review evaluated requirements. No fancy UX. Prove the intelligence works before building the product around it.

**Critical validation:** Have your friend:
1. Upload a real NYC regulatory PDF he uses
2. Enter a real project's site data
3. Review the output
4. Tell you: "Did it miss anything important?" and "Was it faster to review this than to read the PDF?"

If he missed something important → fix the parsing/evaluation before proceeding
If it wasn't faster → fix the review UX before proceeding
If both pass → you have a product. Proceed to Phase 1.

### Phase 1: Full Review Interface + Evaluation Engine
**Goal:** The review experience is fast enough that engineers prefer it over manual reading. Compliance mapping is added.

**Scope:**
- Robust requirement parsing with logic trees, cross-references, soft language detection
- Evaluation engine with explicit reasoning chains
- Full review UI optimized for speed:
  - One-click confirm/override
  - Keyboard shortcuts (j/k navigate, y/n confirm)
  - Batch operations
  - Progressive disclosure (reasoning on expand)
- Compliance mapping: for each applicable requirement, engineer maps to design elements
  - LLM suggests mappings based on design parameters; engineer validates
- Uncertainty resolution workflow: engineer provides missing data, system re-evaluates
- Gap detection: applicable requirements with no design response are flagged
- Project management: create/list/open projects
- Design document upload with parameter extraction

**Key metrics:**
- Review time vs. manual process (target: 4x faster)
- Missed requirements (target: < 5% false negatives)
- False applicability (target: < 10% false positives — over-inclusion is safer than under-inclusion)

**Gravel road:** Single-page app. Left panel: requirements (filterable by status). Right panel: selected requirement detail + compliance mapping. Top bar: project info.

### Phase 2: Document Generation + Export
**Goal:** Generate production-quality SWPPP sections from validated compliance mappings.

**Scope:**
- Section-by-section narrative generation (gated on engineer validation)
- Every generated claim traceable to a validated mapping
- Comparison tables auto-generated from compliance mappings
- Internal consistency checking
- Section editor (evolve existing Monaco/markdown editor)
- Word export (.docx with formatting, TOC, headers)
- PDF export
- Appendix assembly
- Version history (auto-save)

**Prerequisite:** Phase 1 must be validated. If engineers don't trust the review interface, generating documents from it makes things worse, not better.

### Phase 3: Scale
**Goal:** Support multiple document types and jurisdictions.

**Scope:**
- Additional regulatory PDFs: NYSDEC SPDES General Permit, EPA CGP
- Additional jurisdictions beyond NYC
- Additional document types: Basis of Design Reports, Preliminary Engineering Reports, Technical Memos
- Requirements library: parsed requirements persist and are reusable with version tracking
- Template system for different document types
- Team features: share projects, review workflows
- Regulatory update alerts: flag when source document may be outdated

---

## 11. Open Questions

1. **Can you get a real NYC regulatory PDF from your friend?** The walking skeleton lives or dies on testing against a real document. Ideally: the NYC DEP stormwater rules PDF + a completed SWPPP he produced from it + the project's site data.

2. **What's his review process today?** Does he read the regulatory PDF linearly? Use a checklist? Work from memory? Understanding his current workflow tells us what to beat.

3. **What makes him confident he hasn't missed anything?** This is the trust question. If his current confidence comes from experience + thoroughness, we need to understand what "thorough" looks like to him.

4. **How does his firm handle regulatory updates?** Do they track when municipal PDFs change? This informs FM5 (regulatory drift) priority.

5. **Would he use this if it ONLY did parse + evaluate + review (no document generation)?** If yes, Phase 1 alone is a product. If he says "I need the document too," Phase 2 is required for adoption.

6. **What about the existing Anvil codebase?** Recommendation: keep the repo, gut the PFD-specific code, evolve DocGen into the review interface. The Express server, Claude integration, PDF upload, and MUI framework all carry forward.

---

## 12. What Salvages from Current Anvil

| Keep | Evolve Into | Effort |
|------|-------------|--------|
| `DocGenPage.tsx` | Requirements review interface | High — significant restructure |
| `server/routes/generate.ts` | Evaluation + generation API with streaming | Medium |
| PDF upload (multer) | Requirements PDF + design doc upload | Low — already works |
| Anthropic Claude integration | Core LLM engine for parsing, evaluation, generation | None — keep as-is |
| Monaco editor + markdown preview | Section editor for generated document (Phase 2) | Low — already works |
| Express server | API backbone | None — keep as-is |
| MUI v6 | UI components for review interface | None — keep as-is |
| TypeScript throughout | Language | None — keep as-is |

| Delete | Why |
|--------|-----|
| All PFD editor code | Not the product |
| WebSocket / collaboration | Not needed |
| Pyodide / graph executor | Not needed |
| gitManager.ts | Overly complex for simple version history |

---

## 13. Market Context

**Why this is a real opportunity:**
- $5-9B/year in water/wastewater compliance documentation labor in the US
- 200-300K SWPPPs/year alone ($2-3B in labor)
- No dominant AI tool exists — wide open market
- IIJA creating unprecedented demand ($55B for water infrastructure)
- Firms can't hire fast enough — documentation is the bottleneck
- Regulatory data is public domain

**Why the revised approach wins:**
- Conservative by design → engineers trust it → adoption
- Optimized for review speed, not replacement → fits workflow
- Logic tree representation → gets smarter over time
- Requirements database is the moat → network effect across projects/jurisdictions
- Same engine generalizes to PERs, BODRs, Phase I ESAs

**Beachhead:** Principal water engineers at NYC firms producing NYC-jurisdiction SWPPPs. One jurisdiction, one document type, one user profile. Prove the review interface. Then expand.

---

## 14. Design Principles (for all future development)

1. **Conservative defaults.** When uncertain, mark ⚠️ — never silently omit. Over-inclusion is safer than under-inclusion. Engineers can dismiss false positives quickly; they cannot find false negatives.

2. **Reasoning, not scoring.** Every determination includes an explicit reasoning chain tied to specific clauses and specific site data. No probability scores. No confidence percentages.

3. **Engineer in the loop, always.** No unvalidated LLM output reaches the final document. Every compliance mapping has an `engineer_validated` flag.

4. **Transparent about limits.** Flag unparsed sections. Flag low-confidence extractions. Flag outdated source documents. Never claim completeness.

5. **Optimize for review speed.** The product's value is measured in "time to validate" — not "quality of generation." If an engineer can review 100 applicability determinations in 10 minutes instead of 2 hours, that's the win.

6. **Traceable provenance.** Every generated sentence traces back to: a specific requirement (with section ref and page) → a specific applicability evaluation (with reasoning) → a specific compliance mapping (with engineer validation) → a specific design parameter (with source document and page). The full chain must be reconstructable.
