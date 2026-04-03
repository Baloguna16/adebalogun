# Scaling AI Data Center Capacity Beyond Chips: A Research Brief

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

The main constraint on scaling AI data center capacity is no longer just GPUs. In most major North American markets, the binding constraint has shifted to **time-to-power**: securing generation, transmission or distribution upgrades, utility interconnection, and the electrical equipment needed to energize a site. The most important practical implication is that the scarce asset is often not the building shell, but a deliverable sequence of megawatts tied to a realistic energization date.

Power bottlenecks are layered. First, utilities in core markets are seeing very large load-request pipelines from data centers. Second, even where a utility is willing to serve load, interconnection and network upgrades can take years. Third, the equipment needed after a utility commitment, especially **large gas turbines, transformers, medium-voltage switchgear, switchboards, busway, UPS systems, and associated protection equipment**, remains constrained. In parallel, high-density AI clusters are forcing a transition from air cooling to liquid-assisted designs, creating a second bottleneck in cooling equipment, piping, CDUs, chillers, and field installation capacity.

The strongest pricing power sits with supplier classes that combine four traits: concentrated supply, long qualification cycles, limited substitute products, and schedule-critical position in the project path. On that basis, the clearest pricing power today appears in **gas turbine OEMs and packagers**, **transformer and medium-voltage electrical equipment suppliers**, and **integrated power-and-cooling platform vendors**. Specialized electrical and mechanical contractors also have meaningful leverage where they control scarce craft labor and can commit schedules that developers cannot easily replicate internally.

Utilities and permitting authorities are gatekeepers, but their economics are different. Utilities usually do not have unconstrained pricing power because rates are regulated, though they do have strong negotiating leverage around queue discipline, cost allocation, curtailment terms, and special tariffs. Permitting agencies and local governments have approval power, not supplier pricing power; their importance lies in project timing risk, not margin capture.

Bottom line: the AI build-out is increasingly a race to secure **firm power, electrical balance-of-plant, cooling infrastructure, and labor** rather than simply compute hardware. The winners over the next 12 months are likely to be companies that can sell schedule certainty, not just equipment.

## Assumptions And Scope

- Primary lens is **U.S./North America**, because that is where the best current data on utility load growth, interconnection, labor, and equipment constraints is available.
- “Beyond chips” excludes GPUs and networking silicon and focuses on infrastructure required to make AI capacity operational.
- Lead times and pricing conditions vary materially by voltage class, utility territory, project size, and whether supply is greenfield, retrofit, or modular. Where precise figures differ across sources, this brief emphasizes directional conclusions and states uncertainty explicitly.

## Current Landscape

### 1. Power availability is the first-order bottleneck

The IEA reported in 2025 that traditional data centers often use roughly **10-25 MW**, while hyperscale AI facilities can exceed **100 MW**. That changes the development problem from standard commercial load service to something closer to industrial power procurement. CBRE’s 2025 global data center trends report called **limited power availability the prime inhibitor of growth** in core hub markets.

In the U.S., utilities have disclosed unusually large data center load pipelines. A February 2025 Data Center Dynamics survey of utility earnings commentary found:

- Exelon’s pipeline of data centers and other high-density loads had more than doubled to **17 GW**.
- PG&E said it was working to serve **5.5 GW** of new data center demand over the next decade.
- Dominion Energy reported about **40 GW** in various stages of contracting as of December 2024, up sharply from mid-2024.
- Duke said data centers would represent roughly half of its growth pipeline by 2029.

These figures do not translate directly into delivered capacity, but they show that utility request volumes are now far ahead of near-term energization capability in major regions.

### 2. Interconnection is now a data center problem, not only a generation problem

Historically, “interconnection queue” usually referred to generators. That is still important because delayed generation and transmission build-outs reduce system headroom for new large loads. Lawrence Berkeley National Laboratory reported that **generator interconnection requests reached 2.6 terawatts in 2023**, about double the total from three years earlier, with **166 GW** of new capacity entering queues in 2023 alone. FERC’s Order No. 2023 is intended to improve generator-queue processing, but implementation is gradual and does not eliminate local transmission constraints or the challenge of integrating large new loads.

For AI data centers, the practical constraint is often **large-load interconnection plus upstream grid reinforcement**:

