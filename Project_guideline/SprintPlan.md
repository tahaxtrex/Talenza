# Talenza — Sprint Plan & Master TODO
> **Started:** Saturday 20:46 CET
> **Current:** Saturday **21:04 CET** ← YOU ARE HERE (Block 1 in progress — 18 min elapsed)
> **Submit:** Sunday 17:00 CET (hard stop — 1h buffer before 18:00 deadline)
> **Total window:** ~20h remaining
> **Team:** Person A (Frontend) · Person B (Agents/n8n) · Person C (Data/Integration)

---

## ⚫ NEVER CUT — Read This First

These three things must ship regardless of what breaks. If you run out of time, cut everything else before touching these:

1. **Agent 4 Sensitivity Panel with real ▲▼ delta arrows** — this IS the product's promise
2. **Agent 1 Dynamic Q&A** — judges will ask "is this really multi-agent?" Static lists kill that answer
3. **Dimension-level scoring only (Agent 2)** — no overall ratings, ever — this defeats the 7/8 centrality bias and is the core differentiator

---

## OUTPUT 1 — MASTER TODO LIST

### 🔴 CRITICAL PATH — Nothing works without these

| # | Task | Owner | Est. | Blocks |
|---|------|-------|------|--------|
| C1 | Create n8n Cloud workflow + Webhook node + store Claude API key in n8n credentials store | B | 20 min | Everything |
| C2 | Create `src/lib/api.ts` — define `N8N_WEBHOOK_URL` constant + typed `fetch()` helper functions (one per agent) | A | 30 min | All frontend wiring |
| C3 | Create `data/candidates.json` stub (empty array `[]`). **Also:** replace `crisisCandidates` in `candidates.ts` completely — new 12 candidates (6 internal: Thomas Richter, Aisha Okonkwo-Brandt, Marcus Chen, Ingrid Solberg, Ralf Baumgärtner, Leila Ahmadi; 6 external: Claire Dubois, James Okafor, Yuki Tanaka-Hoffmann, Sebastián Vargas, Natasha Volkov, Hans-Peter Grunewald). Remove Mehmet Yilmaz, Kai Hofmann, Priya Nair, Sara Lindqvist entirely. | C | 20 min | Agent 0b save + UI data |
| C4 | Create `data/scenarios.json` with the 2 confirmed real scenarios: Iran-Israel (stakeholder_trust 0.32, change_adaptability 0.28, external_network 0.22, crisis_management 0.12, operational_depth 0.06) and BWMOS (change_adaptability 0.38, external_network 0.28, stakeholder_trust 0.20, operational_depth 0.09, crisis_management 0.05). These replace the 4 abstract scenario types. | C | 20 min | Agent 4 |
| C5 | Create `n8n/` directory + commit empty `workflow.json` placeholder | C | 5 min | Judge import |
| C6 | **End-to-end spike**: A POSTs from Lovable → B's n8n Webhook → HTTP Request to Claude API → raw JSON back → A renders it in UI | A + B | 45 min | All agent wiring |
| C7 | Enable "Allow all origins" CORS on n8n Webhook node. Test from Lovable domain in browser (not Postman) | B | 10 min | CORS silently blocking all calls |
| C8 | Build n8n "Extract from File" PDF parse node (not a Claude call) — outputs plain text | B | 20 min | Agent 0b |
| C9 | Build Agent 0b — internal track: CV plain text + HR opinion → candidate JSON with `dimension_evidence` + `confidence_scores` for all 6 dims | B | 45 min | All scoring |
| C10 | Build Agent 0b — external track: CV plain text only, `hr_opinion` key **absent** (not null) | B | 20 min | External scoring |
| C11 | Wire `InternalPipeline.tsx`: replace `mockGenerateProfile()` → real `fetch()` to n8n → Agent 0b | A | 45 min | Internal candidate ingestion |
| C12 | Wire `ExternalPipeline.tsx`: replace `mockGenerateProfile()` → real `fetch()` to n8n → Agent 0b | A | 30 min | External candidate ingestion |

---

### 🟠 MUST SHIP — Directly scored by judges

