# AI Infrastructure Spend: A Bottoms-Up Value-Capture Model

**Date:** March 26, 2026  
**Prepared for:** User  
**Classification:** General Research

## Executive Summary

The center of gravity in AI infrastructure spend remains the accelerator stack, but the economic bottleneck is broadening. In a current-state base case for a new-build, self-built hyperscale AI data center, I estimate that each **$1.00 of AI data center capex** economically accrues approximately as follows: **$0.34 to GPU platform vendors, $0.08 to networking, $0.10 to memory, $0.06 to foundries/advanced packaging, $0.04 to server assembly, $0.02 to racks, $0.08 to power equipment, $0.05 to cooling, $0.15 to construction, and $0.08 to facility ownership/land/developer economics**.

The simplest way to interpret that result is: **AI capex is still compute-led, but it is no longer compute-only**. Alphabet disclosed that roughly **60%** of its 2025 technical infrastructure capex went to servers and **40%** to data centers and networking equipment, while JLL estimates AI tech fit-out can reach **$25 million per MW** versus roughly **$11.3 million per MW** for shell-and-core construction in 2026. Those two anchors imply that the accelerator cluster still dominates the capex stack, but the supporting physical plant is now too large to treat as a rounding error.

Over the next three years, the mix is likely to shift away from pure GPU capture and toward **memory, foundries/advanced packaging, networking, power, and cooling**. The reason is structural: racks are moving from 30-40 kW class systems toward **120-142 kW today** and are being designed for even higher densities after that. This raises the value of HBM, advanced packaging, optical interconnects, liquid cooling, switchgear, UPS, and behind-the-meter power. At the same time, **server assembly is likely to become a smaller share of the pool**, because rack-scale systems are becoming more vertically integrated by NVIDIA and hyperscalers, compressing OEM/ODM differentiation.

The highest-conviction conclusion is that the winners of the next phase of AI infrastructure buildout are not just NVIDIA and the memory suppliers. The strongest second-derivative value pools are likely to be **TSMC/advanced packaging, HBM vendors, high-end networking, power train vendors, liquid cooling vendors, and owners of power-entitled sites**. The weakest relative pool is traditional server assembly, where volumes are rising but margins remain thin.

## Scope, Definitions, and Assumptions

This model is a **bottoms-up value-capture model**, not an accounting model for any single company.

Key assumptions:

- The unit of analysis is **$1 of capex for a new-build hyperscale AI data center**, primarily optimized for frontier training and high-end inference.
- The model is most applicable to **self-built hyperscaler or neocloud campuses** in the U.S. or similar markets, not retail colocation leases.
- Categories are **mutually exclusive economic-capture buckets**. For example, the **foundry** bucket represents value captured by wafer fabrication and advanced packaging providers that is embedded inside GPUs, networking silicon, and controllers; it is carved out separately rather than double-counted inside GPU vendor revenue.
- Facility ownership includes **land, site control, developer/owner economics, and capitalized owner-side costs**, not recurring rental revenue.
- Construction includes **shell/core plus site work and labor-heavy MEP execution**, while power and cooling capture the major equipment pools that sit on top of construction labor.
- Because public BOM disclosure is limited, the decomposition below uses public company disclosures, industry cost anchors, and explicit assumptions where granular supplier pricing is not public.

## Current Landscape

### Why this matters now

AI infrastructure has become one of the largest capex reallocations in modern technology. The spending base is no longer just a server refresh cycle; it is a combined **semiconductor, electrical equipment, mechanical systems, and real estate** cycle.

Recent public disclosures show the scale:

- Alphabet said 2025 capex was **$91.4 billion**, and that the vast majority of technical infrastructure capex went to servers, with **about 60% in servers and 40% in data centers and networking equipment**. It also guided to **$175-185 billion** of capex for 2026.
- Meta reported **$72.22 billion** of 2025 capex and guided to **$115-135 billion** for 2026.
- JLL estimates nearly **100 GW** of new data center capacity will be added between 2026 and 2030, requiring up to **$3 trillion** of total data center spend, including tenant IT fit-out.