- substation expansion,
- transmission upgrades,
- feeder additions,
- protection studies,
- and in some cases new on-site generation or dedicated substations.

This is why “land with utility letters” is no longer enough. Developers increasingly need evidence of actual construction sequencing to energization.

### 3. Electrical equipment shortages remain severe

The U.S. Department of Energy’s 2024 distribution transformer study highlighted extended lead times, reporting that utilities had experienced wait times rising from typical pre-2020 ranges to **one to three years**, with some orders around **120 weeks**. That study focused on the broader grid, not AI data centers specifically, but the implication is direct: if utilities and developers need more substations and power-delivery hardware at the same time, data center projects compete with the wider electrification cycle.

The most schedule-critical constrained classes include:

- large power transformers,
- distribution transformers,
- medium-voltage switchgear,
- low-voltage switchboards and panelboards,
- busway and bus duct,
- breakers and protective relays,
- UPS systems and power distribution units,
- backup generation packages.

Not every class is equally constrained, but all sit on the project critical path. A shortage in one of them can delay revenue recognition on the whole facility.

### 4. Cooling is shifting from a design choice to a capacity constraint

High-density GPU clusters increasingly require **direct-to-chip liquid cooling**, rear-door heat exchangers, or other hybrid architectures. Vertiv’s 2025 industry outlook emphasized that AI loads are stressing rack-level and room-level power and cooling systems beyond prior enterprise norms. This is not only a capex issue. It changes:

- rack density,
- heat rejection architecture,
- water usage and water treatment,
- piping complexity,
- white-space retrofits,
- commissioning procedures,
- and maintenance staffing.

Cooling choices are now linked to power constraints. A site may have nominal grid access but fail to convert that into usable AI capacity if the cooling topology, CDU supply, chiller capacity, or water permissions are missing.

### 5. Construction labor and field execution are a real bottleneck

AI data center schedules depend on scarce field labor, especially:

- electrical trades,
- pipefitters and mechanical installers,
- controls technicians,
- commissioning specialists,
- and substation and transmission crews.

Quanta stated in its 2025 acquisition announcement for Dynamic Systems that the mechanical, plumbing, and electrical systems inside a load-center facility account for about **60% of facility construction costs** and are dependent on a highly skilled craft workforce. That is a strong signal that labor scarcity is not incidental; it is embedded in the cost structure.

### 6. Permitting and local opposition are becoming material schedule risks

Permitting is not the most important bottleneck everywhere, but it is becoming more important as power and water demands become visible to local communities. Concerns now routinely include:

- electricity cost impacts on residents,
- water use for cooling,
- noise from backup or on-site generation,
- transmission line siting,
- diesel or gas emissions,
- land-use conflicts,
- and skepticism about jobs created per megawatt consumed.

Moody’s, cited by Data Center Knowledge in 2025, warned that water stress is a growing credit risk for data center operators and that local regulation and social backlash can delay projects or raise costs. Recent reporting from Axios, citing Data Center Watch, indicates a growing number of delayed or blocked projects tied to community pushback. The exact totals should be treated cautiously, but the directional trend is credible.

## Core Concepts

### Time-to-power

The elapsed time from site control to energization of the first meaningful tranche of capacity. For AI development, this is often more important than nominal megawatt entitlement on paper.

### Queue position versus deliverability

A utility request or queue position is not equivalent to service. Deliverability depends on the upstream system, equipment supply, and approved construction plan.

### Critical-path equipment

Equipment whose delay holds back the entire campus. For AI data centers this is usually major electrical gear, backup power packages, and increasingly liquid-cooling infrastructure.

### Schedule certainty premium

Customers are paying for reliable delivery dates, not just hardware. This is the main mechanism through which supplier pricing power expresses itself.

### Power density migration

As AI racks move to much higher kW per rack, legacy air-cooled assumptions break. The result is a redesign of both electrical distribution and thermal management.

## Key Players And Supplier Classes

### Utilities and grid operators

- **Dominion Energy, Duke Energy, Exelon, PG&E, Oncor, APS, Entergy, AEP, TVA**: control service territory access and often determine whether a site can be energized this decade.
- **PJM, ERCOT, MISO, regional transmission operators and state regulators**: shape interconnection timing, transmission planning, and tariff structures.

