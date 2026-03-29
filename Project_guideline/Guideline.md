# Talenza — Guideline & Gap Analysis

> **Generated:** Saturday 28 March 2026
> **Deadline:** Sunday 30 March 18:00 CET
> **Backend:** n8n Cloud (no AWS, no custom server)
> **Priority:** Ship the sensitivity panel. It IS the demo.

---

## 1. Executive Summary

The Talenza frontend is a polished, well-structured React + shadcn/ui application with clean UX flow across both Internal and External pipeline tracks. However, **the entire AI/data layer is placeholder**. Every function that should call the n8n Cloud webhook instead uses `Math.random()`, hardcoded arrays, or static dictionaries. The single biggest blocker is that **zero API calls exist** — the frontend has no `fetch()` to any n8n endpoint, and no webhook URL is referenced anywhere in the codebase. The most urgent action is wiring a single end-to-end spike: `InputState → POST to n8n webhook → one Claude API call → render response` — proving the integration chain works before building out the full 5-agent pipeline.

---

## 2. n8n Integration Gaps

Every mock function below makes **zero API calls**. Each must become a `fetch()` to the n8n Cloud webhook URL.

| File | Function | What it does now | What it must do | Which Agent | Blocking demo? |
|------|----------|-----------------|-----------------|-------------|----------------|
| `pipelineStore.ts` | `mockGenerateProfile()` (line 131) | Generates random competency traits using `Math.random()`. Ignores the CV file entirely. Returns fake `key_competencies` and `character_traits` from hardcoded pools. | `POST` CV file to n8n webhook → n8n PDF parse node extracts text → Agent 0b receives plain text + HR opinion (internal) or text only (external) → returns structured candidate JSON with `narrative_summary`, `dimension_evidence`, `confidence_scores` (0.0–1.0 per dim), `hard_flags`. | **Agent 0b** (Candidate Profile Agent) | **YES** — no candidates = nothing downstream works |
| `pipelineStore.ts` | `mockParseScenario()` (line 184) | Checks `rawText.length` to decide if fields are null. If `length > 20`, hardcodes `role_title` to `"Senior Director, Operations"`. Most fields returned as `null`. | `POST` free-text to n8n webhook → Agent 1 Phase 1 (Parse) → returns partially filled scenario JSON with nulls for fields that couldn't be inferred. Agent 1 uses `claude-sonnet-4-6` (temp 0.2) to classify scenario type and derive initial weights. | **Agent 1** Phase 1 (Scenario Agent) | **YES** — scenario definition is the pipeline's input |
| `pipelineStore.ts` | `getNextMissingField()` (line 238) | Iterates a hardcoded `FIELD_QUESTIONS` dictionary of 18 static questions. Returns the next null field and its pre-written question. | `POST` current scenario JSON + user's latest answer to n8n webhook → Agent 1 Phase 2 (Q&A) → Agent 1 generates one dynamic, contextual question referencing the user's prior text. Returns: `{ field, question, updated_scenario_json }`. | **Agent 1** Phase 2 (Dynamic Q&A) | **YES** — hardcoded questions will fail judge scrutiny |
| `pipelineStore.ts` | `mockScoreCandidates()` (line 300) | Uses `Math.round(30 + Math.random() * 70)` for all dimension scores. Picks reasoning and evidence from hardcoded template pools. Computes a weighted `overallScore` from random sub-scores. | `POST` all candidates + scenario weights to n8n webhook → n8n Split In Batches → Agent 2 ×N parallel (one call per candidate, `claude-haiku-4-5-20251001`, temp 0, 200ms delay) → returns per-dimension scores (X.X/10) with one-line evidence, flags (green/amber/red), scenario-weighted total. **NEVER returns an overall rating.** | **Agent 2** ×N (Scoring Agent) | **YES** — scoring is the core output |
| `pipelineStore.ts` | `mockCostAnalysis()` (line 476) | Hardcoded decision tree: checks `urgency` string for "critical" → crisis, checks `business_context` for "transform" → transformation, else stable growth. Returns fixed scores per scenario type. | `POST` all scored candidates + scenario JSON to n8n webhook → Agent 3 (`claude-sonnet-4-6`, temp 0) → returns `INTERNAL/EXTERNAL` recommendation, confidence %, 4-cost breakdown (Opportunity Cost, Execution Risk, Cultural Damage, Time Cost), vacancy cost per week. | **Agent 3** (Cost Analysis & Decision Agent) | **HIGH** — needed for full judging score |
| `candidates.ts` | `getCandidatesForScenario()` (line 89) | Calls `.reverse()` for transformation, uses hardcoded index arrays `[2,0,3,1,4,5]` for growth and `[2,3,0,1,5,4]` for succession. Recalculates `fitScore` with `Math.max(20, 95 - i * 14)`. | `POST` all candidates with existing Agent 2 scores + 3 alternative weight sets from `scenarios.json` to n8n webhook → Agent 4 (`claude-sonnet-4-6`, temp 0) → returns ranked arrays per alternative scenario with delta arrows (▲▼) vs. primary ranking. | **Agent 4** (Sensitivity Agent) | **YES** — this IS the demo moment |

### Additional Integration Gap: No Webhook URL

There is **no n8n webhook URL variable** defined anywhere in the codebase. Before any of the above replacements can work, a central API configuration is needed:

