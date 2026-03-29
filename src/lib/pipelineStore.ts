// ═══════════════════════════════════════════════════════════════
// Pipeline Store — data persistence (localStorage) + n8n bridge
// Keeps localStorage as intermediate cache between frontend and
// n8n responses. Mock functions preserved as fallbacks when n8n
// is not configured.
// ═══════════════════════════════════════════════════════════════

import type { N8nCandidateProfile, N8nScenario, NullField } from './n8nTypes';

// ─── Legacy types (kept for backward compat with UI components) ───

export interface CandidateProfile {
  id: string;
  type: 'internal' | 'external';
  name: string;
  role: string;
  email?: string;
  phone?: string;
  experience_years?: number;
  current_company?: string;
  education?: string;
  languages?: string[];
  key_competencies?: string[];
  character_traits?: {
    leadership_style?: string;
    communication?: string;
    decision_making?: string;
    stress_response?: string;
    adaptability?: string;
    team_dynamics?: string;
    conflict_resolution?: string;
    innovation_mindset?: string;
  };
  hr_opinion?: string;
  personality_description?: string;
  internal_performance_history?: string;
  cv_filename?: string;
  extracted_at: string;
  // n8n enrichment — the full profile from the Profiler Agent
  n8n_profile?: N8nCandidateProfile;
  [key: string]: any;
}

export interface ScenarioData {
  id: string;
  type: 'internal' | 'external';
  // Core scenario fields (legacy — kept for backward compat)
  role_title?: string | null;
  seniority_level?: string | null;
  department?: string | null;
  location?: string | null;
  timeline_weeks?: number | null;
  urgency?: string | null;
  budget_available?: boolean | null;
  budget_range?: string | null;
  reason_for_vacancy?: string | null;
  business_context?: string | null;
  key_challenges?: string | null;
  critical_capability?: string | null;
  package_expectations?: string | null;
  relocation_required?: boolean | null;
  language_requirements?: string[] | null;
  travel_requirements?: string | null;
  team_size?: number | null;
  reports_to?: string | null;
  direct_reports?: number | null;
  raw_description: string;
  created_at: string;
  completed: boolean;
  // n8n enrichment — the full scenario from the Analyst Agent
  n8n_scenario?: N8nScenario;
  [key: string]: any;
}

const INTERNAL_CANDIDATES_KEY = 'talenza_internal_candidates';
const EXTERNAL_CANDIDATES_KEY = 'talenza_external_candidates';
const SCENARIOS_KEY = 'talenza_scenarios';

// ─── Candidates ───

