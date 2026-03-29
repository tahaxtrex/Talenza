// ═══════════════════════════════════════════════════════════════
// n8n Pipeline Types — exact match to the JSON schemas used by
// the n8n workflows (Profiler, Analyst, Clarify, Scorer)
// ═══════════════════════════════════════════════════════════════

// ─── Candidate Profile (output of Profiler Agent) ─────────────

export interface CareerEntry {
  role: string;
  employer: string;
  duration_years: number;
  budget_ownership_eur: number | null;
  headcount_managed: number | null;
  key_achievement: string;
}

export interface CompetencySignal {
  score_raw: number;
  evidence: string[];
  gaps: string[];
}

export interface PersonalityProfile {
  dominant_traits: string[];
  leadership_style: string;
  decision_making_pattern: string;
  stress_response: string;
  collaboration_style: string;
  ambiguity_tolerance: 'low' | 'medium' | 'high';
  change_orientation: 'stabiliser' | 'pragmatist' | 'transformer';
}

export interface HRAssessment {
  overall_readiness: 'ready_now' | 'ready_12_months' | 'ready_24_months' | 'not_ready';
  promotion_trajectory: string;
  cultural_fit_rating: number;
  key_strength_observed: string;
  development_area: string;
  retention_risk: 'low' | 'medium' | 'high';
  raw_opinion: string;
}

export interface N8nCandidateProfile {
  candidate_id: string;
  source_type: 'internal' | 'external';
  created_at: string;

  identity: {
    full_name: string;
    current_role: string;
    current_employer: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    years_total_experience: number;
    years_automotive_experience: number | null;
    languages: string[];
  };

  career_trajectory: CareerEntry[];

  competency_signals: {
    crisis_management: CompetencySignal;
    operational_depth: CompetencySignal;
    change_adaptability: CompetencySignal;
    stakeholder_trust: CompetencySignal;
    external_network: CompetencySignal;
  };

  personality_profile: PersonalityProfile;

  hr_assessment: HRAssessment;

  hiring_logistics: {
    notice_period_weeks: number | null;
    relocation_required: boolean | null;
    estimated_package_eur: number | null;
    availability_date: string | null;
  };

  tension_summary: string;
  best_fit_scenario: string;
  worst_fit_scenario: string;
}

// ─── Profiler Agent: Request / Response ─────────────

export interface ProfilerRequest {
  candidate_type: 'internal' | 'external';
  name: string;
  role: string;
  email?: string;
  phone?: string;
  cv_text: string;
  hr_opinion?: string;
  personality_description?: string;
}

export interface ProfilerResponse {
  profile: N8nCandidateProfile;
}

// ─── Scenario (output of Analyst Agent) ─────────────

export interface KeyStakeholder {
  role: string | null;
  relationship_nature: 'reports_to' | 'partners_with' | 'manages' | null;
  sensitivity_note: string | null;
}

export interface WeightDimension {
  value: number | null;
  confidence: number | null;
  confidence_reasoning: string | null;
  modifiers_that_touched_this_dimension: string[];
  net_movement_from_base: number;
  business_logic: string | null;
}

export interface ValidationQuestion {
  dimension: string;
  question: string;
  current_value: number;
  alternative_suggested: number | null;
}

export interface FloorConstraint {
  dimension: string;
  minimum_score: number;
  floor_reasoning: string;
  is_hard_knockout: boolean;
  override_possible: boolean;
}

export interface HiddenComplexityFlag {
  flag_type: string;
  description: string;
  impact_on_analysis: string;
}

export interface CandidateArchetype {
  archetype_name: string;
  archetype_description: string;
  why_fit_this_scenario?: string;
  why_wrong_for_this_scenario?: string;
  typical_weakness?: string;
}

export interface InterviewTheme {
  theme: string;
  rationale: string;
  suggested_question: string;
}

export interface NullField {
  field_path: string;
  field_label: string;
  blocks_analysis: boolean;
  qa_question: string;
  expected_type: string;
  example_answer?: string;
  impact_if_missing?: string;
}

export interface N8nScenario {
  meta: {
    scenario_id: string | null;
    created_at: string | null;
    version: string;
    status: 'draft' | 'complete' | 'locked';
  };

  role: {
    title: string | null;
    seniority_level: 'director' | 'vp' | 'svp' | 'c_suite' | null;
    department: string | null;
    primary_location: string | null;
    secondary_locations: string[];
    relocation_required: boolean | null;
    relocation_support_available: boolean | null;
    travel_percentage: number | null;
  };

  business_context: {
    situation_type: 'crisis' | 'transformation' | 'growth' | 'succession' | null;
    situation_subtype: string | null;
    description: string | null;
    urgency_driver: string | null;
    board_visibility: string | null;
    external_visibility_risk: boolean | null;
    geopolitical_complexity: boolean | null;
    geopolitical_description: string | null;
    regulatory_complexity: boolean | null;
    regulatory_description: string | null;
    competitive_pressure: string | null;
  };