### Core concept

There are now two linked capex stacks:

1. The **IT fit-out stack**: GPUs/ASICs, HBM, NICs, switches, optics, boards, chassis, PSUs, rack integration.
2. The **facility stack**: shell/core, electrical distribution, UPS, switchgear, transformers, generators, liquid cooling infrastructure, and increasingly site-level power generation/storage.

Historically, investors over-focused on the first stack. That is increasingly incomplete.

## Bottoms-Up Model: Where $1 of AI Data Center Capex Accrues Today

### Base-case allocation

| Category | Current estimate per $1 capex | What this captures |
|---|---:|---|
| GPUs | $0.34 | NVIDIA/AMD accelerator platform economics excluding memory and foundry value carved out below |
| Networking | $0.08 | Back-end and front-end switching, NICs, DPUs, optics, cables |
| Memory | $0.10 | HBM first, plus server DRAM and a modest storage component |
| Foundries | $0.06 | TSMC and other wafer fabrication/advanced packaging economics embedded in AI silicon |
| Server assembly | $0.04 | OEM/ODM integration, motherboards, chassis, power shelves, final system integration |
| Racks | $0.02 | Cabinets, rails, in-rack busbars, rack PDUs, enclosure mechanics |
| Power | $0.08 | UPS, transformers, switchgear, generators, battery systems, power distribution |
| Cooling | $0.05 | CDUs, pumps, chillers, towers, manifolds, direct-liquid-cooling equipment |
| Construction | $0.15 | Shell/core, site work, general construction, labor-heavy MEP execution |
| Facility ownership | $0.08 | Land, site control, developer/owner economics, capitalized owner overhead |
| **Total** | **$1.00** |  |

### Uncertainty ranges

Public disclosure is strongest at the **top level** and weakest inside the detailed component BOM. A reasonable current range for the main buckets is:

- **GPU platform vendors:** $0.30-0.38
- **Networking:** $0.06-0.10
- **Memory:** $0.08-0.12
- **Foundries/advanced packaging:** $0.05-0.08
- **Server assembly:** $0.03-0.06
- **Power + cooling combined:** $0.11-0.17
- **Construction + facility ownership combined:** $0.19-0.27

The base case above should be read as a **midpoint estimate**, not a precise invoice-level truth.

### Why these numbers are reasonable

#### 1. Servers and networking still dominate the spend stack

Alphabet is the cleanest public anchor. Its CFO said that for 2025, about **60%** of investment went to “machines” and **40%** to data centers and networking equipment, and that 2026 would be “fairly similar.” That makes a 56-62% IT-heavy share a reasonable starting point for hyperscale AI deployments.

JLL arrives at a similar conclusion from a different angle: in 2026, average shell-and-core construction cost is forecast at **$11.3 million per MW**, while AI tech fit-out can cost **as much as $25 million per MW**. That implies the IT and facility-equipment layer is at least as important as the building itself, and often more so.

#### 2. GPU platform vendors remain the single largest value-capture pool

Inside the server bucket, the accelerator complex still dominates. NVIDIA’s rack-scale systems show why: the **GB200 NVL72** puts **72 Blackwell GPUs and 36 Grace CPUs in a single liquid-cooled rack**, and the network fabric is tightly integrated with the compute platform. The accelerator is still the economic center of the system.

That said, I do **not** allocate 40-50 cents of the dollar to “GPUs” because too much of that would really belong to memory and foundries. The economically cleaner estimate is **$0.34** to GPU platform vendors after carving out HBM and foundry capture separately.

#### 3. Memory is now a first-order capex bucket, not a secondary component

HBM has become a core value-capture pool because AI accelerators are increasingly memory-constrained and memory-content-per-accelerator keeps rising. Micron’s latest results show how large this has become: its cloud memory business reached **$5.284 billion** of quarterly revenue in fiscal Q1 2026 with **66% gross margin**, underscoring how valuable AI-linked memory has become. TrendForce and industry reporting also point to continued tightness as HBM4 ramps.

That supports assigning roughly **$0.10** of each AI capex dollar to memory suppliers.