export function loadPipelineCandidates(type: 'internal' | 'external'): CandidateProfile[] {
  const key = type === 'internal' ? INTERNAL_CANDIDATES_KEY : EXTERNAL_CANDIDATES_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function savePipelineCandidates(type: 'internal' | 'external', candidates: CandidateProfile[]) {
  const key = type === 'internal' ? INTERNAL_CANDIDATES_KEY : EXTERNAL_CANDIDATES_KEY;
  localStorage.setItem(key, JSON.stringify(candidates));
}

export function addPipelineCandidate(candidate: CandidateProfile) {
  const list = loadPipelineCandidates(candidate.type);
  list.push(candidate);
  savePipelineCandidates(candidate.type, list);
  return list;
}

export function deletePipelineCandidate(type: 'internal' | 'external', id: string) {
  const list = loadPipelineCandidates(type).filter(c => c.id !== id);
  savePipelineCandidates(type, list);
  return list;
}

export function updatePipelineCandidate(type: 'internal' | 'external', id: string, updated: CandidateProfile) {
  const list = loadPipelineCandidates(type).map(c => c.id === id ? updated : c);
  savePipelineCandidates(type, list);
  return list;
}

// ─── Scenarios ───

export function loadScenarios(): ScenarioData[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveScenario(scenario: ScenarioData) {
  const list = loadScenarios();
  const idx = list.findIndex(s => s.id === scenario.id);
  if (idx >= 0) list[idx] = scenario;
  else list.push(scenario);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(list));
  return list;
}

// ─── n8n-aware: Convert N8nCandidateProfile → CandidateProfile ───

export function n8nProfileToCandidate(profile: N8nCandidateProfile): CandidateProfile {
  const competencies = Object.entries(profile.competency_signals)
    .filter(([, v]) => v.score_raw >= 7)
    .map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

  return {
    id: profile.candidate_id,
    type: profile.source_type,
    name: profile.identity.full_name,
    role: profile.identity.current_role,
    email: profile.identity.email || undefined,
    phone: profile.identity.phone || undefined,
    experience_years: profile.identity.years_total_experience,
    current_company: profile.identity.current_employer,
    languages: profile.identity.languages,
    key_competencies: competencies,
    character_traits: {
      leadership_style: profile.personality_profile.leadership_style,
      communication: profile.personality_profile.collaboration_style,
      decision_making: profile.personality_profile.decision_making_pattern,
      stress_response: profile.personality_profile.stress_response,
      adaptability: profile.personality_profile.ambiguity_tolerance,
    },
    hr_opinion: profile.hr_assessment.raw_opinion,
    personality_description: profile.personality_profile.dominant_traits.join(', '),
    cv_filename: 'n8n_generated',
    extracted_at: profile.created_at,
    n8n_profile: profile,
  };
}

// ─── n8n-aware: Convert N8nScenario → ScenarioData ───

export function n8nScenarioToLegacy(n8nScenario: N8nScenario, rawText: string, type: 'internal' | 'external'): ScenarioData {
  return {
    id: n8nScenario.meta.scenario_id || crypto.randomUUID(),
    type,
    role_title: n8nScenario.role.title,
    seniority_level: n8nScenario.role.seniority_level,
    department: n8nScenario.role.department,
    location: n8nScenario.role.primary_location,
    timeline_weeks: n8nScenario.constraints.urgency_weeks,
    urgency: n8nScenario.business_context.urgency_driver,
    budget_available: n8nScenario.constraints.budget_for_search_eur ? true : null,
    budget_range: n8nScenario.constraints.package_budget_total_eur
      ? `€${n8nScenario.constraints.package_budget_total_eur.toLocaleString()}`
      : null,
    reason_for_vacancy: n8nScenario.business_context.description,
    business_context: n8nScenario.business_context.description,
    key_challenges: n8nScenario.business_context.competitive_pressure,
    critical_capability: n8nScenario.priority_capabilities.must_have_1,
    package_expectations: n8nScenario.constraints.package_budget_total_eur
      ? `€${n8nScenario.constraints.package_budget_total_eur.toLocaleString()}`
      : null,
    relocation_required: n8nScenario.role.relocation_required,
    language_requirements: n8nScenario.constraints.language_requirements,
    travel_requirements: n8nScenario.role.travel_percentage
      ? `${n8nScenario.role.travel_percentage}%`
      : null,
    team_size: n8nScenario.team_context.team_size_current,
    reports_to: null,
    direct_reports: null,
    raw_description: rawText,
    created_at: n8nScenario.meta.created_at || new Date().toISOString(),
    completed: n8nScenario.derived.completeness.is_complete,
    n8n_scenario: n8nScenario,
  };
}

// ─── n8n-aware: Get Q&A questions from N8nScenario ───

export function getN8nQAQuestions(scenario: N8nScenario): NullField[] {
  const mandatory = scenario.derived.completeness.null_mandatory_fields || [];
  return mandatory;
}

export function getN8nSoftQuestions(scenario: N8nScenario): NullField[] {
  return scenario.derived.completeness.null_soft_fields || [];
}

export function isScenarioReady(scenario: N8nScenario): boolean {
  return scenario.derived.completeness.ready_for_analysis;
}

// ─── Legacy mock functions (fallback when n8n is not configured) ───

export function mockGenerateProfile(
  type: 'internal' | 'external',
  cvFilename: string,
  manualFields: { name: string; role: string; email?: string; phone?: string },
  hrOpinion?: string,
  personalityDescription?: string,
): CandidateProfile {
  const traits = [
    'Operational Leadership', 'Crisis Management', 'Stakeholder Management',
    'P&L Ownership', 'Change Management', 'Strategic Planning',
    'Team Building', 'Process Optimization', 'Digital Transformation',
  ];
  const randomTraits = traits.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 3));

  return {
    id: crypto.randomUUID(),
    type,
    name: manualFields.name,
    role: manualFields.role,
    email: manualFields.email || undefined,
    phone: manualFields.phone || undefined,
    experience_years: 5 + Math.floor(Math.random() * 20),
    current_company: 'Extracted from CV',
    education: 'MBA, Technical University',
    languages: ['English', 'German'],
    key_competencies: randomTraits,
    character_traits: {
      leadership_style: ['Transformational', 'Servant', 'Authoritative', 'Democratic'][Math.floor(Math.random() * 4)],
      communication: ['Direct and concise', 'Diplomatic and nuanced', 'Data-driven'][Math.floor(Math.random() * 3)],
      decision_making: ['Analytical', 'Intuitive', 'Consensus-driven'][Math.floor(Math.random() * 3)],
      stress_response: ['Composed under pressure', 'Action-oriented', 'Methodical problem-solver'][Math.floor(Math.random() * 3)],
      adaptability: ['High — thrives in ambiguity', 'Moderate — prefers structure', 'Strong — quickly adjusts'][Math.floor(Math.random() * 3)],
      team_dynamics: ['Collaborative leader', 'Independent driver', 'Mentor-oriented'][Math.floor(Math.random() * 3)],
      conflict_resolution: ['Mediator', 'Direct confrontation', 'Avoidant then decisive'][Math.floor(Math.random() * 3)],
      innovation_mindset: ['Early adopter', 'Pragmatic innovator', 'Risk-averse optimizer'][Math.floor(Math.random() * 3)],
    },
    ...(type === 'internal' ? {
      hr_opinion: hrOpinion || undefined,
      personality_description: personalityDescription || undefined,
      internal_performance_history: 'Consistently exceeds expectations. 3 promotions in 5 years.',
    } : {}),
    cv_filename: cvFilename,
    extracted_at: new Date().toISOString(),
  };
}