Assessment: major gatekeeping power, limited direct pricing power because economics are regulated, though special tariffs and cost-allocation structures matter.

### Power generation and behind-the-meter suppliers

- **GE Vernova, Siemens Energy, Mitsubishi Power**: large gas turbine OEMs.
- **ProEnergy and other packagers/deployers**: useful where modular or fast-track generation is needed.
- **Caterpillar, Cummins**: standby and distributed power ecosystems.

Assessment: among the strongest pricing power in the stack. Supply is concentrated, product qualification is hard, and equipment is mission-critical. Reuters-reported commentary in late 2025 indicated GE Vernova’s gas turbine production was effectively booked through 2028, illustrating extreme scarcity.

### Transformers and electrical distribution equipment

- **Hitachi Energy, Siemens Energy, GE Vernova, Eaton, Schneider Electric, ABB, Hubbell, nVent, Powell**.
- Supplier classes include large power transformers, distribution transformers, switchgear, switchboards, busway, UPS, PDUs, relays, breakers, and integrated electrical rooms.

Assessment: very strong pricing power, especially in medium-voltage and project-specific assemblies. This category benefits from long lead times, qualification requirements, and the fact that late substitutions are difficult.

### Integrated data center power and cooling platforms

- **Vertiv, Schneider Electric, Eaton** are the clearest system-level vendors.
- **Modine, Trane Technologies, Carrier, Johnson Controls, AAON, Boyd, nVent** and others serve parts of the thermal stack depending on cooling method.

Assessment: strong pricing power where vendors can provide integrated solutions, factory-built modules, or validated liquid-cooling designs. Vertiv reported strong backlog and continued data-center-led demand; Modine expanded U.S. chiller capacity in 2025 to address data center demand. This is a favorable market, though somewhat less structurally concentrated than turbines or large transformers.

### Engineering, procurement, and construction trades

- **Quanta Services, EMCOR, MYR Group, Comfort Systems USA, specialized mission-critical MEP firms**.

Assessment: meaningful local and project-level pricing power. Labor is scarce, and self-perform capability matters. Contractors with substation, high-voltage, and mission-critical mechanical capabilities are positioned well, especially when owners need guaranteed schedules.

### Development, colocation, and land/power assemblers

- **Hyperscalers**: Microsoft, Google, Amazon, Meta, Oracle, xAI, OpenAI partners.
- **Colocation and developers**: Equinix, Digital Realty, QTS, Compass Datacenters, CyrusOne, Vantage, AirTrunk and others.

Assessment: these firms do not have pricing power as suppliers to the buildout in the same sense, but they increasingly compete on access to power and partner ecosystems.

## Where Pricing Power Is Strongest

### Tier 1: strongest pricing power

#### 1. Gas turbine OEMs and deployable power packages

Why:

- very concentrated supply base,
- long manufacturing slots,
- limited substitutes for large, reliable on-site generation,
- urgent demand from data center developers trying to bypass utility delays.

Implication: customers pay for delivery position and certainty. Margins should remain resilient unless demand normalizes sharply.

#### 2. Transformer and medium-voltage equipment suppliers

Why:

- long lead times,
- heavy customization,
- certification and testing requirements,
- wide demand spillover from grid modernization, electrification, and industrial projects.

Implication: this is one of the clearest bottleneck classes outside chips. Large transformer producers and switchgear suppliers can price for scarcity, especially on expedited or specialized orders.

### Tier 2: strong but more mixed pricing power

#### 3. Integrated power-and-cooling vendors

Why:

- AI-specific designs are changing fast,
- customers prefer validated reference architectures,
- factory integration compresses schedules,
- liquid cooling adds complexity and switching costs.

Implication: vendors with proven AI deployment capability can hold price better than commodity HVAC vendors.

#### 4. Scarce mission-critical electrical and mechanical contractors

Why:

- field labor is hard to scale,
- project delays are costly,
- owners value firms that can guarantee crews and commissioning.

Implication: pricing power is strongest in local markets with labor scarcity and for contractors that combine inside electrical, substation, and mechanical expertise.

### Tier 3: gatekeeping power without classic pricing power

#### 5. Utilities

Why:

- monopoly on interconnection in their territory,
- control over queue discipline and service conditions.

Limitation:

- regulated rates limit pure economic rent extraction.

