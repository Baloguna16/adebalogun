# Adjacent Expansion Paths Beyond Stormwater for Anvil's Compliance-Evaluation Engine

**Date:** March 26, 2026  
**Prepared for:** Anvil  
**Classification:** General Research  

## Executive Summary

Assumption: Anvil's current product is a U.S.-focused stormwater compliance-evaluation engine that ingests semi-structured documents such as permits, plans, design packages, and regulatory guidance; extracts obligations; compares those obligations against project artifacts or operational records; and returns defensible findings with citations. This brief ranks adjacent markets based on how well that core capability transfers, not simply on total market size.

The highest-probability expansion path is **wastewater**, followed by **drinking water**. Both sit inside the same regulatory and buyer ecosystem as stormwater, inherit similar document types and inspection/reporting logic, and face strong compliance pain tied to recurring permit obligations. Wastewater is the cleanest adjacency because it is closest to stormwater in regulatory structure: permit-centric, recurring, highly auditable, and already served by buyers that understand Clean Water Act compliance software. Drinking water is nearly as attractive, and buyer urgency is arguably higher because of public-health exposure, but the work is somewhat less document-only and more dependent on lab, inventory, and operational data integration.

The best non-water adjacency is **infrastructure funding documents**, especially WIFIA, SRF, and related environmental/funding packages. This is not the biggest market by spend, but it is a strong fit for Anvil's engine because the work is document-heavy, checklist-driven, and increasingly standardized. It can also create a practical bridge into wastewater and drinking-water accounts by helping utilities and engineering firms win and document funding before moving deeper into downstream compliance workflows.

**Permitting** is strategically important but should be approached carefully. Buyer pain and urgency are very high, especially where NEPA, federal cross-cutters, and multi-agency reviews collide, but the process is less standardized than water compliance and often requires workflow orchestration, stakeholder coordination, and agency-facing case management in addition to obligation extraction. It is attractive as a medium-term platform move, not the best immediate adjacency.

**Environmental site assessments (ESAs)** rank last among the candidates considered here. The documents are structured and well-understood, especially under ASTM E1527-21, but the buying pattern is more transactional, less recurring at the account level, and already anchored by strong data incumbents and services-heavy delivery. ESA is a plausible feature extension or channel partnership opportunity, but not the most compelling standalone market for Anvil's next wedge.

## Ranking

### Scoring framework

Scores are on a 1-5 scale.  
Weights: Pain `30%`, Repeatability `25%`, Buyer Urgency `25%`, Data Structure Fit `20%`.

| Rank | Market | Pain | Repeatability | Buyer Urgency | Data Structure Fit | Weighted Score | Bottom line |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Wastewater | 5 | 5 | 4 | 5 | 4.75 | Best near-term adjacency; most similar to stormwater compliance mechanics. |
| 2 | Drinking water | 5 | 4 | 5 | 4 | 4.50 | Strong second move; urgency is exceptional, but product must absorb more operational data complexity. |
| 3 | Infrastructure funding documents | 4 | 4 | 4 | 5 | 4.20 | Excellent document-intelligence wedge and cross-sell into utility/engineering buyers. |
| 4 | Permitting | 5 | 3 | 5 | 3 | 4.05 | Big market and major pain, but less standardized and more workflow-heavy than Anvil's current core. |
| 5 | Environmental site assessments | 3 | 2 | 3 | 4 | 2.95 | Structured documents, but lower recurrence and stronger incumbent data/services positions. |

## Background And Context

Stormwater sits inside a larger compliance universe where regulated entities repeatedly interpret semi-structured rules, map them to site-specific conditions, and prove compliance to agencies, lenders, or funding bodies. The attractive adjacencies are the ones where that work remains:

1. Document-centric rather than purely sensor-centric.
2. Repeated across many projects or reporting cycles.
3. High-cost when wrong.
4. Auditable and citation-heavy.
5. Painful enough that buyers will pay for a system of record rather than a one-off consultant memo.

By those criteria, water remains the strongest family of adjacencies. EPA's latest water infrastructure surveys reinforce how large and active the space is. EPA's **7th Drinking Water Infrastructure Needs Survey** says public water systems need **$625 billion** over 20 years, while EPA's **2022 Clean Watersheds Needs Survey** reports **$630.1 billion** in clean-water infrastructure needs, including **$115.3 billion** for stormwater management and **17,544 reported POTWs** serving **270.4 million** people. EPA also states there are **over 148,000 public water systems** in the U.S. Those numbers matter because they imply a long-lived installed base of regulated assets, recurring obligations, and sustained capital/funding activity rather than a short-term niche.