| # | Task | Owner | Est. | Blocks |
|---|------|-------|------|--------|
| M1 | Build Agent 1 Phase 1 — parse free-text → partially filled scenario JSON, classify `scenario_type`, identify null fields | B | 45 min | Q&A loop |
| M2 | Build Agent 1 Phase 2 — for each null field, generate one dynamic contextual question referencing user's prior text (never batched, never hardcoded) | B | 60 min | Dynamic Q&A |
| M3 | Build Agent 1 Phase 3 — when no nulls remain, output complete scenario JSON with 6 weights summing to 100 | B | 30 min | All scoring |
| M4 | Wire `ClarifyingState.tsx` → replace hardcoded `questions[]` import and `FIELD_QUESTIONS` dict with live Agent 1 Phase 2 `fetch()`. Make progress bar dynamic from `remaining_null_fields` count in response. | A | 60 min | Real Q&A experience |
| M5 | Wire `BuildingState.tsx` → replace `Math.random()` weights and 5 wrong dimension keys with Agent 1 Phase 3 real output. Show all 6 canonical dimension keys. | A | 30 min | Correct scenario JSON display |
| M6 | Wire `InputState.tsx` → replace `mockParseScenario()` with `fetch()` to n8n Agent 1 Phase 1 | A | 30 min | Scenario pipeline entry |
| M7 | Build Agent 2 — scoring ×N parallel (one call per candidate). Haiku 4.5, temp 0. Output: per-dimension scores (X.X/10) + one-line evidence citing CV facts + flag (green ≥7 / amber 4–6.9 / red <4). **NEVER an overall rating.** | B | 60 min | Ranked list |
| M8 | Configure n8n Agent 2 batch: Split In Batches → HTTP Request ×N → Merge → 200ms inter-call delay | B | 20 min | Rate limit protection |
| M9 | Rename ALL dimension keys from abbreviations to canonical IDs throughout codebase (`crisis_mgmt`→`crisis_management`, `ops_depth`→`operational_depth`, `change_adapt`→`change_adaptability`, `stakeholder`→`stakeholder_trust`, `external_net`→`external_network`). **Note:** `digital_literacy` has been DROPPED from the new data schema — the canonical set is now 5 dimensions only. Remove `digital_literacy` from anywhere it was added, and remove it from Index.tsx "six competency dimensions" copy (revert Q1 — it should say "five"). | A | 30 min | Agent output matching |
| M10 | ~~Add `digital_literacy` as 6th dimension~~ **REPLACED:** Confirm `digital_literacy` is ABSENT everywhere. Update `Candidate` interface to 5 canonical keys. Update `scoreLabels`, `ScoringResult`, `breakdown`, `CandidateScoreCard.tsx`, `BuildingState.tsx` to match. Check scenario JSON schema (`base_weights` and `final_weights` in `scenarios.json`) — these still use abbreviated keys `crisis_mgmt` etc. and must be migrated to canonical. Scenario JSON schema also has no `digital_literacy` weight key — confirm and align. | A | 25 min | Schema alignment |
| M11 | Unify the two scoring data models (`Candidate` from `candidates.ts` vs `ScoringResult` from `pipelineStore.ts`) into one that matches Agent 2 JSON output shape | A | 45 min | Consistent results display |
| M12 | Wire scoring display: replace `mockScoreCandidates()` with `fetch()` to n8n Agent 2 result. Render real dimension scores on `CandidateScoreCard.tsx`. | A | 60 min | Real scores visible |
| M13 | Build Agent 3 — cost analysis: `INTERNAL`/`EXTERNAL` recommendation + confidence % + 4-cost breakdown (Opportunity Cost, Execution Risk, Cultural Damage, Time Cost) + vacancy cost per week. Fires ONLY when both tracks have candidates. | B | 45 min | Sourcing recommendation |
| M14 | Wire `ResultsState.tsx` Decision Panel → replace hardcoded "INTERNAL HIRE" / "82% confidence" / Thomas Richter paragraph with Agent 3 real output | A | 45 min | Real recommendation visible |
| M15 | ⚫ Build Agent 4 — sensitivity: input = all Agent 2 scores + 2 scenario weight sets from `scenarios.json` (Iran-Israel geopolitical + BWMOS software). Output = ranked array per scenario with delta (▲▼) vs primary. **New demo story:** Thomas #1 crisis → drops significantly under BWMOS (low change_adaptability + external_network). James Okafor #1 or #2 crisis → also drops under BWMOS. Natasha Volkov (Waymo) rises under BWMOS. | B | 60 min | THE demo moment |
| M16 | ⚫ Wire `ResultsState.tsx` scenario switch → replace `getCandidatesForScenario()` and 1500ms fake timeout with `fetch()` to Agent 4. Render delta arrows from response. **Update scenario labels** from generic (crisis/transformation/growth/succession) to real scenario names ("Geopolitical Crisis — MENA" and "Software Org Build — BWMOS"). | A | 45 min | THE demo moment |
| M17 | Confirm both scenario weight sets are locked in `scenarios.json`. Run Agent 1 with both scenario texts and verify its output weights converge to the expected distributions. Update `scenarios.json` with the Agent 1 stable output if it differs from the hand-specified values. | C | 30 min | Agent 4 correctness |
| M18 | Export `n8n/workflow.json` after each working milestone (PDF parse ✓, Agent 0b ✓, Agent 1 ✓, Agent 2 ✓, Agent 3 ✓, Agent 4 ✓) | B | 5 min × 6 | Judge import + recovery |

---

### 🟡 HIGH VALUE — Improves score, not blocking

| # | Task | Owner | Est. | Impact |
|---|------|-------|------|--------|
| H1 | Add `confidence_scores: { [dimension]: number }` to `CandidateProfile` interface | A | 10 min | AI & Agent Quality (+) |
| H2 | Add amber indicator on candidate card for any dimension where `confidence_score < 0.4` — label: "Limited CV evidence" | A | 25 min | UX (10 pts) |
| H3 | Add error handling: on API failure show styled error card ("Analysis unavailable — please try again.") — never blank screen or JS crash | A | 30 min | Working Functionality (25 pts) |
| H4 | Set every n8n node to 1 automatic retry | B | 15 min | Working Functionality (25 pts) |
| H5 | Run Haiku quality test on Agent 2: verify evidence lines cite specific CV facts not generic phrases. If generic → upgrade Agent 2 to Sonnet 4.6. | C | 20 min | AI & Agent Quality (20 pts) |
| H6 | Verify Anthropic API tier — confirm no 429 rate limit risk for 6 parallel Haiku calls | C | 10 min | Demo stability |
| H7 | Add vacancy cost per week display to Agent 3 output panel | A | 20 min | Business Relevance (30 pts) |
| H8 | Screenshot n8n canvas at 2:20 mark in video — prepare label annotations | B | 10 min | Video Clarity (5 pts) |

---

### 🟢 QUICK WINS — Under 30 min, do between blocks

