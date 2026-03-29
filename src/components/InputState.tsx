import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppNavbar from '@/components/AppNavbar';

const scenarioChips = [
  {
    label: "Supply chain crisis",
    text: "We need a new VP of Production for our Munich plant urgently. The plant is experiencing a severe supply chain crisis — critical component shortages have halted two production lines for the past 3 weeks. Board pressure is mounting, quality metrics are deteriorating, and we're at risk of missing Q4 delivery targets worth €180M. We have three internal candidates from Leipzig, Debrecen and Munich, but our internal evaluations rate everyone between 7-8/10, making differentiation impossible. We need to decide within 6 weeks whether to promote internally or launch an external search."
  },
  {
    label: "Digital transformation",
    text: "We are looking for a Head of Digital Manufacturing to lead our EV transition across three European plants. The role requires someone who can bridge traditional automotive manufacturing with Industry 4.0 practices — smart factory rollout, software-defined production, and digital twin implementation. Our current leadership team is strong on legacy operations but lacks digital-native thinking. We have two internal candidates who know our systems deeply, and we're considering external talent from tech-forward manufacturers like Tesla or Siemens. Timeline is flexible — 12-16 weeks — but the strategic importance is very high."
  },
  {
    label: "Succession planning",
    text: "Our current SVP of European Operations is retiring in 18 months and we need to begin a structured succession process. This is a critical role overseeing 12,000 employees across 4 plants. We have a strong internal pipeline of 3 directors who have been groomed for this, but we want to benchmark them against the external market to ensure we're not missing exceptional talent. The ideal candidate needs deep automotive P&L experience, proven ability to manage at scale, and strong relationships with the works council and union representatives."
  },
  {
    label: "Plant restructuring",
    text: "We need to hire a Restructuring Lead for our Debrecen plant which is undergoing a major operational overhaul. The plant needs to shift from combustion engine component manufacturing to EV battery module assembly within 24 months. This involves workforce reskilling of 2,800 employees, €450M capex investment oversight, and managing complex stakeholder relationships including local government and unions. We have one internal candidate with partial restructuring experience and are considering external specialists."
  },
  {
    label: "Cross-regional expansion",
    text: "We are expanding our manufacturing footprint into Southeast Asia and need a Regional VP of Operations to establish and scale a new plant in Thailand. The role requires someone who can build a greenfield operation from scratch — site setup, local talent acquisition, supplier network development, and cultural adaptation of our quality standards. Experience with ASEAN regulatory environments is essential. We're open to both internal transfers from European operations and external hires with regional expertise. Timeline is 10 weeks to have someone identified."
  },
  {
    label: "Leadership vacancy",
    text: "Our Head of Quality Assurance resigned unexpectedly last week after 14 years with the company. This has created an immediate leadership vacuum in a function that oversees IATF 16949 compliance across all European plants. We need someone who can step in quickly, maintain audit readiness, and rebuild team morale. The departing leader was highly respected and their successor will face scrutiny. We have two internal candidates but neither has full certification authority experience. The board wants a decision within 4 weeks."
  },
];

interface Props {
  scenarioText: string;
  setScenarioText: (v: string) => void;
  onSubmit: () => void;
}

export default function InputState({ scenarioText, setScenarioText, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const charCount = scenarioText.length;
  const isValid = charCount >= 30;
  const showChips = charCount <= 50;

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setTimeout(onSubmit, 800);
  };

  const charColor = charCount > 1900
    ? 'text-[hsl(var(--color-danger))]'
    : charCount > 1500
      ? 'text-[hsl(var(--color-amber))]'
      : 'text-[hsl(var(--color-text-tertiary))]';

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--color-bg))]">
      <AppNavbar />

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[680px]">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-[36px] md:text-[56px] text-[hsl(var(--color-text-primary))] leading-[1.1] font-normal"
          >
            Describe your hiring context.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] as const }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-[17px] text-[hsl(var(--color-text-secondary))] leading-[1.6] max-w-[520px] mt-6"
          >
            Tell us about the role, the business situation, and any constraints.
            The more context you share, the more precise the analysis.
          </motion.p>

          {/* Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-8"
          >
            <div className="relative bg-[hsl(var(--color-surface))] border-[1.5px] border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] focus-within:border-[hsl(var(--color-accent))] focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06),0_0_0_4px_rgba(10,102,194,0.12)] transition-all duration-200">
              {charCount === 0 && (
                <p style={{ fontFamily: 'var(--font-body)' }} className="absolute top-6 left-6 right-6 text-[16px] text-[hsl(var(--color-text-tertiary))] italic leading-[1.7] pointer-events-none">
                  e.g. We need a new Head of Production for our Munich plant. We're currently facing severe quality issues and board pressure. We have three internal candidates and want to know whether to also open an external search...
                </p>
              )}
              <textarea
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value.slice(0, 2000))}
                className="w-full text-[16px] text-[hsl(var(--color-text-primary))] leading-[1.7] min-h-[220px] bg-transparent outline-none resize-none relative z-10"
                style={{ fontFamily: 'var(--font-body)', scrollbarWidth: 'none' }}
              />
              <div className={`text-right text-[12px] ${charColor} mt-2`} style={{ fontFamily: 'var(--font-mono)' }}>
                {charCount} / 2000
              </div>
            </div>

            {/* Chips */}
            {showChips && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 md:flex hidden" style={{ scrollbarWidth: 'none' }}>
                {scenarioChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => setScenarioText(chip.text)}
                    style={{ fontFamily: 'var(--font-body)' }}
                    className="whitespace-nowrap text-[13px] text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border-strong))] rounded-full px-[14px] py-[6px] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent))]/5 transition-all duration-150 shrink-0 font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className={`w-full mt-4 h-[52px] rounded-xl text-[16px] font-medium transition-all duration-200 ${
                submitting
                  ? 'w-[52px] mx-auto rounded-full bg-[hsl(var(--color-accent))]'
                  : isValid
                    ? 'bg-[hsl(var(--color-text-primary))] text-[hsl(var(--color-bg))] hover:opacity-90 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 active:scale-[0.99]'
                    : 'bg-[hsl(var(--color-surface-2))] text-[hsl(var(--color-text-tertiary))] border-[1.5px] border-[hsl(var(--color-border))] cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-body)', transitionTimingFunction: 'var(--ease-out-expo)' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-[6px]">
                  <span className="w-[5px] h-[5px] rounded-full bg-white animate-thinking-dot" />
                  <span className="w-[5px] h-[5px] rounded-full bg-white animate-thinking-dot" style={{ animationDelay: '150ms' }} />
                  <span className="w-[5px] h-[5px] rounded-full bg-white animate-thinking-dot" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                'Analyse Context →'
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
