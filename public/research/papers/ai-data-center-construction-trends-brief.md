# AI-Driven Data Center Construction Trends: Deep Research Brief

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

AI has turned data center construction from a steady digital-infrastructure business into a speed-to-power race. The main bottleneck is no longer just financing or shell construction; it is the ability to secure grid power, transmission upgrades, high-density cooling, and scalable interconnect. As a result, the market is shifting from “find land and build” to “lock power, networking, and equipment years in advance.”

The current build cycle is unusually aggressive by historical standards. In North America, CBRE reported that primary-market supply reached 8,155 MW in H1 2025, up 43.4% year over year, while vacancy fell to 1.6%, indicating that demand is absorbing new capacity almost as quickly as it is delivered. Globally, JLL expects the sector to nearly double from 103 GW to 200 GW by 2030, with roughly 100 GW of new capacity added between 2026 and 2030. McKinsey’s central case is similarly forceful: global data center demand could rise from about 82 GW in 2025 to 219 GW by 2030, with AI workloads accounting for most of the increase.

Power is the central gating factor. The IEA estimates global data center electricity use at about 415 TWh in 2024 and projects roughly 945 TWh by 2030 in its base case. In the United States, the DOE and Berkeley Lab estimate data centers consumed 176 TWh in 2023, or 4.4% of U.S. electricity, and could reach 325-580 TWh by 2028, or 6.7%-12% of U.S. electricity. This is why hyperscalers and developers are increasingly treating energy procurement, substation access, on-site generation, and transmission planning as core infrastructure competencies rather than support functions.

Interconnect has become a second major constraint. AI clusters require much denser east-west traffic, higher port speeds, and lower-latency scale-out and now scale-across networking than traditional cloud data centers. NVIDIA, Arista, and others are explicitly positioning their newest fabrics around multi-building and multi-campus AI “factories,” reflecting a shift from isolated halls to distributed campuses and even distributed metro-scale compute fabrics.

Over the next 12-36 months, the most likely outcome is continued strong construction, but with more selective deployment. The winners will be markets with fast power delivery, supportive permitting, strong fiber routes, and land that can support very large campuses. The losers will be constrained legacy hubs that cannot add power fast enough, or projects that win headlines before securing interconnection, generation, or financing. The biggest open question is not whether demand exists; it is how much of announced capacity will be physically energized on schedule.

## Current Landscape

### Market shape

The AI-led cycle has three overlapping demand pools:

- **Hyperscaler cloud expansion:** AWS, Microsoft, Google, and Meta are building to support both internal model development and external cloud AI demand.
- **Neo-cloud and AI-native demand:** Firms such as CoreWeave are scaling purpose-built AI infrastructure rapidly, often with more power-dense and GPU-centric designs than legacy cloud campuses.
- **Colocation and interconnection demand:** Equinix, Digital Realty, QTS, CyrusOne, Vantage, and others are capturing demand from tenants that need large blocks of power but do not want to fully self-build.

This is not a normal enterprise data center cycle. AI training and large-scale inference favor:

- Larger contiguous power blocks
- Higher rack densities
- Liquid cooling readiness
- Dense fiber routes and campus-scale networking
- Faster deployment even at higher capital cost

### Capacity growth

Key current indicators:

- CBRE reported North American primary-market supply of **8,155 MW in H1 2025**, up **43.4% year over year**, with vacancy at **1.6%** and **74.3%** of under-construction capacity already preleased.
- CBRE then reported that in full-year 2025, across eight primary North American markets, **supply expanded 36%**, **net absorption rose 38%**, and vacancy fell further to **1.4%**.
- JLL’s 2025 outlook estimated roughly **10 GW** would break ground globally in 2025 and **7 GW** would complete, with a baseline global market expansion of **15% CAGR through 2027**, potentially reaching 20%.
- JLL’s 2026 outlook projects the global sector will grow from **103 GW to 200 GW by 2030**, requiring up to **$3 trillion** in investment.
- McKinsey’s 2025 demand model projects global capacity demand rising from **82 GW in 2025 to 219 GW by 2030**, with AI representing about **70%** of total demand by then.