export function mockParseScenario(type: 'internal' | 'external', rawText: string): ScenarioData {
  return {
    id: crypto.randomUUID(),
    type,
    role_title: rawText.length > 20 ? 'Senior Director, Operations' : null,
    seniority_level: null,
    department: null,
    location: rawText.includes('Munich') ? 'Munich' : null,
    timeline_weeks: null,
    urgency: null,
    budget_available: null,
    budget_range: null,
    reason_for_vacancy: rawText.length > 50 ? 'Extracted from description' : null,
    business_context: rawText.length > 100 ? rawText.slice(0, 150) : null,
    key_challenges: null,
    critical_capability: null,
    package_expectations: null,
    relocation_required: null,
    language_requirements: null,
    travel_requirements: null,
    team_size: null,
    reports_to: null,
    direct_reports: null,
    raw_description: rawText,
    created_at: new Date().toISOString(),
    completed: false,
  };
}

// ─── Get null fields for Q&A (legacy fallback) ───

const FIELD_QUESTIONS: Record<string, string> = {
  role_title: 'What is the exact role title for this position?',
  seniority_level: 'What seniority level is this role? (e.g., Director, VP, C-level)',
  department: 'Which department or business unit will this role sit in?',
  location: 'What is the primary location for this role?',
  timeline_weeks: 'How many weeks do you have before this vacancy becomes critical?',
  urgency: 'How would you rate the urgency? (Critical / High / Medium / Low)',
  budget_available: 'Do you have budget allocated for the hiring process? (Yes / No)',
  budget_range: 'What is the compensation range for this role?',
  reason_for_vacancy: 'What is the reason for this vacancy? (Departure, new role, restructuring, etc.)',
  business_context: 'Can you describe the current business context? What pressures is the team facing?',
  key_challenges: 'What are the top 2–3 challenges the new hire will face in their first 90 days?',
  critical_capability: 'What is the single most important capability you need from whoever fills this role?',
  package_expectations: 'Are there any package/compensation constraints or expectations?',
  relocation_required: 'Does this role require relocation? (Yes / No)',
  language_requirements: 'Are there any language requirements? (e.g., German, English, French)',
  travel_requirements: 'What are the travel expectations for this role?',
  team_size: 'How large is the team this person will lead?',
  reports_to: 'Who will this role report to?',
  direct_reports: 'How many direct reports will this person have?',
};

export function getNextMissingField(scenario: ScenarioData): { field: string; question: string } | null {
  for (const [field, question] of Object.entries(FIELD_QUESTIONS)) {
    if (scenario[field] === null || scenario[field] === undefined) {
      return { field, question };
    }
  }
  return null;
}

// ─── Mock scoring interfaces ───

export interface ScoreDimension {
  score: number;
  weight: number;
  label: string;
  reasoning: string;
  evidence: string[];
  impact: 'positive' | 'neutral' | 'negative';
}

export interface ScoringResult {
  candidateId: string;
  candidateName: string;
  candidateRole?: string;
  overallScore: number;
  rank: number;
  breakdown: {
    scenario_fit: number;
    experience_match: number;
    leadership_fit: number;
    availability: number;
    risk_factor: number;
  };
  dimensions: ScoreDimension[];
  strengths: string[];
  risks: string[];
  recommendation: string;
  detailedRationale: string;
}

export interface CostDimension {
  label: string;
  internal_score: number;
  external_score: number;
  internal_detail: string;
  external_detail: string;
}