Implication: utilities can shape who gets served and when, but they are not generally the cleanest equity expression of “pricing power.”

#### 6. Permitting authorities and local governments

Why:

- can slow or block projects.

Limitation:

- they do not monetize scarcity like suppliers do.

Implication: critical to project risk, but not a supplier-margin thesis.

## Recent Developments

- **Power demand visibility increased sharply in 2025.** Utility disclosures made clear that data center load requests are arriving at unprecedented scale.
- **Gas generation moved from backup plan to primary workaround.** Developers increasingly explored behind-the-meter gas generation, temporary turbines, and microgrid-style approaches where utility timelines were too slow.
- **Liquid cooling moved into the mainstream capex plan.** Cooling suppliers expanded manufacturing and marketing specifically around AI deployments.
- **Integrated procurement became more valuable.** Multi-year agreements such as Schneider Electric’s large arrangement with Compass illustrate customer willingness to lock in supply and schedule.
- **Construction capability consolidated.** Quanta’s acquisition activity around mechanical infrastructure reflected the value of owning more of the mission-critical labor stack.
- **Community resistance became more visible.** Water, power-cost, and land-use concerns increasingly affected approvals in several markets.

## Opportunities

- **Own or control time-to-power inventory.** Sites with credible near-term megawatts are likely to capture premium economics.
- **Back suppliers selling schedule certainty.** The best opportunities are in critical-path electrical equipment, fast-track generation, and validated cooling platforms.
- **Provide modularization and factory integration.** Prefabricated electrical rooms, skids, cooling modules, and standardized designs reduce field risk.
- **Expand service and retrofit offerings.** Many existing data centers need electrical and cooling retrofits to support AI clusters.
- **Invest in labor productivity.** Firms that can train, retain, and deploy commissioning and MEP talent at scale should gain share and margin.

## Risks And Challenges

- **Demand overshoot risk.** Utility pipelines overstate realized demand; some projects are speculative or duplicative.
- **Policy and permitting backlash.** Local resistance may grow if communities perceive higher rates, water strain, or low job creation.
- **Technology substitution risk.** Improved model efficiency, better utilization, or lower-power inference hardware could soften infrastructure demand at the margin.
- **Fuel and emissions risk.** Behind-the-meter gas solutions solve timing problems but can create regulatory and reputational issues.
- **Supply normalization risk.** If OEMs add capacity aggressively, today’s pricing power could fade in 24-36 months.

## Open Questions

- How much of today’s utility load pipeline is duplicative site optioning versus firm demand?
- Will regulators create special rate structures that allocate data center upgrade costs more explicitly to large-load customers?
- How quickly will utilities and OEMs expand transformer and switchgear capacity relative to demand?
- Which cooling architectures become standard for 100 kW+ rack environments?
- Can behind-the-meter generation bridge the gap without triggering stricter emissions or market-design responses?
- Does local political opposition become concentrated in a few stressed markets, or spread broadly across U.S. growth regions?

## What To Monitor In The Next 12 Months

- Utility disclosures on **firmed data center contracts versus pipeline requests**.
- Announcements on **new transformer, switchgear, UPS, busway, and chiller manufacturing capacity**.
- Lead-time commentary from **Eaton, Vertiv, Schneider Electric, ABB, Powell, Modine, Trane, Carrier, Hubbell, and nVent**.
- Gas turbine order books and delivery slots at **GE Vernova, Siemens Energy, and Mitsubishi Power**.
- State regulatory actions on **large-load tariffs, cost allocation, and behind-the-meter generation rules**.
- Evidence that **liquid cooling retrofits** are accelerating or stalling.
- Labor indicators for **electrical, mechanical, and commissioning trades** in major data center corridors.
- Local votes, moratoria, or lawsuits related to **water use, zoning, transmission siting, and diesel or gas generation**.

## Actionable Next Steps