| # | Task | Owner | Est. | Do When |
|---|------|-------|------|---------|
| Q1 | Fix `Index.tsx` line 49: keep "five competency dimensions" — `digital_literacy` has been dropped from the new data schema. The canonical count is 5. Do NOT change to "six". | A | 2 min | First thing |
| Q2 | Relabel ResultsState scenario toggle section: "Sensitivity Analysis — How rankings shift under different conditions." | A | 5 min | Before demo |
| Q3 | Fix `BuildingState.tsx` dimension keys in JSON animation (5 abbreviated → 6 canonical) | A | 15 min | During Agent 1 wiring |
| Q4 | Remove hardcoded Thomas Richter paragraph from `ResultsState.tsx` Decision Panel (lines 141–178) | A | 10 min | Before demo |
| Q5 | Add AI disclaimer footer on results page: "AI-assisted analysis. Final decision remains with the hiring committee." | A | 5 min | Before video |
| Q6 | Verify `data/scenarios.json` has BOTH real scenarios locked with correct keys. Update scenario chip labels in `InputState.tsx` — replace generic chips (operational crisis / digital transformation) with the 2 real scenario description chips (Iran-Israel MENA crisis, BWMOS software org). | C | 20 min | During Agent 1 testing |
| Q7 | Add n8n canvas annotated screenshot to README | C | 15 min | After Agent 4 done |
| Q8 | Add `narrative_summary` display on candidate card expanded view | A | 20 min | After M12 done |
| Q9 | Verify CORS from Lovable domain (browser DevTools → Network → OPTIONS) | C | 10 min | Immediately after C7 |

---

## OUTPUT 2 — HOUR-BY-HOUR SPRINT PLAN

> Format per block: TIME · Person A · Person B · Person C · Checkpoint · Risk

---

### 🌙 SATURDAY NIGHT — Setup & Spike (20:46–03:00)

---

**20:46–21:15 | Block 1 — Setup**

| | Task |
|--|------|
| **A** | Create `src/lib/api.ts`: define `N8N_WEBHOOK_URL = ''` placeholder, stub 5 typed `fetch()` functions (one per agent). Fix Q1: "five"→"six" in Index.tsx. **Also:** replace `crisisCandidates` in `candidates.ts` with the 12 new candidates from Sample candidates file — 6 internal, 6 external. |
| **B** | Create n8n Cloud workflow. Add Webhook node. **Add OpenAI credentials** using n8n's 100 free credits (use the native OpenAI node — no custom headers needed). Also add Claude API key to n8n credentials store for the real migration in Block 3. |
| **C** | Create `data/candidates.json` (`[]`), `data/scenarios.json` with the 2 confirmed real scenarios (Iran-Israel geopolitical crisis + BWMOS software org). Create `n8n/` directory. Push to GitHub. |
| ✅ | **End of block:** n8n webhook URL exists. api.ts exists. data files exist. Both OpenAI and Claude credentials stored. Everyone has the webhook URL. |
| ⚠️ | Risk: n8n free credits may only be available on specific plan — verify this is active before relying on it. Have Claude API key as fallback. |

---

**21:15–21:45 | Block 2 — Spike build (OpenAI first)**

> **Strategy:** Use n8n's native OpenAI node for the spike. It's simpler (dropdown credential, no custom headers), uses free credits, and validates the pipeline architecture. **This is NOT the final integration** — migration to Claude API happens in Block 3.

| | Task |
|--|------|
| **A** | Add a hidden "Test Spike" button to InternalPipeline that POSTs `{ test: true }` to the webhook URL from api.ts. Log the response to console. |
| **B** | In n8n: add **OpenAI node** (not HTTP Request) → select gpt-4o-mini → send "Return JSON: { status: 'ok', message: 'spike works' }" → return response. Enable CORS "Allow all origins" on Webhook node. Test in Postman first. |
| **C** | Write Agent 0b system prompt (internal track). Draft in a plain text file. Note: draft for Claude but the spike test will use gpt-4o-mini. Share draft with B. |
| ✅ | **End of block:** n8n workflow: Webhook → OpenAI node → gpt-4o-mini → Respond. B tested in Postman. Pipeline architecture confirmed. Free credits used. |
| ⚠️ | Budget: 100 free credits total. Each full pipeline test = ~10 calls. Use free credits ONLY for spike + structure validation. Switch to Claude before Agent 0b testing. |

---

**21:45–22:15 | Block 3 — Spike verify + Claude migration**

> **This block completes the spike AND migrates to Claude API.** By the end of Block 3, all subsequent work uses Claude — not OpenAI.

| | Task |
|--|------|
| **A** | Click "Test Spike" from Lovable browser tab. Open DevTools → Network. Verify CORS passes (no blocked OPTIONS request). If successful, render response string in UI. |
| **B** | ⚡ **Claude migration:** Replace the OpenAI node with an HTTP Request node. Set: `POST https://api.anthropic.com/v1/messages`, headers `x-api-key: {{$credentials.claudeApiKey}}`, `anthropic-version: 2023-06-01`, `Content-Type: application/json`. Body: `{ model: 'claude-sonnet-4-6', max_tokens: 100, messages: [{role:'user', content:'Return JSON: {status:"ok"}'}] }`. Verify Claude responds. The OpenAI node is now deleted. |
| **C** | Verify Claude response shape differs from OpenAI: Claude wraps content in `content[0].text` — update the n8n "Set" node to extract this correctly. Finalise Agent 0b output JSON schema (all 5 canonical dimensions, no digital_literacy). |
| ✅ | **CHECKPOINT 1 ~22:15:** Lovable → n8n webhook → **Claude API** → JSON response renders in the browser. CORS working. All subsequent work is Claude-only. |
| ⚠️ | **BLOCKER:** If Claude HTTP Request node returns 401, check: `x-api-key` header (not `Authorization: Bearer`). If CORS blocks, add `Access-Control-Allow-Origin: *` on n8n Respond node. Do not proceed to Block 4 until CP1 is confirmed with Claude, not OpenAI. |

---

**22:15–22:45 | Block 4 — PDF parse + Agent 0b internal**