#### 4. Foundries deserve their own bucket

TSMC is no longer just a background supplier in AI economics. In its January 16, 2025 earnings call, TSMC said revenue from AI accelerators was **close to the mid-teens percent of total 2024 revenue**, and that this revenue would **double in 2025**. It also guided 2025 capex of **$38-42 billion**, with **10-20%** allocated to advanced packaging, testing, mask-making, and related items.

That makes foundry and advanced packaging a distinct economic capture pool. I estimate about **$0.06 per $1 of AI data center capex** accrues here today, with upside as CoWoS and equivalent advanced packaging become more important.

#### 5. Server assembly is strategically important but economically weak

The OEM/ODM layer is critical operationally, but it captures less value than many investors assume. Supermicro’s results are a useful public proxy: despite strong AI-driven growth, its Q4 FY2025 gross margin was only **9.5%**. This is consistent with a world where assembly is necessary, but pricing power is limited.

That justifies a modest **$0.04** allocation to server assembly.

#### 6. Power and cooling are moving from support functions to primary bottlenecks

The old model of treating electrical and thermal infrastructure as commodity “facility overhead” is breaking down.

- NVIDIA’s **GB200 NVL72** is a liquid-cooled rack-scale architecture.
- Vertiv’s GB300 NVL72 reference architecture supports **up to 142 kW per rack**.
- JLL says the average wait for a grid connection in primary markets now exceeds **four years**, which is pushing operators toward behind-the-meter power and battery storage.

That supports a combined **$0.13** allocation today to **power ($0.08)** and **cooling ($0.05)**, with likely upside over the next three years.

## Key Players and Where They Capture Value

### GPUs

- **NVIDIA**: still the dominant economic center of the AI capex stack.
- **AMD**: growing challenger, especially if MI-series racks and open designs gain share.

### Networking

- **NVIDIA**: InfiniBand, Ethernet, DPUs, integrated NVLink system fabric.
- **Broadcom**: merchant switching and interconnect exposure.
- **Arista** and optics vendors: front-end Ethernet and cluster interconnect.

### Memory

- **SK hynix**: HBM leader.
- **Micron**: increasingly material HBM and cloud memory beneficiary.
- **Samsung**: likely to remain relevant as HBM4 ecosystem broadens.

### Foundries and advanced packaging

- **TSMC**: overwhelmingly the key value-capture node in leading-edge AI silicon and CoWoS-class packaging.
- Packaging and substrate ecosystem players matter, but TSMC remains the main bottleneck.

### Server assembly and rack integration

- **Supermicro**, **Dell**, **HPE**, **Quanta**, **Wiwynn**, **Foxconn**, **Inventec**.
- This is a scale business with operational relevance but structurally lower capture.

### Power and cooling

- **Vertiv**, **Eaton**, **Schneider Electric**: electrical train and thermal infrastructure.
- **Modine**, **Carrier**, **Trane**, and liquid-cooling component suppliers.

### Construction and facility ownership

- Hyperscalers building directly.
- Large developers/operators such as **Digital Realty**, **Equinix**, **QTS/Blackstone**, and power-entitled private developers.

## Recent Developments

- **Capex escalation has accelerated, not paused.** Alphabet and Meta both stepped up guidance materially in early 2026.
- **Rack density is still climbing.** The market has already moved from H100-era air-cooled clusters toward **120-142 kW liquid-cooled racks**, and roadmaps point higher.
- **Memory and packaging remain constrained.** TSMC is still expanding advanced packaging; Micron and peers are still ramping HBM supply.
- **Power has become a gating factor.** JLL’s data on multi-year grid waits confirms that the bottleneck is shifting from “Can I buy GPUs?” to “Can I energize and cool them on schedule?”

## How the Mix Is Likely to Change Over the Next 3 Years

### Expected 2028 mix