  constraints: {
    urgency_weeks: number | null;
    hard_deadline_date: string | null;
    hard_deadline_reason: string | null;
    budget_for_search_eur: number | null;
    can_use_search_firm: boolean | null;
    search_firm_constraint_reason: string | null;
    package_budget_total_eur: number | null;
    package_budget_base_eur: number | null;
    package_out_of_band_possible: boolean | null;
    package_approval_required: string | null;
    internal_equity_risk: boolean | null;
    personal_security_risk: boolean | null;
    language_requirements: string[];
    cultural_requirements: string[];
    legal_clearance_required: boolean | null;
  };

  priority_capabilities: {
    must_have_1: string | null;
    must_have_2: string | null;
    must_have_3: string | null;
    nice_to_have_1: string | null;
    nice_to_have_2: string | null;
    explicit_disqualifiers: string[];
  };

  team_context: {
    team_exists: boolean | null;
    team_size_current: number | null;
    team_size_target_year1: number | null;
    team_size_target_year2: number | null;
    team_type: string | null;
    inherited_technical_debt: boolean | null;
    inherited_culture_issues: boolean | null;
    key_stakeholders: KeyStakeholder[];
  };

  derived: {
    classification: {
      scenario_type: string | null;
      scenario_subtype: string | null;
      classification_source: string | null;
      classification_confidence: number | null;
      classification_reasoning: string | null;
      ambiguity_flag: boolean;
      ambiguity_note: string | null;
    };

    weight_calculation: {
      base_weights: {
        crisis_mgmt: number | null;
        ops_depth: number | null;
        change_adapt: number | null;
        stakeholder: number | null;
        external_net: number | null;
      };

      modifiers_applied: Array<{
        modifier_name: string;
        trigger_field: string;
        trigger_value: any;
        trigger_condition: string;
        dimension_affected: string;
        multiplier: number;
        modifier_reasoning: string;
      }>;

      final_weights: {
        crisis_mgmt: WeightDimension;
        ops_depth: WeightDimension;
        change_adapt: WeightDimension;
        stakeholder: WeightDimension;
        external_net: WeightDimension;
      };

      weight_validation: {
        sum_check: number;
        sum_valid: boolean;
        low_confidence_dimensions: string[];
        validation_questions_triggered: ValidationQuestion[];
      };
    };

    floor_constraints: {
      active_floors: FloorConstraint[];
      floor_derivation_logic: string;
    };

    dimension_correlation_warnings: {
      correlated_pairs: Array<{
        dimension_a: string;
        dimension_b: string;
        correlation_strength: 'low' | 'medium' | 'high';
        scenario_specific_note: string;
      }>;
    };

    scenario_intelligence: {
      scenario_summary: string | null;
      hidden_complexity_flags: HiddenComplexityFlag[];
      candidate_archetypes_to_seek: CandidateArchetype[];
      candidate_archetypes_to_avoid: CandidateArchetype[];
      scenario_specific_interview_themes: InterviewTheme[];
    };

    completeness: {
      null_mandatory_fields: NullField[];
      null_soft_fields: NullField[];
      low_confidence_weights_requiring_validation: Array<{
        dimension: string;
        current_value: number;
        confidence: number;
        validation_question: string;
      }>;
      mandatory_fields_complete: boolean;
      soft_fields_complete: boolean;
      weights_validated: boolean;
      completeness_percentage: number;
      is_complete: boolean;
      ready_for_analysis: boolean;
    };
  };
}

// ─── Analyst Agent: Request / Response ─────────────

export interface AnalystRequest {
  raw_scenario_text: string;
  pipeline_type: 'internal' | 'external';
}

export interface AnalystResponse {
  scenario: N8nScenario;
}

// ─── Clarify Agent: Request / Response ─────────────

export interface ClarifyRequest {
  scenario: N8nScenario;
  answers: Array<{
    field_path: string;
    value: any;
  }>;
}

export interface ClarifyResponse {
  scenario: N8nScenario;
}

// ─── Scorer Agent: Request / Response ─────────────

export interface ScorerRequest {
  scenario: N8nScenario;
  candidates: N8nCandidateProfile[];
  pipeline_type: 'internal' | 'external';
}

export interface ScoredCandidate {
  candidate_id: string;
  candidate_name: string;
  candidate_role: string;
  overall_score: number;
  rank: number;

  dimension_scores: {
    crisis_mgmt: { weighted_score: number; raw_score: number; weight: number };
    ops_depth: { weighted_score: number; raw_score: number; weight: number };
    change_adapt: { weighted_score: number; raw_score: number; weight: number };
    stakeholder: { weighted_score: number; raw_score: number; weight: number };
    external_net: { weighted_score: number; raw_score: number; weight: number };
  };

  floor_violations: Array<{
    dimension: string;
    score: number;
    floor: number;
    is_hard_knockout: boolean;
  }>;

  strengths: string[];
  risks: string[];
  recommendation: string;
  detailed_rationale: string;
  best_fit_scenario: string;
  worst_fit_scenario: string;
}

export interface CostAnalysisResult {
  recommendation: 'internal' | 'external' | 'both';
  confidence: number;
  reasoning: string;
  internal_cost_estimate_eur: string;
  external_cost_estimate_eur: string;
  time_to_fill_internal_weeks: string;
  time_to_fill_external_weeks: string;
  risk_dimensions: Array<{
    label: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    detail: string;
  }>;
}

export interface ScorerResponse {
  ranked_candidates: ScoredCandidate[];
  cost_analysis?: CostAnalysisResult;
  scenario_summary: string;
}
