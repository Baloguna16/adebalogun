# Water Engineering Compliance Documentation Market: Research Brief

**Date:** 2026-03-17
**Prepared for:** Ade (Anvil pivot market sizing)
**Classification:** Market Research

---

## Executive Summary

Water, stormwater, and wastewater engineers at consulting firms spend 20-35% of their project fees on documentation -- writing compliance reports that cross-reference regulatory requirements against project designs. This is a $5-9B annual labor market in the US alone, with no dominant AI-powered tool addressing it.

The pain is structural: every compliance document follows the same pattern -- read a regulatory PDF, extract requirements, compare each requirement against the project's design parameters, write a narrative proving compliance. SWPPPs (Stormwater Pollution Prevention Plans) represent the highest-volume, most-structured entry point at 200-300K documents per year and $2-3B in annual engineering labor. The same automation engine generalizes to Basis of Design Reports, Preliminary Engineering Reports, NPDES permits, and adjacent markets like Phase I Environmental Site Assessments (100-150K/year).

The Bipartisan Infrastructure Law's $55B water infrastructure allocation is creating a surge in project volume at a time when firms can't hire fast enough. Documentation is the bottleneck.

---

## SWPPP Pain Analysis (Section by Section)

### What Makes SWPPPs Time-Consuming

A SWPPP for a commercial construction site typically takes **40-200 hours** of engineering labor and costs **$5,000-$25,000** in fees. Large linear projects (highways, pipelines) can exceed 300 pages and cost $25K+.

| Section | Pain Level | Hours | Why It Hurts |
|---------|-----------|-------|-------------|
| **Site Description** | Medium | 4-12 hrs | Custom every project -- soil types, drainage patterns, phasing, site history. ~5 pages of site-specific narrative. |
| **Receiving Water Assessment** | High | 4-16 hrs | Must identify every downstream water body, cross-reference EPA's 303(d) impaired waters list, check TMDL applicability, determine flow paths. Multiple regulatory databases to check. |
| **BMP Selection & Design** | Highest | 12-40 hrs | Select BMPs appropriate to site conditions, then write narrative justifying each choice against municipal/state requirements. "City requires X, we provide Y, here's why Y meets X." This is the cross-referencing nightmare. |
| **Hydrology / Stormwater Calculations** | High | 8-30 hrs | Calculations done in HydroCAD/SWMM/Excel, then manually transcribed into report narrative and tables. Transcription errors are common and can cause compliance failures. |
| **Compliance Tables** | Highest | 8-30 hrs | Side-by-side tables: "Requirement says X → Our design provides Y → Status: Compliant." Engineer manually reads the 200-page municipal PDF, types each requirement, then writes the response. For complex sites: 20+ pages of tables. |
| **Inspection & Maintenance Plan** | Medium-Low | 4-8 hrs | Mostly boilerplate but must be customized to the specific BMPs selected for this site. |
| **Pollution Prevention / Good Housekeeping** | Low | 2-4 hrs | ~90% boilerplate. Material handling, spill prevention, waste management. |
| **Maps & Plans** | High | 8-20 hrs | Produced in AutoCAD/Civil 3D, not a text automation target. |
| **Appendices Assembly** | Medium | 4-12 hrs | Organizing calculations, product spec sheets, regulatory excerpts, NOI forms, soil reports into coherent appendices. |

### The Single Most Painful Task

Reading a 200-page municipal requirements PDF, extracting every relevant requirement, and writing a compliance response for each one proving the design meets or exceeds the standard. This is pure cross-referencing labor -- exactly what an LLM should automate.

### SWPPP Annual Volume (US)

- **EPA Construction General Permit (CGP)** covers any construction site disturbing 1+ acre
- **US construction starts:** ~900,000-1,000,000 per year (residential, commercial, infrastructure)
- **Sites requiring SWPPPs:** Estimated 200,000-300,000 per year based on EPA NOI filings and state equivalents
- **Average fee:** ~$10,000
- **Total SWPPP labor market:** ~$2-3B/year

---

## Other High-Volume Compliance Documents

### The Universal Pain Pattern

Every painful engineering compliance document shares the same structure:

```
Regulatory Requirements (PDF / standards / checklists)
        ↓ cross-reference
Project-Specific Design Data (calcs, model output, drawings)
        ↓ generate
Compliance Narrative + Comparison Tables + Appendices
```

This is one engine. One product, many document types.

### Document Type Analysis