### Power and grid reality

The electricity burden is now too large to treat as background infrastructure:

- IEA: **415 TWh** global data center electricity consumption in 2024; about **945 TWh** by 2030 in the base case.
- IEA: the U.S., China, and Europe remain the largest power-demand regions; the U.S. and China account for nearly **80%** of global growth in data center electricity demand to 2030.
- DOE/Berkeley Lab: U.S. data center electricity consumption rose from **58 TWh in 2014** to **176 TWh in 2023** and could rise to **325-580 TWh by 2028**.

Implication: in many markets, the real product being leased is not square footage. It is energized megawatts delivered on time.

## Core Concepts

### 1. AI-ready capacity is different from legacy capacity

Not all MW are equal. AI-ready capacity usually implies support for higher rack densities, liquid cooling pathways, stronger power distribution, more resilient networking, and faster fit-out for GPU deployments.

### 2. Speed-to-power beats speed-to-shell

JLL, CBRE, and Cushman all point to power access as the main site-selection variable. In practical terms, time to substation, transformer, and transmission capacity can matter more than how fast the building can be erected.

### 3. Interconnect is now strategic infrastructure

AI economics depend not just on compute density but on how well clusters scale. NVIDIA’s 2025 announcements around Spectrum-XGS and photonics reflect a market shift toward connecting multiple buildings and campuses as unified AI systems. Arista has similarly emphasized 800G and scale-across networking for distributed AI clusters.

### 4. Preleasing and campus optionality matter

In constrained markets, customers increasingly prelease years ahead of delivery. Developers therefore prize sites that can support phased expansion over many hundreds of MW or even multi-GW campuses.

### 5. Behind-the-meter and “bring your own power” are moving from edge case to mainstream

As grid queues lengthen, on-site generation, battery storage, and private-wire or co-developed generation are becoming part of mainstream project design, especially in the U.S. and selected EMEA markets.

## Key Players

### Hyperscalers

- **Amazon/AWS:** Amazon said it expects about **$200 billion** of 2026 capex across Amazon, with 2025 property-and-equipment purchases up by **$50.7 billion** year over year, primarily reflecting AI investments. AWS is pushing both custom silicon and “AI Factories.”
- **Microsoft:** Microsoft’s property and equipment additions reached **$49.3 billion** in the first half of FY2026, versus **$30.7 billion** in the comparable prior-year period, while Azure grew **39%** in FY26 Q2. Microsoft remains one of the largest AI infrastructure spenders, though 2025 lease pullback reports suggest pacing can still vary market by market.
- **Google/Alphabet:** Alphabet reported **$91.4 billion** of 2025 capex and guided **$175-185 billion** for 2026, with most Q4 2025 capex going to technical infrastructure. Google also agreed to acquire Intersect in December 2025 to accelerate U.S. energy and data center development.
- **Meta:** Meta spent **$72.2 billion** of capex in 2025 and entered a joint venture with Blue Owl to develop its Hyperion campus in Louisiana, with approximately **$27 billion** of total development cost for buildings plus long-lived power, cooling, and connectivity infrastructure.

### AI-native infrastructure players

- **OpenAI / Stargate:** OpenAI announced a **$500 billion / 10 GW** U.S. infrastructure ambition in January 2025. By September 2025, it said Stargate had nearly **7 GW** of planned capacity and more than **$400 billion** in planned investment over the next three years; by October 2025, Michigan pushed planned capacity above **8 GW**.
- **Oracle:** Central to Stargate and increasingly relevant as a large-scale AI infrastructure partner.
- **CoreWeave:** Reported more than **850 MW** of active power capacity and about **3.1 GW** of contracted power as of December 31, 2025, with revenue backlog of **$66.8 billion**. CoreWeave illustrates both the demand strength and the financing intensity of the AI-native model.

### Colocation and digital infrastructure operators