| | Task |
|--|------|
| **A** | Update InternalPipeline CV upload form to send PDF as `multipart/form-data` (not just filename string). The file object must be in the POST body. |
| **B** | Add n8n "Extract from File" node before Agent 0b. Wire: Webhook receives file → Extract from File → outputs plain text string → passed to Agent 0b as `cv_text`. Paste Agent 0b internal system prompt. |
| **C** | Test the PDF parse node with a real PDF. Verify plain text output is readable. Log it. Check for encoding issues. |
| ✅ | **End of block:** PDF goes in, plain text comes out of the n8n Extract node. Agent 0b node exists with system prompt. |
| ⚠️ | Risk: Large PDF times out. Test with a small 1-page CV first. |

---

**22:45–23:15 | Block 5 — Agent 0b complete both tracks**

| | Task |
|--|------|
| **A** | Replace `mockGenerateProfile('internal', ...)` in InternalPipeline.tsx with `fetch()` call to `api.ts → agentOb()`. Handle loading state. Store returned candidate JSON. |
| **B** | Wire Agent 0b end-to-end in n8n (internal track). Add conditional branch: if `source === 'external'` → omit `hr_opinion` key entirely from Claude prompt. Test with a real CV. |
| **C** | Validate Agent 0b output against spec schema. Check: `dimension_evidence` has all 6 dimensions. `confidence_scores` present. `hr_opinion` absent on external. `hard_flags` populated if notice period > 12 weeks. |
| ✅ | **End of block:** InternalPipeline adds a real candidate from a real PDF. JSON matches schema. |
| ⚠️ | Risk: Agent 0b returns generic evidence ("has good experience") instead of specific facts. If so → strengthen system prompt: "You MUST cite a specific achievement, project, or measurable outcome from the CV text. Never write generic phrases." |

---

**23:15–23:45 | Block 6 — External track + data save**

| | Task |
|--|------|
| **A** | Replace `mockGenerateProfile('external', ...)` in ExternalPipeline.tsx with real `fetch()`. Verify `hr_opinion` is absent from the payload (not null, not empty). |
| **B** | Complete external track Agent 0b. Add n8n step to append candidate JSON to `data/candidates.json` (or return it to frontend to store). Export `workflow.json` — first milestone commit. |
| **C** | Test both internal and external track with different PDFs. Commit test candidate JSONs to `data/candidates.json`. Confirm GitHub has the file. |
| ✅ | **End of block:** Both tracks produce real candidate profiles. `data/candidates.json` has real entries. `n8n/workflow.json` exported + committed. |

---

**23:45–00:15 | Block 7 — Checkpoint 2 + handoff notes**

| | Task |
|--|------|
| **A** | Verify candidate cards display `narrative_summary` and `dimension_evidence` from real API (not random traits). Do Q8: add narrative_summary to card expanded view. |
| **B** | Begin Agent 1 Phase 1 system prompt. The prompt must: parse free-text → fill known fields → return partial scenario JSON with nulls for unknown fields. Include `scenario_type` classification and initial `weights` if inferrable. |
| **C** | Run 3 test uploads (different CVs, internal + external). Note any schema gaps. Lock `data/scenarios.json` crisis weights. Begin drafting Agent 1 test cases (6 scenario chip texts). |
| ✅ | **CHECKPOINT 2 ~00:15 Sun:** Both tracks ingest real CVs. Real candidate JSON (with dimension_evidence) is visible in the UI. workflow.json committed. |

---

**00:15–00:45 | Block 8 — Agent 1 Phase 1**

| | Task |
|--|------|
| **A** | Wire `InputState.tsx` → replace `mockParseScenario()` with `fetch()` to Agent 1 Phase 1. Pass raw scenario text. Handle response: store partial scenario JSON, transition to ClarifyingState. |
| **B** | Build Agent 1 Phase 1 in n8n. Claude Sonnet 4.6, temp 0.2. System prompt: parse text → fill scenario JSON → mark null fields → return `{ scenario: {...}, null_fields: [...], progress_pct: N }`. |
| **C** | Test Agent 1 Phase 1 with all 6 scenario chip texts from InputState. Verify: correct `scenario_type` classification, reasonable initial weight estimates, correct null field identification. |
| ✅ | **End of block:** Free-text → partial scenario JSON. Null fields identified. `scenario_type` classified correctly for all 6 test scenarios. |
| ⚠️ | Risk: temp 0.2 produces inconsistent `scenario_type` classification. If so, add explicit classification rules to system prompt: "If text contains urgency/crisis/deadline keywords → crisis. If contains digital/transformation/EV/Industry 4.0 → transformation." |

---

**00:45–01:15 | Block 9 — Agent 1 Phase 2 (dynamic Q&A)**

| | Task |
|--|------|
| **A** | Refactor `ClarifyingState.tsx`: remove `import { questions } from '@/data/candidates'`. Each "send answer" now POSTs `{ scenario_json, latest_answer, target_field }` to Agent 1 Phase 2 endpoint. Render returned `question` string. Make progress bar use `progress_pct` from response. |
| **B** | Build Agent 1 Phase 2 in n8n. Input: current scenario JSON + user's latest answer + prior context text. Output: `{ question, target_field, updated_scenario, remaining_null_fields, progress_pct }`. System prompt rule: question MUST reference user's prior text. Bad: "How urgent?" Good: "You mentioned board pressure — how many weeks?" |
| **C** | ⚫ Test the Q&A loop manually: does each question reference prior context? Does it exit when `remaining_null_fields` is empty? Check all 11 mandatory fields are eventually filled. |
| ✅ | **End of block:** ClarifyingState shows AI-generated contextual questions. Progress bar is dynamic. Q&A exits correctly. |
| ⚠️ | Risk: Q&A loop never terminates (keeps finding null fields). Add explicit exit condition to Agent 1: "If `remaining_null_fields` is empty, do not generate a question — return Phase 3 finalisation instead." |