| Document | Est. Annual Volume (US) | Hours to Produce | Typical Fee | Automation Fit |
|----------|------------------------|-------------------|-------------|---------------|
| **SWPPPs** | 200K-300K | 40-200 hrs | $5K-$25K | Perfect -- high volume, highly structured, clear regulatory framework |
| **Preliminary Engineering Reports (PERs)** | 5K-10K | 100-400 hrs | $20K-$100K | Strong -- driven by state SRF loan checklists, point-by-point compliance |
| **Basis of Design Reports (BODRs)** | 10K-20K | 80-300 hrs | $15K-$75K | Strong -- design criteria comparison tables are the core pain |
| **O&M Manuals** | 3K-5K | 200-1,000+ hrs | $30K-$200K | Moderate -- very long, heavy manufacturer data assembly |
| **NPDES Permit Applications** | ~10K renewals/year | 40-160 hrs | $10K-$40K | Good -- form-driven with compliance narrative |
| **MS4 Annual Reports** | ~7,500/year | 40-120 hrs | $8K-$25K | Moderate -- data compilation + narrative |
| **Consumer Confidence Reports (CCRs)** | ~50K/year | 10-40 hrs | $2K-$8K | Lower -- mostly data tables, less narrative |
| **Environmental Assessments (NEPA)** | 10K-20K all sectors | 100-500 hrs | $25K-$150K | Moderate -- more engineering judgment required |
| **Phase I ESAs (adjacent)** | 100K-150K | 20-40 hrs | $2K-$5K | Strong -- ASTM E1527 standard, highly structured |

### Detailed Breakdown of Key Document Types

#### Preliminary Engineering Reports (PERs)
- Required for every State Revolving Fund (SRF) loan and USDA Rural Development grant
- Each state has a specific PER template/checklist that must be addressed point-by-point
- IIJA is flooding SRF programs with $11.7B in new funding, meaning more PERs than ever
- Typical structure: existing conditions → regulatory requirements → alternatives analysis → recommended alternative → cost estimate → financial analysis
- Pain: the state checklist can be 50+ items, each requiring a written response with supporting data
- **Same engine as SWPPP compliance tables**

#### Basis of Design Reports (BODRs)
- Produced for every significant water/wastewater facility design
- Core pain: design criteria comparison tables
  - Column 1: Regulatory standard (e.g., "Ten States Standards: minimum detention time = 2 hours")
  - Column 2: Proposed design (e.g., "Proposed detention time = 2.5 hours")
  - Column 3: Status (e.g., "Compliant -- exceeds minimum")
- Must cross-reference multiple standards simultaneously: Ten States Standards (GLUMRB), state design standards, local utility standards, EPA guidance
- **Identical automation pattern to SWPPP compliance tables**

#### O&M Manuals
- Massive documents (200-1,000+ pages) for water/wastewater treatment plants
- Heavy assembly work: process descriptions, equipment lists, manufacturer cut sheets, operating procedures, maintenance schedules
- Less about regulatory cross-referencing, more about compilation and generation of operating procedures
- Still automatable but a different pattern -- more like document assembly than compliance checking

#### Phase I Environmental Site Assessments (ESAs)
- Governed by ASTM E1527-21 standard -- very rigid structure
- Sections: site description, historical review (Sanborn maps, aerial photos, city directories), regulatory database review, site reconnaissance, interviews, findings
- The regulatory database review section is particularly automatable -- it's a cross-reference of the site against EPA/state databases
- **100,000-150,000 produced annually** -- massive volume
- Every commercial real estate transaction requires one
- **Strong adjacent market -- same engine, different domain**

---

## Market Sizing

### The Water/Wastewater Consulting Market

- **Total US water/wastewater consulting market:** ~$15-20B/year
- **Documentation as % of project fees:** 20-35% (varies by project type; compliance-heavy projects skew higher)
- **Documentation labor spend:** ~$3.75-7B/year

### Firm Landscape

| Tier | Count (est.) | Employees | Water Revenue | Notes |
|------|-------------|-----------|---------------|-------|
| **Top 10** (AECOM, Jacobs, HDR, Arcadis, Black & Veatch, Stantec, WSP, Brown & Caldwell, Carollo, Hazen) | 10 | 5,000-50,000+ each | $500M-$2B+ each | Enterprise sales, long cycles |
| **Mid-tier** (50-500 people) | 500-1,000 | 50-500 each | $5M-$100M each | Sweet spot for SaaS adoption |
| **Small firms** (2-50 people) | 5,000-10,000 | 2-50 each | $200K-$10M each | Price-sensitive, highest pain-per-person |
| **Total** | ~6,000-11,000 firms | | $15-20B combined | |

### TAM Calculation

#### Bottom-Up: SWPPPs Only
- 250,000 SWPPPs/year × $10,000 avg fee = **$2.5B in SWPPP labor**
- Anvil saves 50-60% of labor time
- Capture 10% of value as software fee (~$500-600/SWPPP)
- **$125-150M revenue opportunity on SWPPPs alone**

#### Bottom-Up: All Water/Wastewater Compliance Docs
- Total documentation labor: ~$5B/year
- Anvil-addressable portion (structured compliance docs): ~$3.5B
- 50% time savings, capture 10% of value
- **$175M revenue opportunity**

#### With Adjacent Markets
- Phase I ESAs: 125K/year × $3.5K avg = $437M labor
- NEPA documents (all sectors): $2-4B/year
- Geotech reports: $1-2B/year
- Total adjacent: ~$4-7B/year
- Combined TAM: **$8-12B in documentation labor**
- Addressable + capturable: **$400M-600M revenue opportunity**