## Current Landscape

### Cross-market pattern

Across wastewater, drinking water, permitting, and funding, buyers are dealing with five simultaneous pressures:

1. **Regulatory churn.** Rules are changing faster than teams can update manual checklists.
2. **Staffing gaps.** Utilities and public agencies are short-staffed and still depend heavily on spreadsheets, Word templates, and consultant review.
3. **Auditability pressure.** Agencies, boards, and funders increasingly expect traceable support, not just expert judgment.
4. **Fragmented data.** Lab data, GIS, permit conditions, engineering drawings, and notices live in separate systems.
5. **Federal funding and federal conditions.** IIJA-era funding expanded opportunity, but also imported more documentation and compliance burden.

### Market by market

#### 1. Wastewater

**Why it fits:** Wastewater is the closest sibling to stormwater. It uses permit-specific obligations, recurring reporting cycles, thresholds/exceedances, inspections, and a heavy paper trail under the Clean Water Act and NPDES. EPA's pretreatment program and electronic reporting rules reinforce how standardized the compliance logic is.

**Core concepts**

- NPDES permit conditions and facility-specific effluent limits.
- Discharge Monitoring Reports (DMRs), monthly operating reports, sampling schedules, and exceedance response.
- Pretreatment program oversight for indirect industrial dischargers to POTWs.
- Industrial user classification, local limits, and enforcement workflows.

**Buyer types**

- Municipal wastewater utilities and POTWs.
- Industrial dischargers with direct permits.
- Pretreatment teams managing significant industrial users.
- Engineering consultants and operator support firms.

**Key players**

- **Aquatic Informatics / WIMS Rio / WaterTrax**: compliance and operational data management across drinking water and wastewater.
- **SAMS**: utility-focused compliance platform spanning water, wastewater, industrial pretreatment, and stormwater.
- **Locus Water**: broad cloud platform spanning water data, permit tracking, and utility workflows.
- **Hach WIMS**: long-standing operational/compliance data system.
- **Ecesis** and similar compliance-calendar vendors: lighter-weight deadline and reporting workflow software.

**Recent developments**

- EPA continues to push electronic NPDES reporting. EPA states electronic reporting is required for coverage under several EPA general permits, including the Construction General Permit and Multi-Sector General Permit.
- EPA updated pretreatment guidance and publications through late 2024 and 2025, including new materials on pH and R&D-facility applicability.
- EPA's March 12, 2026 CWNS update highlighted a new national sewersheds dataset and the start of planning for the 2027 CWNS, which implies more normalized infrastructure data over time.

**Assessment**

This is the best immediate move because the user problem is nearly identical to stormwater: convert permits and guidance into machine-evaluable obligations, monitor recurring tasks, and produce defensible outputs. The main product extension is adding wastewater-specific models, tables, formulas, and reporting artifacts; not rebuilding the whole product.

#### 2. Drinking water

**Why it fits:** Drinking water has the strongest urgency among the adjacencies because non-compliance directly touches public health, ratepayer trust, and elected-official attention. But the work is somewhat less permit-centric than wastewater and more tied to inventories, lab data, monitoring schedules, public notices, and annual reporting.

**Core concepts**

- Safe Drinking Water Act compliance.
- Consumer Confidence Reports (CCRs).
- Lead and Copper Rule / Lead and Copper Rule Improvements.
- PFAS monitoring, MCL compliance, and public communication.
- State primacy complexity: federal baseline plus state-specific implementation.

**Buyer types**

- Community water systems.
- Regional utilities and investor-owned water companies.
- State primacy agencies and technical-assistance partners.
- Consulting engineers and operators helping small systems stay compliant.

**Key players**

- **Aquatic Informatics** and **WaterTrax**.
- **SAMS Water**.
- **Locus Water**.
- EPA's own tools, such as **CCRiWriter**, which partially automate annual report preparation.

**Recent developments**