---

**01:15–01:45 | Block 10 — Agent 1 Phase 3 + BuildingState**

| | Task |
|--|------|
| **A** | Wire `BuildingState.tsx` to real Agent 1 Phase 3 output. Replace `Math.random()` weights and 5 abbreviated keys with real `weights` object using 6 canonical dimension IDs. Do Q3: fix dimension keys in JSON animation. |
| **B** | Build Agent 1 Phase 3 in n8n. When `remaining_null_fields` is empty → output complete scenario JSON with `weights` (6 dims summing to 100) + `scenario_rationale`. Add 1 automatic retry to all Agent 1 nodes. |
| **C** | Test Phase 3: verify weights always sum to 100. If they don't → add normalisation step in n8n. Log 5 test scenario outputs. Keep the ones closest to expected (crisis: crisis_management dominant, etc.). |
| ✅ | **End of block:** Agent 1 full flow works. Dynamic Q&A → finalised scenario JSON → real weights displayed in BuildingState JSON animation. |

---

**01:45–02:15 | Block 11 — Agent 1 integration + bug fix**

| | Task |
|--|------|
| **A** | Full end-to-end test: upload candidate → describe scenario → answer questions → see BuildingState with real scenario JSON. Fix any state management bugs. |
| **B** | Export `workflow.json` (second milestone). Fix any n8n execution errors. Confirm Agent 1 temp 0.2 gives consistent enough classification. |
| **C** | Run Agent 1 with all 4 scenario types (crisis, transformation, growth, succession). Record stable weight outputs. Update `data/scenarios.json` with these observed values. These become the Agent 4 reference weights. |
| ✅ | **CHECKPOINT 3 ~02:15 Sun:** Agent 1 complete. Dynamic contextual Q&A works. Scenario JSON with real weights produced. `scenarios.json` updated with 4 scenario weight sets. |

---

**02:15–02:45 | Block 12 — Quick wins batch + Agent 2 prep**

| | Task |
|--|------|
| **A** | Quick wins: Q4 (remove hardcoded Thomas Richter paragraph), M9 (rename all dimension keys), M10 (add digital_literacy everywhere). These are < 30 min each and unblock model matching later. |
| **B** | Write Agent 2 system prompt. Key rules: score each dimension X.X/10 citing SPECIFIC evidence from `dimension_evidence` field. If `confidence_score < 0.4` → write "Limited CV evidence — score provisional". NEVER produce an overall score. Output JSON only. |
| **C** | Prepare 3 complete test payloads for Agent 2 (candidate JSON + scenario weights). Stage them for B to test immediately when Agent 2 node is built. |

---

**02:45–03:00 | Block 13 — Sleep handoff**

| | Task |
|--|------|
| **A** | Write brief "state of the app" note: what's wired, what's pending, any known bugs. Go to sleep. |
| **B** | Continue solo (night guard). Build Agent 2. Document outputs. Sleep at 04:30. |
| **C** | Go to sleep. |

---

### 🌙 NIGHT SHIFT — B solo (03:00–04:30)

> A and C are sleeping. B builds Agent 2 alone — it's mostly n8n work with no frontend dependency.

**03:00–03:45 | Night Block 1 — Build Agent 2**

B builds Agent 2 n8n subflow:
- Input node: receives all candidate JSONs + scenario weights
- Split In Batches node: one batch = one candidate
- HTTP Request node → Haiku 4.5, temp 0, max_tokens 600
- 200ms delay between calls
- Merge node: collects all N scored candidate JSONs
- Output: array of `{ candidate_id, scores: [{ dimension, score, evidence, flag }] }`
- Test with 3 candidates. Verify evidence cites specific CV facts.
- Haiku quality check: if evidence says "good operational experience" instead of "Led Leipzig plant through 3-week shutdown" → add more specificity instruction to system prompt.
- Export `workflow.json` (third milestone).

**03:45–04:30 | Night Block 2 — Verify + Agent 3 prep**

B:
- Run Agent 2 against all 6 test candidates with crisis weights. Log the output.
- Verify: 6 dimensions scored. No overall rating. Evidence is specific. Flags are green/amber/red correctly.
- Write Agent 3 system prompt draft. Agent 3 input: all scored candidates + scenario JSON. Output: `{ recommendation: "INTERNAL"|"EXTERNAL", confidence_pct, cost_breakdown: { opportunity_cost, execution_risk, cultural_damage, time_cost }, vacancy_cost_per_week, reasoning }`.
- **B goes to sleep at 04:30.**

---

### 🌅 SLEEP WINDOW

| Person | Sleep | Wake |
|--------|-------|------|
| A | 03:00 | 08:00 (5h) |
| B | 04:30 | 08:30 (4h) |
| C | 03:00 | 08:00 (5h) |

> **Do not skip sleep.** Tired people make errors in n8n node wiring and TypeScript interfaces that cost 2+ hours to debug. 4 hours is the minimum.

---

### ☀️ SUNDAY MORNING — Wire + Score + Recommend (08:00–12:00)

---

**08:00–08:30 | Block 14 — Morning sync + Agent 2 wiring**

| | Task |
|--|------|
| **A** | Read B's night notes. Review Agent 2 output schema. Begin M11: unify `Candidate` and `ScoringResult` data models to match Agent 2 output shape. |
| **B** | (Still sleeping, wakes 08:30) |
| **C** | Review Agent 2 test outputs from B's logs. Run Haiku quality check (H5): are evidence lines specific or generic? Flag for B if upgrade to Sonnet needed. |

---

**08:30–09:00 | Block 15 — Agent 2 frontend wiring**