1. Build an internal dashboard organized around **time-to-power**, not just MW requested. Track utility status, substation scope, equipment status, permitting status, and commissioning labor for each target project.
2. Segment supplier exposure into three buckets: **irreplaceable bottlenecks**, **integrated solution vendors**, and **replaceable commodities**. Concentrate diligence on the first two.
3. Prioritize diligence on **transformers, medium-voltage gear, UPS, and liquid-cooling integration** before making assumptions about construction timelines.
4. Treat **utilities as capacity partners**, not just service providers. Evaluate tariff structures, queue rules, upgrade cost-sharing, and political receptivity in each territory.
5. For investment or procurement decisions, demand evidence of **factory slots, tested designs, and field labor availability**, not only signed purchase orders.
6. Develop scenarios for **behind-the-meter generation** including gas supply, emissions permitting, runtime assumptions, and eventual grid integration.
7. Build a market map of contractors with proven **mission-critical electrical, mechanical, and commissioning** depth in target regions; labor access may be as valuable as OEM supply.
8. Monitor community sentiment early. In stressed markets, add a formal workstream for **water, noise, traffic, and local-rate impact** before site acquisition is finalized.

## Key Takeaways

1. The dominant AI data center bottleneck beyond chips is **time-to-power**, not generic building capacity.
2. The most powerful supplier classes are those selling **schedule certainty on critical-path equipment**.
3. **Gas turbines, transformers, and medium-voltage electrical gear** have the clearest structural pricing power today.
4. **Cooling has become a first-order infrastructure issue** because high-density AI clusters break legacy air-cooled assumptions.
5. **Skilled trades and commissioning capacity** are meaningful constraints and support contractor pricing.
6. Utilities and permitting authorities are decisive gatekeepers, but they are not the cleanest expressions of supplier pricing power.
7. Over the next year, the best signal is whether announced demand converts into **firm contracts, delivered equipment, and energized megawatts**.

## Sources And Further Reading

### Primary Sources

- IEA, *Energy and AI* topic page: https://www.iea.org/topics/artificial-intelligence
- FERC, generator interconnection reforms / Order No. 2023: https://www.ferc.gov/industries-data/electric/electric-transmission/generator-interconnection/final-rules-establishing
- Lawrence Berkeley National Laboratory, *Queued Up: Characteristics of Power Plants Seeking Transmission Interconnection*: https://emp.lbl.gov/queues
- U.S. Department of Energy, *Distribution Transformer Supply Chain Review*: https://www.energy.gov/sites/default/files/2024-04/Distribution%20Transformer%20Supply%20Chain%20Review.pdf
- Schneider Electric and Compass Datacenters partnership announcement: https://www.se.com/us/en/about-us/newsroom/news/press-releases/schneider-electric-and-compass-datacenters-expand-partnership-with-3-billion-multi-year-data-center-technology-agreement-654c72aea7ee7277290da24e
- Vertiv, *Data Center Trends 2025*: https://investors.vertiv.com/financial-news/news-details/2024/Data-Center-Trends-2025-Vertiv-Predicts-Industry-Efforts-to-Support-Enable-Leverage-and-Regulate-AI/default.aspx
- Modine, U.S. chiller capacity expansion announcement: https://investors.modine.com/news/news-details/2025/Modine-Expands-U-S--Chiller-Production-Capacity-to-Serve-Data-Center-Customers/default.aspx
- Quanta Services acquisition announcement for Dynamic Systems: https://investors.quantaservices.com/news-events/press-releases/detail/380/quanta-services-acquires-dynamic-systems-a-premier-turnkey-mechanical-and-process-infrastructure-solutions-provider

### Industry And Expert Analysis

- CBRE, *Global Data Center Trends 2025*: https://www.cbre.com/insights/reports/global-data-center-trends-2025
- Data Center Dynamics, utility load growth reporting: https://www.datacenterdynamics.com/en/news/us-utilities-report-significant-growth-in-data-centers-seeking-grid-connection/
- Data Center Knowledge, water and cooling risk: https://www.datacenterknowledge.com/cooling/ai-cooling-demands-push-data-centers-into-deep-water
- Axios, local opposition to AI data centers: https://www.axios.com/2026/02/24/ai-data-centers-energy-bills

### Recent Reporting

- Reuters-derived reporting on GE Vernova gas turbine capacity being effectively booked through 2028: https://www.world-energy.org/article/54718.html

### Notes On Uncertainty

- Utility pipelines are not the same as committed, delivered load; they likely overstate realized demand.
- Equipment lead times differ by voltage class, customization, and customer priority.
- Community-opposition data is fragmented and often reported through industry trackers rather than standardized public databases.
- The relative pricing power of cooling vendors is positive but less cleanly measurable than that of turbines or electrical gear OEMs.
