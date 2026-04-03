# System Decomposition Methodologies: A Comprehensive Research Brief

**Date:** 2026-03-17
**Classification:** General Research

---

## Executive Summary

System decomposition -- the practice of breaking complex systems into manageable, buildable components -- is one of the most consequential activities in engineering. Done well, it reveals the natural structure hidden inside problems, exposes bottlenecks before they become crises, and produces build sequences that deliver value incrementally. Done poorly, it creates distributed monoliths, premature abstractions, and teams building the wrong things.

This brief synthesizes three distinct but complementary approaches: (1) classical systems engineering from INCOSE/NASA with its rigorous functional decomposition, N-squared diagrams, and interface analysis; (2) Elon Musk's "Algorithm" -- a 5-step process born from Tesla's production hell that ruthlessly questions requirements and deletes before optimizing; and (3) Palantir's ontology-based discovery methodology, where Forward Deployed Engineers embed with users to discover what to build bottoms-up before decomposing discovered patterns into platform primitives.

The key tension across all three: **top-down decomposition vs. bottom-up discovery**. Classical SE decomposes from requirements. Musk decomposes by questioning whether requirements should exist at all. Palantir discovers what to build through embedded deployment, then decomposes after discovery. The most powerful approach combines all three -- using classical rigor for structure, Musk's algorithm for elimination, and Palantir's discovery for validation.

---

## 1. Classical Systems Engineering Decomposition

### Functional Decomposition

The foundational method. Top-down, iterative: start with the highest-level system function and progressively break it into subfunctions until each block performs a single, pure function.

**The "and/or" test:** Each block in a diagram should be describable without using "and" or "or" -- this forces pure function assignment, enabling reuse, replacement, and simple interfaces.

**Three types of decomposition (INCOSE/ISO 15288):**
- **Functional** -- what the system does (functions)
- **Physical** -- what performs those functions (hardware, software)
- **Hierarchical** -- nested levels where higher-level components comprise lower-level ones

**Three flows to track:** material, energy, and information.

**Key insight:** INCOSE recommends using *multiple methods* to reveal a comprehensive set of elementary functions, then clustering and composing these into a functional architecture. No single method catches everything.

### Functional Flow Block Diagrams (FFBDs)

Developed by TRW in the 1950s, adopted by NASA in the 1960s. Multi-tier, time-sequenced, step-by-step flow diagrams capturing both functional sequence and functional hierarchy.

**Numbering convention:** Level 1 functions are 1.0, 2.0, 3.0. When 2.0 is decomposed, children become 2.1, 2.2, 2.3. This provides traceability through the hierarchy.

### N-Squared (N²) Diagrams

Invented by Robert J. Lano at TRW in 1977. An N x N matrix where diagonal cells contain system elements and off-diagonal cells capture interfaces.

**What it reveals:**
- **Orphan elements:** functions with no connections (possibly unnecessary)
- **Feedback loops:** cyclic patterns indicating tight interdependencies
- **Single points of failure:** centralized connections with no redundancy
- **Interface density:** heavily populated rows/columns indicate high coupling
- **Hidden natural structure:** subsystem boundaries that aren't obvious from requirements alone

**Critical finding:** When combined with FFBDs, the N² matrix becomes "a very powerful system architecting tool to identify potential subsystems and critical system elements."

### Interface Analysis

NASA's process: during ConOps analysis, identify origin, destination, stimuli, and special characteristics of each interface. Key principle: an ICD should describe *only the interface itself* -- not the characteristics of connecting systems. This separation enables independent development.

### Work Breakdown Structures (WBS)

MIL-STD-881F (2022). A **product-oriented** family tree -- explicitly NOT function-oriented or cost-oriented. This is a crucial distinction from functional decomposition. The WBS addresses products required, not functions.

### Subsystem Boundary Identification

System boundaries are **arbitrary constructs** -- mental models created because of their usefulness.

