import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';

interface Props {
  answers: string[];
  scenarioText: string;
  onComplete: (scenario: any) => void;
}

function deriveScenarioType(text: string): string {
  const t = text.toLowerCase();
  if (/crisis|urgent|failing|pressure|emergency/.test(t)) return 'crisis';
  if (/transform|digital|ev|change|innovation/.test(t)) return 'transformation';
  if (/succession|pipeline|groom|retire/.test(t)) return 'succession';
  return 'growth';
}

export default function BuildingState({ answers, scenarioText, onComplete }: Props) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineChars, setCurrentLineChars] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [filling, setFilling] = useState(false);

  const scenarioType = deriveScenarioType(scenarioText);
  const scenarioId = `bmw_munich_${Math.floor(1000 + Math.random() * 9000)}`;

  const jsonLines = [
    '{',
    `  "scenario_id": "${scenarioId}",`,
    `  "role_title": "${answers[0] || 'Head of Production'}",`,
    `  "urgency_weeks": ${parseInt(answers[1]) || 8},`,
    `  "scenario_type": "${scenarioType}",`,
    `  "internal_candidates": ${answers[2]?.toLowerCase().includes('yes') || answers[2]?.toLowerCase().includes('internal') ? 'true' : 'false'},`,
    `  "internal_candidate_count": ${parseInt(answers[2]?.match(/\d+/)?.[0] || '0') || 'null'},`,
    `  "priority_capability": "${(answers[3] || 'operational excellence').slice(0, 40)}",`,
    `  "hard_constraints": ${answers[4] ? `"${answers[4].slice(0, 50)}"` : 'null'},`,
    '  "weights": {',
    `    "crisis_mgmt": ${(0.2 + Math.random() * 0.3).toFixed(2)},`,
    `    "ops_depth": ${(0.15 + Math.random() * 0.25).toFixed(2)},`,
    `    "change_adapt": ${(0.1 + Math.random() * 0.2).toFixed(2)},`,
    `    "stakeholder": ${(0.1 + Math.random() * 0.2).toFixed(2)},`,
    `    "external_net": ${(0.05 + Math.random() * 0.15).toFixed(2)}`,
    '  },',
    `  "scenario_rationale": "Given the ${scenarioType} context, candidates are ranked by crisis management capability and operational depth.",`,
    `  "created_at": "${new Date().toISOString()}"`,
    '}',
  ];

  useEffect(() => {
    if (lineIndex >= jsonLines.length) {
      setDone(true);
      setTimeout(() => setShowButton(true), 400);
      return;
    }

    const line = jsonLines[lineIndex];
    let charIdx = 0;
    setCurrentLineChars('');

    const interval = setInterval(() => {
      charIdx++;
      setCurrentLineChars(line.slice(0, charIdx));
      if (charIdx >= line.length) {
        clearInterval(interval);
        setTypedLines(prev => [...prev, line]);
        setCurrentLineChars('');
        setTimeout(() => setLineIndex(prev => prev + 1), 60);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [lineIndex]);

  const handleActivate = () => {
    setFilling(true);
    setTimeout(() => {
      onComplete({
        scenario_id: scenarioId,
        scenario_type: scenarioType,
        role_title: answers[0] || 'Head of Production',
        urgency_weeks: parseInt(answers[1]) || 8,
        priority_capability: (answers[3] || 'operational excellence').slice(0, 40),
      });
    }, 800);
  };

  const colorize = (text: string) => {
    return text.split(/("(?:[^"\\]|\\.)*")/g).map((part, i) => {
      if (part.startsWith('"') && text.indexOf(part) < text.indexOf(':')) {
        return <span key={i} style={{ color: '#79B8FF' }}>{part}</span>;
      }
      if (part.startsWith('"')) {
        return <span key={i} style={{ color: '#9ECE6A' }}>{part}</span>;
      }
      if (/^\d+\.?\d*/.test(part.trim())) {
        return <span key={i} style={{ color: '#FF9E64' }}>{part}</span>;
      }
      if (/true|false|null/.test(part)) {
        return <span key={i} style={{ color: '#BB9AF7' }}>{part}</span>;
      }
      return <span key={i} style={{ color: 'rgba(255,255,255,0.4)' }}>{part}</span>;
    });
  };

  return (
    <div className="animate-page-enter min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: 'radial-gradient(ellipse 800px 600px at 50% 40%, rgba(10,102,194,0.04) 0%, transparent 70%)' }}
    >
      <div className="w-full max-w-[640px] text-center">
        <div className="flex items-center justify-center gap-2 animate-fade-slide" style={{ animationDelay: '0ms' }}>
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse-dot" />
          <span className="font-body text-[13px] text-t-tertiary tracking-[0.1em] uppercase">Building scenario profile</span>
        </div>

        <h2 className="font-display text-[32px] md:text-[42px] text-t-primary leading-[1.2] mt-6 animate-fade-slide" style={{ animationDelay: '100ms' }}>
          Your context is taking shape.
        </h2>

        <p className="font-body text-[17px] text-t-secondary mt-4 max-w-[480px] mx-auto animate-fade-slide" style={{ animationDelay: '180ms' }}>
          We've structured your hiring scenario into a precise decision framework.
        </p>

        {/* JSON Panel */}
        <div
          className="mt-8 bg-[#0F1117] rounded-[20px] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.1)] text-left animate-fade-slide min-h-[400px]"
          style={{ animationDelay: '260ms' }}
        >
          {/* Window bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>scenario.json</span>
          </div>
          <div className="h-[1px] mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* JSON lines */}
          <div className="font-mono text-[13px] leading-[1.8] overflow-hidden max-h-[300px] md:max-h-none overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {typedLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-7 text-right pr-3 shrink-0 select-none border-r mr-3" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.06)', fontSize: '11px' }}>
                  {i + 1}
                </span>
                <span className="whitespace-pre">{colorize(line)}</span>
              </div>
            ))}
            {!done && (
              <div className="flex">
                <span className="w-7 text-right pr-3 shrink-0 select-none border-r mr-3" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.06)', fontSize: '11px' }}>
                  {typedLines.length + 1}
                </span>
                <span className="whitespace-pre">{colorize(currentLineChars)}</span>
                <span className="inline-block w-[2px] h-4 bg-brand animate-blink ml-[1px]" />
              </div>
            )}
          </div>
        </div>

        {/* Done state */}
        {done && (
          <div className="mt-6 flex items-center justify-center gap-3 animate-fade-slide">
            <div className="w-8 h-8 rounded-full bg-success-light border border-success flex items-center justify-center">
              <Check size={16} className="text-success" />
            </div>
            <span className="font-body text-[15px] text-success">Scenario profile ready</span>
          </div>
        )}

        {showButton && (
          <button
            onClick={handleActivate}
            disabled={filling}
            className="w-full mt-6 h-[56px] rounded-[14px] bg-brand text-primary-foreground font-body text-[16px] font-medium relative overflow-hidden hover:bg-brand-hover hover:shadow-[0_8px_24px_rgba(10,102,194,0.35)] hover:-translate-y-[2px] transition-all duration-200 animate-fade-slide active:translate-y-0"
            style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
          >
            {filling && (
              <div className="absolute inset-0 bg-brand-hover" style={{ animation: 'progress-fill 600ms var(--ease-out-expo) forwards' }} />
            )}
            <span className="relative z-10">{filling ? 'Analysing...' : 'Activate Scenario and Analyse Candidates'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