- On **October 8, 2024**, EPA finalized the **Lead and Copper Rule Improvements (LCRI)**, requiring drinking water systems to identify and replace lead pipes within 10 years.
- On **May 14, 2025**, EPA announced it would keep current PFAS drinking-water regulations for **PFOA** and **PFOS** while proposing to extend their compliance deadlines, and also announced its intent to rescind and reconsider several other PFAS determinations.
- EPA says public water systems must complete initial PFAS monitoring **by 2027**, provide public information beginning in **2027**, and implement solutions **by 2029** if monitoring shows exceedances under the currently published framework.
- EPA's December 2, 2025 DWINSA update estimates **four million lead service lines** and updates FY 2025-2026 allotment logic using service-line inventory data.

**Assessment**

Drinking water is highly attractive, but Anvil should treat it as a more operationally integrated product. A document-only wedge can start with CCR generation, rule interpretation, inventory compliance packages, and PFAS/LCRI evidence assembly. Over time, however, the winning product likely needs tighter lab, asset, and service-line inventory integrations than stormwater did.

#### 3. Infrastructure funding documents

**Why it fits:** This is the strongest pure document-intelligence adjacency. Funding applications, environmental questionnaires, project narratives, eligibility screens, BABA documentation, and sources-and-uses packages are highly structured, repetitive, and expensive to assemble. They are also upstream of system buildout, making them a useful entry point into utility and consultant accounts.

**Core concepts**

- WIFIA letters of interest and applications.
- SRF intended use plans, priority lists, environmental review packages, and application support.
- BABA documentation and waiver logic.
- Funding eligibility, engineering feasibility, environmental questionnaire completion, and cross-cutter support.

**Buyer types**

- Utility finance and capital-program teams.
- Engineering consultants and grant writers.
- State SRF administrators and municipal applicants.
- Public works agencies pursuing IIJA-era funding.

**Key players**

- **Euna / AmpliFund** and **eCivis**: grants management and funding workflow platforms.
- **Deltek GovWin**: opportunity intelligence, especially for public-sector contractors.
- Internal consultant-led processes at engineering firms remain common and often manual.

**Recent developments**

- EPA updated **WIFIA** letter-of-interest and application forms in **January 2025** and now provides revised **2025 Environmental Questionnaires**.
- EPA's WIFIA guidance says environmental review relies on a borrower's Environmental Questionnaire and federal cross-cutting authorities.
- EPA's BABA page, updated in early 2026, says BABA requirements apply to **over 70 EPA programs**, and that Office of Water implementation guidance updates are underway.
- EPA OIG reported on **February 19, 2025** that EPA guidance to SRF programs on BABA implementation was not sufficient in several areas, underscoring how messy the documentation burden still is.

**Assessment**

This is the best way to monetize Anvil's document engine outside pure compliance operations. It is especially compelling if Anvil's buyers already include civil/environmental engineering firms or municipalities. It can be sold as a high-ROI drafting and evidence-assembly layer before expanding into downstream operational compliance.

#### 4. Permitting

**Why it fits:** The pain is real and budgets are meaningful. But "permitting" is not one problem; it is a stack of problem types: federal environmental review, local entitlement, agency-specific form logic, interagency routing, public notices, and exceptions handling. That makes it attractive but harder to productize as a narrow compliance-evaluation engine.

**Core concepts**

- NEPA review and related cross-cutting requirements.
- FAST-41 coordination and timetable management.
- Federal and state agency permit application packages.
- Local government permitting workflow and interdepartmental review.

**Buyer types**

- Infrastructure developers and project sponsors.
- Public agencies and utility capital teams.
- Environmental/permitting consultants and law firms.
- State and local permitting departments.

**Key players**

- **OpenGov**, **Accela**, and similar government workflow platforms.
- The **Permitting Council / FAST-41** public process infrastructure.
- A long tail of consultants, PM tools, and agency-specific portals.

**Recent developments**

- On **January 20, 2025**, President Trump issued **Executive Order 14154** directing CEQ to propose rescinding CEQ's NEPA regulations.
- CEQ published an **Interim Final Rule on February 25, 2025** and a **Final Rule on January 8, 2026** removing CEQ's NEPA regulations; prior rulemakings, including the **May 2024 Phase 2 Final Rule**, were rescinded.
- The Permitting Council says FAST-41 projects achieved a Record of Decision **nearly 18 months faster** than comparable projects that did not opt in.

**Assessment**

