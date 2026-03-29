---
name: n8n workflow architecture
description: Talenza v6 Gemini — exact webhook paths, request/response formats for all 6 endpoints
type: feature
---

## n8n Workflow: Talenza v6 - Gemini (Fixed)

### Webhook Endpoints

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|-------------|----------|
| GET | `/webhook/hiring-config` | Debug config | — | `{ storage, model, url, ... }` |
| GET | `/webhook/hiring-candidates` | List candidates | `?source_type=internal\|external` | `{ status, count, candidates: [{ candidate_id, source_type, full_name, current_role, ... }] }` |
| POST | `/webhook/hiring-candidates-fetch` | Fetch full profiles | `{ candidate_ids: string[] }` | `{ status, count, candidates: [full profiles] }` |
| POST | `/webhook/hiring-pipeline` | Ingest candidate | `{ track, cv_text, hr_opinion?, personality_description? }` | `{ status: 'success', candidate_id, name, source }` |
| POST | `/webhook/hiring-scenario` | Analyze scenario | `{ track, scenario_text, additional_context? }` | `{ status: 'needs_input', questions, scenario_draft }` or `{ status: 'scenario_complete', track, scenario }` |
| POST | `/webhook/hiring-score` | Score candidates | `{ track }` | `{ status: 'complete', track, report }` |

### Key Architecture Notes

- **No separate clarify endpoint** — Q&A answers are collected locally then re-submitted to `/hiring-scenario` via `additional_context`
- **Scorer reads server-side files** — only needs `{ track }`, reads candidates.json and scenarios.json from n8n server
- **Pipeline response is minimal** — full profiles stored server-side, response only has `{ candidate_id, name, source }`
- **Questions format**: `[{ type: 'missing'|'weight', field?, dimension?, question }]`
- **Internal track** sends `hr_opinion` + `personality_description`; external track only sends `cv_text`
- Uses Gemini 2.5 Flash via direct HTTP calls (not n8n AI nodes)
- Data stored in flat JSON files on n8n server (`candidates.json`, `scenarios.json`)