| | Task |
|--|------|
| **A** | Wire scoring display (M12): replace `mockScoreCandidates()` with `fetch()` to Agent 2. Update `CandidateScoreCard.tsx` to render real dimension scores from API. Add loading skeleton during call. |
| **B** | Wake up. Review A and C's morning notes. Fix any Agent 2 issues C flagged. Confirm Agent 2 endpoint works end-to-end. |
| **C** | Test the wired Agent 2 from the Lovable frontend. Verify all 6 dimension scores appear on cards. Check green/amber/red flags display correctly. |
| ✅ | **End of block:** CandidateScoreCard shows real dimension scores with evidence from actual CV content. |

---

**09:00–09:30 | Block 16 — Agent 2 polish + Checkpoint 4**

| | Task |
|--|------|
| **A** | Add confidence score amber indicator (H2): if any `confidence_score < 0.4` → show amber "Limited CV evidence" badge on that dimension. Add `confidence_scores` to CandidateProfile interface (H1). |
| **B** | Build Agent 3 node in n8n (paste system prompt from 04:30 draft). Wire: all scored candidates + scenario JSON → Agent 3 → recommendation JSON. |
| **C** | Full pipeline test: upload CV → define scenario → Q&A → see real scored candidates. Log any failures. |
| ✅ | **CHECKPOINT 4 ~09:30 Sun:** Agent 2 complete. Real dimension scores on candidate cards. Confidence indicators visible. Both tracks score candidates correctly. |

---

**09:30–10:00 | Block 17 — Agent 3 complete**

| | Task |
|--|------|
| **A** | Wire Decision Panel (M14): replace hardcoded "INTERNAL HIRE" / "82% confidence" / Thomas Richter paragraph with Agent 3 real output. Render: recommendation badge, confidence %, 4-cost breakdown rows, vacancy cost per week display (H7). |
| **B** | Test Agent 3 with both all-internal and mixed internal+external candidate sets. Verify it fires only when both exist. Verify 4-cost breakdown has meaningful values. Export `workflow.json` (fourth milestone). |
| **C** | Validate Agent 3 outputs for both test scenarios. Confirm: internal-only set does NOT trigger Agent 3. Mixed set DOES. Confidence % is meaningful (not always 82%). |
| ✅ | **End of block:** Agent 3 complete. Real INTERNAL/EXTERNAL recommendation visible. Decision panel no longer hardcoded. |

---

**10:00–10:30 | Block 18 — Agent 4 build**

| | Task |
|--|------|
| **A** | Begin M16: refactor `ResultsState.tsx` scenario switch to prepare for Agent 4. Remove `getCandidatesForScenario()` call. Replace `setTimeout(1500)` with real `fetch()` loading state. Keep delta arrow rendering logic — it will work once Agent 4 returns real deltas. |
| **B** | ⚫ Build Agent 4 in n8n. Input: all candidates with Agent 2 scores + 3 alternative weight sets from `scenarios.json`. Re-apply weights to existing dimension scores (do NOT re-score). Output per scenario: ranked array + delta vs primary ranking. Thomas: Crisis #1 → Transformation #6. Sara: Crisis #6 → Transformation #1. |
| **C** | ⚫ Verify `scenarios.json` has all 4 weight sets locked. Test Agent 4 with the 6 scored candidates. Confirm Thomas and Sara swap correctly between crisis and transformation scenarios. |
| ⚠️ | Risk: Agent 4 re-scores instead of re-ranks (calls Claude again per candidate). Must be a re-weighting calculation, not new scoring. |

---

**10:30–11:00 | Block 19 — Agent 4 wire + Checkpoint 5**

| | Task |
|--|------|
| **A** | ⚫ Complete M16: wire scenario switch `fetch()` to Agent 4 endpoint. Render returned ranked arrays. Delta arrows come from response `delta` field — not array index subtraction. Relabel section "Sensitivity Analysis — How rankings shift under different conditions." (Q2) |
| **B** | ⚫ Test Agent 4 end-to-end. Verify delta arrows are correct (▲▼). Export `workflow.json` (fifth milestone). Add 1 retry to Agent 3 + Agent 4 nodes (H4). |
| **C** | Full end-to-end pipeline test: both tracks. Upload 2 internal + 2 external CVs → describe scenario → Q&A → view ranked candidates → switch to transformation scenario → verify Sara moves up, Thomas moves down. |
| ✅ | **CHECKPOINT 5 ~11:00 Sun:** Full pipeline end-to-end. Agent 0b → 1 → 2 → 3 → 4 all wired. Sensitivity panel shows real ▲▼ delta arrows. Thomas and Sara swap correctly. |

---

**11:00–11:30 | Block 20 — Integration + error handling**

| | Task |
|--|------|
| **A** | Add error handling (H3): on API failure → show styled error card "Analysis unavailable — please try again." in each pipeline step. Never blank screen. Do Q5: add AI disclaimer footer. |
| **B** | Verify 200ms delay on Agent 2 batch. Set all remaining nodes to 1 retry. Run the full pipeline twice to confirm reproducible outputs (temp 0 for all except Agent 1). |
| **C** | Run 3 full end-to-end tests with different scenario descriptions. Log results. Check for edge cases: what happens if user uploads only 1 candidate? What if Agent 1 Q&A stalls? |

---

**11:30–12:00 | Block 21 — Buffer / final integration fixes**

| | Task |
|--|------|
| **A** | Fix any bugs from C's testing. Do remaining quick wins if time allows (Q8 narrative_summary, Q9 CORS check). |
| **B** | Fix n8n execution errors. Confirm Claude API rate limits aren't being hit. Export `workflow.json` (sixth + final milestone). |
| **C** | Commit all data files. Push final frontend changes. Confirm GitHub repo has: `data/candidates.json`, `data/scenarios.json`, `n8n/workflow.json`, clean `ui/` directory. |

