import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.7, ease, delay },
  });

  return (
    <section id="problem" className="relative py-32 md:py-48" ref={ref}>
      <div className="max-w-[940px] mx-auto px-6 md:px-10">
        {/* Label */}
        <motion.div {...fadeUp(0)} className="mb-6">
          <span
            className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-medium"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The Real Problem
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div {...fadeUp(0.1)}>
          <h2
            className="text-[clamp(28px,4.5vw,48px)] text-foreground leading-[1.15] mb-12"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The candidates don't change.
            <br />
            <span className="text-muted-foreground">The business reality does.</span>
          </h2>
        </motion.div>

        {/* Card 1 — Context-Aware Ranking */}
        <motion.div
          {...fadeUp(0.2)}
          className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-6"
          style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              CONTEXT-AWARE RANKING
            </span>
          </div>
          <p className="text-[15px] text-muted-foreground leading-[1.8] mb-5" style={{ fontFamily: 'var(--font-body)' }}>
            Traditional hiring ranks candidates once and treats that ranking as fixed. But business conditions shift —{' '}
            <span className="text-foreground font-medium">market crises, strategy pivots, leadership changes</span>{' '}
            — and suddenly the top candidate is wrong for the moment.
          </p>
          <p className="text-[15px] text-muted-foreground leading-[1.8] mb-5" style={{ fontFamily: 'var(--font-body)' }}>
            A candidate who excels in{' '}
            <span className="text-foreground font-medium">stability</span> becomes a liability during{' '}
            <span className="text-[hsl(var(--color-danger))] font-medium">disruption</span>.
            One built for growth may falter in cost-cutting mode. The people don't change —{' '}
            <span className="text-foreground font-semibold italic">the context does.</span>
          </p>
          <p className="text-[15px] text-muted-foreground leading-[1.8]" style={{ fontFamily: 'var(--font-body)' }}>
            Yet nobody re-evaluates the shortlist when the situation shifts. Talenza does —{' '}
            <span className="text-foreground font-medium">dynamically re-ranking candidates</span>{' '}
            against the current business reality, so you always hire for the moment you're actually in.
          </p>
        </motion.div>

        {/* Insight 1 */}
        <motion.div {...fadeUp(0.3)} className="flex items-start gap-4 mb-16">
          <div className="w-1 h-12 rounded-full bg-accent mt-1 shrink-0" />
          <p className="text-[17px] text-foreground leading-[1.7] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
            The same candidates, ranked under different business contexts, produce completely different results.
            Talenza makes that explicit — so you never hire for the wrong moment.
          </p>
        </motion.div>

        {/* Card 2 — Internal vs. External */}
        <motion.div
          {...fadeUp(0.4)}
          className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-6"
          style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              INTERNAL VS. EXTERNAL HIRE
            </span>
          </div>
          <p className="text-[15px] text-muted-foreground leading-[1.8] mb-5" style={{ fontFamily: 'var(--font-body)' }}>
            Before you ever rank a candidate, there's a harder question:{' '}
            <span className="text-foreground font-semibold italic">should you be looking externally at all?</span>{' '}
            Most companies answer this with gut feel — "we always promote from within" or "we need fresh perspective." Neither answer is based on data.
          </p>

          {/* Factor grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Urgency', detail: 'How much time do you actually have to fill the role?' },
              { label: 'Pipeline strength', detail: 'Is the internal candidate truly ready, or a risk?' },
              { label: 'Cost difference', detail: 'External search means significant fees, time, and onboarding cost.' },
              { label: 'Failure risk', detail: 'A wrong hire in a critical moment can be catastrophic.' },
            ].map((f) => (
              <div key={f.label} className="bg-muted/40 border border-border rounded-xl px-5 py-4">
                <p className="text-[13px] text-foreground font-semibold mb-1" style={{ fontFamily: 'var(--font-body)' }}>{f.label}</p>
                <p className="text-[13px] text-muted-foreground leading-[1.6]" style={{ fontFamily: 'var(--font-body)' }}>{f.detail}</p>
              </div>
            ))}
          </div>

          <p className="text-[15px] text-muted-foreground leading-[1.8]" style={{ fontFamily: 'var(--font-body)' }}>
            Talenza weighs all these factors and delivers a{' '}
            <span className="text-foreground font-medium">structured recommendation</span>{' '}
            — internal or external, with clear reasoning behind it.
          </p>
        </motion.div>

        {/* Insight 2 */}
        <motion.div {...fadeUp(0.5)} className="flex items-start gap-4">
          <div className="w-1 h-12 rounded-full bg-accent mt-1 shrink-0" />
          <p className="text-[17px] text-foreground leading-[1.7] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
            The sourcing decision happens before you ever look at a candidate. Talenza makes it data-driven —
            using Opportunity Cost, Execution Risk, Cultural Damage, and Time Cost as explicit dimensions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