Permitting is better framed as a future platform expansion into "regulatory program management" than as the next focused adjacency. If Anvil enters this space too broadly, it risks competing with workflow suites and PM systems instead of selling a sharply differentiated compliance-evaluation layer.

#### 5. Environmental site assessments

**Why it fits:** The documents are structured, the standards are explicit, and the outputs are audit-sensitive. That is all favorable. The problem is that the market is less recurring at the account level and strongly influenced by incumbent data providers and services firms.

**Core concepts**

- Phase I Environmental Site Assessments.
- All Appropriate Inquiries (AAI).
- ASTM E1527-21 and recognized environmental conditions (RECs).
- Historical research, regulatory records, data gaps, and lender liability protection.

**Buyer types**

- Environmental consultants.
- Lenders and real estate transaction parties.
- Developers and environmental due-diligence teams.

**Key players**

- **LightBox EDR**, the dominant environmental records and historical-data source.
- Services firms such as environmental due-diligence consultants and engineering firms.

**Recent developments**

- EPA states that AAI must comply with the final rule at **40 CFR Part 312**, and that **ASTM E1527-21** can satisfy AAI requirements.
- ASTM E1527-21 became the practical baseline for U.S. Phase I work after the transition away from E1527-13.
- LightBox emphasizes that EDR searches **over 2,000 databases and layers**, showing how much of the value pool sits in proprietary data aggregation rather than pure document evaluation.

**Assessment**

ESA is likely better as an enabler than a market. For example, Anvil could provide REC extraction, data-gap checking, report QA, or acquisition-summary automation on top of existing data sources. A direct full-stack assault would require competing with entrenched data distribution and consultant workflows.

## Key Players And What They Tell You

### Incumbent pattern

The leading vendors in adjacent markets are generally not selling "reasoning" first. They sell one of three things:

1. **System of record for compliance operations**  
   Examples: Aquatic Informatics, Hach WIMS, SAMS, Locus.

2. **Workflow/case-management layer for government processes**  
   Examples: OpenGov, Accela.

3. **Data moat or opportunity intelligence**  
   Examples: LightBox EDR, Deltek GovWin, eCivis/Euna grants data and workflow.

This matters because Anvil should avoid trying to replace systems of record on day one. Its strongest move is to become the **evaluation and evidence layer** that sits on top of messy documents and fragmented source systems.

### Implication for positioning

Anvil is best positioned as:

- The system that reads permits, questionnaires, standards, and supporting artifacts.
- The engine that converts them into normalized obligations and evidence requests.
- The reviewer that flags missing items, inconsistencies, likely non-compliance, and unsubstantiated assertions.
- The generator of draft outputs with citations, not merely a document store.

That is a clearer wedge than "another utility platform."

## Core Concepts Anvil Must Preserve In Any Expansion

Regardless of market, the winning product should preserve five capabilities:

1. **Obligation extraction:** turn regulations and permits into structured control statements.
2. **Evidence mapping:** connect each obligation to the specific document section, table, drawing, test result, or narrative that supports compliance.
3. **Gap detection:** identify omissions, contradictions, stale references, and unsupported claims.
4. **Stateful reuse:** carry prior project logic forward so repeat buyers do not start from zero.
5. **Defensible output:** produce reviewer-facing artifacts with citations and clear uncertainty flags.

The adjacencies rank differently mostly because some of them preserve all five, while others break one or more.

## Practical Opportunities

### Best near-term product opportunities

#### 1. Wastewater permit obligation engine

Start with NPDES and pretreatment obligations for municipal utilities and engineering consultants. Prioritize:

- Permit condition extraction.
- Sampling and reporting schedule normalization.
- DMR package QA.
- Pretreatment annual report support.
- Exceedance and corrective-action evidence assembly.

This is the fastest route from stormwater to a broader "water compliance" platform.

#### 2. Drinking-water rule package assistant

Do not start with a full SCADA/lab platform. Start with high-friction document outputs:

- CCR drafting and evidence support.
- PFAS monitoring obligation extraction.
- LCRI inventory and replacement-plan package review.
- Public-notice language generation with source citations.

This keeps Anvil in its natural lane while buyer urgency is high.

#### 3. Funding-document co-pilot for utilities and consultants

This can be productized as:

- WIFIA and SRF application completeness review.
- Environmental questionnaire drafting and consistency checks.
- BABA documentation tracker.
- Sources-and-uses and attachment cross-reference QA.
- Reusable project narrative libraries tied to regulatory evidence.

