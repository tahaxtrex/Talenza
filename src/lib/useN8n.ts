// ═══════════════════════════════════════════════════════════════
// n8n Integration Hooks — matches Talenza v6 Gemini workflow
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  callPipeline, callScenario, callScenarioQA, callSourcingStrategy, callScore,
  listCandidates, fetchCandidates,
  isN8nConfigured, isN8nError,
  type PipelineResponse, type ScenarioResponse, type ScenarioQAResponse, type ScenarioQuestion,
  type SourcingResponse, type ScoreResponse, type ListCandidatesResponse, type FetchCandidatesResponse,
} from './n8nService';
import {
  type CandidateProfile,
  mockGenerateProfile, mockParseScenario, mockScoreCandidates, mockCostAnalysis,
  type ScenarioData, type ScoringResult, type CostAnalysis,
} from './pipelineStore';

// ─── Pipeline (Candidate Ingestion) ────────────────

export function useN8nPipeline() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingest = useCallback(async (
    track: 'internal' | 'external',
    cvText: string,
    hrOpinion?: string,
    personalityDescription?: string,
    formData?: { name: string; role: string; email?: string; phone?: string },
  ): Promise<{ candidateId: string; name: string; profile: CandidateProfile }> => {
    setError(null);

    if (!isN8nConfigured()) {
      // Fallback to mock
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      const mock = mockGenerateProfile(
        track, 'manual_entry',
        { name: formData?.name || 'Unknown', role: formData?.role || 'Unknown', email: formData?.email, phone: formData?.phone },
        hrOpinion, personalityDescription,
      );
      setLoading(false);
      return { candidateId: mock.id, name: mock.name, profile: mock };
    }

    setLoading(true);
    try {
      const res: PipelineResponse = await callPipeline({
        track,
        cv_text: cvText,
        hr_opinion: hrOpinion,
        personality_description: personalityDescription,
      });

      // n8n returns minimal response; build a CandidateProfile from form data + response
      const profile: CandidateProfile = {
        id: res.candidate_id,
        type: track,
        name: res.name || formData?.name || 'Unknown',
        role: formData?.role || '',
        email: formData?.email,
        phone: formData?.phone,
        hr_opinion: hrOpinion,
        personality_description: personalityDescription,
        extracted_at: new Date().toISOString(),
      };

      toast.success(`Candidate "${res.name}" ingested successfully`);
      return { candidateId: res.candidate_id, name: res.name, profile };
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Pipeline failed. Please retry.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ingest, loading, error };
}

// ─── Scenario (Analyst + Q&A) ──────────────────────

export function useN8nScenario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    track: 'internal' | 'external',
    scenarioText: string,
    additionalContext?: string,
  ): Promise<{
    status: 'needs_input' | 'scenario_complete';
    questions: ScenarioQuestion[];
    scenarioDraft: any | null;
    scenarioFinal: any | null;
  }> => {
    setError(null);

    if (!isN8nConfigured()) {
      // Fallback to mock
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      const mock = mockParseScenario(track, scenarioText);
      setLoading(false);
      return { status: 'scenario_complete', questions: [], scenarioDraft: null, scenarioFinal: mock };
    }

    setLoading(true);
    try {
      const res: ScenarioResponse = await callScenario({
        track,
        scenario_text: scenarioText,
        additional_context: additionalContext,
      });

      if (res.status === 'needs_input') {
        return {
          status: 'needs_input',
          questions: res.questions || [],
          scenarioDraft: res.scenario_draft || null,
          scenarioFinal: null,
        };
      } else {
        toast.success('Scenario analysis complete');
        return {
          status: 'scenario_complete',
          questions: [],
          scenarioDraft: null,
          scenarioFinal: res.scenario || null,
        };
      }
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Scenario analysis failed. Please retry.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQA = useCallback(async (
    scenarioId: string,
    track: 'internal' | 'external',
    answers: Array<{ field: string; value: string }>
  ): Promise<{ status: 'scenario_complete'; track: string; scenario: any }> => {
    setError(null);
    if (!isN8nConfigured()) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      return { status: 'scenario_complete', track, scenario: {} };
    }

    setLoading(true);
    try {
      const res: ScenarioQAResponse = await callScenarioQA({
        scenario_id: scenarioId,
        track,
        answers,
      });
      toast.success('Scenario answers submitted successfully');
      return {
        status: res.status,
        track: res.track,
        scenario: res.scenario,
      };
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Failed to submit answers. Please retry.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, submitQA, loading, error };
}

// ─── Sourcing Strategy ─────────────────────────────

export function useN8nSourcing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSourcing = useCallback(async (
    scenarioId: string,
    candidateIds: string[]
  ): Promise<SourcingResponse | null> => {
    setError(null);

    if (!isN8nConfigured()) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 2000));
      setLoading(false);
      return null; // The caller should fallback to mock
    }

    setLoading(true);
    try {
      const res: SourcingResponse = await callSourcingStrategy({
        scenario_id: scenarioId,
        candidate_ids: candidateIds,
      });
      toast.success('Sourcing strategy analysis complete');
      return res;
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Sourcing analysis failed. Please retry.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyzeSourcing, loading, error };
}

// ─── Scorer ────────────────────────────────────────

export function useN8nScorer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useCallback(async (
    track: 'internal' | 'external',
    // Fallback params (used when n8n is not configured)
    fallbackCandidates?: CandidateProfile[],
    fallbackScenario?: ScenarioData | null,
  ): Promise<{ report: any }> => {
    setError(null);

    if (!isN8nConfigured()) {
      // Fallback to mock
      setLoading(true);
      await new Promise(r => setTimeout(r, 2500));
      const results = mockScoreCandidates(fallbackCandidates || [], fallbackScenario!);
      setLoading(false);
      return { report: { ranked_list: results, mock: true } };
    }

    setLoading(true);
    try {
      const res: ScoreResponse = await callScore({ track });
      toast.success('Scoring complete');
      return { report: res.report };
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Scoring failed. Please retry.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { score, loading, error };
}

// ─── List / Fetch Candidates ───────────────────────

export function useN8nCandidateList() {
  const [loading, setLoading] = useState(false);

  const list = useCallback(async (sourceType?: 'internal' | 'external'): Promise<ListCandidatesResponse | null> => {
    if (!isN8nConfigured()) return null;
    setLoading(true);
    try {
      return await listCandidates(sourceType);
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Failed to list candidates.';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSelected = useCallback(async (ids: string[]): Promise<FetchCandidatesResponse | null> => {
    if (!isN8nConfigured()) return null;
    setLoading(true);
    try {
      return await fetchCandidates(ids);
    } catch (err) {
      const msg = isN8nError(err) ? err.message : 'Failed to fetch candidates.';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { list, fetchSelected, loading };
}