- **Equinix:** Reported 59 major projects underway across 34 metros in 25 countries in Q2 2025 and added land in several metros in Q3 2025 supporting over **900 MW** of future retail and xScale capacity.
- **Digital Realty, QTS, Vantage, CyrusOne, NTT GDC:** Remain important wholesale and build-to-suit partners, especially where hyperscalers prefer lease-plus-option structures instead of owning every campus directly.

### Infrastructure suppliers

- **NVIDIA:** Pushing photonics, InfiniBand, Ethernet, and scale-across fabrics to support million-GPU and multi-site AI factories.
- **Arista, Broadcom, Ciena, fiber providers:** Increasingly critical because networking now influences usable compute performance and campus design.

## Regional Buildout Patterns

### United States and Canada

North America remains the core buildout region because it combines hyperscaler concentration, land availability, capital access, and multiple power-rich secondary markets. But the center of gravity is widening:

- **Northern Virginia** remains the largest hub, but power and transmission constraints are forcing diversification.
- **Phoenix, Dallas-Fort Worth, Atlanta, Chicago, Columbus, Salt Lake City, Reno, and parts of the Midwest** are increasingly attractive because they offer faster power delivery or lower land friction.
- **Texas** remains central because of scale, power-market flexibility, and willingness to entertain private-power structures.
- **New cluster logic:** developers increasingly prize markets that can deliver large blocks of power quickly, even if they are slightly worse on latency or ecosystem depth.

### Europe / EMEA

Europe remains important, but grid and permitting limits are sharper:

- Cushman’s H2 2025 EMEA update said the regional pipeline was approaching **15 GW**.
- Core FLAP-D markets still dominate, but growth is becoming more selective because grid access, environmental scrutiny, and regulatory complexity are more binding.
- Developers are looking harder at secondary markets and at self- or co-developed power solutions.

### Asia-Pacific

APAC is broadening into a multi-cluster region:

- Cushman reported APAC had about **12.7 GW** of operational capacity in H1 2025, **3.2 GW** under construction, and **13.3 GW** in planning.
- **Singapore** remains strategically important but tightly controlled. In December 2025, IMDA/EDB launched a second data center call allocating at least **200 MW**, emphasizing sustainability and green energy.
- **Johor, Malaysia** is emerging as Singapore’s spillover market because it offers more land and power flexibility. This is a regional pattern worth taking seriously rather than treating as opportunistic overflow.
- **India** remains a long-duration growth market, especially where policy, tax treatment, and domestic cloud demand align.

### Middle East

The Middle East is increasingly relevant for sovereign AI and energy-linked infrastructure plays. The opportunity is real, but geopolitical and security considerations remain more material than in North America.

## Developer Economics

### What has improved

- Demand visibility is unusually strong because of hyperscaler precommitments.
- Lease rates are rising for large contiguous blocks. CBRE said 10 MW+ pricing rose by up to **19%** in some North American markets in H1 2025.
- Preleasing reduces commercialization risk on well-located projects.
- Joint-venture capital is plentiful for credible platforms.

### What has worsened

- Construction costs are rising. JLL says average global shell-and-core construction cost rose from **$7.7 million per MW in 2020** to **$10.7 million per MW in 2025**, and could reach **$11.3 million per MW in 2026**. It notes that AI tech fit-out can add as much as **$25 million per MW**.
- Land costs are rising in powered clusters.
- Utility contributions for transmission and substation upgrades are increasing.
- Equipment lead times remain problematic in transformers, switchgear, generators, cooling gear, and some networking components.

### Resulting business model shift

The economics increasingly favor:

- Large balance sheets or infrastructure-fund backing
- Phased campus development rather than one-off assets
- Power-first underwriting
- JV structures that separate development, ownership, and tenancy risk
- Brownfield conversion where interconnection already exists

This explains transactions like Meta-Blue Owl Hyperion and Google’s move to deepen energy-development control through Intersect.

## Hyperscaler Strategies

### 1. Dual-track procurement: own + lease

Hyperscalers are not choosing between self-build and colocation. They are doing both. JLL explicitly describes this as a dual strategy, and it matches market behavior. Owning secures strategic campuses; leasing preserves speed and optionality.

### 2. Vertical integration into power and silicon