```typescript
// Needed: src/lib/api.ts or similar
const N8N_WEBHOOK_URL = 'https://your-n8n-cloud-instance.app/webhook/talenza';
```

---

## 3. Pre-processing Gap (PDF Parse Step)

### What exists now

`InternalPipeline.tsx` and `ExternalPipeline.tsx` both accept a file upload in their "Add Candidate" forms. The file reference is passed to `mockGenerateProfile()` as a `cvFilename` string parameter. **The file content is never read.** The function ignores the file entirely and generates random traits from hardcoded pools like `['Operational Leadership', 'Crisis Management', ...]`.

### What the n8n PDF parse node must do

1. **Frontend** sends the PDF file as `multipart/form-data` (or base64) in the `POST` body to the n8n webhook.
2. **n8n "Extract from File" node** (built-in, not a Claude call) reads the PDF → outputs plain text.
3. **Agent 0b** receives the plain text (not the file) + HR opinion (internal track) or plain text only (external track).
4. Agent 0b returns the structured candidate JSON with `dimension_evidence` (one sentence per dimension citing specific CV facts) and `confidence_scores` (0.0–1.0 per dimension).
5. **Frontend** receives the JSON response and adds the candidate to the pipeline store.

### Where it fires in the pipeline

Stage 1 — Candidate Ingestion. Runs **once per CV upload**, completely independent of any scenario. Candidates are profiled and stored **before** the scenario exists.

---

## 4. Scenario Q&A Gap (Agent 1 Dynamic vs. Hardcoded)

### How ClarifyingState.tsx currently works

`ClarifyingState.tsx` imports a hardcoded `questions` array from `candidates.ts` containing 5 static questions:

```typescript
const questions = [
  "What is the specific role title and seniority level you're trying to fill?",
  "What is your realistic timeline?...",
  "Do you have internal candidates already identified?...",
  "What is the single most important capability...?",
  "Are there any hard constraints...?",
];
```

The component iterates through these 5 questions sequentially. The `fieldKeys` are hardcoded to `['role_title', 'urgency_weeks', 'internal_candidates', 'priority_capability', 'hard_constraints']`. Progress is fixed at `(currentQuestion / 5) * 100`. After 5 answers, `onComplete()` fires and `BuildingState.tsx` renders a fake JSON typewriter animation with `Math.random()` weights.

**Problems:**
- Questions are generic, not contextual — they don't reference the user's prior text.
- Exactly 5 questions every time — the spec requires a variable number based on which fields the AI couldn't infer from the initial free text.
- The "Emerging structure" JSON panel shows only 5 hardcoded field keys, not the full 11+ mandatory scenario fields.
- `BuildingState.tsx` generates random weights using `Math.random()`, not Agent 1's derived weights.
- `BuildingState.tsx` uses 5 dimension keys (`crisis_mgmt`, `ops_depth`, `change_adapt`, `stakeholder`, `external_net`) — missing `digital_literacy` and using wrong names.

### How Agent 1's dynamic Q&A must work

**Phase 1 — Parse:** User submits free-text → `POST` to n8n → Agent 1 (Sonnet 4.6, temp 0.2) returns partially filled scenario JSON. Fields the AI could infer are populated; fields it couldn't are `null`.

**Phase 2 — Q&A loop:** For each null field, the frontend `POST`s the current scenario JSON + user's latest answer to n8n → Agent 1 generates one contextual question referencing the user's specific text. One question per exchange, never batched.

Expected n8n response shape per Q&A round:

```json
{
  "question": "You mentioned board pressure is mounting — how many weeks do you realistically have before this vacancy becomes operationally critical?",
  "target_field": "urgency_weeks",
  "updated_scenario": { ... partial scenario JSON with latest answer incorporated ... },
  "remaining_null_fields": ["budget_available", "primary_constraint"],
  "progress_pct": 72
}
```

**Phase 3 — Finalise:** When `remaining_null_fields` is empty, Agent 1 returns the complete scenario JSON with derived competency weights (6 dimensions summing to 100).

### Mandatory scenario fields (Q&A exits only when all non-null)

> ⚠️ **UPDATE (28 March):** The actual scenario JSON schema (from `Sample Scenarios` file) is **vastly more complex** than the simple field list below. See Section 13 for the full schema analysis. The mandatory fields that block analysis (`blocks_analysis: true`) drive the Q&A exit condition — these come from the `completeness.null_mandatory_fields` array in the Agent 1 response, not from a hardcoded list.

For the Q&A loop, Agent 1's Phase 2 response must include `completeness.null_mandatory_fields` — each entry already contains the `qa_question` string to display. The frontend should render this question directly from the API response, not generate its own. The loop exits when `completeness.is_complete = true` or `completeness.ready_for_analysis = true`.

Core mandatory fields to prioritise: `role.title`, `constraints.urgency_weeks`, `business_context.situation_type`, `priority_capabilities.must_have_1`, `derived.weight_calculation.final_weights` (5 canonical dimensions summing to 1.0).

---

## 5. Sensitivity Panel Gap (Agent 4 vs. Fake Toggle)

### How ResultsState.tsx currently fakes the scenario switch

`ResultsState.tsx` renders 4 scenario buttons (crisis, transformation, growth, succession). On click, `handleScenarioChange(key)` does the following:

