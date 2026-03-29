import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Users, ArrowRight } from 'lucide-react';
import Scene3D from './Scene3D';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    num: '01',
    title: 'Define Candidates',
    desc: '5-6 synthetic candidate profiles — 3 internal, 2-3 external. No file uploads. No complex forms.',
    color: 'var(--color-accent)',
  },
  {
    num: '02',
    title: 'Describe Your Context',
    desc: 'A role title and business scenario — crisis, transformation, growth, or succession. Clean, fast, usable by a non-tech HR director.',
    color: 'var(--color-success)',
  },
  {
    num: '03',
    title: 'AI Agents Analyze',
    desc: 'Four independent agents — Context, Scoring, Decision, and Comparison — each with separate reasoning chains.',
    color: 'var(--color-amber)',
  },
  {
    num: '04',
    title: 'See What Changes',
    desc: 'Flip the scenario and watch rankings animate. That\'s your moment of clarity.',
    color: 'var(--color-danger)',
  },
];

export default function PipelineSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pipeline" className="relative py-32 md:py-48 overflow-hidden" ref={ref}>
      {/* Background 3D */}
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] opacity-20">
        <Scene3D className="w-full h-full" variant="pipeline" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="mb-4"
        >
          <span
            className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-medium"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The Workflow
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[clamp(28px,4.5vw,48px)] text-foreground leading-[1.15] mb-16 md:mb-24 max-w-[600px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Four steps.
          <br />
          Zero ambiguity.
        </motion.h2>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.1 }}
              className="group bg-card border border-border rounded-2xl p-8 hover:border-[hsl(var(--color-border-strong))] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <span
                  className="text-[32px] font-light text-muted-foreground/40"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {step.num}
                </span>
                <div
                  className="w-2 h-2 rounded-full mt-3 opacity-60"
                  style={{ backgroundColor: `hsl(${step.color})` }}
                />
              </div>
              <h3
                className="text-[20px] text-foreground font-medium mb-3"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {step.title}
              </h3>
              <p
                className="text-[14px] text-muted-foreground leading-[1.7]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