The frontier players increasingly control more of the stack:

- custom accelerators and CPUs
- network fabrics
- software stack optimization
- energy sourcing and project development

The strategic point is simple: AI economics now depend on end-to-end system efficiency, not just GPU purchase volume.

### 3. Training and inference are diverging operationally

McKinsey expects inference to grow faster than training over the next five years. That matters because training favors giant concentrated clusters, while inference can support more distributed deployment over time. Near term, both are driving construction, but the mix will affect site design and regional patterns.

### 4. Capacity announcements are partly option value

Not all announced GW will become energized capacity on announced timelines. Some projects are real commitments; others are strategic reservations on land, utilities, or political goodwill. This is a key assumption throughout the market.

## Recent Developments

- **January 21, 2025:** OpenAI announced Stargate, targeting **$500 billion** and **10 GW** of U.S. AI infrastructure over four years.
- **July 22, 2025:** OpenAI and Oracle said they would develop **4.5 GW** of additional U.S. capacity, bringing Stargate capacity under development to over **5 GW** at that time.
- **September 23, 2025:** OpenAI said Stargate had nearly **7 GW** of planned capacity and over **$400 billion** of planned investment over the next three years.
- **October 2025:** Meta broke ground on a new El Paso AI site that can scale to **1 GW**, and separately formalized the Blue Owl Hyperion JV in Louisiana.
- **December 1, 2025:** Singapore launched DC-CFA2, making at least **200 MW** available under strict sustainability criteria.
- **December 22, 2025:** Alphabet announced the acquisition of Intersect to accelerate U.S. energy and data center projects.
- **February 2026:** Amazon guided to about **$200 billion** of 2026 capex; Alphabet guided to **$175-185 billion**; Meta and Microsoft remained at historically high run rates.

## Opportunities

- **Power-enabled land banking:** The scarcest asset is increasingly pre-entitled, power-proximate land.
- **Behind-the-meter generation and storage:** Gas, battery, geothermal, and eventually nuclear-linked solutions are moving from thesis to procurement pipeline.
- **Interconnect and fiber infrastructure:** Scale-across AI architecture increases the value of metro and long-haul fiber plus optical transport upgrades.
- **Cooling retrofits and AI conversions:** Legacy sites with strong interconnection may become attractive if they can be upgraded for higher densities.
- **Structured capital and JVs:** There is room for financial engineering around campuses, power assets, and long-duration leases.
- **Emerging regional hubs:** Markets adjacent to constrained hubs can capture spillover if they solve power and permitting.

## Risks

- **Power-delivery slippage:** The most important execution risk is that “announced” capacity lacks timely energized delivery.
- **Equipment bottlenecks:** Transformers, switchgear, and cooling systems can delay projects even after land and financing are secured.
- **Demand overshoot:** Some announced projects may reflect option-taking rather than hard near-term utilization.
- **Ratepayer and regulatory backlash:** As costs shift to grids and local communities, utilities and regulators may impose stricter cost recovery or siting rules.
- **Water and sustainability pressure:** High-density cooling and local water stress will sharpen permitting friction.
- **Geopolitical concentration:** Cross-border AI infrastructure, especially in politically sensitive regions, adds national-security and resilience concerns.

## Open Questions

- How much of the currently announced U.S. and global GW pipeline is truly financeable and energizable by 2028?
- Will inference become distributed quickly enough to change the current “mega-campus” bias?
- How far will utilities shift costs to developers through “bring your own power” or direct interconnection charges?
- Will open Ethernet gain enough ground against InfiniBand in the largest training clusters to materially alter network economics?
- How much will software and chip efficiency offset the brute-force power growth implied by current deployment plans?

## What to Monitor in the Next 12 Months

