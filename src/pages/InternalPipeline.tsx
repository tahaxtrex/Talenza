import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, Loader2, CheckCircle, ChevronRight,
  MessageCircle, BarChart3, Users, ArrowRight, AlertCircle,
  Plus, Check, Scale, TrendingUp, Shield, Clock, Building2, ExternalLink,
} from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';
import CandidateScoreCard from '@/components/CandidateScoreCard';
import {
  CandidateProfile, ScenarioData, ScoringResult,
  loadPipelineCandidates, addPipelineCandidate,
  saveScenario, savePipelineCandidates,
} from '@/lib/pipelineStore';
import { fetchCandidates } from '@/lib/candidateStore';
import { useN8nPipeline, useN8nScenario, useN8nScorer, useN8nSourcing } from '@/lib/useN8n';
import type { ScenarioQuestion, SourcingResponse } from '@/lib/n8nService';

const ease = [0.16, 1, 0.3, 1] as const;

type Step = 'candidates' | 'scenario' | 'qa' | 'cost-analysis' | 'scoring';

export default function InternalPipeline() {
  const [step, setStep] = useState<Step>('candidates');
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => loadPipelineCandidates('internal'));
  const [selectedExistingIds, setSelectedExistingIds] = useState<Set<string>>(() => {
    return new Set(candidates.map(c => c.id));
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const [existingCandidates, setExistingCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchCandidates().then((old) => {
      setExistingCandidates(
        old
          .filter(c => c.source === 'internal')
          .map(c => ({
            id: c.name,
            type: 'internal' as const,
            name: c.name,
            role: c.role,
            source_label: c.source,
            headline_strength: c.headline_strength,
            headline_risk: c.headline_risk,
            extracted_at: new Date().toISOString(),
          }))
      );
    });
  }, []);

  const toggleExisting = (candidate: any) => {
    const newSet = new Set(selectedExistingIds);
    if (newSet.has(candidate.id)) {
      newSet.delete(candidate.id);
      const updated = candidates.filter(c => c.id !== candidate.id);
      setCandidates(updated);
      savePipelineCandidates('internal', updated);
    } else {
      newSet.add(candidate.id);
      const profile: CandidateProfile = {
        id: candidate.id,
        type: 'internal',
        name: candidate.name,
        role: candidate.role,
        headline_strength: candidate.headline_strength,
        headline_risk: candidate.headline_risk,
        extracted_at: candidate.extracted_at || new Date().toISOString(),
      };
      const updated = [...candidates, profile];
      setCandidates(updated);
      savePipelineCandidates('internal', updated);
    }
    setSelectedExistingIds(newSet);
  };

  const selectAll = () => {
    const allIds = new Set(existingCandidates.map(c => c.id));
    setSelectedExistingIds(allIds);
    const profiles: CandidateProfile[] = existingCandidates.map(c => ({
      id: c.id,
      type: 'internal' as const,
      name: c.name,
      role: c.role,
      headline_strength: c.headline_strength,
      headline_risk: c.headline_risk,
      extracted_at: c.extracted_at || new Date().toISOString(),
    }));
    const manualCandidates = candidates.filter(c => !existingCandidates.some(e => e.id === c.id));
    const updated = [...profiles, ...manualCandidates];
    setCandidates(updated);
    savePipelineCandidates('internal', updated);
  };

  // ─── n8n hooks ───
  const { ingest: n8nIngest, loading: pipelineLoading } = useN8nPipeline();
  const { analyze: n8nAnalyze, submitQA: n8nSubmitQA, loading: scenarioLoading } = useN8nScenario();
  const { analyzeSourcing: n8nAnalyzeSourcing, loading: sourcingLoading } = useN8nSourcing();
  const { score: n8nScore, loading: scorerLoading } = useN8nScorer();

  // ─── Candidate input state ───
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [hrOpinion, setHrOpinion] = useState('');
  const [personalityDesc, setPersonalityDesc] = useState('');
  const [processing, setProcessing] = useState(false);

  // ─── Scenario state ───
  const [scenarioText, setScenarioText] = useState('');
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [scenarioDraft, setScenarioDraft] = useState<any>(null);
  const [n8nQuestions, setN8nQuestions] = useState<ScenarioQuestion[]>([]);
  const [n8nQAIndex, setN8nQAIndex] = useState(0);
  const [qaAnswers, setQaAnswers] = useState<Array<{ field: string; question: string; answer: string }>>([]);
  const [currentQA, setCurrentQA] = useState<{ field: string; question: string } | null>(null);
  const [qaAnswer, setQaAnswer] = useState('');
  const [scenarioParsing, setScenarioParsing] = useState(false);

  // ─── Scoring state ───
  const [scores, setScores] = useState<ScoringResult[]>([]);
  const [scoring, setScoring] = useState(false);
  const [scoringReport, setScoringReport] = useState<any>(null);

  // ─── Candidate input handlers ───
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf');
    if (file) setCvFile(file);
  }, []);

  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) setCvFile(f);
    };
    input.click();
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(`[Could not read file: ${file.name}]`);
      reader.readAsText(file);
    });
  };

  const processCandidate = async () => {
    if (!formName || !formRole) return;
    setProcessing(true);
    try {
      let cvText = 'No CV provided';
      if (cvFile) {
        cvText = await readFileAsText(cvFile);
      }

      const { profile } = await n8nIngest(
        'internal',
        cvText,
        hrOpinion || undefined,
        personalityDesc || undefined,
        { name: formName, role: formRole, email: formEmail || undefined, phone: formPhone || undefined },
      );
      const updated = addPipelineCandidate(profile);
      setCandidates(updated);
    } catch {
      // Error already toasted by hook
    } finally {
      setProcessing(false);
      setCvFile(null);
      setFormName('');
      setFormRole('');
      setFormEmail('');
      setFormPhone('');
      setHrOpinion('');
      setPersonalityDesc('');
    }
  };

  // ─── Scenario handlers ───
  const parseScenario = async () => {
    if (!scenarioText.trim()) return;
    setScenarioParsing(true);
    try {
      const result = await n8nAnalyze('internal', scenarioText);

      if (result.status === 'needs_input' && result.questions.length > 0) {
        // n8n wants more info — show Q&A
        setN8nQuestions(result.questions);
        setScenarioDraft(result.scenarioDraft);
        setN8nQAIndex(0);
        setQaAnswers([]);
        const q = result.questions[0];
        setCurrentQA({ field: q.field || q.dimension || 'unknown', question: q.question });
        setStep('qa');
      } else {
        // Scenario is complete
        const scenarioData: ScenarioData = {
          id: crypto.randomUUID(),
          type: 'internal',
          raw_description: scenarioText,
          created_at: new Date().toISOString(),
          completed: true,
          n8n_scenario: result.scenarioFinal,
        };
        setScenario(scenarioData);
        saveScenario(scenarioData);
        setStep('cost-analysis');
      }
    } catch {
      // Error already toasted
    } finally {
      setScenarioParsing(false);
    }
  };

  const submitQAAnswer = async () => {
    if (!currentQA || !qaAnswer.trim()) return;

    const newAnswers = [...qaAnswers, { field: currentQA.field, question: currentQA.question, answer: qaAnswer.trim() }];
    setQaAnswers(newAnswers);
    setQaAnswer('');

    const nextIdx = n8nQAIndex + 1;

    if (nextIdx < n8nQuestions.length) {
      // More questions to ask
      setN8nQAIndex(nextIdx);
      const q = n8nQuestions[nextIdx];
      setCurrentQA({ field: q.field || q.dimension || 'unknown', question: q.question });
    } else {
      // All questions answered — re-submit to scenario webhook
      setScenarioParsing(true);
      setCurrentQA(null);
      try {
        const scenarioId = scenarioDraft?.meta?.scenario_id || `scenario_${Date.now()}`;
        const formattedAnswers = newAnswers.map(a => ({ field: a.field, value: a.answer }));
        
        const result = await n8nSubmitQA(scenarioId, 'internal', formattedAnswers);

        // Complete
        const scenarioData: ScenarioData = {
          id: scenarioId,
          type: 'internal',
          raw_description: scenarioText,
          created_at: new Date().toISOString(),
          completed: true,
          n8n_scenario: result.scenario || scenarioDraft,
        };
        setScenario(scenarioData);
        saveScenario(scenarioData);
        setStep('cost-analysis');
      } catch {
        // Error toasted
      } finally {
        setScenarioParsing(false);
      }
    }
  };

  // ─── Sourcing Strategy ───
  const [sourcingResult, setSourcingResult] = useState<SourcingResponse | null>(null);

  const runCostAnalysis = async () => {
    if (!scenario?.id) return;
    const res = await n8nAnalyzeSourcing(scenario.id, candidates.map(c => c.id));
    if (res) {
      setSourcingResult(res);
    }
  };

  // ─── Scoring ───
  const runScoring = async () => {
    if (candidates.length === 0) return;
    setScoring(true);
    try {
      const { report } = await n8nScore('internal', candidates, scenario);
      setScoringReport(report);

      // If mock fallback was used, report.mock === true and report.ranked_list has ScoringResult[]
      if (report.mock) {
        setScores(report.ranked_list);
      } else {
        // n8n report — display the raw report (structure depends on AI output)
        // Try to extract ranked_list if available
        const rankedList = report.ranked_list || report.scoring?.ranked_list || [];
        const mapped: ScoringResult[] = rankedList.map((c: any, i: number) => ({
          candidateId: c.candidate_id || c.candidateId || `candidate_${i}`,
          candidateName: c.candidate_name || c.name || c.candidateName || 'Unknown',
          candidateRole: c.role || c.candidateRole || '',
          overallScore: Math.round((c.total_score || c.overall_score || c.overallScore || 0) * 100) / 100,
          rank: c.rank || i + 1,
          breakdown: {
            scenario_fit: 0,
            experience_match: 0,
            leadership_fit: 0,
            availability: 0,
            risk_factor: 0,
          },
          dimensions: [],
          strengths: c.strengths || [],
          risks: c.risks || c.concerns || [],
          recommendation: c.recommendation || '',
          detailedRationale: c.rationale || c.detailed_rationale || '',
        }));
        setScores(mapped.length > 0 ? mapped : []);
      }
    } catch {
      // Error toasted
    } finally {
      setScoring(false);
    }
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'candidates', label: 'Candidates', icon: <Users size={16} /> },
    { key: 'scenario', label: 'Scenario', icon: <FileText size={16} /> },
    { key: 'qa', label: 'Q&A', icon: <MessageCircle size={16} /> },
    { key: 'cost-analysis', label: 'Sourcing Strategy', icon: <Scale size={16} /> },
    { key: 'scoring', label: 'Scoring', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))]">
      <AppNavbar />

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-[32px] md:text-[42px] text-[hsl(var(--color-text-primary))] leading-[1.1]">
            Internal Pipeline
          </h1>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] text-[hsl(var(--color-text-secondary))] mt-2">
            Upload CVs with HR opinions, define the scenario, and score internal candidates.
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
          className="flex items-center gap-2 mt-8 mb-10 overflow-x-auto pb-2"
        >
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setStep(s.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  step === s.key
                    ? 'bg-[hsl(var(--color-accent))] text-white shadow-md'
                    : 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-secondary))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {s.icon} {s.label}
                {s.key === 'candidates' && candidates.length > 0 && (
                  <span className="ml-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded-md">{candidates.length}</span>
                )}
              </button>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-[hsl(var(--color-text-tertiary))]" />}
            </div>
          ))}
        </motion.div>

        {/* ═══ STEP 1: CANDIDATES ═══ */}
        <AnimatePresence mode="wait">
          {step === 'candidates' && (
            <motion.div key="candidates" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>

              {/* Select from existing */}
              {existingCandidates.length > 0 && (
                <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))]">
                      Select Existing Candidates
                    </h2>
                    <button
                      onClick={selectAll}
                      className="text-[13px] font-medium text-[hsl(var(--color-accent))] hover:underline"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Select All ({existingCandidates.length})
                    </button>
                  </div>
                  <div className="space-y-2">
                    {existingCandidates.map((c, i) => {
                      const isSelected = selectedExistingIds.has(c.id);
                      return (
                        <motion.button
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.03 }}
                          onClick={() => toggleExisting(c)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5'
                              : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))]'
                              : 'border-[hsl(var(--color-border-strong))]'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-semibold truncate">{c.name}</p>
                            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-tertiary))] truncate">{c.role}</p>
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[hsl(var(--color-success-light))] text-[hsl(var(--color-success))]" style={{ fontFamily: 'var(--font-body)' }}>
                            Internal
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add new candidate toggle */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[hsl(var(--color-border-strong))] text-[hsl(var(--color-text-secondary))] hover:border-[hsl(var(--color-accent))]/50 hover:text-[hsl(var(--color-accent))] transition-all duration-200"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <Plus size={18} /> Add New Candidate
                </button>
              ) : (
                <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))]">
                      Add Internal Candidate
                    </h2>
                    <button onClick={() => setShowAddForm(false)} className="text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text-primary))]">
                      <X size={18} />
                    </button>
                  </div>

                  {/* CV Upload */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5'
                        : cvFile
                          ? 'border-[hsl(var(--color-success))] bg-[hsl(var(--color-success-light))]'
                          : 'border-[hsl(var(--color-border-strong))] hover:border-[hsl(var(--color-accent))]/50'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={pickFile}
                  >
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle size={20} className="text-[hsl(var(--color-success))]" />
                        <span style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-medium">{cvFile.name}</span>
                        <button onClick={e => { e.stopPropagation(); setCvFile(null); }} className="ml-2">
                          <X size={16} className="text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-danger))]" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="mx-auto text-[hsl(var(--color-text-tertiary))]" />
                        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-medium mt-3">Drop CV (PDF) here or click to browse</p>
                        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-tertiary))] mt-1">Optional — you can also fill in details manually</p>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">Name <span className="text-[hsl(var(--color-danger))]">*</span></label>
                      <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full name" className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors" style={{ fontFamily: 'var(--font-body)' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">Role <span className="text-[hsl(var(--color-danger))]">*</span></label>
                      <input value={formRole} onChange={e => setFormRole(e.target.value)} placeholder="Current role / title" className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors" style={{ fontFamily: 'var(--font-body)' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">Email</label>
                      <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@company.com" className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors" style={{ fontFamily: 'var(--font-body)' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">Phone</label>
                      <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+49 ..." className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors" style={{ fontFamily: 'var(--font-body)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">HR Opinion</label>
                    <textarea value={hrOpinion} onChange={e => setHrOpinion(e.target.value)} placeholder="HR's assessment — strengths, concerns, cultural fit..." rows={3} className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors resize-y" style={{ fontFamily: 'var(--font-body)' }} />
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] font-medium mb-1.5 block">Personality & Persona Description</label>
                    <textarea value={personalityDesc} onChange={e => setPersonalityDesc(e.target.value)} placeholder="Describe their personality, work style, conflict handling..." rows={3} className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors resize-y" style={{ fontFamily: 'var(--font-body)' }} />
                  </div>

                  <button
                    onClick={processCandidate}
                    disabled={!formName || !formRole || processing || pipelineLoading}
                    className="w-full h-[52px] rounded-xl bg-[hsl(var(--color-accent))] text-white font-medium text-[15px] hover:bg-[hsl(var(--color-accent-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {processing || pipelineLoading ? <><Loader2 size={18} className="animate-spin" /> Ingesting candidate...</> : <>Ingest Candidate <ArrowRight size={16} /></>}
                  </button>
                </div>
              )}

              {/* Selected candidates summary + continue */}
              {candidates.length > 0 && (
                <div className="mt-6 p-5 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]">
                  <div className="flex items-center justify-between mb-4">
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] font-semibold text-[hsl(var(--color-text-primary))]">
                      {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} ready for pipeline
                    </p>
                    <button
                      onClick={() => {
                        setCandidates([]);
                        setSelectedExistingIds(new Set());
                        savePipelineCandidates('internal', []);
                      }}
                      className="text-[13px] font-medium text-[hsl(var(--color-danger))] hover:underline"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    {candidates.map(c => (
                      <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] transition-colors">
                        <span style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] font-medium">{c.name}</span>
                        <button
                          onClick={() => {
                            const updated = candidates.filter(cand => cand.id !== c.id);
                            setCandidates(updated);
                            savePipelineCandidates('internal', updated);
                            const newSet = new Set(selectedExistingIds);
                            newSet.delete(c.id);
                            setSelectedExistingIds(newSet);
                          }}
                          className="text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-danger))] p-0.5 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('scenario')}
                    className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--color-accent))] text-white px-6 py-3.5 rounded-xl text-[14px] font-medium hover:bg-[hsl(var(--color-accent-hover))] hover:-translate-y-[1px] hover:shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Continue to Scenario <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 2: SCENARIO ═══ */}
          {step === 'scenario' && (
            <motion.div key="scenario" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>
              <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
                <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))] mb-2">
                  Describe Your Scenario
                </h2>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] mb-5">
                  Describe the hiring scenario in detail. The AI will convert it to a structured format and ask you to fill in any missing information.
                </p>

                <textarea
                  value={scenarioText}
                  onChange={e => setScenarioText(e.target.value)}
                  placeholder="Example: We need to urgently fill the VP of Operations role at our Munich plant. The previous VP left unexpectedly due to personal reasons. The plant is currently facing production delays and we need someone who can stabilize operations within 4 weeks..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors resize-y leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                />

                <button
                  onClick={parseScenario}
                  disabled={!scenarioText.trim() || scenarioParsing || scenarioLoading}
                  className="w-full mt-4 h-[52px] rounded-xl bg-[hsl(var(--color-accent))] text-white font-medium text-[15px] hover:bg-[hsl(var(--color-accent-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {scenarioParsing || scenarioLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Analyzing scenario...</>
                  ) : (
                    <>Analyze Scenario <ArrowRight size={16} /></>
                  )}
                </button>
              </div>

              {/* Show parsed JSON preview if available */}
              {(scenario || scenarioDraft) && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-[18px] text-[hsl(var(--color-text-primary))] mb-3">Scenario JSON</h3>
                  <pre className="bg-[#0F1117] text-white/70 text-[12px] leading-[1.8] rounded-xl p-5 overflow-x-auto max-h-[400px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(scenario?.n8n_scenario || scenarioDraft || scenario, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 3: Q&A ═══ */}
          {step === 'qa' && (
            <motion.div key="qa" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>
              <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
                <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))] mb-2">
                  Fill in Missing Details
                </h2>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] mb-6">
                  The AI detected missing fields in your scenario. Answer each question to complete the profile.
                  {n8nQuestions.length > 0 && (
                    <span className="ml-2 text-[hsl(var(--color-accent))]">
                      Question {n8nQAIndex + 1} of {n8nQuestions.length}
                    </span>
                  )}
                </p>

                {currentQA ? (
                  <motion.div key={currentQA.field} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease }}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-accent))]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageCircle size={16} className="text-[hsl(var(--color-accent))]" />
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] text-[hsl(var(--color-text-primary))] font-medium leading-relaxed">
                        {currentQA.question}
                      </p>
                    </div>

                    <input
                      value={qaAnswer}
                      onChange={e => setQaAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitQAAnswer()}
                      placeholder="Type your answer..."
                      className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] text-[14px] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-tertiary))] focus:outline-none focus:border-[hsl(var(--color-accent))] transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                      autoFocus
                    />

                    <button
                      onClick={submitQAAnswer}
                      disabled={!qaAnswer.trim() || scenarioParsing || scenarioLoading}
                      className="mt-4 flex items-center gap-2 bg-[hsl(var(--color-accent))] text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-[hsl(var(--color-accent-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {scenarioParsing || scenarioLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Re-analyzing...</>
                      ) : (
                        <>Submit Answer <ArrowRight size={16} /></>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle size={32} className="mx-auto text-[hsl(var(--color-success))] mb-3" />
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] text-[hsl(var(--color-text-primary))] font-medium">All fields completed!</p>
                    <button
                      onClick={() => setStep('cost-analysis')}
                      className="mt-4 flex items-center gap-2 mx-auto bg-[hsl(var(--color-accent))] text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-all duration-200"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Proceed to Sourcing Strategy <Scale size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Show answered questions */}
              {qaAnswers.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                  {qaAnswers.map((a, i) => (
                    <div key={i} className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-xl p-4">
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-tertiary))] mb-1">{a.question}</p>
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-medium">{a.answer}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Live JSON preview */}
              {scenarioDraft && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-[18px] text-[hsl(var(--color-text-primary))] mb-3">Draft Scenario JSON</h3>
                  <pre className="bg-[#0F1117] text-white/70 text-[12px] leading-[1.8] rounded-xl p-5 overflow-x-auto max-h-[400px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(scenarioDraft, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 4: SOURCING STRATEGY (COST ANALYSIS) ═══ */}
          {step === 'cost-analysis' && (
            <motion.div key="cost-analysis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>
              {!sourcingResult ? (
                <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center">
                  <Scale size={44} className="mx-auto text-[hsl(var(--color-text-tertiary))] mb-4" />
                  <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[26px] text-[hsl(var(--color-text-primary))] mb-2">
                    Internal vs. External Hire
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-secondary))] max-w-lg mx-auto mb-2 leading-relaxed">
                    Before ranking candidates, answer the strategic question: <span className="font-semibold text-[hsl(var(--color-text-primary))]">should you even be looking externally?</span>
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-tertiary))] max-w-md mx-auto mb-8">
                    This analysis evaluates your scenario across four cost dimensions to give you a data-driven sourcing recommendation.
                  </p>
                  <button
                    onClick={runCostAnalysis}
                    disabled={sourcingLoading}
                    className="flex items-center gap-2 mx-auto bg-[hsl(var(--color-accent))] text-white px-8 py-3.5 rounded-xl text-[15px] font-medium hover:bg-[hsl(var(--color-accent-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {sourcingLoading ? <><Loader2 size={18} className="animate-spin" /> Analyzing sourcing strategy...</> : <>Run Sourcing Analysis <Scale size={16} /></>}
                  </button>
                </div>
              ) : sourcingResult && (
                <div className="space-y-6">
                  {/* Header with scenario type badge */}
                  <div className="flex items-center justify-between">
                    <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[26px] text-[hsl(var(--color-text-primary))]">
                      Sourcing Strategy
                    </h2>
                    <span className={`text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                      sourcingResult.decision_inputs.wrong_hire_risk.crisis_mode
                        ? 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]'
                        : 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]'
                    }`} style={{ fontFamily: 'var(--font-body)' }}>
                      {sourcingResult.decision_inputs.wrong_hire_risk.scenario_type || 'Standard Scenario'}
                    </span>
                  </div>

                  {/* Recommendation Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className={`rounded-2xl p-6 border-2 ${
                      sourcingResult.recommended_strategy === 'internal_first'
                        ? 'border-[hsl(var(--color-success))] bg-[hsl(var(--color-success))]/5'
                        : sourcingResult.recommended_strategy === 'external_first'
                          ? 'border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5'
                          : 'border-[hsl(var(--color-warning,45_93%_47%))] bg-[hsl(var(--color-warning,45_93%_47%))]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        sourcingResult.recommended_strategy === 'internal_first'
                          ? 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]'
                          : sourcingResult.recommended_strategy === 'external_first'
                          ? 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]'
                          : 'bg-[hsl(var(--color-warning,45_93%_47%))]/10 text-[hsl(var(--color-warning,45_93%_47%))]'
                      }`}>
                         {sourcingResult.recommended_strategy === 'internal_first' ? <Building2 size={20} /> : <ExternalLink size={20} />}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-[20px] text-[hsl(var(--color-text-primary))]">
                          Recommendation: {
                            sourcingResult.recommended_strategy === 'internal_first' ? 'Internal First' :
                            sourcingResult.recommended_strategy === 'external_first' ? 'External Search' : 'Parallel Search (Hybrid)'
                          }
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-2">
                       {sourcingResult.rationale.map((r, i) => (
                          <p key={i} style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-secondary))] leading-relaxed flex gap-2">
                            <span className="text-[hsl(var(--color-text-tertiary))]">•</span> {r}
                          </p>
                       ))}
                    </div>
                  </motion.div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* Pipeline Strength */}
                     <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-xl p-5">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-accent))]/10 flex items-center justify-center text-[hsl(var(--color-accent))]">
                           <Users size={16} />
                         </div>
                         <h4 style={{ fontFamily: 'var(--font-display)' }} className="text-[16px] text-[hsl(var(--color-text-primary))]">Pipeline Strength</h4>
                       </div>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--color-border))]">
                           <span className="text-[13px] text-[hsl(var(--color-text-secondary))]">Internal Top Score</span>
                           <span className="text-[14px] font-medium text-[hsl(var(--color-text-primary))]">{sourcingResult.decision_inputs.internal_pipeline_strength.top_weighted_score}</span>
                         </div>
                         <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--color-border))]">
                           <span className="text-[13px] text-[hsl(var(--color-text-secondary))]">External Top Score</span>
                           <span className="text-[14px] font-medium text-[hsl(var(--color-text-primary))]">{sourcingResult.decision_inputs.external_pipeline_strength.top_weighted_score}</span>
                         </div>
                         <div className="flex justify-between items-center text-[12px] text-[hsl(var(--color-text-tertiary))]">
                            <span>Count: {sourcingResult.decision_inputs.internal_pipeline_strength.candidate_count} internal, {sourcingResult.decision_inputs.external_pipeline_strength.candidate_count} external</span>
                         </div>
                       </div>
                     </motion.div>

                     {/* Urgency & Time */}
                     <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-xl p-5">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-accent))]/10 flex items-center justify-center text-[hsl(var(--color-accent))]">
                           <Clock size={16} />
                         </div>
                         <h4 style={{ fontFamily: 'var(--font-display)' }} className="text-[16px] text-[hsl(var(--color-text-primary))]">Time Constraints</h4>
                       </div>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--color-border))]">
                           <span className="text-[13px] text-[hsl(var(--color-text-secondary))]">Urgency Limit</span>
                           <span className={`text-[14px] font-medium ${sourcingResult.decision_inputs.urgency_weeks ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-text-primary))]'}`}>{sourcingResult.decision_inputs.cost_time_signals.urgency_weeks || 'None'} w</span>
                         </div>
                         <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--color-border))]">
                           <span className="text-[13px] text-[hsl(var(--color-text-secondary))]">External Assumed Time</span>
                           <span className="text-[14px] font-medium text-[hsl(var(--color-text-primary))]">{sourcingResult.decision_inputs.cost_time_signals.external_time_to_fill_weeks} w</span>
                         </div>
                         <div className="flex justify-between items-center text-[12px] text-[hsl(var(--color-text-tertiary))]">
                            {sourcingResult.decision_inputs.cost_time_signals.urgency_vs_external_time_gap_weeks != null && (
                               <span>Risk gap: {sourcingResult.decision_inputs.cost_time_signals.urgency_vs_external_time_gap_weeks} w</span>
                            )}
                         </div>
                       </div>
                     </motion.div>
                  </div>

                  {/* Continue to scoring */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setStep('scoring')}
                      className="flex items-center gap-2 bg-[hsl(var(--color-accent))] text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-[hsl(var(--color-accent-hover))] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Continue to Candidate Scoring <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 5: SCORING ═══ */}
          {step === 'scoring' && (
            <motion.div key="scoring" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease }}>
              {scores.length === 0 && !scoringReport ? (
                <div className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 text-center">
                  <BarChart3 size={40} className="mx-auto text-[hsl(var(--color-text-tertiary))] mb-4" />
                  <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))] mb-2">
                    Ready to Score
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-secondary))] mb-1">
                    {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} ready
                  </p>
                  {candidates.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-danger))] mt-2 flex items-center justify-center gap-1">
                      <AlertCircle size={14} /> Add candidates first
                    </p>
                  )}
                  <button
                    onClick={runScoring}
                    disabled={scoring || scorerLoading || candidates.length === 0}
                    className="mt-6 flex items-center gap-2 mx-auto bg-[hsl(var(--color-accent))] text-white px-8 py-3.5 rounded-xl text-[15px] font-medium hover:bg-[hsl(var(--color-accent-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {scoring || scorerLoading ? <><Loader2 size={18} className="animate-spin" /> Scoring candidates...</> : <>Run Analysis <ArrowRight size={16} /></>}
                  </button>
                </div>
              ) : (
                <>
                  {/* Score cards if we have structured results */}
                  {scores.length > 0 && (
                    <>
                      <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[22px] text-[hsl(var(--color-text-primary))] mb-1">
                        Candidate Rankings
                      </h2>
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] mb-5">Click any candidate to see detailed scoring rationale</p>
                      <div className="space-y-3">
                        {scores.map((s, i) => (
                          <CandidateScoreCard key={s.candidateId} score={s} index={i} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Raw report JSON (always show for n8n results) */}
                  {scoringReport && !scoringReport.mock && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                      <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-[18px] text-[hsl(var(--color-text-primary))] mb-3">Full Scoring Report</h3>
                      <pre className="bg-[#0F1117] text-white/70 text-[12px] leading-[1.8] rounded-xl p-5 overflow-x-auto max-h-[600px]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {JSON.stringify(scoringReport, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