**Key criteria:**
| Criterion | Guidance |
|-----------|----------|
| Coupling | Minimize dependencies between subsystems |
| Cohesion | Maximize internal relatedness |
| Purpose alignment | Components contributing to the subsystem's primary objective |
| Observable functions | All valid functions should be observable at the boundary |
| Team structure | Boundaries often align with organizational boundaries |
| Manufacturing/test | Physical assembly, testing, logistics considerations |

**Critical insight:** Boundaries and requirements co-evolve. The iteration between subsystem architecture and requirement refinement is essential, not a sign of failure.

### The V-Model

Links decomposition (left arm) to integration and verification (right arm). Every requirement during decomposition has a corresponding verification activity during integration. Requirements cascade down; verification evidence moves up.

---

## 2. Elon Musk's Algorithm and First Principles

### The 5-Step Engineering Process

Developed during Tesla's Model 3 "production hell." Walter Isaacson calls it "The Algorithm." Musk's executives reportedly mouth the words "like liturgy."

**Step 1: Question Every Requirement**
- "Your requirements are definitely dumb; it does not matter who gave them to you."
- Each requirement must be attributed to a specific person by name -- never a department.
- "Requirements from smart people are the most dangerous, because people are less likely to question them."

**Step 2: Delete Any Part or Process You Can**
- "If you do not end up adding back at least 10% of them, then you didn't delete enough."
- "The best part is no part. The best process is no process. It weighs nothing. Costs nothing. Can't go wrong."

**Step 3: Simplify and Optimize**
- "The most common error of a smart engineer is to optimize the thing that should not exist."
- Only optimize what survives Steps 1 and 2.

**Step 4: Accelerate Cycle Time**
- "Every process can be speeded up. But only do this after you have followed the first three steps."
- "Don't go faster until you've worked on the other three things first."

**Step 5: Automate**
- Automation comes last, never first.
- "The big mistake in [my factories] was that I began by trying to automate every step."

**Why order matters:** Most engineers instinctively start at Step 5 (automate) or Step 3 (optimize). As Tim Berry put it: "Most people start with Step 5, and they automate a process that never should have existed."

### The Idiot Index

The ratio of a finished component's cost to the cost of its raw materials. Any ratio > 10:1 is a prime candidate for improvement. Rocket raw materials represent only ~2% of typical rocket price -- this convinced Musk to build SpaceX.

### First Principles Thinking

Two modes of reasoning:
- **By analogy** (default): "things must be done this way because they've always been done this way"
- **First principles**: boil down to fundamental truths and rebuild from there

Process: identify conventional claim -> break into fundamental parts -> question which assumptions are provable vs inherited -> research empirical fundamentals -> reconstruct from ground up.

### Key Examples

**Raptor Engine (1 -> 2 -> 3):**
- Raptor 1: 2,080 kg, 185 tons thrust, "looked like a Christmas tree"
- Raptor 2: 1,630 kg (22% lighter), 230 tons thrust (24% more), 40% cheaper
- Raptor 3: 40% lighter system weight than v2, 280 tons thrust (51% more than v1)
- Technique: eliminated heat shield, external plumbing, bolted flanges; used 3D printing

**Starship carbon fiber -> stainless steel:**
- Carbon fiber: ~$200/kg effective, melts at 300-400°F
- Stainless steel: ~$3/kg (60x cheaper), melts at 1,500-1,600°F, strength increases 50% at cryogenic temps
- The industry was reasoning by analogy, not physics

**Tesla Flufferbot:**
- Robot placed fiberglass insulation mat on battery pack to dampen noise
- Robot kept failing, blocking production line
- Tested car with and without mat: no change in cabin noise
- Deleted the part AND the robot. Battery pack production: 7 hours -> 17 minutes

**Tesla Gigacasting:**
- Single die-cast piece replacing ~400 conventional parts
- Development timelines: 3-4 years -> 18-24 months

### Critical Path Identification

1. Find the bottleneck first
2. Keep asking "why" until root cause
3. Resolve bottleneck before touching anything else
4. Co-locate teams for immediate feedback