- Hyperscaler capex guidance persistence through 2026 earnings cycles, especially Amazon, Microsoft, Google, and Meta.
- Utility and regulator treatment of data center cost allocation in major U.S. markets.
- Evidence that behind-the-meter generation moves from pilot language to operating projects.
- Transformer, switchgear, and cooling-equipment lead times.
- Whether Stargate and other multi-GW campus announcements convert into measurable energized capacity.
- Signs of Microsoft-style pacing adjustments spreading to other hyperscalers.
- Interconnect architecture changes, especially multi-campus fabrics and 800G/1.6T optical deployment.
- Singapore/Johor dynamics and whether similar spillover patterns emerge elsewhere.
- EMEA permitting changes and any major policy response to grid congestion or water stress.
- Real lease-rate behavior in 10 MW+ deals; this is one of the cleanest indicators of whether scarcity remains acute.

## Future Outlook: 12-36 Months

### Base case

Construction remains strong, but the bottleneck shifts further upstream into energy and utility coordination. AI demand remains robust enough that any short-term pauses by individual hyperscalers are absorbed by other tenants or delayed, not cancelled, demand.

### Most likely market shape

- More capital goes to fewer, larger campuses.
- Secondary markets outperform legacy hubs on incremental growth.
- Self-build and lease models coexist.
- On-site generation and private energy solutions become standard in project evaluation.
- Networking architecture becomes a first-order real-estate variable because multi-site fabrics change where capacity can be placed.

### What could change the trajectory

- A major efficiency step-change in model serving or hardware could reduce some demand intensity.
- A power-policy backlash could slow approvals materially in certain markets.
- A macro shock could slow financing, but current hyperscaler balance sheets make a near-term collapse unlikely.

## Key Takeaways

1. AI is causing a genuine infrastructure supercycle, but the scarce unit is energized, networked AI-ready MW, not generic data center square footage.
2. Power availability now dominates site selection, project timing, and valuation.
3. Interconnect has become a structural bottleneck and a source of competitive advantage.
4. Regional diversification is accelerating because core hubs cannot absorb all AI growth.
5. Developer economics still look attractive, but only for platforms that can solve power, capital, and equipment simultaneously.
6. Hyperscalers are pursuing both self-build and leased capacity, not choosing one over the other.
7. Over the next 12-36 months, project execution discipline will matter more than headline announcements.

## Actionable Next Steps

1. Prioritize markets by **time to delivered power**, not by legacy data center reputation alone.
2. Underwrite projects using a **power-first diligence model** that explicitly tests substation, transformer, transmission, and backup-generation timelines.
3. Treat **interconnect strategy** as a core investment variable; require clarity on fiber paths, metro diversity, and cluster-scale network design.
4. Separate **announced capacity** from **energized or contracted capacity** in any market sizing or competitive analysis.
5. Build scenario models for **ratepayer backlash, utility cost-shifting, and permitting delays** in primary markets.
6. Track hyperscaler disclosures quarterly for changes in **capex, lease mix, backlog, and utilization signals**.
7. Evaluate opportunities in adjacent layers: **power development, cooling retrofits, fiber, and structured capital**, not just owned data center shells.

## Assumptions and Uncertainty Notes

- Company-announced GW figures often represent **planned**, **under-development**, or **contracted** capacity, not energized operational capacity.
- Global market forecasts vary because researchers define “capacity” differently: some refer to operational IT load, some to demand, and some to combined pipeline.
- Construction-cost figures are not fully comparable across reports because some include only shell-and-core while others discuss fit-out or IT equipment separately.
- Medium-term demand could be lower than current announcements imply if AI efficiency improves faster than deployment, or if enterprises slow monetization of AI workloads.

## Sources and Further Reading

### Primary and official sources

