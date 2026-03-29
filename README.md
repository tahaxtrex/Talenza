# Talenza — Executive Hiring Intelligence Platform

> AI-powered agentic pipeline for executive-level hiring decisions. Scores candidates across five competency dimensions, adapts rankings to business context, and recommends internal vs. external sourcing strategies.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Routing & Pages](#routing--pages)
5. [Design System](#design-system)
6. [Landing Page](#landing-page)
7. [Core Pipeline — Legacy (Demo Flow)](#core-pipeline--legacy-demo-flow)
8. [Core Pipeline — Internal Pipeline](#core-pipeline--internal-pipeline)
9. [Core Pipeline — External Pipeline](#core-pipeline--external-pipeline)
10. [Data Layer](#data-layer)
11. [Scoring Engine](#scoring-engine)
12. [Cost / Sourcing Analysis](#cost--sourcing-analysis)
13. [3D Visuals](#3d-visuals)
14. [Animation System](#animation-system)
15. [Key Architectural Decisions](#key-architectural-decisions)
16. [File Map](#file-map)

---

## Product Overview

**Talenza** is a decision-support tool for HR directors and executive hiring committees. It solves the problem that candidate rankings change when business context changes — a candidate who excels in a crisis may be wrong for a growth scenario.

### Core Value Proposition

1. **Context-aware ranking** — The same candidates, scored under different business scenarios (crisis, transformation, growth, succession), produce completely different rankings.
2. **Internal vs. External sourcing** — Before ranking anyone, the system recommends whether to hire internally or externally based on cost, risk, urgency, and pipeline strength.
3. **Agentic architecture** — Four independent AI agents (Candidate Profiler, Scenario Analyst, Scoring & Strategy, Scenario Comparison), each with separate inputs/outputs.

### Current State

The app is a **frontend prototype** — all AI agents are currently simulated with deterministic mock functions. There is no backend, no database, and no real AI integration yet. Data persists in `localStorage`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + custom design tokens in `index.css` |
| Components | shadcn/ui (Radix primitives) |
| Animation | Framer Motion 12 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Routing | React Router DOM 6 |
| State | React useState/useEffect + localStorage persistence |
| Data fetching | @tanstack/react-query (configured but not actively used yet) |
| Charts | Recharts (installed, not used in current UI) |

---

## Architecture Overview

```
src/
├── pages/                    # Route-level components
│   ├── Landing.tsx           # Marketing landing page (/)
│   ├── Index.tsx             # Pipeline chooser (/app)
│   ├── InternalPipeline.tsx  # Full internal hiring pipeline (/internal)
│   ├── ExternalPipeline.tsx  # Full external hiring pipeline (/external)
│   ├── Dashboard.tsx         # Candidate CRUD dashboard (/dashboard)
│   ├── Candidates.tsx        # Standalone CV upload page (unused route)
│   └── NotFound.tsx          # 404
│
├── components/
│   ├── AppNavbar.tsx          # In-app navigation bar
│   ├── InputState.tsx         # Legacy: scenario text input with chips
│   ├── ClarifyingState.tsx    # Legacy: conversational Q&A UI
│   ├── BuildingState.tsx      # Legacy: JSON typing animation
│   ├── ResultsState.tsx       # Legacy: ranked results with scenario toggle
│   ├── CandidateScoreCard.tsx # Expandable candidate score card
│   ├── NavLink.tsx            # Reusable nav link
│   └── landing/               # Landing page sections
│       ├── LandingNavbar.tsx
│       ├── HeroSection.tsx
│       ├── ProblemSection.tsx
│       ├── PipelineSection.tsx
│       ├── AgentsSection.tsx
│       ├── MissionSection.tsx
│       ├── Scene3D.tsx         # Three.js canvas wrapper
│       └── NetworkGraph.tsx    # 3D network graph component
│
├── data/
│   └── candidates.ts          # Static candidate data + scenario re-ranking logic
│
├── lib/
│   ├── candidateStore.ts      # localStorage CRUD for legacy candidates
│   ├── pipelineStore.ts       # Full pipeline data layer (profiles, scenarios, scoring, cost analysis)
│   └── utils.ts               # cn() utility (clsx + tailwind-merge)
│
├── hooks/
│   ├── use-mobile.tsx         # Mobile breakpoint detection
│   └── use-toast.ts           # Toast notification hook
│
├── index.css                  # Design tokens, animations, global styles
├── main.tsx                   # React entry point
└── App.tsx                    # Router configuration
```

---

## Routing & Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Landing` | Marketing landing page with 3D visuals |
| `/app` | `Index` | Pipeline chooser — Internal vs External |
| `/internal` | `InternalPipeline` | 5-step internal hiring pipeline |
| `/external` | `ExternalPipeline` | 4-step external hiring pipeline |
| `/dashboard` | `Dashboard` | Candidate JSON viewer/editor with CRUD |
| `*` | `NotFound` | 404 page |

### Navigation Flow

```
Landing (/) 
  → "Try Talenza Now" → /app (Pipeline Chooser)
      → Internal Pipeline (/internal)
      → External Pipeline (/external)
  → AppNavbar links to /app, /dashboard
```

---

## Design System

### Fonts (loaded via Google Fonts in `index.html`)

| Token | Font | Usage |
|-------|------|-------|
| `--font-display` | DM Serif Display | Headlines, large titles |
| `--font-body` | DM Sans | Body text, labels, buttons |
| `--font-mono` | JetBrains Mono | Code, JSON, metrics |

### Color Tokens (HSL, defined in `index.css :root`)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--color-bg` | `40 33% 97%` | Page background (warm off-white) |
| `--color-surface` | `0 0% 100%` | Cards, panels |
| `--color-surface-2` | `40 20% 95%` | Secondary surfaces, inputs |
| `--color-border` | `36 14% 89%` | Default borders |
| `--color-border-strong` | `33 8% 76%` | Hover/active borders |
| `--color-text-primary` | `42 10% 9%` | Headings, primary text |
| `--color-text-secondary` | `38 6% 40%` | Body copy |
| `--color-text-tertiary` | `34 6% 63%` | Captions, labels |
| `--color-accent` | `210 88% 40%` | Primary brand blue (#0A66C2) |
| `--color-accent-hover` | `210 90% 33%` | Button hover |
| `--color-accent-light` | `213 100% 95%` | Light blue backgrounds |
| `--color-success` | `152 65% 30%` | Green — positive scores, internal |
| `--color-amber` | `40 100% 30%` | Warning, medium scores |
| `--color-danger` | `5 63% 46%` | Red — risks, high urgency |

### Tailwind Custom Utilities (in `tailwind.config.ts`)

- `surface`, `surface-2` — card backgrounds
- `t-primary`, `t-secondary`, `t-tertiary` — text colors
- `brand`, `brand-hover`, `brand-light` — accent colors
- `success`, `success-light` — positive indicators
- `amber`, `amber-light` — warning indicators
- `danger`, `danger-light` — error/risk indicators
- `brd`, `brd-strong` — border colors

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary animation easing — used everywhere |
| `--ease-out-circ` | `cubic-bezier(0, 0.55, 0.45, 1)` | Secondary easing |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Emphasis easing |

### Visual Effects

- **Noise texture** — SVG fractalNoise overlay at 3% opacity on `#root::before`
- **Focus states** — 2px solid accent outline with 2px offset
- **Scrollbar** — Custom 6px thin scrollbar with border-strong thumb

---

## Landing Page

**File:** `src/pages/Landing.tsx` — composes 5 sections in order:

### 1. LandingNavbar (`landing/LandingNavbar.tsx`)
- Fixed position, transparent → blurred on scroll
- Desktop: section links + "Launch App" CTA
- Mobile: hamburger menu with AnimatePresence
- Smooth-scrolls to section `id`s: `problem`, `pipeline`, `agents`, `mission`

### 2. HeroSection (`landing/HeroSection.tsx`)
- Full-height hero with 3D `NetworkGraph` background (variant: `hero`)
- Radial gradient overlay to fade 3D into background
- Headline: "Stop guessing. Start knowing."
- Metrics strip: 4 AI Agents, 5 Dimensions, <6s Full Analysis
- CTA → `/app`

### 3. ProblemSection (`landing/ProblemSection.tsx`)
- Two content cards explaining the core value props:
  - **Context-Aware Ranking** — same candidates, different scenarios = different rankings
  - **Internal vs. External** — structured sourcing recommendation before ranking
- Each card has a pull-quote "insight" below it

### 4. PipelineSection (`landing/PipelineSection.tsx`)
- 4-step workflow cards in a 2×2 grid:
  1. Define Candidates
  2. Describe Your Context
  3. AI Agents Analyze
  4. See What Changes
- 3D background (variant: `pipeline`)

### 5. AgentsSection (`landing/AgentsSection.tsx`)
- 4 agent cards, each split into description (left) + terminal output preview (right):
  1. **Candidate Profiler** — CV + HR opinion → structured JSON with traits
  2. **Scenario Analyst** — text → structured JSON, detects nulls, runs Q&A
  3. **Scoring & Strategy** — scores candidates + internal vs external recommendation
  4. **Scenario Comparison** — re-runs scoring under different context, shows rank shifts
- 3D background (variant: `agents`)

### 6. MissionSection (`landing/MissionSection.tsx`)
- Closing CTA with mission statement
- Footer with copyright

---

## Core Pipeline — Legacy (Demo Flow)

> These components exist in `src/components/` but are **not currently routed** — they were the original demo flow before the Internal/External pipeline split. They are referenced by the old `Candidates.tsx` page.

### State Machine (was in old Index.tsx)

```
InputState → ClarifyingState → BuildingState → ResultsState
```

### InputState (`src/components/InputState.tsx`)
- Full-screen textarea for scenario description
- 6 pre-built scenario chips (supply chain crisis, digital transformation, etc.)
- 2000 character limit, minimum 30 chars to proceed
- Submit triggers 800ms delay → next state

### ClarifyingState (`src/components/ClarifyingState.tsx`)
- Split-panel: left (context summary + live JSON) + right (chat conversation)
- 5 sequential questions from `data/candidates.ts`
- Chat-style UI with AI typing indicator (3 dots)
- Left panel shows "emerging structure" as a JSON object built progressively via `TypewriterValue` component
- Progress bar: X of 5 questions

### BuildingState (`src/components/BuildingState.tsx`)
- Centered JSON typing animation — line-by-line character reveal
- Derives scenario type from text keywords (crisis/transformation/succession/growth)
- Generates a mock `scenario.json` with weighted scoring parameters
- Syntax highlighting: blue for keys, green for strings, orange for numbers, purple for booleans
- "Activate Scenario" button with fill animation

### ResultsState (`src/components/ResultsState.tsx`)
- Scenario toggle bar: Crisis / Transformation / Growth / Succession
- 6 candidate cards from `data/candidates.ts` with:
  - Rank, name, source badge (internal/external), fit score %
  - 5 score bars (Crisis, Ops, Change, Stakeholder, Network)
  - Expanded view: headline strength, key risk, detailed scores
  - Rank change indicators (▲▼) when switching scenarios
- Shimmer loading state during scenario switch (1.5s mock delay)
- Decision panel: INTERNAL HIRE recommendation with risk matrix + rationale

---

## Core Pipeline — Internal Pipeline

**File:** `src/pages/InternalPipeline.tsx` (816 lines)

### 5-Step Flow

```
Step 1: Candidates → Step 2: Scenario → Step 3: Q&A → Step 4: Sourcing Strategy → Step 5: Scoring
```

### Step 1: Candidates
- **Select existing** — loads internal candidates from `candidateStore` (old dashboard data)
- **Add new** — form with:
  - CV upload (drag & drop PDF, simulated)
  - Name*, Role* (required), Email, Phone
  - HR Opinion (textarea) — internal-only
  - Personality & Persona Description (textarea) — internal-only
- Calls `mockGenerateProfile('internal', ...)` → generates `CandidateProfile` with randomized `character_traits`
- Saves to localStorage via `pipelineStore`

### Step 2: Scenario
- Large textarea for free-text scenario description
- "Analyze Scenario" → calls `mockParseScenario()` which intentionally returns many `null` fields to trigger Q&A
- Shows parsed JSON preview below

### Step 3: Q&A
- Iterates through 18 possible fields via `getNextMissingField()`
- Sequential question/answer — one at a time
- Parses answers: "yes"/"no" → boolean, numeric strings → numbers, comma-separated → arrays
- Live JSON preview updates as fields are filled
- Completes when all fields have values

### Step 4: Sourcing Strategy (Internal Pipeline Only)
- Calls `mockCostAnalysis(scenario)` — evaluates 4 dimensions:
  1. **Opportunity Cost** — internal vs external vacancy impact
  2. **Execution Risk** — known vs unknown entity
  3. **Cultural Damage** — promotion signals vs bypassing internal talent
  4. **Time Cost** — 2-4 weeks internal vs 12-18 weeks external
- Displays side-by-side comparison cards with scores and reasoning
- Outputs recommendation: INTERNAL / EXTERNAL / BOTH with confidence reasoning
- Adapts to scenario type (crisis → strongly internal, transformation → both)

### Step 5: Scoring
- Calls `mockScoreCandidates(candidates, scenario)`
- Renders `CandidateScoreCard` for each candidate, sorted by overall score
- Each card shows:
  - Rank badge, name, role, overall score
  - 5 mini breakdown bars (scenario fit, experience match, leadership fit, availability, risk factor)
  - Expandable panel with:
    - Recommendation badge
    - Overall assessment paragraph
    - 5 dimension-by-dimension breakdowns with score bars, reasoning, evidence bullets
    - Strengths & Risks panels

---

## Core Pipeline — External Pipeline

**File:** `src/pages/ExternalPipeline.tsx` (502 lines)

### 4-Step Flow (no sourcing strategy step)

```
Step 1: Candidates → Step 2: Scenario → Step 3: Q&A → Step 4: Scoring
```

Identical to Internal Pipeline except:
- No HR Opinion or Personality Description fields in candidate form
- No Sourcing Strategy step — goes directly from Q&A to Scoring
- Filters existing candidates by `source === 'external'`

---

## Data Layer

### `src/data/candidates.ts` — Static Demo Data

- **`Candidate` interface** — rank, name, role, source, fitScore, 5 scores, strength/risk headlines
- **`crisisCandidates`** — 6 hardcoded candidates (3 internal, 3 external) with BMW context
- **`getCandidatesForScenario(scenario)`** — reorders candidates based on scenario type:
  - `crisis` → default order (Thomas Richter #1)
  - `transformation` → reversed (Priya Nair #1)
  - `growth` → custom reorder (Claire Dubois #1)
  - `succession` → custom reorder (Mehmet Yilmaz #1)
- **`questions`** — 5 clarifying questions for the legacy demo flow
- **`scoreLabels`** — Maps score keys to short display labels

### `src/lib/candidateStore.ts` — Legacy localStorage CRUD

- **Keys:** `talenza_candidates`
- **Functions:** `loadCandidates()`, `saveCandidates()`, `deleteCandidate()`, `updateCandidate()`, `addCandidate()`
- Seeds with `crisisCandidates` on first load
- Used by Dashboard page

### `src/lib/pipelineStore.ts` — Full Pipeline Data Layer (566 lines)

This is the core data/logic file. All AI functions are mocked.

#### Types

```typescript
CandidateProfile {
  id, type, name, role, email?, phone?,
  experience_years?, current_company?, education?, languages?, key_competencies?,
  character_traits?: { leadership_style, communication, decision_making, stress_response,
                       adaptability, team_dynamics, conflict_resolution, innovation_mindset },
  hr_opinion?, personality_description?, internal_performance_history?,
  cv_filename?, extracted_at
}

ScenarioData {
  id, type, role_title?, seniority_level?, department?, location?,
  timeline_weeks?, urgency?, budget_available?, budget_range?,
  reason_for_vacancy?, business_context?, key_challenges?, critical_capability?,
  package_expectations?, relocation_required?, language_requirements?, travel_requirements?,
  team_size?, reports_to?, direct_reports?,
  raw_description, created_at, completed
}

ScoringResult {
  candidateId, candidateName, candidateRole?, overallScore, rank,
  breakdown: { scenario_fit, experience_match, leadership_fit, availability, risk_factor },
  dimensions: ScoreDimension[],
  strengths: string[], risks: string[],
  recommendation, detailedRationale
}

CostAnalysis {
  dimensions: CostDimension[],
  internal/external cost estimates, time to fill,
  internal/external overall scores,
  recommendation: 'internal' | 'external' | 'both',
  reasoning, scenario_type, scenario_label
}
```

#### Key Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `mockGenerateProfile()` | type, cvFilename, manualFields, hrOpinion?, personalityDesc? | `CandidateProfile` | Simulates AI extraction from CV — generates random traits |
| `mockParseScenario()` | type, rawText | `ScenarioData` | Parses text into structured JSON — intentionally leaves most fields `null` |
| `getNextMissingField()` | `ScenarioData` | `{field, question} \| null` | Iterates 18 field definitions, returns first `null` field with its question |
| `mockScoreCandidates()` | candidates[], scenario | `ScoringResult[]` | Generates random scores with contextual reasoning text |
| `mockCostAnalysis()` | scenario? | `CostAnalysis` | Evaluates 4 cost dimensions, adapts to scenario type |

#### Storage Keys

| Key | Contents |
|-----|----------|
| `talenza_candidates` | Legacy candidate list (candidateStore) |
| `talenza_internal_candidates` | Internal pipeline candidates |
| `talenza_external_candidates` | External pipeline candidates |
| `talenza_scenarios` | Saved scenario data |

---

## Scoring Engine

### Overall Score Formula (in `mockScoreCandidates`)

```
overallScore = scenario_fit × 0.30
             + experience_match × 0.25
             + leadership_fit × 0.20
             + availability × 0.15
             + (100 - risk_factor) × 0.10
```

Each dimension score is randomized (30-100 range) in the mock. In production, these would come from actual AI analysis.

### Dimension Scoring

Each of the 5 dimensions produces:
- **Score** (0-100)
- **Weight** (percentage)
- **Reasoning** — 3-tier template (strong/moderate/weak) that interpolates scenario context
- **Evidence** — 3 bullet points per tier
- **Impact** — positive (≥70) / neutral (45-69) / negative (<45)

### Recommendation Logic

| Score Range | Recommendation |
|-------------|---------------|
| ≥ 70 | "Strong fit — fast-track to final interview round" |
| 50-69 | "Moderate fit — include in shortlist with targeted assessment" |
| < 50 | "Weak fit — consider only if pipeline is thin" |

---

## Cost / Sourcing Analysis

### Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| Opportunity Cost | Revenue/productivity lost during vacancy |
| Execution Risk | Probability of placement failure |
| Cultural Damage | Team morale impact of sourcing decision |
| Time Cost | Timeline alignment with urgency |

### Scenario Adaptation

| Scenario Type | Detection | Recommendation Bias |
|---------------|-----------|-------------------|
| Crisis | urgency = "critical"/"high" or timeline ≤ 6 weeks | Strongly INTERNAL |
| Transformation | context contains "transform" or challenges contain "new" | BOTH (parallel process) |
| Stable Growth | Default | Data-driven (compare overall scores) |

### Cost Estimates

- Internal: €15,000 – €25,000 (redeployment, training)
- External: €80,000 – €150,000 (agency fees, onboarding)
- Time: Internal 2-4 weeks vs External 12-18 weeks

---

## 3D Visuals

### Scene3D (`landing/Scene3D.tsx`)
- Wrapper component that renders a Three.js `<Canvas>` with `NetworkGraph`
- 3 variants with different color/density configurations:
  - `hero` — 30 nodes, blue/green, slow rotation
  - `agents` — 18 nodes, gold/red, faster rotation
  - `pipeline` — 20 nodes, blue/dark blue, medium speed
- Performance: DPR capped at 1.5, pointer-events disabled

### NetworkGraph (`landing/NetworkGraph.tsx`)
- Instanced mesh for nodes (sphere geometry) distributed on a Fibonacci sphere
- Line segments connecting nodes within `radius × 1.1` distance
- Per-frame animation: group rotation, individual node position oscillation, scale breathing
- Central glow sphere with emissive material
- 70/30 split between primary and accent color nodes

---

## Animation System

### CSS Animations (in `index.css`)

| Class | Keyframes | Duration | Usage |
|-------|-----------|----------|-------|
| `animate-page-enter` | `page-enter` (opacity + translateY 16px) | 350ms | Page transitions |
| `animate-fade-slide` | `fade-slide-in` (opacity + translateY 24px) | 600ms | Staggered element reveals |
| `animate-thinking-dot` | `thinking-dot` (scale + opacity pulse) | 1.2s infinite | AI typing indicator |
| `animate-pulse-dot` | `pulse-dot` (scale + opacity) | 1.5s infinite | Status indicators |
| `animate-blink` | `blink` (opacity step) | 1s infinite | Cursor blink |
| `animate-char-pop` | `char-pop` (scale bounce) | 120ms | Character animation |

### Framer Motion Patterns

- **Ease constant:** `[0.16, 1, 0.3, 1]` (expo-out) — used in every page
- **Scroll-triggered:** `useInView` with `once: true` for landing sections
- **Staggered delays:** `delay: 0.15 + i * 0.1` pattern for lists
- **AnimatePresence:** Used for step transitions in pipelines
- **Layout animations:** Used in Dashboard candidate list

---

## Key Architectural Decisions

### 1. Client-Side Only (No Backend)
- **Why:** Prototype stage — validates UX flow and scoring logic before investing in backend
- **How:** All data in localStorage, all AI functions are deterministic mocks
- **Trade-off:** No persistence across devices, no real AI, no multi-user support

### 2. Two Separate Pipelines (Internal vs External)
- **Why:** Internal hiring has fundamentally different inputs (HR opinion, personality, cost analysis) and outputs (sourcing strategy)
- **How:** `InternalPipeline.tsx` (816 lines, 5 steps) vs `ExternalPipeline.tsx` (502 lines, 4 steps)
- **Trade-off:** Code duplication (~60% shared logic) — should be refactored into shared hooks

### 3. Mock Functions with Realistic Output Structure
- **Why:** Allows frontend development to proceed independently of AI integration
- **How:** `mockGenerateProfile()`, `mockParseScenario()`, `mockScoreCandidates()`, `mockCostAnalysis()` all return fully typed objects with randomized but contextually plausible data
- **Trade-off:** Scoring randomness means repeated runs give different results

### 4. Intentional Null Fields in Scenario Parsing
- **Why:** Forces the Q&A step — the AI purposely leaves fields unfilled so the clarification agent has work to do
- **How:** `mockParseScenario()` fills only 3-4 of 18 fields, `getNextMissingField()` iterates sequentially
- **Trade-off:** Sequential Q&A is slow (18 questions) — should prioritize critical fields

### 5. Design Token System
- **Why:** Consistent theming, easy dark mode addition, accessibility
- **How:** HSL values in CSS custom properties → Tailwind config maps them to utility classes
- **Trade-off:** Some components still use inline `hsl(var(--color-*))` instead of Tailwind utilities

### 6. Legacy Demo Flow Preserved
- **Why:** Original prototype used a different UX flow (single-page state machine). Kept for reference/fallback
- **Which files:** `InputState.tsx`, `ClarifyingState.tsx`, `BuildingState.tsx`, `ResultsState.tsx`
- **Status:** Not currently routed but fully functional

### 7. 3D Performance Optimizations
- **Instanced meshes** for nodes (single draw call)
- **DPR capped at 1.5** to prevent GPU thrashing on high-DPI displays
- **Pointer events disabled** on canvas to prevent interaction overhead
- **No shadows** — relies on emissive materials for visual depth

---

## File Map

```
src/
├── App.tsx                           # Router config (6 routes)
├── main.tsx                          # React DOM entry point
├── index.css                         # Design tokens, animations, global styles
├── App.css                           # (empty/minimal)
│
├── pages/
│   ├── Landing.tsx                   # 19 lines — composes 5 landing sections
│   ├── Index.tsx                     # 146 lines — pipeline chooser (internal/external cards)
│   ├── InternalPipeline.tsx          # 816 lines — 5-step internal pipeline
│   ├── ExternalPipeline.tsx          # 502 lines — 4-step external pipeline
│   ├── Dashboard.tsx                 # 283 lines — candidate CRUD with JSON editing
│   ├── Candidates.tsx                # 236 lines — standalone CV upload (unused)
│   └── NotFound.tsx                  # 404 page
│
├── components/
│   ├── AppNavbar.tsx                 # 53 lines — in-app nav (Home, Analyse, Dashboard)
│   ├── CandidateScoreCard.tsx        # 231 lines — expandable score card with dimension breakdowns
│   ├── InputState.tsx                # 153 lines — legacy: scenario text input
│   ├── ClarifyingState.tsx           # 215 lines — legacy: chat-style Q&A
│   ├── BuildingState.tsx             # 189 lines — legacy: JSON typing animation
│   ├── ResultsState.tsx              # 317 lines — legacy: ranked results with scenario toggle
│   ├── NavLink.tsx                   # Reusable navigation link
│   └── landing/
│       ├── LandingNavbar.tsx          # 116 lines — fixed nav with scroll detection
│       ├── HeroSection.tsx            # 113 lines — hero with 3D background
│       ├── ProblemSection.tsx          # 130 lines — value proposition cards
│       ├── PipelineSection.tsx         # 114 lines — 4-step workflow grid
│       ├── AgentsSection.tsx           # 188 lines — 4 agent cards with terminal output
│       ├── MissionSection.tsx          # 85 lines — closing CTA + footer
│       ├── Scene3D.tsx                 # 57 lines — Three.js canvas wrapper
│       └── NetworkGraph.tsx            # 150 lines — instanced 3D network graph
│
├── data/
│   └── candidates.ts                 # 122 lines — static candidates, questions, scenario reranking
│
├── lib/
│   ├── candidateStore.ts             # 39 lines — localStorage CRUD (legacy)
│   ├── pipelineStore.ts              # 566 lines — full pipeline data layer + mock AI functions
│   └── utils.ts                      # cn() utility
│
├── hooks/
│   ├── use-mobile.tsx                # isMobile hook
│   └── use-toast.ts                  # Toast notification hook
│
└── components/ui/                    # ~50 shadcn/ui components (accordion, button, card, dialog, etc.)
```

---

## Future Integration Points

When connecting real AI backends, replace these mock functions in `pipelineStore.ts`:

| Mock Function | Real Implementation |
|---------------|-------------------|
| `mockGenerateProfile()` | LLM CV parser + trait extraction API |
| `mockParseScenario()` | LLM scenario structuring + NER |
| `getNextMissingField()` | AI-driven prioritized question selection |
| `mockScoreCandidates()` | Multi-agent scoring pipeline with separate reasoning chains |
| `mockCostAnalysis()` | Data-driven cost model with market benchmarks |

All mock functions return the same TypeScript types that the UI consumes, so replacing them is a drop-in operation.