Tesla's bottleneck progression: battery assembly -> body assembly -> cell supply -> lithium supply -> AI chip manufacturing. Continuous Theory of Constraints application.

**Psychology of false critical paths:** Many things assumed to be on the critical path are unnecessary entirely. The real critical path only becomes visible after unnecessary requirements are stripped away.

---

## 3. Palantir's Ontology-Based Discovery

### The Ontology

Three-layer architecture:
- **Semantic Layer:** Objects, properties, links -- pure domain modeling as decomposition
- **Kinetic Layer:** Actions as first-class citizens; behavior decomposed into discrete, governed operations
- **Dynamic Layer:** Business rules, AI models, simulations, real-time reasoning

Key principle: the ontology connects fragmented data, logic, and action, allowing translation to a shared conceptual model to happen *once* rather than every time a new application is built. "An SDK of your ontology is an SDK of your business."

### Forward Deployed Engineers (FDEs)

Core mindset: "You don't actually know the thing to build, and you're going to discover it bottoms-up with users."

**Two-team structure:**
- **Echo teams:** Domain insiders who unearth real problems
- **Delta teams:** Rapid-prototyping engineers who ship "the scrappy v0 in weeks, not quarters"

**Discovery process:**
1. Build the "gravel road" -- minimum viable path that solves the user's pain point
2. This exposes patterns (reusable primitives, workflows)
3. Platform synthesis: identify buildable abstractions from cross-client patterns

**Critical insight:** The FDE model inverts the typical build process. Instead of decomposing a known system into parts, Palantir *discovers* what the system should be through embedded deployment, then decomposes discovered patterns into platform primitives. Decomposition happens *after* discovery.

### Foundry Pipeline Decomposition

4-stage architecture:
1. **Datasource Project** -- raw data sync and cleanup
2. **Transform Project** -- canonical, reusable datasets
3. **Ontology Project** -- operational objects
4. **Application Layer** -- operational applications

Decomposition boundaries driven by **ownership, permissions, and data freshness** -- not just technical concerns. Conway's Law thinking.

### AIP (AI Decomposition)

AI is decomposed as fundamentally **decision-centric**, not model-centric. Every decision decomposes into: data (information), logic (evaluation), action (execution). The Ontology integrates all three. AI agents create *proposals* rather than directly making changes.

### TITAN / SDSI

Software Defined Systems Integration: all key components use government, open-source, and commercial standards. Software comprised of **capability modules** that are: highly cohesive, loosely coupled, extensible, interoperable, and fully severable. The Army's first "AI-defined vehicle" -- software defines vehicle capabilities, hardware becomes substrate.

---

## 4. Decomposition Anti-Patterns

### Premature Decomposition
Decomposing without observability, CI/CD, and ownership model. "It's worse to pick the wrong abstraction than no abstraction." "Duplication is cheaper than the wrong abstraction."

### Wrong Abstraction Boundaries
Decomposing into technical layers instead of business boundaries. A wrong decomposition means wrong architecture, leading to complete rewrites.

### Over-Decomposition (Nanoservices)
Too many small services creating excessive complexity. If two services collaborate heavily, they should be one service.

### Distributed Monolith
Tightly coupled services in distributed environment. Worse than an actual monolith: all downsides of distributed, none of the benefits.

### Bounded Context Misconception
"Bounded Contexts are the exact opposite of Microservices." A BC defines boundaries of the **biggest services possible**. Many teams wrongly equate them with microservices, leading to over-decomposition.

---

## 5. Risk/Value Prioritization

### The Risk-Value Quadrant
| | High Value | Low Value |
|---|---|---|
| **High Risk** | Build FIRST | AVOID |
| **Low Risk** | Build second | Defer/delegate |

### Recommended Build Sequence
1. **Walking skeleton** -- end-to-end thin slice proving the architecture
2. **High-risk/high-value subsystems** -- address uncertainty early
3. **Foundation/platform subsystems** -- things other subsystems depend on
4. **Value-delivering features** -- build outward from proven skeleton
5. **Low-risk/low-value features** -- defer or cut

---

## 6. From Decomposition to Action Plans