| Category | Current | Likely in 2028 | Direction |
|---|---:|---:|---|
| GPUs | $0.34 | $0.30 | Down modestly |
| Networking | $0.08 | $0.10 | Up |
| Memory | $0.10 | $0.12 | Up |
| Foundries | $0.06 | $0.08 | Up |
| Server assembly | $0.04 | $0.03 | Down |
| Racks | $0.02 | $0.03 | Up modestly |
| Power | $0.08 | $0.10 | Up |
| Cooling | $0.05 | $0.07 | Up |
| Construction | $0.15 | $0.12 | Down as share, not necessarily dollars |
| Facility ownership | $0.08 | $0.05 | Down as share, except in power-scarce markets |
| **Total** | **$1.00** | **$1.00** |  |

### Interpretation

#### What grows as a share

- **Memory**: HBM content per rack will rise further.
- **Foundries**: advanced packaging intensity increases with larger packages and more complex chiplets.
- **Networking**: inference at scale and distributed AI raise the importance of front-end and back-end networking.
- **Power and cooling**: higher rack density forces more spend into electrical and thermal systems.

#### What shrinks as a share

- **GPU platform capture** declines modestly as the rest of the system becomes more expensive, even if GPU dollars still rise in absolute terms.
- **Server assembly** shrinks because NVIDIA and hyperscalers are standardizing more of the rack.
- **Construction and facility ownership** likely shrink as a share because the cost of the tech stack and MEP equipment rises faster than the building shell. In absolute dollars, these categories may still increase.

## Analysis and Tensions

### Bull case

The bull case is that AI capex remains durable because the use cases are broadening from one-time model training to revenue-generating inference. If that happens, the spend stack broadens, not narrows: more regional clusters, more networking, more power distribution, more memory, and more retrofit work.

### Bear case

The bear case is not “AI spend disappears.” It is that **the mix shifts faster than expected**:

- from training to inference,
- from GPUs to custom ASICs,
- from centralized mega-clusters to a more distributed topology,
- and from premium near-term procurement to more normalized purchasing.

That would pressure the pure-GPU share of value capture while helping networking, memory, and power-enabled infrastructure.

### The most important second-order effect

The industry is entering a phase where **power entitlement and deployment speed** may matter more than nominal semiconductor demand. The scarcest asset may not be the chip. It may be the **energized, liquid-cooling-ready MW**.

## Practical Opportunities

- **Power and cooling vendors** look like the strongest underappreciated second-derivative beneficiaries.
- **HBM and foundry exposure** remain attractive because they benefit whether the winning accelerator is a GPU or a hyperscaler ASIC.
- **Power-entitled land and facility ownership** can be valuable when utility interconnection is the true bottleneck.
- **Networking** is likely to gain share as clusters scale and inference becomes more distributed.
- **Construction firms with data-center MEP specialization** should benefit, but labor scarcity and fixed-price contracting can dilute margins.

## Risks and Challenges

- **Power bottlenecks**: grid delays can strand capex and delay revenue realization.
- **Packaging bottlenecks**: CoWoS and related advanced packaging remain concentrated.
- **HBM cyclicality**: memory can be structurally attractive and still violently cyclical.
- **GPU concentration risk**: too much of the stack still depends on NVIDIA roadmaps and supply.
- **Policy and trade risk**: export controls, tariffs, and industrial policy can change supplier economics quickly.
- **Accounting opacity**: investors still struggle to distinguish short-life AI hardware from long-life building assets in reported capex.

## Open Questions

- How much of 2026-2028 capex will shift from GPU clusters to custom ASIC fleets?
- Will HBM remain supply constrained through 2027, or does HBM4 broaden supply fast enough to compress memory economics?
- How quickly does AI inference become the dominant workload mix, and what does that do to regional infrastructure demand?
- Do hyperscalers continue self-building, or does constrained power force more third-party development and lease structures?
- How much of future “power” capex moves on-site into gas generation, battery storage, and private-wire infrastructure?

## What to Monitor in the Next 12 Months