### The Infrastructure Spending Tailwind

The Bipartisan Infrastructure Law (IIJA/BIL) allocated:
- **$55B for water infrastructure** -- largest water investment in US history
- **$11.7B in new SRF funding** (each loan requires a PER)
- **$15B for lead service line replacement** (each project needs engineering reports)
- **$10B for PFAS treatment** (new treatment facilities = BODRs + O&M manuals)

This means:
- More projects than ever before
- Engineering firms can't hire fast enough
- Documentation is the bottleneck -- firms have design work but not enough staff to write reports
- Any tool that saves 50% of documentation time is worth paying for immediately

---

## Competitive Landscape

### Existing Tools (None Dominant)

| Tool | What It Does | Gap |
|------|-------------|-----|
| **SWPPPTrack** | SWPPP *inspection tracking* (after the plan is written) | Does NOT generate the document |
| **Bluebeam Revu** | PDF markup and review | Document review, not generation |
| **HydroCAD / SWMM** | Stormwater modeling | Produces calcs, not the report wrapping the calcs |
| **AutoCAD Civil 3D** | Site design + some reports | Design tool, not compliance documentation |
| **ProjectWise / Newforma** | Document management | Stores documents, doesn't generate them |
| **Microsoft Word** | Report writing | The actual tool used -- manual, no intelligence |
| **Firm template libraries (SharePoint)** | Word templates | Go stale, no regulatory intelligence |

### AI Entrants (Early / None Purpose-Built)

- General LLM tools (ChatGPT, Claude) used informally for drafting boilerplate
- No purpose-built tool specifically for water engineering compliance documentation
- Legal tech (ContractPodAI, Ironclad) has proven the pattern in an adjacent domain -- contract automation is the same cross-referencing problem
- **Wide open market**

---

## Adjacent Markets Detail

### Phase I Environmental Site Assessments (ESAs)
- **Volume:** 100,000-150,000/year in the US
- **Fee:** $2,000-$5,000 each
- **Market:** $300-750M/year
- **Structure:** ASTM E1527-21 standard -- rigid, well-defined sections
- **Automation fit:** Strong. Historical review and regulatory database sections are particularly automatable.
- **Why it's attractive:** Every commercial real estate transaction needs one. High volume, low variance, clear structure.

### NEPA Environmental Documents
- **Volume:** 10,000-20,000 EAs/year, ~200 EISs/year across all sectors
- **Fee:** $25K-$150K (EA), $500K-$5M (EIS)
- **Market:** $2-4B/year
- **Automation fit:** Moderate. EAs are structured enough. EISs require too much judgment for v1.

### Transportation Engineering
- **Traffic Impact Studies:** ~50K-100K/year, $5K-$30K each
- **Highway Design Reports:** Similar cross-referencing pattern against AASHTO standards
- **Automation fit:** Good for traffic studies (structured analysis), moderate for design reports

### Geotechnical Engineering
- **Geotech Reports:** ~200K-500K/year, $3K-$15K each
- **Structure:** Site description, boring logs, lab results, analysis, foundation recommendations
- **Automation fit:** Moderate. Boring log data extraction is structured; recommendations require judgment.

---

## Pricing Model Considerations

| Model | Price Point | Target |
|-------|-----------|--------|
| **Per document** | $200-$500/SWPPP generated | Small firms, occasional use |
| **Monthly subscription** | $200-$500/seat/month | Mid-tier firms, regular use |
| **Enterprise** | $50K-$200K/year | Top 10 firms, unlimited use |
| **Freemium** | Free for 1 doc/month, paid for more | Market penetration |

**Benchmark:** Engineers bill at $150-$250/hour. A SWPPP taking 100 hours = $15K-$25K in labor. If Anvil saves 50 hours, that's $7.5K-$12.5K in labor savings. A $300-$500 fee per document is trivially justified.

---

## Key Takeaways

1. **The pain is universal and structural.** Every compliance document in engineering follows the same pattern: regulatory requirements → cross-reference against design → compliance narrative. One engine, many document types.

2. **SWPPPs are the perfect beachhead.** 200-300K/year, $2-3B in labor, highly structured, clear regulatory framework, massive pain point. Start here.

3. **The requirements database is the moat.** Once you've parsed NYC DEP's stormwater rules, every NYC project benefits. Parse 50 municipalities and you have a knowledge base no competitor can replicate. This is Palantir's ontology pattern applied to regulatory compliance.

4. **No one has built this yet.** Tools exist for inspection tracking, document management, and design modeling. Nothing exists for compliance document *generation*. The market is wide open.

5. **IIJA is creating unprecedented demand.** $55B in water infrastructure funding = more projects than firms can staff. Documentation is the bottleneck. Timing is ideal.

6. **Phase I ESAs are the killer adjacent market.** 100-150K/year, ASTM-structured, same engine. Every commercial real estate deal needs one.

7. **The pricing math is trivial.** If a SWPPP costs $15K in labor and Anvil saves 50% of the time, a $300-500 per-document fee pays for itself 15-25x over. This is not a hard sell.
