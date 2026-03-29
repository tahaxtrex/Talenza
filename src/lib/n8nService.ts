// ═══════════════════════════════════════════════════════════════
// n8n Webhook Service — matches Talenza v6 Gemini workflow exactly
// Configure via VITE_N8N_BASE_URL env var (e.g. http://localhost:5678)
// ═══════════════════════════════════════════════════════════════

function getBaseUrl(): string {
  return import.meta.env.VITE_N8N_BASE_URL || '';
}

// Webhook paths — exact match to n8n workflow node paths
const WEBHOOK_PATHS = {
  pipeline:        '/webhook/hiring-pipeline',         // POST — ingest candidate
  scenario:        '/webhook/hiring-scenario',          // POST — analyze scenario
  scenarioQA:      '/webhook/hiring-scenario-qa',       // POST — submit QA answers
  sourcing:        '/webhook/hiring-sourcing',          // POST — calculate internal vs external
  score:           '/webhook/hiring-score',              // POST — score candidates
  listCandidates:  '/webhook/hiring-candidates',        // GET  — list all candidates
  fetchCandidates: '/webhook/hiring-candidates-fetch',  // POST — fetch selected by IDs
  config:          '/webhook/hiring-config',             // GET  — view config
} as const;

// ─── Request types ─────────────────────────────────

export interface PipelineRequest {
  track: 'internal' | 'external';
  cv_text: string;
  hr_opinion?: string;
  personality_description?: string;
}

export interface ScenarioRequest {
  track: 'internal' | 'external';
  scenario_text: string;
  additional_context?: string;
}

export interface ScenarioQARequest {
  scenario_id: string;
  track: 'internal' | 'external';
  answers: Array<{ field: string; value: string }>;
}

export interface SourcingRequest {
  scenario_id: string;
  candidate_ids: string[];
}

export interface ScoreRequest {
  track: 'internal' | 'external';
}

export interface FetchCandidatesRequest {
  candidate_ids: string[];
}

// ─── Response types ────────────────────────────────

export interface PipelineResponse {
  status: 'success';
  candidate_id: string;
  name: string;
  source: 'internal' | 'external';
}

export interface ScenarioQuestion {
  type: 'missing' | 'weight';
  field?: string;
  dimension?: string;
  question: string;
}

export interface ScenarioResponse {
  status: 'needs_input' | 'scenario_complete';
  questions?: ScenarioQuestion[];
  scenario_draft?: any;
  track?: string;
  scenario?: any;
}

export interface ScenarioQAResponse {
  status: 'scenario_complete';
  track: string;
  scenario: any;
}

export interface SourcingResponse {
  status: 'success';
  scenario_id: string;
  recommended_strategy: 'internal_first' | 'external_first' | 'hybrid';
  strategy_options: string[];
  decision_inputs: {
    urgency_weeks: number | null;
    internal_pipeline_strength: { candidate_count: number; top_weighted_score: number; average_weighted_score: number };
    external_pipeline_strength: { candidate_count: number; top_weighted_score: number; average_weighted_score: number };
    cost_time_signals: { external_search_fee_eur: number; external_time_to_fill_weeks: number; urgency_weeks: number | null; urgency_vs_external_time_gap_weeks: number | null };
    wrong_hire_risk: { scenario_type: string | null; crisis_mode: boolean; external_wrong_hire_impact: string; internal_wrong_hire_impact: string };
  };
  top_internal: any[];
  top_external: any[];
  thresholds_used: Record<string, number>;
  rationale: string[];
}

export interface ScoreResponse {
  status: 'complete';
  track: 'internal' | 'external';
  report: any;
}

export interface CandidateListItem {
  candidate_id: string;
  source_type: 'internal' | 'external';
  full_name: string;
  current_role: string;
  current_employer: string;
  created_at: string;
}

export interface ListCandidatesResponse {
  status: 'success';
  count: number;
  candidates: CandidateListItem[];
}

export interface FetchCandidatesResponse {
  status: 'success';
  count: number;
  candidates: any[];
}

// ─── Error class ───────────────────────────────────

export class N8nServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = 'N8nServiceError';
  }
}

// ─── Generic caller ────────────────────────────────

async function callWebhook<TRes>(
  method: 'GET' | 'POST',
  webhookPath: string,
  endpointName: string,
  payload?: any,
  queryParams?: Record<string, string>,
): Promise<TRes> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new N8nServiceError(
      'n8n not configured. Set VITE_N8N_BASE_URL in your environment.',
      0,
      endpointName,
    );
  }

  let url = `${baseUrl}${webhookPath}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (method === 'POST' && payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage: string;
    try {
      const body = await res.json();
      errorMessage = body.error || body.message || res.statusText;
    } catch {
      errorMessage = res.statusText;
    }
    throw new N8nServiceError(
      `${endpointName} failed [${res.status}]: ${errorMessage}`,
      res.status,
      endpointName,
    );
  }

  return res.json();
}

// ─── API functions ─────────────────────────────────

/** Ingest a candidate (CV + optional HR opinion). n8n stores the full profile server-side. */
export async function callPipeline(request: PipelineRequest): Promise<PipelineResponse> {
  return callWebhook<PipelineResponse>('POST', WEBHOOK_PATHS.pipeline, 'Pipeline (Ingest)', request);
}

/** Analyze a scenario. Returns either questions (needs_input) or a complete scenario. */
export async function callScenario(request: ScenarioRequest): Promise<ScenarioResponse> {
  return callWebhook<ScenarioResponse>('POST', WEBHOOK_PATHS.scenario, 'Scenario', request);
}

/** Submit answers for scenario missing inputs. */
export async function callScenarioQA(request: ScenarioQARequest): Promise<ScenarioQAResponse> {
  return callWebhook<ScenarioQAResponse>('POST', WEBHOOK_PATHS.scenarioQA, 'Scenario QA', request);
}

/** Analyze strategic sourcing options for the current scenario and internal/external candidate pools. */
export async function callSourcingStrategy(request: SourcingRequest): Promise<SourcingResponse> {
  return callWebhook<SourcingResponse>('POST', WEBHOOK_PATHS.sourcing, 'Sourcing Strategy', request);
}

/** Score all candidates against the stored scenario. n8n reads its own files. */
export async function callScore(request: ScoreRequest): Promise<ScoreResponse> {
  return callWebhook<ScoreResponse>('POST', WEBHOOK_PATHS.score, 'Scorer', request);
}

/** List all stored candidates (optionally filtered by source_type). */
export async function listCandidates(sourceType?: 'internal' | 'external'): Promise<ListCandidatesResponse> {
  const query = sourceType ? { source_type: sourceType } : undefined;
  return callWebhook<ListCandidatesResponse>('GET', WEBHOOK_PATHS.listCandidates, 'List Candidates', undefined, query);
}

/** Fetch full profiles for selected candidate IDs. */
export async function fetchCandidates(candidateIds: string[]): Promise<FetchCandidatesResponse> {
  return callWebhook<FetchCandidatesResponse>('POST', WEBHOOK_PATHS.fetchCandidates, 'Fetch Candidates', { candidate_ids: candidateIds });
}

// ─── Helpers ───────────────────────────────────────

export function isN8nError(error: unknown): error is N8nServiceError {
  return error instanceof N8nServiceError;
}

export function isN8nConfigured(): boolean {
  return !!getBaseUrl();
}