This path can also function as top-of-funnel land-and-expand into wastewater and drinking-water compliance.

### Good medium-term opportunities

- Permit review support for complex water infrastructure projects with WIFIA/NEPA/cross-cutter overlap.
- Cross-program compliance graph that links funding conditions, permit conditions, and construction commitments into one obligation register.
- Consultant QA layer that reduces senior-review time on repetitive regulatory documents.

## Risks And Challenges

### 1. Incumbents already own the operational data plane

In wastewater and drinking water, platforms such as Aquatic Informatics, Hach WIMS, Locus, and SAMS already manage lab imports, dashboards, and operational workflows. If Anvil tries to replace those systems too early, sales cycles will lengthen and integration burdens will rise.

### 2. State variability can break naive standardization

Federal rules provide a baseline, but primacy agencies, state SRF processes, state permit templates, and local review practices create meaningful differences. The product must separate:

- federal/common logic,
- state overlays,
- and customer-specific templates.

### 3. Permitting can become a services trap

Permitting has enormous pain, but it is easy to drift into bespoke project management, legal support, and agency coordination work. That is hard to scale as software.

### 4. Funding-document ROI must be explicit

Grant and loan application teams feel pain, but buyers may still view the work as episodic consulting rather than recurring SaaS unless Anvil ties the funding workflow to a broader ongoing compliance program.

### 5. ESA may be economically attractive but strategically distracting

ESA is tempting because the documents are structured. But the market can pull the company toward low-recurring, report-factory economics rather than durable platform revenue.

## Open Questions

1. Who is Anvil's current economic buyer in stormwater: utilities, consultants, developers, or internal compliance teams? The best adjacency changes materially by buyer.
2. Does Anvil already integrate with lab/asset/GIS systems, or is it still primarily document-native? If document-native, wastewater and funding documents become even more attractive relative to drinking water.
3. Is the goal to expand average contract value within existing accounts, or open a new buyer category? Funding documents may win the former; permitting may aim at the latter.
4. How much tolerance does the company have for state-by-state configuration work? Drinking water and funding both require it, but in different ways.
5. Can Anvil access enough labeled historical documents to fine-tune extraction and evaluation models per market? Wastewater usually offers better repeatability here than permitting.

## What To Monitor In The Next 12 Months

1. **EPA PFAS rule changes and implementation dates.** Especially whether the May 14, 2025 announced direction becomes final in a way that shifts buyer urgency or scope for drinking-water workflows.
2. **LCRI implementation behavior.** Watch utility demand around service-line inventory QA, public notice generation, and replacement-plan documentation.
3. **2027 CWNS preparation and sewersheds data normalization.** More standardized wastewater infrastructure datasets can improve targeting and benchmarking.
4. **BABA guidance revisions for EPA water programs.** Updated documentation rules could increase funding-document pain and create a clear compliance-evidence opportunity.
5. **WIFIA and SRF form revisions.** These directly change the templates and checklists a document engine can productize.
6. **NEPA and permitting process changes under the current administration.** Regulatory simplification can reduce some workflow burden while increasing uncertainty and variance in agency practice.
7. **Incumbent product moves toward AI review.** Especially Locus, Aquatic Informatics, OpenGov, Accela, Euna, and LightBox.
8. **Customer evidence on whether buyers want review automation or end-to-end workflow replacement.** This is the most important product-strategy question.

## Actionable Next Steps

1. **Prioritize wastewater as the next formal market.** Build a narrow first release around NPDES permit obligation extraction, DMR package QA, pretreatment support, and recurring reporting workflows.
2. **Run a parallel design-partner program in drinking water.** Focus only on document-centric use cases first: CCRs, PFAS monitoring packages, LCRI evidence bundles, and public notices.
3. **Launch a funding-documents pilot as a cross-sell, not a separate company bet.** Target engineering firms and utility capital teams already adjacent to stormwater and wastewater work.
4. **Avoid a full permitting platform build in the next phase.** Instead, test one focused permitting module such as environmental questionnaire review, permit completeness checking, or cross-cutter evidence assembly.
5. **Treat ESA as a feature/partnership lane.** Explore QA, summarization, and REC extraction on top of external data sources rather than building a full standalone ESA stack.
6. **Design the product architecture around a reusable obligation graph.** The same underlying model should map permit clauses, funding conditions, and rule requirements to evidence artifacts across markets.
7. **Choose two buyer motions and ignore the rest.** The cleanest options appear to be `(a)` utilities and water agencies, or `(b)` engineering/environmental consultants serving those agencies. Mixing too many buyer types will blur the roadmap.
8. **Instrument ROI aggressively in pilots.** Measure senior-review hours saved, fewer missing attachments, faster draft completion, and reduced compliance findings; those are likely to sell better than generic AI messaging.