1. Stores current rankings in `previousRankings` (for delta arrow calculation).
2. Sets `loading = true`.
3. Calls `setTimeout(() => { setCandidates(getCandidatesForScenario(key)); setLoading(false); }, 1500)` — a **fake 1500ms loading spinner**.
4. `getCandidatesForScenario()` in `candidates.ts` reorders the static array:
   - `'transformation'` → `.reverse()` on the array
   - `'growth'` → hardcoded index `[2, 0, 3, 1, 4, 5]`
   - `'succession'` → hardcoded index `[2, 3, 0, 1, 5, 4]`
   - Default (crisis) → returns original `crisisCandidates` array
5. `fitScore` is recalculated with `Math.max(20, 95 - i * 14)` — purely positional, not AI-derived.

Delta arrows (▲▼) do exist in the UI but are computed from the difference between the old `previousRankings` and the new `.rank` — which is just the new array index. No dimension re-scoring occurs.

### What Agent 4 must return

Agent 4 receives all candidates with their existing Agent 2 dimension scores + 3 alternative weight sets read from `scenarios.json`. It re-applies the weights (not re-scores dimensions) and outputs ranked arrays per scenario.

Expected n8n response shape (updated for 2 real scenarios):

```json
{
  "primary_scenario": "iran_israel_geopolitical_crisis",
  "sensitivity_results": [
    {
      "scenario_id": "bwmos_software_org",
      "scenario_label": "Software Org Build — BWMOS",
      "rankings": [
        { "candidate_id": "uuid", "name": "Marcus Chen", "rank": 1, "weighted_total": 8.9, "delta": 2, "delta_arrow": "▲" },
        { "candidate_id": "uuid", "name": "Natasha Volkov", "rank": 2, "weighted_total": 8.6, "delta": 3, "delta_arrow": "▲" },
        { "candidate_id": "uuid", "name": "Thomas Richter", "rank": 6, "weighted_total": 3.8, "delta": -5, "delta_arrow": "▼" }
      ]
    }
  ]
}
```

> **New demo story (updated from Thomas/Sara to Thomas/Marcus or Thomas/Natasha):**
> - Thomas Richter: `crisis_management 9.2`, `operational_depth 9.4`, `change_adaptability 3.8`, `external_network 1.8` → Top rank under MENA Crisis (high crisis/ops weights) → Near-bottom under BWMOS (change_adaptability + external_network dominate)
> - Marcus Chen (internal): `change_adaptability ~9`, `external_network ~9`, `crisis_management ~2` → Near-bottom under MENA Crisis → Top under BWMOS
> - James Okafor (external): best:crisis → also drops under BWMOS
> - Natasha Volkov (Waymo, external): best:transformation → rises under BWMOS

### UI integration point

`ResultsState.tsx` line 44 (`setTimeout(() => { setCandidates(getCandidatesForScenario(key)); ... })`) must be replaced with a `fetch()` to the n8n webhook that triggers Agent 4. The response replaces the candidates array and the delta arrows come from the response `delta` field, not from array index subtraction.

