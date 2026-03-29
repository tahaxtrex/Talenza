import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, TrendingUp, AlertTriangle, CheckCircle2,
  Target, Briefcase, Users, Clock, ShieldAlert, Minus,
} from 'lucide-react';
import { ScoringResult } from '@/lib/pipelineStore';

const ease = [0.16, 1, 0.3, 1] as const;

const impactColors = {
  positive: { bg: 'bg-[hsl(var(--color-success))]/10', text: 'text-[hsl(var(--color-success))]', icon: CheckCircle2 },
  neutral: { bg: 'bg-[hsl(var(--color-warning,45_93%_47%))]/10', text: 'text-[hsl(var(--color-warning,45_93%_47%))]', icon: Minus },
  negative: { bg: 'bg-[hsl(var(--color-danger))]/10', text: 'text-[hsl(var(--color-danger))]', icon: AlertTriangle },
};

const dimensionIcons = [Target, Briefcase, Users, Clock, ShieldAlert];

interface Props {
  score: ScoringResult;
  index: number;
}

export default function CandidateScoreCard({ score: s, index: i }: Props) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = s.overallScore >= 70
    ? 'text-[hsl(var(--color-success))]'
    : s.overallScore >= 50
      ? 'text-[hsl(var(--color-warning,45_93%_47%))]'
      : 'text-[hsl(var(--color-danger))]';

  const rankBg = i === 0
    ? 'bg-gradient-to-br from-[hsl(var(--color-accent))] to-[hsl(var(--color-accent-hover))] text-white'
    : 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.08 }}
    >
      {/* Main card — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left bg-[hsl(var(--color-surface))] border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
          expanded
            ? 'border-[hsl(var(--color-accent))] shadow-md rounded-b-none'
            : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]'
        }`}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rankBg}`}>
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-[18px]">#{s.rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] text-[hsl(var(--color-text-primary))] font-semibold">{s.candidateName}</p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))]">
              {s.candidateRole || s.recommendation}
            </p>
          </div>
          <div className="text-right mr-2">
            <p style={{ fontFamily: 'var(--font-display)' }} className={`text-[28px] leading-none ${scoreColor}`}>{s.overallScore}</p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[11px] text-[hsl(var(--color-text-tertiary))] uppercase tracking-wider">Score</p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown size={18} className="text-[hsl(var(--color-text-tertiary))]" />
          </motion.div>
        </div>

        {/* Mini breakdown bars */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(s.breakdown).map(([key, val]) => (
            <div key={key} className="text-center">
              <div className="h-1.5 rounded-full bg-[hsl(var(--color-surface-2))] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    key === 'risk_factor'
                      ? val > 30 ? 'bg-[hsl(var(--color-danger))]' : 'bg-[hsl(var(--color-success))]'
                      : val >= 70 ? 'bg-[hsl(var(--color-success))]' : val >= 45 ? 'bg-[hsl(var(--color-warning,45_93%_47%))]' : 'bg-[hsl(var(--color-danger))]'
                  }`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[10px] text-[hsl(var(--color-text-tertiary))] mt-1 capitalize">
                {key.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="bg-[hsl(var(--color-surface))] border border-t-0 border-[hsl(var(--color-accent))] rounded-b-xl px-5 pb-6 pt-2">

              {/* Recommendation badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5 ${
                s.overallScore >= 70 ? 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]'
                  : s.overallScore >= 50 ? 'bg-[hsl(var(--color-warning,45_93%_47%))]/10 text-[hsl(var(--color-warning,45_93%_47%))]'
                    : 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]'
              }`}>
                <TrendingUp size={14} />
                <span style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] font-semibold">{s.recommendation}</span>
              </div>

              {/* Overall rationale */}
              <div className="bg-[hsl(var(--color-surface-2))] rounded-xl p-4 mb-6">
                <h4 style={{ fontFamily: 'var(--font-display)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] mb-2">Overall Assessment</h4>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] leading-relaxed">
                  {s.detailedRationale}
                </p>
              </div>

              {/* Dimension-by-dimension breakdown */}
              <h4 style={{ fontFamily: 'var(--font-display)' }} className="text-[16px] text-[hsl(var(--color-text-primary))] mb-4">Scoring Breakdown by Dimension</h4>
              <div className="space-y-4 mb-6">
                {s.dimensions.map((dim, di) => {
                  const colors = impactColors[dim.impact];
                  const Icon = dimensionIcons[di] || Target;
                  return (
                    <motion.div
                      key={dim.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: di * 0.06 }}
                      className="bg-[hsl(var(--color-surface-2))] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg}`}>
                            <Icon size={14} className={colors.text} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-semibold">
                            {dim.label}
                          </span>
                          <span style={{ fontFamily: 'var(--font-body)' }} className="text-[11px] text-[hsl(var(--color-text-tertiary))]">
                            (Weight: {dim.weight}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: 'var(--font-display)' }} className={`text-[20px] ${colors.text}`}>{dim.score}</span>
                          <span style={{ fontFamily: 'var(--font-body)' }} className="text-[11px] text-[hsl(var(--color-text-tertiary))]">/100</span>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="h-2 rounded-full bg-[hsl(var(--color-bg))] overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dim.score}%` }}
                          transition={{ duration: 0.5, delay: 0.1 + di * 0.05 }}
                          className={`h-full rounded-full ${
                            dim.impact === 'positive' ? 'bg-[hsl(var(--color-success))]'
                              : dim.impact === 'neutral' ? 'bg-[hsl(var(--color-warning,45_93%_47%))]'
                                : 'bg-[hsl(var(--color-danger))]'
                          }`}
                        />
                      </div>

                      {/* Reasoning */}
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-secondary))] leading-relaxed mb-3">
                        {dim.reasoning}
                      </p>

                      {/* Evidence bullets */}
                      <div className="space-y-1.5">
                        {dim.evidence.map((ev, ei) => (
                          <div key={ei} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              dim.impact === 'positive' ? 'bg-[hsl(var(--color-success))]'
                                : dim.impact === 'neutral' ? 'bg-[hsl(var(--color-warning,45_93%_47%))]'
                                  : 'bg-[hsl(var(--color-danger))]'
                            }`} />
                            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-tertiary))] leading-relaxed">
                              {ev}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[hsl(var(--color-success))]/5 border border-[hsl(var(--color-success))]/20 rounded-xl p-4">
                  <h5 style={{ fontFamily: 'var(--font-display)' }} className="text-[14px] text-[hsl(var(--color-success))] mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Key Strengths
                  </h5>
                  <div className="space-y-2">
                    {s.strengths.map((str, si) => (
                      <p key={si} style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] leading-relaxed flex items-start gap-2">
                        <span className="text-[hsl(var(--color-success))] mt-0.5 shrink-0">+</span> {str}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="bg-[hsl(var(--color-danger))]/5 border border-[hsl(var(--color-danger))]/20 rounded-xl p-4">
                  <h5 style={{ fontFamily: 'var(--font-display)' }} className="text-[14px] text-[hsl(var(--color-danger))] mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} /> Key Risks
                  </h5>
                  <div className="space-y-2">
                    {s.risks.map((r, ri) => (
                      <p key={ri} style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[hsl(var(--color-text-secondary))] leading-relaxed flex items-start gap-2">
                        <span className="text-[hsl(var(--color-danger))] mt-0.5 shrink-0">⚠</span> {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