## Key Takeaways

1. Wastewater is the best next adjacency because it preserves almost all of stormwater's underlying product logic.
2. Drinking water is highly attractive, but the product will need deeper operational-data integration over time.
3. Infrastructure funding documents are the strongest non-water wedge because the work is structured, expensive, and upstream of broader compliance spend.
4. Permitting is a large opportunity, but it is not a clean next move unless Anvil narrows the use case sharply.
5. ESA is useful as an enabling feature area, but weaker as the primary expansion bet.
6. The strategic goal should be to own the evaluation and evidence layer, not immediately replace incumbent systems of record.
7. Regulatory churn in PFAS, lead service lines, BABA, WIFIA, and NEPA creates strong timing for a citation-heavy compliance engine.

## Sources And Further Reading

### Primary sources

- EPA, **7th Drinking Water Infrastructure Needs Survey and Assessment**: https://www.epa.gov/dwsrf/epas-7th-drinking-water-infrastructure-needs-survey-and-assessment
- EPA, **Information about Public Water Systems**: https://www.epa.gov/dwreginfo/information-about-public-water-systems
- EPA, **Clean Watersheds Needs Survey (CWNS)**: https://www.epa.gov/cwns
- EPA, **Lead and Copper Rule Improvements**: https://www.epa.gov/ground-water-and-drinking-water/lead-and-copper-rule-improvements
- EPA, **PFAS and Drinking Water**: https://www.epa.gov/sdwa/and-polyfluoroalkyl-substances-pfas
- EPA, **Brownfields All Appropriate Inquiries**: https://www.epa.gov/brownfields/brownfields-all-appropriate-inquiries
- EPA, **National Pretreatment Program**: https://www.epa.gov/npdes/national-pretreatment-program
- EPA, **Electronic Reporting for EPA's NPDES General Permits**: https://www.epa.gov/npdes/electronic-reporting-epas-npdes-general-permits
- EPA, **WIFIA Public Borrowers**: https://www.epa.gov/wifia/wifia-public-borrowers
- EPA, **WIFIA Federal Requirements**: https://www.epa.gov/wifia/wifia-federal-requirements
- EPA, **Build America, Buy America EPA Programs**: https://www.epa.gov/baba/build-america-buy-america-baba-epa-programs
- CEQ / DOE NEPA portal, **CEQ NEPA Rulemaking / Removal of CEQ Regulations**: https://ceq.doe.gov/laws-regulations/regulations.html
- Permitting Council, **FAST-41**: https://www.permitting.gov/projects/title-41-fixing-americas-surface-transportation-act-fast-41
- ASTM, **E1527-21**: https://store.astm.org/e1527-21.html

### Market and vendor references

- Aquatic Informatics, **WIMS Rio**: https://aquaticinformatics.com/products/water-compliance-operations-solution-rio/
- Aquatic Informatics, **WaterTrax**: https://aquaticinformatics.com/products/wastewater-compliance-software/
- Locus Technologies, **Water Utility Solutions**: https://www.locustec.com/applications/water-utilities/
- Locus Technologies, **Water Data Management**: https://www.locustec.com/applications/water-data-management/
- SAMS, **Compliance Software**: https://njbsoft.com/
- Hach, **WIMS Platform**: https://www.hach.com/digital-solutions/wims
- LightBox, **EDR Due Diligence**: https://www.lightboxre.com/industries/environmental-due-diligence-products-edr/
- OpenGov, **Permitting & Licensing**: https://opengov.com/products/permitting-and-licensing/
- Accela, **Government Software**: https://www.accela.com/
- Euna / AmpliFund, **Grants**: https://eunasolutions.com/solutions/grants/
- eCivis overview: https://www.govtech.com/ecivis
- Deltek GovWin: https://www.deltek.com/en/products/business-development/govwin