export interface CostAnalysis {
  dimensions: CostDimension[];
  internal_cost_estimate: string;
  external_cost_estimate: string;
  time_to_fill_internal: string;
  time_to_fill_external: string;
  internal_overall: number;
  external_overall: number;
  recommendation: 'internal' | 'external' | 'both';
  reasoning: string;
  scenario_type: 'crisis' | 'stable_growth' | 'transformation';
  scenario_label: string;
}

export function mockScoreCandidates(
  candidates: CandidateProfile[],
  _scenario: ScenarioData,
): ScoringResult[] {
  const scenarioRole = _scenario.role_title || 'Senior Leadership Position';
  const urgency = _scenario.urgency || 'Medium';

  return candidates
    .map((c) => {
      const breakdown = {
        scenario_fit: Math.round(30 + Math.random() * 70),
        experience_match: Math.round(40 + Math.random() * 60),
        leadership_fit: Math.round(35 + Math.random() * 65),
        availability: Math.round(50 + Math.random() * 50),
        risk_factor: Math.round(10 + Math.random() * 40),
      };

      const overallScore = Math.round(
        breakdown.scenario_fit * 0.3 +
        breakdown.experience_match * 0.25 +
        breakdown.leadership_fit * 0.2 +
        breakdown.availability * 0.15 +
        (100 - breakdown.risk_factor) * 0.1
      );

      return {
        candidateId: c.id,
        candidateName: c.name,
        candidateRole: c.role,
        overallScore,
        rank: 0,
        breakdown,
        dimensions: [] as ScoreDimension[],
        strengths: ['Strong operational track record', 'Deep institutional knowledge', 'Proven crisis management'],
        risks: ['Limited transformation experience', 'No international assignment history'],
        recommendation: overallScore >= 70 ? 'Strong fit — fast-track' : overallScore >= 50 ? 'Moderate fit — shortlist' : 'Weak fit — consider alternatives',
        detailedRationale: `${c.name} scores ${overallScore}/100 for ${scenarioRole}. Urgency: ${urgency}.`,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export function mockCostAnalysis(scenario?: ScenarioData | null): CostAnalysis {
  const timeline = scenario?.timeline_weeks || 12;
  const urgency = scenario?.urgency?.toLowerCase() || '';
  let scenarioType: 'crisis' | 'stable_growth' | 'transformation' = 'stable_growth';
  let scenarioLabel = 'Stable Growth';

  if (urgency.includes('critical') || urgency.includes('high') || timeline <= 6) {
    scenarioType = 'crisis';
    scenarioLabel = 'Crisis / Urgent Hire';
  } else if (scenario?.business_context?.toLowerCase().includes('transform')) {
    scenarioType = 'transformation';
    scenarioLabel = 'Transformation';
  }

  const dimensions: CostDimension[] = [
    {
      label: 'Opportunity Cost',
      internal_score: scenarioType === 'crisis' ? 85 : 65,
      external_score: scenarioType === 'crisis' ? 30 : 60,
      internal_detail: 'Internal candidate available quickly.',
      external_detail: '12–18 week search timeline.',
    },
    {
      label: 'Execution Risk',
      internal_score: scenarioType === 'crisis' ? 78 : 70,
      external_score: scenarioType === 'crisis' ? 25 : 50,
      internal_detail: 'Known entity — cultural fit reduces risk.',
      external_detail: '30% of external senior hires fail within 18 months.',
    },
    {
      label: 'Cultural Damage',
      internal_score: 80,
      external_score: scenarioType === 'crisis' ? 35 : 55,
      internal_detail: 'Internal promotion builds loyalty.',
      external_detail: 'May signal lack of trust in team.',
    },
    {
      label: 'Time Cost',
      internal_score: scenarioType === 'crisis' ? 92 : 80,
      external_score: scenarioType === 'crisis' ? 20 : 45,
      internal_detail: `Internal move: 2–4 weeks.`,
      external_detail: `External search: 12–18 weeks.`,
    },
  ];

  const internalOverall = Math.round(dimensions.reduce((s, d) => s + d.internal_score, 0) / dimensions.length);
  const externalOverall = Math.round(dimensions.reduce((s, d) => s + d.external_score, 0) / dimensions.length);

  return {
    dimensions,
    internal_cost_estimate: '€15,000 – €25,000',
    external_cost_estimate: '€80,000 – €150,000',
    time_to_fill_internal: '2–4 weeks',
    time_to_fill_external: '12–18 weeks',
    internal_overall: internalOverall,
    external_overall: externalOverall,
    recommendation: scenarioType === 'crisis' ? 'internal' : 'both',
    reasoning: `Based on ${scenarioLabel} context with ${timeline}-week timeline.`,
    scenario_type: scenarioType,
    scenario_label: scenarioLabel,
  };
}
