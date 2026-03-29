import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { getCandidatesForScenario, scoreLabels, type Candidate } from '@/data/candidates';

interface Props {
  scenario: any;
  selectedScenario: string;
  setSelectedScenario: (v: string) => void;
  onNewAnalysis: () => void;
}

const scenarioLabels = [
  { key: 'crisis', label: 'Operational Crisis' },
  { key: 'transformation', label: 'Digital Transformation' },
  { key: 'growth', label: 'Stable Growth' },
  { key: 'succession', label: 'Succession Planning' },
];

const scenarioBadgeStyles: Record<string, string> = {
  crisis: 'bg-danger-light text-danger border-danger/30',
  transformation: 'bg-brand-light text-brand border-brand/30',
  growth: 'bg-success-light text-success border-success/30',
  succession: 'bg-surface-2 text-t-secondary border-brd',
};

export default function ResultsState({ scenario, selectedScenario, setSelectedScenario, onNewAnalysis }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [previousRankings, setPreviousRankings] = useState<Record<string, number>>({});
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCandidates(getCandidatesForScenario(selectedScenario));
  }, []);

  const handleScenarioChange = (key: string) => {
    if (key === selectedScenario) return;
    const prev: Record<string, number> = {};
    candidates.forEach(c => { prev[c.name] = c.rank; });
    setPreviousRankings(prev);
    setLoading(true);
    setSelectedScenario(key);

    setTimeout(() => {
      setCandidates(getCandidatesForScenario(key));
      setLoading(false);
    }, 1500);
  };

  const currentLabel = scenarioLabels.find(s => s.key === selectedScenario)?.label || '';

  return (
    <div className="animate-page-enter min-h-screen">
      {/* Nav */}
      <nav className="h-16 bg-surface/85 backdrop-blur-[20px] border-b border-brd sticky top-0 z-50 flex items-center justify-between px-6 lg:px-[40px]">
        <div className="flex items-center gap-3">
          <div className="w-[1px] h-4 bg-brand" />
          <span className="font-display text-[18px] text-t-primary">Talenza</span>
        </div>

        <div className={`hidden md:flex items-center gap-2 font-body text-[13px] font-medium px-[14px] py-[6px] rounded-full border ${scenarioBadgeStyles[selectedScenario]}`}>
          {currentLabel} · {scenario?.role_title || 'Head of Production'}
        </div>

        <button
          onClick={onNewAnalysis}
          className="font-body text-[13px] text-t-secondary border border-brd rounded-lg px-4 py-2 hover:border-t-primary hover:text-t-primary transition-all duration-150"
        >
          New Analysis
        </button>
      </nav>

      {/* Context strip */}
      <div className="bg-brand-light border-b border-brand/15 px-6 lg:px-[40px] py-4">
        <div className="max-w-[1200px] mx-auto flex flex-wrap gap-6 md:gap-12">
          {[
            { label: 'Role', value: scenario?.role_title || 'Head of Production' },
            { label: 'Urgency', value: `${scenario?.urgency_weeks || 8} weeks` },
            { label: 'Priority', value: scenario?.priority_capability || 'Operational excellence' },
          ].map(item => (
            <div key={item.label}>
              <span className="font-body text-[12px] text-t-tertiary">{item.label}</span>
              <p className="font-body text-[14px] text-t-primary font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-[40px] py-8">
        {/* Scenario toggle */}
        <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {scenarioLabels.map(s => (
            <button
              key={s.key}
              onClick={() => handleScenarioChange(s.key)}
              className={`whitespace-nowrap font-body text-[13px] px-5 py-2 rounded-full transition-all duration-200 shrink-0 ${
                s.key === selectedScenario
                  ? 'bg-brand text-primary-foreground'
                  : 'text-t-secondary border border-brd hover:border-t-secondary hover:text-t-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Label row */}
        <div className="flex justify-between items-center mt-6 mb-4">
          <span className="font-body text-[13px] text-t-tertiary tracking-[0.08em] uppercase">
            6 Candidates Ranked
          </span>
          <span className="font-body text-[13px] text-t-tertiary tracking-[0.08em] uppercase">
            Fit Score ▼
          </span>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[100px] bg-surface border border-brd rounded-[16px] overflow-hidden">
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-surface via-surface-2 to-surface bg-[length:200%_100%]"
                  style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
                />
              </div>
            ))
          ) : (
            candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.name}
                candidate={candidate}
                index={index}
                expanded={expandedCandidate === index}
                onToggle={() => setExpandedCandidate(expandedCandidate === index ? null : index)}
                delta={previousRankings[candidate.name] ? previousRankings[candidate.name] - candidate.rank : undefined}
              />
            ))
          )}
        </div>

        {/* Decision Panel */}
        {!loading && (
          <div className="mt-8 bg-surface border border-brd rounded-[20px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] grid md:grid-cols-2 gap-8 animate-fade-slide" style={{ animationDelay: '400ms' }}>
            <div>
              <p className="font-body text-[11px] text-t-tertiary tracking-[0.1em] uppercase">Sourcing Recommendation</p>
              <div className="mt-4 inline-block bg-success-light text-success border-[1.5px] border-success rounded-lg px-5 py-[10px]">
                <span className="font-body text-[22px] font-semibold">INTERNAL HIRE</span>
              </div>
              <p className="font-mono text-[16px] text-t-secondary mt-3">82% confidence</p>

              <div className="mt-6 space-y-3">
                {[
                  { label: 'Opportunity', level: 'LOW', color: 'success' },
                  { label: 'Execution', level: 'MEDIUM', color: 'amber' },
                  { label: 'Cultural', level: 'LOW', color: 'success' },
                  { label: 'Time', level: 'HIGH', color: 'danger' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 py-2 border-b border-brd last:border-0">
                    <span className="font-body text-[13px] text-t-tertiary w-[100px]">{row.label}</span>
                    <span className={`font-mono text-[11px] font-medium px-2 py-[2px] rounded bg-${row.color}-light text-${row.color}`}>
                      {row.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-body text-[11px] text-t-tertiary tracking-[0.1em] uppercase">Decision Rationale</p>
              <p className="font-body text-[15px] text-t-primary leading-[1.7] mt-4">
                Thomas Richter's crisis management track record at Leipzig directly mirrors the operational challenges facing the Munich plant. His institutional knowledge of BMW processes, combined with proven ability to manage under board-level pressure, makes him the highest-confidence candidate for immediate deployment. External candidates, while strong on transformation metrics, carry unacceptable ramp-time risk in an active crisis window.
              </p>
              <p className="font-body text-[12px] text-t-tertiary italic mt-4">
                AI-assisted analysis. Final decision remains with the hiring committee.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function CandidateCard({ candidate, index, expanded, onToggle, delta }: {
  candidate: Candidate;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  delta?: number;
}) {
  const rankColor = candidate.rank === 1 ? 'text-amber' : candidate.rank <= 3 ? 'text-t-primary' : 'text-t-tertiary';
  const sourceStyle = candidate.source === 'internal' ? 'bg-success-light text-success' : 'bg-brand-light text-brand';
  const scores = Object.entries(candidate.scores);

  return (
    <div
      className="bg-surface border border-brd rounded-[16px] hover:border-brd-strong hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] transition-all duration-200 animate-fade-slide cursor-pointer"
      style={{ animationDelay: `${index * 60}ms`, transitionTimingFunction: 'var(--ease-out-expo)' }}
      onClick={onToggle}
    >
      <div className="p-5 md:p-6 flex items-center gap-4 md:gap-6">
        {/* Rank */}
        <div className="w-12 shrink-0">
          <span className={`font-display text-[36px] ${rankColor}`}>{candidate.rank}</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-[16px] font-semibold text-t-primary">{candidate.name}</span>
            <span className={`font-body text-[11px] font-medium rounded px-2 py-[2px] ${sourceStyle}`}>
              {candidate.source === 'internal' ? 'Internal' : 'External'}
            </span>
          </div>
          <p className="font-body text-[13px] text-t-secondary mt-[2px] truncate">{candidate.role}</p>
        </div>

        {/* Score */}
        <div className="text-right shrink-0 w-[80px] md:w-[100px]">
          <span className="font-mono text-[28px] text-t-primary font-medium">{candidate.fitScore}%</span>
          {delta !== undefined && delta !== 0 && (
            <div className={`font-mono text-[12px] animate-fade-slide ${delta > 0 ? 'text-success' : 'text-danger'}`}>
              {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
            </div>
          )}
        </div>

        {/* Bars (desktop) */}
        <div className="hidden lg:block w-[280px] shrink-0 space-y-[6px]">
          {scores.map(([key, val], bi) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-body text-[11px] text-t-tertiary w-[60px] truncate">{scoreLabels[key]}</span>
              <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-[600ms]"
                  style={{
                    width: `${(val / 10) * 100}%`,
                    transitionDelay: `${index * 60 + bi * 80}ms`,
                    transitionTimingFunction: 'var(--ease-out-expo)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chevron */}
        <div className="shrink-0">
          {expanded ? (
            <ChevronDown size={20} className="text-t-tertiary" />
          ) : (
            <ChevronRight size={20} className="text-t-tertiary hover:text-t-primary hover:translate-x-[2px] transition-all duration-150" />
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-brd px-5 md:px-6 py-5 grid md:grid-cols-[55%_45%] gap-6 animate-fade-slide">
          <div className="space-y-4">
            <div className="pl-4 border-l-[3px] border-success">
              <p className="font-body text-[11px] text-t-tertiary uppercase tracking-[0.08em] mb-1">Strongest fit</p>
              <p className="font-body text-[14px] text-t-primary leading-[1.6]">{candidate.headline_strength}</p>
            </div>
            <div className="pl-4 border-l-[3px] border-danger">
              <p className="font-body text-[11px] text-t-tertiary uppercase tracking-[0.08em] mb-1">Key risk</p>
              <p className="font-body text-[14px] text-t-primary leading-[1.6]">{candidate.headline_risk}</p>
            </div>
          </div>

          <div className="space-y-3">
            {scores.map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-body text-[12px] text-t-tertiary">{scoreLabels[key]}</span>
                <span className={`font-mono text-[13px] px-2 py-[2px] rounded ${
                  val >= 7 ? 'bg-success-light text-success' : val >= 4 ? 'bg-amber-light text-amber' : 'bg-danger-light text-danger'
                }`}>
                  {val.toFixed(1)}
                </span>
              </div>
            ))}
            {(() => {
              const vals = Object.values(candidate.scores);
              const spread = Math.max(...vals) - Math.min(...vals);
              if (spread > 3) return (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle size={14} className="text-amber" />
                  <span className="font-body text-[12px] text-amber">High perspective variance — see rationale</span>
                </div>
              );
              return null;
            })()}
          </div>

          {/* Mobile bars */}
          <div className="lg:hidden md:col-span-2 space-y-[6px]">
            {scores.map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="font-body text-[11px] text-t-tertiary w-[60px] truncate">{scoreLabels[key]}</span>
                <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${(val / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