### Walking Skeleton (Alistair Cockburn)
"A tiny implementation performing a small, end-to-end function." Comes *before* an MVP. Focus on infrastructure, not features: deployment, CI, monitoring. Prevents architectural problems.

### Dependency Mapping
1. List all components
2. Identify dependencies (inputs, information, approvals)
3. Identify high-priority items and focus on dependency resolution before work begins
4. Identify bottlenecks, risks, and critical paths

### Architecture Quantum
"Independently deployable artifacts with high functional cohesion, high static coupling, and synchronous dynamic coupling." The unit of decomposition analysis.

### Fitness Functions
Tests for software architecture (not domain logic). Validate architecture characteristics. Rule of thumb: "Is any domain knowledge required to execute this test?" If no, it's a fitness function.

---

## Key Takeaways

1. **The three approaches are complementary, not competing.** Classical SE provides structure, Musk's Algorithm provides elimination discipline, Palantir's approach provides discovery methodology.

2. **Delete before optimize.** The most common engineering error is optimizing something that shouldn't exist. Musk's 10% add-back rule is a diagnostic for whether you've deleted enough.

3. **Boundaries and requirements co-evolve.** The idea of decomposing fixed requirements is a simplification. Iterate between architecture and requirements.

4. **N² diagrams reveal hidden structure.** They're an architectural *discovery* tool, not just documentation.

5. **Discovery before decomposition.** Palantir's FDE model shows that for novel systems, you discover what to build through embedded deployment, then decompose.

6. **Build high-risk/high-value first.** Walking skeleton -> risky subsystems -> platform -> features -> low-value items.

7. **Avoid premature decomposition.** Duplication is cheaper than the wrong abstraction. Bounded contexts define the biggest possible services, not the smallest.

---

## Sources

### Classical Systems Engineering
- [INCOSE SE Handbook v5.0](https://www.incose.org/resources-publications/technical-publications/se-handbook/)
- [NASA SE Handbook SP-6105 Rev 2](https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf)
- [MIL-STD-881F](https://www.dau.edu/cop/se/documents/mil-std-881-work-breakdown-structures-defense-materiel-items)
- [Lano's Original N² Chart Report (1977)](https://bpb-us-w1.wpmucdn.com/sites.usc.edu/dist/a/54/files/2022/09/Lano-the-N2-chart-TRW-1977-hi-res-used-courtesy-of-Northrop-Grumman.pdf)

### Elon Musk's Algorithm
- [Walter Isaacson, "Elon Musk" (2023)](https://www.goodreads.com/work/quotes/144038357-elon-musk)
- [Aviation Week: The Algorithm](https://aviationweek.com/space/commercial-space/algorithm-spacexs-five-step-process-better-engineering)
- [Inc: Musk's Algorithm](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)
- [Samuel Katsaros: Raptor Engine Evolution](https://samuelkatsaros.com/blog/raptor-engine-evolution)

### Palantir
- [Palantir Architecture Center: Ontology System](https://www.palantir.com/docs/foundry/architecture-center/ontology-system)
- [Palantir Blog: Ontology-Oriented Software Development](https://blog.palantir.com/ontology-oriented-software-development-68d7353fdb12)
- [SVPG: Forward Deployed Engineers](https://www.svpg.com/forward-deployed-engineers/)
- [Palantir Blog: MOSA with SDSI](https://blog.palantir.com/implementing-mosa-with-software-defined-systems-integration-4882b12f74ce)

### Anti-Patterns & Prioritization
- [Vladik Khononov: Bounded Contexts are NOT Microservices](https://vladikk.com/2018/01/21/bounded-contexts-vs-microservices/)
- [Martin Fowler: Break a Monolith into Microservices](https://martinfowler.com/articles/break-monolith-into-microservices.html)
- [Software Architecture: The Hard Parts (O'Reilly)](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/)
- [Alistair Cockburn: Walking Skeleton](https://medium.com/@jorisvdaalsvoort/walking-skeletons-in-software-architecture-894168276e3f)
