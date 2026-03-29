# Talenza — Executive Hiring Intelligence Platform

> AI-powered agentic pipeline for executive-level hiring decisions. Scores candidates across five competency dimensions, adapts rankings to business context, and recommends internal vs. external sourcing strategies.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Step-by-Step Setup](#step-by-step-setup)
   - [1. Clone the Repository](#1-clone-the-repository)
   - [2. Install Node.js Dependencies](#2-install-nodejs-dependencies)
   - [3. Get Your API Keys](#3-get-your-api-keys)
   - [4. Configure Environment Variables](#4-configure-environment-variables)
   - [5. Start n8n (Docker)](#5-start-n8n-docker)
   - [6. Import the n8n Workflow](#6-import-the-n8n-workflow)
   - [7. Start the Frontend](#7-start-the-frontend)
4. [Where to Put Your Keys](#where-to-put-your-keys)
5. [Architecture Overview](#architecture-overview)
6. [Available Scripts](#available-scripts)
7. [How to Use the App](#how-to-use-the-app)
8. [Webhook Endpoints Reference](#webhook-endpoints-reference)
9. [Data Files](#data-files)
10. [Troubleshooting](#troubleshooting)
11. [Tech Stack](#tech-stack)

---

## Prerequisites

Install these **before** starting:

| Tool | Version | Why | Install |
|------|---------|-----|---------|
| **Node.js** | 18+ (LTS recommended) | Runs the frontend dev server and build tools | [nodejs.org](https://nodejs.org/) |
| **npm** | Comes with Node.js | Installs JavaScript dependencies | Bundled with Node.js |
| **Docker** | 20+ | Runs the n8n automation backend | [docker.com](https://docs.docker.com/get-docker/) |
| **Docker Compose** | v2+ (included in Docker Desktop) | Orchestrates the n8n container | Bundled with Docker Desktop |
| **Git** | Any recent version | Clone the repository | [git-scm.com](https://git-scm.com/) |

Verify your installations:

```bash
node --version    # Should print v18.x.x or higher
npm --version     # Should print 9.x.x or higher
docker --version  # Should print Docker version 20+
docker compose version  # Should print v2+
```

---

## Project Structure

```
Talenza-draft/
├── src/                          # React frontend source code
│   ├── pages/                    # Route pages
│   │   ├── Landing.tsx           # Marketing landing page (/)
│   │   ├── Index.tsx             # Pipeline chooser (/app)
│   │   ├── InternalPipeline.tsx  # Internal hiring flow (/internal)
│   │   ├── ExternalPipeline.tsx  # External hiring flow (/external)
│   │   └── Dashboard.tsx         # Candidate management (/dashboard)
│   ├── components/               # UI components
│   │   ├── InputState.tsx        # Scenario text input
│   │   ├── ClarifyingState.tsx   # Q&A conversation
│   │   ├── BuildingState.tsx     # Loading animation
│   │   ├── ResultsState.tsx      # Ranked results display
│   │   ├── CandidateScoreCard.tsx# Score breakdown card
│   │   ├── landing/              # Landing page sections
│   │   └── ui/                   # shadcn/ui components (37)
│   ├── lib/                      # Core logic
│   │   ├── n8nService.ts         # n8n webhook API client
│   │   ├── n8nTypes.ts           # TypeScript type definitions
│   │   ├── pipelineStore.ts      # Data persistence layer
│   │   ├── candidateStore.ts     # Candidate localStorage CRUD
│   │   └── useN8n.ts             # React hooks for n8n
│   └── data/
│       └── candidates.ts         # Fallback mock data
│
├── n8n-data/                     # n8n server-side data (Docker volume)
│   ├── candidates/               # 13 candidate JSON profiles
│   │   ├── index.json            # Candidate index
│   │   ├── internal_*.json       # 6 internal candidates
│   │   └── external_*.json       # 6 external candidates
│   └── scenarios/                # Scenario definitions
│       ├── index.json            # Scenario index
│       └── *.json                # Individual scenarios
│
├── talenza_pipeline.json         # n8n workflow (IMPORT THIS INTO n8n)
├── docker-compose.yml            # n8n Docker service config
├── .env                          # n8n environment variables
├── .env.local                    # Frontend environment variables
├── vite.config.ts                # Vite build configuration
├── tailwind.config.ts            # Tailwind CSS theme
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Talenza-draft.git
cd Talenza-draft
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This installs all frontend dependencies (React, Vite, Tailwind, shadcn/ui, Three.js, etc.) into the `node_modules/` folder. It reads from `package.json`.

### 3. Get Your API Keys

You need **one** LLM API key. The project supports two options:

#### Option A: Google Gemini (configured in `.env`)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** or go to the API keys section
4. Create a new API key
5. Copy the key — it looks like `AIzaSy...`

#### Option B: Anthropic Claude (configured in `docker-compose.yml`)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key — it looks like `sk-ant-...`

### 4. Configure Environment Variables

There are **two** environment files you need to set up. Both already exist in the repo with placeholder/example values.

#### File 1: `.env` (n8n backend configuration)

Open `.env` in the project root and set your Gemini API key:

```env
# ── YOUR API KEY ──────────────────────────────────────
GEMINI_API_KEY=paste_your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# ── Data directory (don't change) ────────────────────
TALENZA_DATA_DIR=./n8n-data

# ── CORS & Network (don't change for local dev) ─────
N8N_CORS_ALLOWED_ORIGINS=*
N8N_CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
N8N_CORS_ALLOWED_HEADERS=*
N8N_LISTEN_ADDRESS=0.0.0.0
WEBHOOK_URL=http://localhost:5678/

# ── n8n internal settings (don't change) ─────────────
N8N_EXTERNAL_ALLOWED_ENV_VARS=GEMINI_API_KEY,GEMINI_MODEL,TALENZA_DATA_DIR
N8N_RUNNERS_DISABLED=true
```

#### File 2: `.env.local` (frontend configuration)

Open `.env.local` and verify the n8n URL:

```env
VITE_N8N_BASE_URL=http://localhost:5678
```

This tells the React frontend where to find the n8n webhooks. If you deploy n8n elsewhere, change this URL.

#### File 3: `docker-compose.yml` (if using Anthropic Claude instead of Gemini)

If you prefer Claude over Gemini, open `docker-compose.yml` and replace the placeholder API key on **line 11**:

```yaml
services:
  n8n:
    environment:
      # Replace "Your_API_KEY" with your real Anthropic key
      - ANTHROPIC_API_KEY=sk-ant-your-real-key-here
      - ANTHROPIC_MODEL=claude-sonnet-4-6
```

### 5. Start n8n (Docker)

```bash
docker compose up -d
```

This does the following:
- Pulls the `n8nio/n8n:latest` Docker image (first time only, ~500MB)
- Creates a container named `talenza-n8n`
- Maps port **5678** on your machine to port 5678 in the container
- Mounts the `n8n-data/` folder so n8n can read/write candidate and scenario JSON files
- Creates a persistent Docker volume `n8n_data` for n8n's internal database

Wait about 30 seconds for n8n to fully start, then verify:

```bash
# Check container is running
docker ps

# You should see:
# CONTAINER ID  IMAGE            STATUS   PORTS                    NAMES
# abc123...     n8nio/n8n:latest Up ...   0.0.0.0:5678->5678/tcp   talenza-n8n

# Test n8n is responding
curl http://localhost:5678
```

You can also open **http://localhost:5678** in your browser to see the n8n admin UI.

**First-time n8n setup:** When you open n8n for the first time, it will ask you to create an admin account (email + password). Create one — this is just for the local n8n instance.

### 6. Import the n8n Workflow

The AI pipeline logic lives in the file `talenza_pipeline.json`. You **must** import it into n8n:

1. Open **http://localhost:5678** in your browser
2. Log in with the account you just created
3. On the main dashboard, click the **"..."** menu (top-right) or go to **Workflows**
4. Click **"Import from File"**
5. Select the file `talenza_pipeline.json` from the project root
6. The workflow will open — you should see multiple connected nodes (Profiler, Analyst, Scorer, Sourcing agents, etc.)
7. Click **"Save"** to save the workflow
8. Click the **"Active"** toggle (top-right of the workflow editor) to **activate** the workflow — this enables the webhook endpoints

**The workflow must be active for the app to work.** When active, n8n listens on the webhook URLs that the frontend calls.

### 7. Start the Frontend

```bash
npm run dev
```

This starts the Vite dev server:

```
  VITE v5.4.19  ready in 500ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://[your-ip]:8080/
```

Open **http://localhost:8080** in your browser. You should see the Talenza landing page.

---

## Where to Put Your Keys

Quick reference for where each key/config goes:

| Key/Config | File | Line/Field | Example Value |
|------------|------|------------|---------------|
| Gemini API Key | `.env` | `GEMINI_API_KEY=` | `AIzaSyDn4bK...` |
| Gemini Model | `.env` | `GEMINI_MODEL=` | `gemini-2.5-flash` |
| Anthropic API Key | `docker-compose.yml` | `ANTHROPIC_API_KEY=` (line 11) | `sk-ant-api03-...` |
| Anthropic Model | `docker-compose.yml` | `ANTHROPIC_MODEL=` (line 12) | `claude-sonnet-4-6` |
| n8n Base URL | `.env.local` | `VITE_N8N_BASE_URL=` | `http://localhost:5678` |

**Important:**
- The `.env` file is loaded by the n8n Docker container. These variables are available inside n8n workflow expressions via `$env.GEMINI_API_KEY`.
- The `docker-compose.yml` environment variables are injected directly into the container and override `.env` for variables defined in both places.
- The `.env.local` file is loaded by Vite (the frontend build tool). Only variables prefixed with `VITE_` are exposed to the frontend code.
- **Never commit real API keys to git.** The `.env` and `.env.local` files should be in `.gitignore`.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    USER BROWSER                       │
│                                                       │
│   http://localhost:8080                                │
│   ┌─────────────────────────────────────────────┐    │
│   │         React Frontend (Vite)                │    │
│   │                                              │    │
│   │  Landing → Pipeline Chooser → Steps 1-5     │    │
│   │  localStorage for client-side caching        │    │
│   └──────────────┬──────────────────────────────┘    │
│                  │ HTTP (fetch)                        │
└──────────────────┼───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│         n8n (Docker) — http://localhost:5678           │
│                                                       │
│   Webhook endpoints:                                  │
│   POST /webhook/hiring-pipeline      (ingest CV)      │
│   POST /webhook/hiring-scenario      (analyze role)   │
│   POST /webhook/hiring-scenario-qa   (Q&A answers)    │
│   POST /webhook/hiring-score         (score cands.)   │
│   POST /webhook/hiring-sourcing      (strategy)       │
│   GET  /webhook/hiring-candidates    (list all)       │
│   POST /webhook/hiring-candidates-fetch (by IDs)      │
│                                                       │
│   AI Agents: Profiler → Analyst → Scorer → Sourcing  │
│                                                       │
│   ┌──────────────┐    ┌──────────────────────┐       │
│   │ Gemini / Claude│    │ /n8n-data/ (JSON)   │       │
│   │ LLM API       │    │ candidates & scenarios│       │
│   └──────────────┘    └──────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

**Data flow:**
1. User enters a hiring scenario in the React frontend
2. Frontend POSTs to n8n webhook endpoints
3. n8n runs AI agents (Profiler, Analyst, Scorer, Sourcing) that call the LLM (Gemini or Claude)
4. n8n stores results as JSON files in `/n8n-data/`
5. n8n returns structured JSON responses to the frontend
6. Frontend renders scores, rankings, and sourcing recommendations

---

## Available Scripts

Run these from the project root:

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server on **http://localhost:8080** with hot reload |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on the codebase |
| `npm run test` | Run unit tests (Vitest, single run) |
| `npm run test:watch` | Run unit tests in watch mode |
| `docker compose up -d` | Start n8n in background |
| `docker compose down` | Stop n8n |
| `docker compose logs -f` | Tail n8n logs (useful for debugging) |
| `docker compose restart` | Restart n8n |

---

## How to Use the App

1. **Landing Page** (`/`) — Marketing overview. Click **"Try Talenza Now"** to enter the app.

2. **Pipeline Chooser** (`/app`) — Choose between:
   - **Internal Pipeline**: Score existing internal candidates for a role
   - **External Pipeline**: Score external/market candidates for a role

3. **Internal Pipeline** (`/internal`) — 5 steps:
   - **Step 1 — Candidates**: View pre-loaded internal candidates or upload new CVs
   - **Step 2 — Scenario**: Describe the hiring scenario (role, context, urgency)
   - **Step 3 — Q&A**: Answer clarifying questions the AI asks about missing info
   - **Step 4 — Scoring**: AI scores all candidates across 5 dimensions
   - **Step 5 — Sourcing**: Strategic recommendation (internal vs. external hire)

4. **External Pipeline** (`/external`) — Same flow but for external candidates (4 steps, no CV upload)

5. **Dashboard** (`/dashboard`) — View, edit, and manage stored candidate profiles

### The 5 Scoring Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| Crisis Management | Handling emergencies, pressure, unexpected challenges |
| Operational Depth | P&L ownership, process mastery, execution at scale |
| Change Adaptability | Innovation, ambiguity tolerance, transformation leadership |
| Stakeholder Trust | Communication, credibility, relationship management |
| External Network | Industry connections, board relationships, market visibility |

---

## Webhook Endpoints Reference

These are the n8n webhook URLs the frontend calls. They are defined in `src/lib/n8nService.ts`.

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|-------------|
| `/webhook/hiring-pipeline` | POST | Ingest a candidate CV | `{ track, cv_text, hr_opinion?, personality_description? }` |
| `/webhook/hiring-scenario` | POST | Analyze a hiring scenario | `{ track, scenario_text, additional_context? }` |
| `/webhook/hiring-scenario-qa` | POST | Submit Q&A answers | `{ scenario_id, track, answers: [{ field, value }] }` |
| `/webhook/hiring-score` | POST | Score candidates vs scenario | `{ track }` |
| `/webhook/hiring-sourcing` | POST | Run sourcing strategy analysis | `{ scenario_id, candidate_ids[] }` |
| `/webhook/hiring-candidates` | GET | List all candidates | Query: `?source_type=internal\|external` |
| `/webhook/hiring-candidates-fetch` | POST | Fetch candidates by IDs | `{ candidate_ids[] }` |
| `/webhook/hiring-config` | GET | View n8n config | — |

---

## Data Files

### Pre-loaded Candidates (`n8n-data/candidates/`)

The repo ships with 13 sample candidate profiles:

**Internal (6):**
- Thomas Richter — Plant Manager, BMW Leipzig
- Aisha Okonkwo-Brandt — VP Operations, BMW Group
- Marcus Chen — Director Digital Manufacturing, BMW
- Ingrid Solberg — SVP Supply Chain, BMW
- Ralf Baumgärtner — Head of Production, BMW Munich
- Leila Ahmadi — Director Strategy, BMW Group

**External (6):**
- Claire Dubois — COO, Stellantis
- James Okafor — VP Manufacturing, Toyota Europe
- Yuki Tanaka-Hoffmann — CDO, Continental AG
- Sebastian Vargas — EVP Operations, Volvo
- Natasha Volkov — SVP Supply Chain, Mercedes-Benz
- Hans-Peter Grünewald — CEO, ZF Aftermarket

### Pre-loaded Scenarios (`n8n-data/scenarios/`)

Multiple hiring scenario templates for different business contexts (crisis, transformation, succession, etc.).

---

## Troubleshooting

### n8n container won't start

```bash
# Check logs
docker compose logs n8n

# Common fix: port 5678 already in use
lsof -i :5678
# Kill the process or change the port in docker-compose.yml
```

### Frontend can't connect to n8n

1. Verify n8n is running: `docker ps | grep talenza-n8n`
2. Verify the URL: `curl http://localhost:5678`
3. Check `.env.local` has `VITE_N8N_BASE_URL=http://localhost:5678`
4. Check the n8n workflow is **active** (toggle in n8n UI)
5. Check browser console for CORS errors

### Webhook returns 404

The n8n workflow is not imported or not activated:
1. Open http://localhost:5678
2. Import `talenza_pipeline.json` (see [Step 6](#6-import-the-n8n-workflow))
3. Make sure the workflow **Active** toggle is ON

### API key errors in n8n

```bash
# Check what env vars n8n sees
docker exec talenza-n8n env | grep -E "GEMINI|ANTHROPIC"

# If empty, restart with updated .env
docker compose down && docker compose up -d
```

### "n8n not configured" error in frontend

The `VITE_N8N_BASE_URL` variable is missing or empty. Make sure `.env.local` exists and contains:
```
VITE_N8N_BASE_URL=http://localhost:5678
```
Then restart the dev server (`npm run dev`).

### npm install fails

```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5.8, Vite 5.4 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui (Radix UI primitives) |
| **Animation** | Framer Motion, Three.js + React Three Fiber |
| **State** | React hooks, localStorage, React Query |
| **Backend** | n8n (workflow automation, Docker container) |
| **AI/LLM** | Google Gemini 2.5 Flash or Anthropic Claude |
| **Data Storage** | JSON files (n8n-data/) + browser localStorage |
| **Testing** | Vitest, Testing Library, Playwright |
| **Linting** | ESLint with TypeScript rules |

---

## Quick Start (TL;DR)

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/Talenza-draft.git
cd Talenza-draft
npm install

# 2. Set your API key in .env
#    Edit .env → replace GEMINI_API_KEY value with your real key
#    OR edit docker-compose.yml → replace ANTHROPIC_API_KEY value

# 3. Start n8n
docker compose up -d

# 4. Import workflow into n8n
#    Open http://localhost:5678 → create account → import talenza_pipeline.json → activate

# 5. Start frontend
npm run dev

# 6. Open http://localhost:8080
```