The UI label must change from a scenario toggle (implying the user's scenario changes) to: **"Sensitivity Analysis — How rankings shift under different conditions."** The primary scenario is the user's actual scenario. The alternatives are what-if comparisons, not main views.

---

## 6. Competency Dimension Gaps

> ⚠️ **UPDATE (28 March):** `digital_literacy` has been **DROPPED** from the official data schema. Both the Sample Scenarios JSON schema and all 12 Sample Candidates profile JSONs use **5 canonical dimensions only**. The spec note about "6 dimensions" in the project system prompt is **outdated**. The canonical set is now confirmed as: `crisis_management`, `operational_depth`, `stakeholder_trust`, `change_adaptability`, `external_network`.

| Required Dimension | `candidates.ts` (Candidate interface + data) | `pipelineStore.ts` (ScoringResult.breakdown) | `CandidateScoreCard.tsx` (rendering) | `BuildingState.tsx` (JSON animation) | `ResultsState.tsx` (scoreLabels) | Status |
|---|---|---|---|---|---|---|
| `crisis_management` | ✅ as `crisis_mgmt` (wrong name) | ❌ uses `scenario_fit` instead | ❌ renders `scenario_fit` | ✅ as `crisis_mgmt` (wrong name) | ✅ as `crisis_mgmt` label "Crisis" | ⚠️ Wrong key name |
| `operational_depth` | ✅ as `ops_depth` (wrong name) | ❌ uses `experience_match` instead | ❌ renders `experience_match` | ✅ as `ops_depth` (wrong name) | ✅ as `ops_depth` label "Ops" | ⚠️ Wrong key name |
| `stakeholder_trust` | ✅ as `stakeholder` (wrong name) | ❌ uses `leadership_fit` instead | ❌ renders `leadership_fit` | ✅ as `stakeholder` (wrong name) | ✅ as `stakeholder` label "Stakehld" | ⚠️ Wrong key name |
| `change_adaptability` | ✅ as `change_adapt` (wrong name) | ❌ uses `availability` instead | ❌ renders `availability` | ✅ as `change_adapt` (wrong name) | ✅ as `change_adapt` label "Change" | ⚠️ Wrong key name |
| ~~`digital_literacy`~~ | ~~MISSING~~ | ~~MISSING~~ | ~~MISSING~~ | ~~MISSING~~ | ~~MISSING~~ | **DROPPED from schema — do NOT add** |
| `external_network` | ✅ as `external_net` (wrong name) | ❌ uses `risk_factor` instead | ❌ renders `risk_factor` | ✅ as `external_net` (wrong name) | ✅ as `external_net` label "Network" | ⚠️ Wrong key name |

### Summary of dimension issues (revised)

1. **`digital_literacy` is officially DROPPED.** Do not add it. If the project system prompt says "6 dimensions", ignore it — the actual data schema uses 5. Index.tsx should stay "five competency dimensions."
2. **`candidates.ts`** uses abbreviated key names — all 5 concepts present but wrong key strings.
3. **`pipelineStore.ts` ScoringResult** uses entirely different invented dimension names (`scenario_fit`, `experience_match`, etc.) that don't map to the 5 canonical dimensions.
4. **Scenario JSON schema** in `Sample Scenarios` also uses abbreviated keys (`crisis_mgmt`, `ops_depth`, etc.) in `base_weights` and `final_weights` — these must be migrated to canonical keys for Agent 1/4 output matching.
5. **`CandidateScoreCard.tsx`** and **`BuildingState.tsx`** inherit wrong names from above.

### What must change

All interfaces, data objects, score labels, and rendering logic must use the **5 canonical dimension IDs**: `crisis_management`, `operational_depth`, `stakeholder_trust`, `change_adaptability`, `external_network`. Agent responses will use these exact keys — the frontend must match exactly.

---

## 7. Confidence Score Gap

### What confidence_scores are

Agent 0b must output `confidence_scores`: a 0.0–1.0 value per dimension indicating how much CV evidence existed to assess that dimension. This is NOT a candidate quality score — it measures **extraction confidence**.

### Where they must be added

| Location | What's needed |
|----------|---------------|
| `pipelineStore.ts` → `CandidateProfile` interface | Add `confidence_scores: { [dimension]: number }` field |
| `pipelineStore.ts` → `mockGenerateProfile()` return value | Include confidence scores (will be replaced by Agent 0b response) |
| `CandidateScoreCard.tsx` | Add amber indicator rendering when any dimension's confidence < 0.4 |
| `ResultsState.tsx` → CandidateCard component | Show amber badge per dimension where confidence is low |
| `InternalPipeline.tsx` / `ExternalPipeline.tsx` | Pass confidence data through to scoring display |

### Amber indicator rule

`confidence_score < 0.4` on any dimension → render an amber indicator on the candidate card for that dimension. This signals "limited CV evidence — score is provisional" to the HR director. It does NOT mean the candidate is weak.

---

## 8. HR Opinion Handling Gap

### Spec requirement

- **Internal track:** HR opinion is **mandatory**. A free-text field written by an HR manager reflecting their qualitative assessment. It must be sent to Agent 0b as part of the payload alongside the extracted CV text.
- **External track:** The `hr_opinion` key must be **ABSENT** from the JSON — not `null`, not empty string. The key should not exist in the payload at all, because the data does not exist for people outside the organisation.

### What the current code does

**InternalPipeline.tsx** (lines ~60–180): Collects `hrOpinion` and `personalityDescription` text fields and passes them to `mockGenerateProfile('internal', cvFilename, manualFields, hrOpinion, personalityDescription)`. The mock function stores `hrOpinion` in the returned object if provided, but the value is never used meaningfully — Agent 0b should use it to inform the `narrative_summary` and `dimension_evidence`.

**ExternalPipeline.tsx**: Does NOT collect HR opinion fields. Calls `mockGenerateProfile('external', ...)` without the opinion parameters. However, `mockGenerateProfile()` still sets `hr_opinion: undefined` in the return object (line 173 conditional). When the JSON is serialized for the n8n API call, `undefined` values are omitted — which is correct behaviour. But this is accidental, not intentional enforcement.

### What must change

1. When building the Agent 0b request payload for external candidates, explicitly verify that the `hr_opinion` key is not present in the JSON body.
2. When building the Agent 0b request payload for internal candidates, validate that `hr_opinion` is non-empty before sending. Show a UI error if the HR manager submits without an opinion.
3. The `CandidateProfile` TypeScript interface should have `hr_opinion?: string` (optional) — present for internal, absent for external.

---

## 9. Sequence Diagram vs. Codebase

The sequence diagram (from `Sequence_Diagram.excalidraw`) defines the following pipeline nodes. Each is mapped to its current frontend counterpart.

### Internal Track

| Pipeline Stage | Diagram Node | Frontend File / Function | Status | What's needed |
|----------------|-------------|--------------------------|--------|---------------|
| Entry | "HR selects track" → "Internal" | `Index.tsx` → `navigate('/internal')` | ✅ Works | — |
| Stage 1 | "Upload CV" + "HR opinion" | `InternalPipeline.tsx` → add candidate form | ✅ UI exists | Wire file upload to n8n |
| Stage 1 | "AI: Parse CV to text" | — | ❌ **MISSING** | n8n "Extract from File" node (pre-processing, not a Claude call) |
| Stage 1 | "AI: Build candidate JSON" → "CV + opinion, confidence scores" | `mockGenerateProfile()` | ⚠️ **MOCK** — random data, no API call | Replace with Agent 0b call via n8n webhook |
| Stage 1 | "Store candidate JSON" | `addPipelineCandidate()` → localStorage | ⚠️ **PARTIAL** — stores in localStorage, should come from API | Candidate JSON should come from Agent 0b response; local storage for session caching is OK |
| Stage 1 | "Repeats per CV upload" | UI supports multiple uploads | ✅ Works | — |
| Stage 2 | "Describe scenario" | `InputState.tsx` → textarea with scenario chips | ✅ UI exists | Wire to Agent 1 Phase 1 |
| Stage 2 | "AI: Generate scenario JSON" → "Schema + weights" | `mockParseScenario()` | ⚠️ **MOCK** — string length checks, no API call | Replace with Agent 1 Phase 1 call |
| Stage 2 | "Missing fields?" → "Yes" → "Q&A chat" | `ClarifyingState.tsx` + `getNextMissingField()` | ⚠️ **MOCK** — hardcoded 5 questions, not dynamic | Replace with Agent 1 Phase 2 (dynamic, contextual Q&A) |
| Stage 2 | "No" → "Scenario JSON" | `BuildingState.tsx` | ⚠️ **MOCK** — random weights, wrong dimension keys | Must render Agent 1 Phase 3 final output |
| Stage 3 | "AI: Score candidates" → "Weighted by scenario" | `mockScoreCandidates()` | ⚠️ **MOCK** — `Math.random()` scores, wrong dimensions | Replace with Agent 2 ×N parallel calls |
| Stage 3 | "Cost analysis" → "Internal vs external + vacancy" | `mockCostAnalysis()` | ⚠️ **MOCK** — hardcoded decision tree | Replace with Agent 3 call |
| Stage 3 | "Ranked list + justification" | `ResultsState.tsx` | ⚠️ **PARTIAL** — displays rankings but from mock data | Must render Agent 2 + Agent 4 output |
| Stage 3 | "Final report" | `ResultsState.tsx` → Decision Panel | ⚠️ **HARDCODED** — "INTERNAL HIRE", "82% confidence", hardcoded rationale text | Must render Agent 3 output dynamically |

### External Track

| Pipeline Stage | Diagram Node | Frontend File / Function | Status | What's needed |
|----------------|-------------|--------------------------|--------|---------------|
| Entry | "HR selects track" → "External" | `Index.tsx` → `navigate('/external')` | ✅ Works | — |
| Stage 1 | "Upload CV" (no HR opinion) | `ExternalPipeline.tsx` → add candidate form | ✅ UI exists | Wire file upload to n8n |
| Stage 1 | "AI: Parse CV to text" | — | ❌ **MISSING** | n8n "Extract from File" node |
| Stage 1 | "AI: Build candidate JSON" → "CV only + confidence scores" | `mockGenerateProfile()` | ⚠️ **MOCK** | Replace with Agent 0b call (no HR opinion in payload) |
| Stage 1 | "Store candidate JSON" | `addPipelineCandidate()` → localStorage | ⚠️ **PARTIAL** | Same as internal |
| Stage 2 | "Describe scenario" | Same `InputState.tsx` flow | ✅ UI exists | Wire to Agent 1 |
| Stage 2 | "AI: Generate scenario JSON" + Q&A | Same as internal | ⚠️ **MOCK** | Same as internal |
| Stage 3 | "AI: Score candidates" | `mockScoreCandidates()` | ⚠️ **MOCK** | Replace with Agent 2 ×N |
| Stage 3 | "Ranked list + justification" | Shared `ResultsState.tsx` rendering | ⚠️ **PARTIAL** | Must render Agent 2 + Agent 4 output |
| Stage 3 | "Final report" | — | ❌ **MISSING for external** | External track has no cost-analysis step and no Agent 3 integration. Agent 3 fires only when both internal AND external candidates exist — this conditional logic is not implemented. |

### Cross-track gap: Agent 4 (Sensitivity)

The sequence diagram does not explicitly label Agent 4 as a separate node, but the spec requires it as the post-analysis sensitivity panel. **Neither track** currently calls Agent 4. The `ResultsState.tsx` scenario toggle fakes it with array reordering.

---

## 10. Missing Files

| File | Purpose | Who owns it |
|------|---------|-------------|
| `data/candidates.json` | Write target — Agent 0b appends structured candidate JSON here on each upload. The frontend dashboard reads from this file. | Person C (data) |
| `data/scenarios.json` | Read only — locked scenario weight definitions for Agent 4. **Updated:** contains 2 real BMW scenarios (not 4 abstract ones): (1) Iran-Israel MENA geopolitical crisis: stakeholder_trust 0.32, change_adaptability 0.28, external_network 0.22, crisis_management 0.12, operational_depth 0.06. (2) BWMOS software org build: change_adaptability 0.38, external_network 0.28, stakeholder_trust 0.20, operational_depth 0.09, crisis_management 0.05. Agent 4 reads these; it never calls Agent 1 again. | Person C (data) |
| `n8n/workflow.json` | Exportable n8n pipeline. Judges import this. Must be exported and committed after every working milestone (after PDF parse, after Agent 0b, after Agent 1, after Agent 2, after Agent 3, after Agent 4). Recovery point if n8n Cloud resets. | Person B (agents/pipeline) |
| `src/lib/api.ts` (or equivalent) | Central n8n webhook URL configuration and `fetch()` helper functions for each agent call. Does not exist — there is no API layer at all. | Person A (frontend) |

### Files that are NOT needed (confirming no AWS)

The following files from earlier specs have been explicitly removed from scope. They do not need to exist:
- ~~`infrastructure/lib/n8n-stack.ts`~~ — n8n Cloud handles hosting
- ~~`infrastructure/lib/storage-stack.ts`~~ — no EFS/S3
- ~~`infrastructure/lib/secrets-stack.ts`~~ — API keys in n8n Cloud credentials store
- ~~`agents/contextAgent.js`~~ — agent logic lives in n8n nodes, not code files
- ~~`agents/profileAgent.js`~~
- ~~`agents/decisionAgent.js`~~
- ~~`agents/scenarioAgent.js`~~
- ~~`pipeline/index.js`~~

**n8n Cloud IS the backend. No custom server files.**

---

## 11. Priority Build Order

~30 hours remaining until deadline (Sunday 30 March 18:00 CET).

### MUST SHIP (blocks everything downstream)

- [ ] **End-to-end spike:** Lovable → n8n webhook → one raw Claude API call → response rendered in UI. Proves the integration chain works.
- [ ] **PDF parse node + Agent 0b wired (both tracks):** n8n "Extract from File" → Agent 0b (Sonnet 4.6, temp 0) → candidate JSON with `dimension_evidence` + `confidence_scores`. No candidates in store = nothing works downstream.
- [ ] **Agent 1 dynamic Q&A wired:** Replace hardcoded `questions` array and `getNextMissingField()` with Agent 1 multi-turn API calls. Remove `FIELD_QUESTIONS` dictionary. Dynamic, contextual questions.
- [ ] **Agent 2 parallel scoring wired:** Replace `mockScoreCandidates()` `Math.random()` with Agent 2 ×N parallel calls (Haiku 4.5, temp 0, 200ms delay). Dimension-level scores only — never an overall rating.

### HIGH (needed for full judging score)

- [ ] **Agent 3 cost analysis + recommendation wired:** Replace `mockCostAnalysis()` hardcoded decision tree. 4-cost breakdown + INTERNAL/EXTERNAL recommendation + vacancy cost per week.
- [ ] **Agent 4 sensitivity panel wired with delta arrows:** Replace `getCandidatesForScenario()` array reordering. Agent 4 reads `scenarios.json` locked weights, returns ranked arrays with ▲▼ deltas. Relabel UI: "Sensitivity Analysis — How rankings shift under different conditions."
- [ ] **Export `n8n/workflow.json`** after each milestone — this is the recovery point AND judges import it.

### MEDIUM

- [ ] **Replace `candidates.ts` data entirely** — 12 new candidates (6 internal + 6 external) from Sample candidates file. Remove old 6.
- [ ] **Rename dimension keys** from abbreviations (`crisis_mgmt`) to 5 canonical IDs (`crisis_management`) everywhere. Do NOT add `digital_literacy`.
- [ ] **Confidence score interface + amber indicator UI** on candidate cards for dimensions where `confidence_score < 0.4`.
- [ ] **HR opinion absent (not null) for external candidates** — enforce at the API payload level.
- [ ] **Create `data/scenarios.json`** with the 2 real scenarios (Iran-Israel MENA crisis + BWMOS software org) — not the 4 abstract types.
- [ ] **Create `data/candidates.json`** as the write target for Agent 0b output.
- [ ] **Update scenario chips in `InputState.tsx`** — replace generic chips with the 2 real BMW scenario descriptions.

### LOW

- [ ] Styled error card on pipeline failure (not blank screen)
- [ ] n8n execution log shown in video
- [ ] Every n8n node configured with 1 automatic retry

### NEVER CUT

- ⚡ **Sensitivity panel (Agent 4)** — this IS the product's promise. "How does that change if the situation changes tomorrow?"
- ⚡ **Dynamic Q&A (Agent 1)** — static question lists will fail judge scrutiny when they ask "Is this really multi-agent or just one prompt?"
- ⚡ **Dimension-level scoring only (Agent 2)** — no overall ratings. This is the core differentiator vs. the 7/8 centrality bias.

---

## 12. Quick Wins (< 30 min each)

These fast fixes make the app look production-ready before the full pipeline integration is complete.

1. ~~Add `digital_literacy` to `candidates.ts`~~ — **REMOVED from scope.** `digital_literacy` has been dropped from the official data schema. Do NOT add it.

2. **Replace `candidates.ts` data entirely** — the 6 candidates (Thomas, Claire, Mehmet, Kai, Priya, Sara) must be replaced with the 12 new candidates from the Sample candidates file. 6 internal: Thomas Richter, Aisha Okonkwo-Brandt, Marcus Chen, Ingrid Solberg, Ralf Baumgärtner, Leila Ahmadi. 6 external: Claire Dubois, James Okafor, Yuki Tanaka-Hoffmann, Sebastián Vargas, Natasha Volkov, Hans-Peter Grunewald. ~30 min (copy from Sample candidates file).

3. **Rename dimension keys everywhere** — find-and-replace `crisis_mgmt` → `crisis_management`, `ops_depth` → `operational_depth`, `change_adapt` → `change_adaptability`, `stakeholder` → `stakeholder_trust`, `external_net` → `external_network`. ~20 min.

4. **Leave Index.tsx copy as "five competency dimensions"** — this is now correct. Do NOT change to "six".

4. **Fix the hardcoded Decision Panel in ResultsState.tsx** — lines 141–178 hardcode "INTERNAL HIRE", "82% confidence", and a paragraph about Thomas Richter. Even before Agent 3 is wired, this should render dynamically from the scoring data. ~20 min.

5. **Create placeholder `data/scenarios.json`** with the confirmed crisis weights and skeleton entries for the other 3 scenarios. This unblocks Agent 4 development. ~10 min.

6. **Create `src/lib/api.ts`** with the n8n webhook URL and typed `fetch()` wrappers for each agent call. Even if they initially call mocks, having the API layer defined makes the wiring switch fast. ~20 min.

7. **Fix `BuildingState.tsx` weight keys** — currently shows 5 abbreviated keys with `Math.random()`. Replace with 6 canonical dimension keys. Even before Agent 1 is wired, this makes the JSON animation match the spec. ~10 min.

8. **Add "Sensitivity Analysis" section label** in `ResultsState.tsx` above the scenario toggle. Reframe from "switch scenario" to "what-if comparison". ~5 min.

9. **Remove hardcoded `questions` array import** from `ClarifyingState.tsx` and make the question source a prop — preparing it for dynamic Agent 1 questions without breaking the current flow. ~15 min.

10. **CORS pre-flight test** — once the first n8n webhook is set up, test from the Lovable domain (not Postman). Fix immediately if blocked. ~10 min.

---

## Additional Issues Found (Beyond the 10 Confirmed)

### 11. Two separate scoring systems coexist

`ResultsState.tsx` uses `Candidate` type from `candidates.ts` (with `fitScore`, `scores`, `headline_strength/risk`). `InternalPipeline.tsx` and `ExternalPipeline.tsx` use `ScoringResult` type from `pipelineStore.ts` (with `overallScore`, `breakdown`, `dimensions[]`, `strengths[]`, `risks[]`). These are completely different data shapes. The Dashboard route appears to use the `candidates.ts` system while the Pipeline routes use `pipelineStore.ts`. Once agents are wired, there should be one unified scoring data model matching the Agent 2 output schema.

### 12. ResultsState.tsx Decision Panel is fully hardcoded

Lines 141–178 render a static "INTERNAL HIRE" recommendation with "82% confidence" and a hardcoded paragraph about Thomas Richter. This does not change with scenario selection or candidate data. It must become dynamic, rendering Agent 3's actual output.

### 13. BuildingState.tsx scenario classification is regex-based

`deriveScenarioType()` uses simple regex (`/crisis|urgent|failing/`) to classify scenarios. Agent 1 replaces this entirely — scenario classification should come from the AI, not from keyword matching.

### 14. Progress bar is hardcoded to 5 steps

`ClarifyingState.tsx` calculates progress as `(currentQuestion / 5) * 100`. The spec says progress should reflect fields filled vs. total mandatory fields, which varies per scenario description. This must become dynamic based on Agent 1's response.

### 15. No error handling for API failures

Neither pipeline page has any error handling, loading states for API calls, or retry logic. The spec requires: styled error card on failure ("Analysis unavailable — please try again"), not a blank screen or JS crash.

### 17. OpenAI-first spike strategy (n8n 100 free credits)

The team has 100 free OpenAI credits available via n8n. **Recommended use:** Use the n8n native OpenAI node (gpt-4o-mini) for the end-to-end spike in Block 2 only — this validates the pipeline architecture (Lovable → webhook → AI call → response) without consuming Claude API budget. The native OpenAI node in n8n is simpler to configure (dropdown credential, no custom headers required) compared to Claude's HTTP Request node.

**Migration to Claude must happen in Block 3 (by ~22:15 CET), not later.** Do not use the free credits for Agent 0b or any real agent work. Reasons: (a) Claude and OpenAI produce differently structured responses — the `content[0].text` wrapper in Claude responses requires a different extraction step in n8n; (b) the 7/8 centrality bias characteristic that Agent 2 is designed to defeat cannot be validated with OpenAI — only Claude's dimension-level behaviour matters for the core differentiator; (c) the n8n node TYPE changes during migration (OpenAI dropdown node → HTTP Request node), not just the model string, so migrating tired on Sunday morning introduces new bugs.

**Credit budget:** 100 credits ≈ 10 full pipeline test runs (10 API calls per run). Use all 100 on the spike and structural validation only. Never use them after CP1 is confirmed with Claude.

### 16. `candidateStore.ts` seeds from hardcoded data

`loadCandidates()` seeds localStorage with `crisisCandidates` on first load. In production, this store should be populated by Agent 0b output (appended to `candidates.json`), not hardcoded. **With the candidate data update, `crisisCandidates` now needs to be replaced with the 12 new candidates — otherwise `candidateStore.ts` seeds with stale data.** The seed data is useful for demos but should reflect the real candidate pool.

---

## 13. Critical Data Changes (28 March Update)

> These changes were discovered by reading the new `Sample Scenarios` and `Sample candidates` files added to `Talenza-draft/`. All sprint planning and implementation work should reflect these.

### 13.1 Candidate Pool: 12 candidates replacing original 6

The original 6 candidates in `candidates.ts` (`Thomas Richter, Claire Dubois, Mehmet Yilmaz, Kai Hofmann, Priya Nair, Sara Lindqvist`) are **partially replaced**. Thomas Richter (internal) and Claire Dubois (external) remain, but all others are new. The new complete set:

**Internal (6):**
| # | Name | Role | Best Scenario | Worst Scenario |
|---|------|------|--------------|----------------|
| 1 | Thomas Richter | Plant Manager, BMW Leipzig | crisis | transformation |
| 2 | Aisha Okonkwo-Brandt | Head of Supply Chain Transformation, BMW | transformation | succession |
| 3 | Marcus Chen | Director Software & Connected Services, BMW | transformation | crisis |
| 4 | Ingrid Solberg | VP International Operations & Market Expansion | growth | crisis |
| 5 | Ralf Baumgärtner | CFO, BMW Motorrad | succession | transformation |
| 6 | Leila Ahmadi | Head of Talent Strategy & Organisational Innovation | transformation | crisis |

**External (6):**
| # | Name | Role | Best Scenario | Worst Scenario |
|---|------|------|--------------|----------------|
| 1 | Claire Dubois | COO, Stellantis Manufacturing | growth | crisis |
| 2 | James Okafor | SVP Global Manufacturing Operations, Ford | crisis | succession |
| 3 | Yuki Tanaka-Hoffmann | VP Manufacturing Excellence & Quality, Toyota Europe | growth | crisis |
| 4 | Sebastián Vargas | CEO, BYD Latin America | growth | crisis |
| 5 | Natasha Volkov | VP Engineering & Product, Waymo | transformation | crisis |
| 6 | Hans-Peter Grunewald | COO, Volkswagen Commercial Vehicles | TBD | TBD |

**Action required:** `candidates.ts`, `candidateStore.ts`, and any seed data must be replaced before demo day.

**New sensitivity panel demo story:** Thomas Richter (internal, crisis specialist) vs. Marcus Chen (internal, software/transformation specialist). Under the MENA crisis scenario, Thomas ranks #1 (or top 2). Switch to BWMOS scenario and Thomas drops to near-bottom — Marcus rises to top. This is more impactful than the old Thomas/Sara story because both are internal candidates, making the internal-vs-external decision more complex.

### 13.2 Scenarios: 2 real scenarios replacing 4 abstract types

The scenario set is now 2 specific BMW scenarios (not generic types):

**Scenario 1 — Iran-Israel MENA Geopolitical Crisis**
- BMW Middle East operations, sanctions compliance, dealer network disruption
- Weights: `stakeholder_trust: 0.32, change_adaptability: 0.28, external_network: 0.22, crisis_management: 0.12, operational_depth: 0.06`
- Unique pressures: geopolitical complexity, personal security risk, search firm confidentiality constraint, 6-week deadline

**Scenario 2 — BWMOS Software Org Build (competition with VW/Mercedes)**
- Build BMW's in-house software division from zero, compete with FAANG for talent
- Weights: `change_adaptability: 0.38, external_network: 0.28, stakeholder_trust: 0.20, operational_depth: 0.09, crisis_management: 0.05`
- Unique pressures: compensation band constraint, 18–20 week timeline, greenfield team build, capital markets day deadline

**Impact on `data/scenarios.json`:** The file should contain these 2 scenarios, not the 4 abstract (crisis/transformation/growth/succession) types. Update `InputState.tsx` scenario chips to describe these real situations.

### 13.3 Scenario JSON Schema: 10x more complex than expected

The `Sample Scenarios` file reveals that Agent 1's output schema is **far more complex** than anticipated. It includes:

- `derived.classification` — scenario type with confidence score (0.0–1.0) and ambiguity flag
- `derived.weight_calculation.base_weights` — starting weights before modifiers
- `derived.weight_calculation.modifiers_applied` — array of named modifiers (urgency_modifier, geopolitical_modifier, etc.) showing exactly WHY weights shifted
- `derived.weight_calculation.final_weights` — post-modifier weights, each with its own confidence score and `confidence_reasoning`
- `derived.weight_calculation.weight_validation` — sum check + `low_confidence_dimensions` + `validation_questions_triggered`
- `derived.floor_constraints` — minimum acceptable scores per dimension; below-floor candidates get knockout warnings
- `derived.dimension_correlation_warnings` — flags dimension pairs that might double-count the same capability
- `derived.scenario_intelligence` — scenario summary, hidden complexity flags, candidate archetypes to seek/avoid, interview question themes
- `derived.completeness` — `null_mandatory_fields` (each with `qa_question` pre-written), `ready_for_analysis` boolean

**Impact on Agent 1 system prompt:** The system prompt must instruct Claude to produce this full schema, not just a simple `{ weights: {...}, role_title: "..." }` object. This is significantly more work than originally estimated. However, the `qa_question` fields in `completeness.null_mandatory_fields` are **auto-generated by Agent 1** — the frontend just needs to display them, not generate them.

**Impact on sprint planning:** Agent 1 Phase 1 + Phase 3 are now more complex to prompt-engineer. Budget extra time (M1 +30 min, M3 +20 min) for the system prompt. Test Agent 1 output schema compliance before wiring to frontend.

### 13.4 Dimension Key Mismatch: Two naming conventions in same schema

The scenario JSON schema (`Sample Scenarios`) uses **abbreviated keys** in `base_weights` and `final_weights` (`crisis_mgmt`, `ops_depth`, etc.) while the candidate profile JSONs (`Sample candidates`) use **canonical keys** (`crisis_management`, `operational_depth`, etc.). This is an internal inconsistency in the new data files.

**Decision needed:** Pick one and enforce everywhere. Recommendation: canonical keys throughout (`crisis_management` etc.) — they're already used in candidate profiles and are more readable. Update `scenarios.json` to use canonical keys. Agent 1 system prompt must output canonical keys in the `weights` object.