- **Hyperscaler capex guidance** from Alphabet, Meta, Microsoft, Amazon, and Oracle.
- **HBM pricing and allocation**, especially HBM4 qualification and yield.
- **TSMC advanced packaging expansion**, especially CoWoS capacity and lead times.
- **Rack power roadmaps**, including adoption of 142 kW-plus systems and progress toward much higher-density power architectures.
- **Utility interconnection timelines** and the rise of behind-the-meter power projects.
- **NVIDIA system integration depth**, because more vertical integration reduces OEM/ODM capture.
- **ASIC announcements** from hyperscalers, which could redistribute value from GPU vendors toward memory, foundries, and networking.
- **Real estate and developer pricing** for powered sites in top-tier and second-tier markets.

## Actionable Next Steps

1. Build a linked model with three tabs: **capex guidance by buyer**, **$/MW facility cost**, and **$/rack IT BOM**. Most investors track only the first.
2. Treat **HBM and advanced packaging** as separate line items in any semiconductor model rather than rolling them into a generic “GPU” bucket.
3. Re-underwrite **server assembly** as a low-capture, operationally important layer; avoid giving OEMs accelerator-like multiples without evidence of sustained margin expansion.
4. Add a dedicated **power bottleneck dashboard**: interconnection queue time, gas-turbine lead times, UPS/switchgear lead times, and liquid-cooling deployment cadence.
5. Track the split between **self-build and third-party capacity**, because that determines whether value accrues to facility owners/developers or stays inside hyperscaler capex.
6. Run at least two forward scenarios: **GPU-dominant** and **ASIC-mix expansion**. The likely winners differ less than many assume, but the relative capture of GPUs versus memory/foundries/networking changes materially.

## Bottom Line

Today’s AI data center capex dollar still belongs primarily to the accelerator stack, but the next three years should see the value pool broaden materially. The likely direction is **less concentration in pure GPU economics and more capture by memory, foundries, networking, power, cooling, and power-entitled infrastructure**. For decision-making, the main mistake to avoid is modeling AI infrastructure as if it were only a semiconductor story. It is now equally a **power systems, thermal systems, and deployment-speed** story.

## Sources and Further Reading

### Primary sources

- Alphabet Q4 2025 earnings call transcript: https://abc.xyz/investor/events/event-details/2026/2025-Q4-Earnings-Call-2026-Dr_C033hS6/default.aspx
- Meta Q4 and FY2025 results: https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx
- TSMC Q4 2024 earnings call transcript: https://investor.tsmc.com/english/encrypt/files/encrypt_file/reports/2025-01/84aeb15bbe33894365d33f52e027c5268ba95dcf/TSMC%204Q24%20Transcript.pdf
- Micron fiscal Q1 2026 results: https://investors.micron.com/news-releases/news-release-details/micron-technology-inc-reports-results-first-quarter-fiscal-2026
- NVIDIA GB200 NVL72 product page: https://www.nvidia.com/en-us/data-center/gb200-nvl72/
- Vertiv GB300 NVL72 reference architecture release: https://www.prnewswire.com/news-releases/vertiv-develops-energy-efficient-cooling-and-power-reference-architecture-for-the-nvidia-gb300-nvl72-platform-available-as-simready-assets-in-nvidia-omniverse-blueprint-for-ai-factory-design-and-operations-302478919.html
- Supermicro FY2025 Q4 results: https://ir.supermicro.com/news/news-details/2025/Supermicro-Announces-Fourth-Quarter-and-Full-Fiscal-Year-2025-Financial-Results/default.aspx

### Expert analysis and market reports

- JLL 2026 Global Data Center Outlook: https://www.jll.com/en-sea/insights/market-outlook/global-data-centers
- CBRE Global Data Center Trends 2025: https://www.cbre.com/insights/reports/global-data-center-trends-2025
- TrendForce AI server market coverage: https://www.trendforce.com/presscenter/news/Semiconductors?page=19
- TrendForce 2025 AI server scenarios: https://www.trendforce.com/presscenter/news/20250212-12469.html
- TrendForce liquid cooling and rack-density outlook: https://www.trendforce.com/presscenter/news/20250821-12682.html
- TrendForce CSP capex outlook: https://www.trendforce.com/presscenter/news/20260225-12934.html
- SemiAnalysis GB200 component and supply-chain model: https://semianalysis.com/gb200-model/