- IEA, *Energy and AI* (2025): https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai
- U.S. DOE announcement on Berkeley Lab data center power report (Dec. 20, 2024): https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers
- Berkeley Lab summary of the 2024 U.S. report (Jan. 15, 2025): https://newscenter.lbl.gov/2025/01/15/berkeley-lab-report-evaluates-increase-in-electricity-demand-from-data-centers/
- OpenAI, *Announcing The Stargate Project* (Jan. 21, 2025): https://openai.com/index/announcing-the-stargate-project/
- OpenAI, *Stargate advances with 4.5 GW partnership with Oracle* (Jul. 22, 2025): https://openai.com/index/stargate-advances-with-partnership-with-oracle/
- OpenAI, *Five new Stargate sites* (Sep. 23, 2025): https://openai.com/index/five-new-stargate-sites
- OpenAI, *Expanding Stargate to Michigan* (Oct. 30, 2025): https://openai.com/index/expanding-stargate-to-michigan//
- Amazon Q4 2025 results: https://www.aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report
- Microsoft FY26 Q2 results and cash flows: https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q2/press-release-webcast and https://www.microsoft.com/en-us/investor/earnings/fy-2026-q2/cash-flows
- Alphabet Q4 2025 earnings call transcript: https://abc.xyz/investor/events/event-details/2026/2025-Q4-Earnings-Call-2026-Dr_C033hS6/default.aspx
- Alphabet acquisition of Intersect (Dec. 22, 2025): https://abc.xyz/investor/news/news-details/2025/Alphabet-Announces-Agreement-to-Acquire-Intersect-to-Advance-U-S--Energy-Innovation-2025-DVIuVDM9wW/default.aspx
- Meta Q4 and full-year 2025 results: https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx
- Meta / Blue Owl Hyperion JV (Oct. 21, 2025): https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/
- Singapore IMDA / EDB DC-CFA2 launch (Dec. 1, 2025): https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/factsheets/2025/launch-of-second-data-centre
- NVIDIA photonics networking announcement (Mar. 18, 2025): https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Announces-Spectrum-X-Photonics-Co-Packaged-Optics-Networking-Switches-to-Scale-AI-Factories-to-Millions-of-GPUs/default.aspx
- NVIDIA Spectrum-XGS (Aug. 22, 2025): https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Introduces-Spectrum-XGS-Ethernet-to-Connect-Distributed-Data-Centers-Into-Giga-Scale-AI-Super-Factories/default.aspx
- Arista AI networking announcement (Mar. 12, 2025): https://investors.arista.com/Communications/Press-Releases-and-Events/Press-Release-Detail/2025/Arista-Introduces-Intelligent-Innovations-for-AI-Networking/
- CoreWeave Q4/FY2025 results: https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Fourth-Quarter-and-Fiscal-Year-2025-Results

### High-signal industry research

- CBRE, *North America Data Center Trends H1 2025*: https://www.cbre.com/insights/reports/north-america-data-center-trends-h1-2025
- CBRE, *North America Data Center Trends H2 2025* summary: https://www.cbre.com/press-releases/fast-growing-north-american-data-center-market-set-records-in-2025
- JLL, *2025 Global Data Center Outlook*: https://www.jll.com/en-us/newsroom/global-data-center-demand-surges-despite-supply-and-power-constraints
- JLL, *2026 Global Data Center Outlook*: https://www.jll.com/en-uk/insights/market-outlook/global-data-centers
- Cushman & Wakefield, *2025 Global Data Center Market Comparison*: https://www.cushmanwakefield.com/en/news/2025/05/demand-for-data-infrastructure-fuels-real-estate-transformation-across-global-data-center-markets
- Cushman & Wakefield, *APAC Data Centre Update H1 2025*: https://www.cushmanwakefield.com/en/Singapore/Insights/APAC-Data-Centre-Update
- Cushman & Wakefield, *EMEA Data Centre Market Update H2 2025*: https://www.cushmanwakefield.com/en/insights/emea-data-centre-update
- Cushman & Wakefield, *Asia Pacific Data Centre Construction Cost Guide 2025*: https://www.cushmanwakefield.com/en/insights/apac-data-centre-construction-cost-guide
- McKinsey, *AI power: Expanding data center capacity to meet growing demand* (Oct. 29, 2024): https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/ai-power-expanding-data-center-capacity-to-meet-growing-demand
- McKinsey, *Data center demands* (May 20, 2025): https://www.mckinsey.com/featured-insights/week-in-charts/data-center-demands
- McKinsey, *The next big shifts in AI workloads and hyperscaler strategies* (Dec. 17, 2025): https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-next-big-shifts-in-ai-workloads-and-hyperscaler-strategies