---

### 🔴 12:00 SUNDAY — CUT DECISION POINT

> Stand up. Assess the real state of the pipeline.

**If full pipeline is working (Agents 0b–4 all wired):**
→ Continue to polish + demo prep as planned.

**If Agent 4 is NOT wired yet:**
→ Keep the sensitivity panel UI (never cut it).
→ Hardcode the panel to use real Agent 2 scores × `scenarios.json` locked weights — calculate re-ranking client-side in `getCandidatesForScenario()` using real scores instead of random. This preserves the demo moment with authentic data even without the Agent 4 API call.
→ Cut Agent 3 detailed cost breakdown — simplify to a single recommendation card with confidence %.
→ All remaining time goes to video + submission.

**If Agent 2 is NOT wired yet:**
→ Polish the mock data to be deterministic and convincing. Ensure Thomas #1 Crisis and Sara #1 Transformation are stable. Demo the UI flow with confident narration about what the real agents do.
→ Video script: show n8n canvas (even if pipeline isn't fully connected), explain each node's purpose, show the sensitivity panel switching.

---

### 🎬 SUNDAY AFTERNOON — Polish, Video, Submit (12:00–17:00)

---

**12:00–13:00 | Block 22 — Polish sprint**

| | Task |
|--|------|
| **A** | Final UI polish: loading states look right, error cards visible, delta arrows animate, confidence amber badges visible. Do Q7 (README n8n screenshot). Check all quick wins are done. |
| **B** | Final n8n polish: confirm execution log is visible and shows agent names clearly (label each node). Annotate canvas nodes for video (2:20 mark). |
| **C** | Final data: commit `data/scenarios.json` with all 4 locked weight sets. Commit `n8n/workflow.json`. Push everything to main. Confirm GitHub is clean and complete. |
| ✅ | **CHECKPOINT 6 ~13:00 Sun:** All code committed. UI polished. n8n canvas labelled. Demo rehearsal can begin. |

---

**13:00–14:00 | Block 23 — Demo rehearsal (full team)**

All 3 people: run a complete demo together from scratch:

1. Open Lovable app → choose Internal Pipeline
2. Upload a real CV (Thomas Richter PDF) + write HR opinion
3. Describe the supply chain crisis scenario
4. Answer Agent 1's contextual questions
5. Watch BuildingState animate with real weights
6. See ranked candidates with real scores and evidence
7. Click into a candidate card — see dimension breakdown
8. View Decision Panel — real INTERNAL recommendation + confidence %
9. Switch sensitivity panel → Transformation scenario → Thomas drops, Sara rises
10. **Note exact timestamps for Loom video** (n8n canvas at 2:20)

If any step fails → fix immediately. If it can't be fixed in 15 min → use fallback plan.

✅ **CHECKPOINT 7 ~14:00 Sun:** Full demo rehearsed. Known failure points addressed or fallback scripted.

---

**14:00–15:30 | Block 24 — Video recording (Loom)**

**Recording script:**
- **0:00–0:20** — Problem hook: "85–97% of hiring decisions are driven by intuition. 48% of HR professionals admit personal bias. We built Talenza to replace the gut feel with a reason."
- **0:20–0:45** — Show the app live, choose Internal Pipeline
- **0:45–1:30** — Upload CV. Show Agent 0b producing real dimension evidence.
- **1:30–2:00** — Enter scenario text. Watch Agent 1 ask a contextual question referencing it.
- **2:00–2:20** — BuildingState: real scenario JSON with real weights animates.
- **2:20–2:30** — CUT TO: n8n canvas (10 seconds). Label each agent node visually. This is the architecture diagram.
- **2:30–3:00** — Candidate results: real dimension scores, evidence per candidate.
- **3:00–3:30** — Switch to Transformation scenario. Thomas drops to #6. Sara rises to #1. Narrate why.
- **3:30–3:50** — Agent 3 Decision Panel: real recommendation + 4-cost breakdown.
- **3:50–4:00** — Closing line: "We don't replace the hiring decision. We replace the gut feel with a reason."

**Recording rules:**
- No cuts. One continuous take.
- Face cam on throughout.
- 1080p Loom.
- If take fails → re-record immediately. 2 takes maximum.
- Save backup recording even if not perfect.

✅ **CHECKPOINT 8 target ~15:30 Sun:** Video recorded, Loom link live.

---

**15:30–16:30 | Block 25 — Submission prep**

| | Task |
|--|------|
| **A** | Final GitHub push. Confirm Lovable public URL is live and loads correctly. |
| **B** | Confirm n8n webhook endpoint is live and not sleeping (trigger it once). |
| **C** | Prepare submission: Lovable URL, GitHub repo link, Loom video link. Fill submission form. Get all 3 team member names in. |

---

**16:30–17:00 | Block 26 — Submit**

→ Submit by **17:00 CET**. This is the hard target.
→ 1 hour buffer before the 18:00 deadline.
→ After submission: screenshot confirmation page. Share with team.

---

## VISUAL TIMELINE SUMMARY

```
SAT 20:46  ████ Setup (A: api.ts | B: n8n webhook | C: data files)  ← BLOCK 1 IN PROGRESS
SAT 21:04  ◀◀◀◀ ← YOU ARE HERE (21:04 CET)
SAT 21:15  ████ Spike build (B: webhook → Claude node)
SAT 21:45  ████ ✅ CP1 Spike verified. CORS working.
SAT 22:15  ████ PDF parse + Agent 0b internal
SAT 22:45  ████ Agent 0b both tracks wired
SAT 23:15  ████ External track + data save
SAT 23:45  ████ ✅ CP2 Both tracks ingest real CVs.
SUN 00:15  ████ Agent 1 Phase 1
SUN 00:45  ████ Agent 1 Phase 2 (dynamic Q&A)
SUN 01:15  ████ Agent 1 Phase 3 + BuildingState
SUN 01:45  ████ Agent 1 integration test
SUN 02:15  ████ ✅ CP3 Agent 1 complete. Dynamic Q&A works.
SUN 02:15  ████ Quick wins batch + Agent 2 prep
SUN 02:45  ████ Sleep handoff (A+C sleep 03:00)
           ░░░░ B solo: Build Agent 2 (03:00–04:30)
           ░░░░ SLEEP: A 03:00–08:00 | B 04:30–08:30 | C 03:00–08:00
SUN 08:00  ████ Morning sync + Agent 2 wiring (A+C)
SUN 08:30  ████ Agent 2 frontend wiring (B wakes 08:30)
SUN 09:00  ████ ✅ CP4 Agent 2 complete. Real scores on cards.
SUN 09:30  ████ Agent 3 complete
SUN 10:00  ████ Agent 4 build ⚫
SUN 10:30  ████ ✅ CP5 Agent 4 wired. Full pipeline end-to-end. ⚫
SUN 11:00  ████ Integration + error handling
SUN 11:30  ████ Buffer / final fixes
SUN 12:00  🔴🔴 CUT DECISION POINT
SUN 12:00  ████ ✅ CP6 Polish sprint
SUN 13:00  ████ Demo rehearsal (all 3)
SUN 14:00  ████ ✅ CP7 Video recording (Loom)
SUN 15:30  ████ Submission prep
SUN 16:30  ████ Submit
SUN 17:00  ✅ ✅ CP8 SUBMITTED (17:00 hard stop)
```

---

## IF EVERYTHING GOES WRONG — Fallback Strategy

> Trigger this plan if the n8n integration has not produced working end-to-end results by **10:00 Sunday**.

### Tiered Fallback — Use the highest tier that is still reachable

---

#### 🟡 TIER 1 — Partial integration (Agent 1 + 2 working, Agent 3/4 not wired)

If you have Agents 0b, 1, and 2 wired but not 3 and 4:

- **Agent 3 Decision Panel:** Hardcode one convincing, deterministic output per scenario type in `ResultsState.tsx`. Not random — fixed:
  - Crisis → "INTERNAL HIRE, 78% confidence. External search would take 14–20 weeks; BMW cannot sustain a 6-week leadership gap."
  - Transformation → "EXTERNAL HIRE, 71% confidence. No current internal candidate has Industry 4.0 transition experience at scale."
- **Agent 4 Sensitivity Panel:** Calculate re-ranking client-side. Use real Agent 2 dimension scores (which you have) × `scenarios.json` locked weights. Write a `reRankByWeights(candidates, weights)` pure function in `api.ts`. No API call — just math. Real scores, real re-ranking. **The demo moment still works.**
- This is Tier 1 because the core differentiator (sensitivity analysis with real data) is preserved. The panel is authentic even without the Agent 4 API call.

---

#### 🟠 TIER 2 — Agent 2 working, Agent 1 not wired

If you have Agents 0b and 2 wired but Agent 1's dynamic Q&A is broken:

- **Agent 1 Q&A:** Use the 6 hardcoded scenario chips from `InputState.tsx` as pre-built scenario descriptions. Skip the Q&A step entirely — detect scenario type from keyword matching (`/crisis|urgent/` → crisis) and jump directly to BuildingState.
- In the video, narrate: "In production, Agent 1 generates contextual follow-up questions in real time. For this demo we're using BMW-specific pre-defined scenarios."
- **Judges accept this if** the n8n canvas shows the Agent 1 node with a visible system prompt. The intent is clear.

---

#### 🔴 TIER 3 — No n8n integration working by 10:00 Sunday

Full frontend-only demo. Execute all of the following immediately:

1. **Remove all `Math.random()` from mock functions.** Replace with fixed deterministic values. Thomas scores: crisis_management 9.2, operational_depth 8.7, stakeholder_trust 7.8, change_adaptability 4.1, digital_literacy 2.9, external_network 5.5. Sara scores: crisis_management 4.3, operational_depth 5.1, stakeholder_trust 6.2, change_adaptability 9.1, digital_literacy 9.4, external_network 8.7.
2. **Scenario toggle:** Use `reRankByWeights()` client-side function with locked `scenarios.json` weights. Thomas #1 Crisis → #6 Transformation. Sara #6 Crisis → #1 Transformation. **The delta arrows still animate. The demo moment still lands.**
3. **Decision Panel:** Per scenario type, return a convincing fixed output as above.
4. **Do NOT show a spinning loader for 1500ms.** It looks broken. Reduce to 300ms if keeping the fake delay at all.
5. **Redirect all remaining time to the video.** Show the n8n canvas with labelled agent nodes (even if unconnected). Walk through each node's purpose. Show the sensitivity panel switching live. Read the closing line.

**Why Tier 3 still scores:**
Judges allocate 30 pts to Business Relevance and 10 pts to UX — 40 pts that do NOT require live API calls. A polished Tier 3 demo with real dimension logic, clear agent architecture in the video, and the sensitivity panel animating with authentic score mathematics will outscore a crashing live integration. The worst outcome on demo day is not mocked data — it is a blank screen or a JS crash.

---

### Pre-emptive fallback prep (do this Saturday night regardless of tier)

By **02:45 Saturday:** A saves a working screenshot of the UI with deterministic mock data. If the live app breaks Sunday, this becomes the video backup — narrate over it. Never record over the fallback screenshot.

**Do NOT wait until 10:00 Sunday to decide.** If any critical path block slips by more than 45 minutes, call the tier down in the team chat immediately. Burn no time debugging when the clock is running.
