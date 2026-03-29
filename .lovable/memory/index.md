# Project Memory

## Core
Dark corporate theme. HSL design tokens in index.css. SF Pro Display + Inter.
n8n self-hosted backend. 6 webhook endpoints (hiring-pipeline, hiring-scenario, hiring-score, hiring-candidates, hiring-candidates-fetch, hiring-config).
Frontend calls n8n directly via VITE_N8N_BASE_URL. No Supabase/Cloud.
Mock functions preserved as fallback when n8n is not configured.

## Memories
- [n8n architecture](mem://features/n8n-architecture) — 6 webhook endpoints, exact request/response formats, Q&A via re-submit pattern
- [JSON schemas](mem://features/json-schemas) — Candidate profile + Scenario schemas from sample files
- [Pipeline flow](mem://features/pipeline-flow) — Internal (5 steps) vs External (4 steps), Q&A driven by n8n
