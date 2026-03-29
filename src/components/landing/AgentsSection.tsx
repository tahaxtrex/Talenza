import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Scene3D from './Scene3D';

const ease = [0.16, 1, 0.3, 1] as const;

const agents = [
  {
    id: 1,
    name: 'Candidate Profiler',
    tag: 'Agent 1',
    tagColor: 'var(--color-danger)',
    tagBg: 'var(--color-danger-light)',
    desc: 'Ingests each candidate\'s CV, HR assessment, and personality description. Extracts every trait — leadership style, risk tolerance, decision-making patterns, cultural fit markers — into a structured profile. Runs automatically as you input each candidate.',
    output: `{
  "leadership_style": "directive",
  "risk_tolerance": 0.72,
  "crisis_experience": true,
  "decision_speed": "fast",
  "cultural_adaptability": 0.58,
  "stakeholder_mgmt": "strong",
  "change_resistance": 0.31
}`,
  },
  {
    id: 2,
    name: 'Scenario Analyst',
    tag: 'Agent 2',
    tagColor: 'var(--color-accent)',
    tagBg: 'var(--color-accent-light)',
    desc: 'Converts your business scenario into a structured evaluation framework. Detects missing information — urgency, budget, team dynamics, market pressure — and runs a Q&A session to fill the gaps before any scoring begins.',
    output: `Scenario parsed: 14/18 fields filled
⚠ Missing: budget_constraint → null
⚠ Missing: team_readiness → null
⚠ Missing: timeline_urgency → null

→ Initiating clarification:
  "How urgent is this hire?"
  "Is there budget for external search?"
  "How stable is the current team?"`,
  },
  {
    id: 3,
    name: 'Scoring & Strategy',
    tag: 'Agent 3',
    tagColor: 'var(--color-amber)',
    tagBg: 'var(--color-amber-light)',
    desc: 'Takes all candidate profiles and the validated scenario. Scores each candidate against context-weighted criteria. Then runs a sourcing analysis — should you hire internally or externally? — based on cost, risk, urgency, and pipeline strength.',
    output: `Candidate scores (crisis context):
  Markus B.  → 84.2  [crisis: 9.1, ops: 8.4]
  Sarah K.   → 71.5  [crisis: 5.8, ops: 9.0]
  Thomas R.  → 68.9  [crisis: 6.2, ops: 7.1]

Sourcing: INTERNAL HIRE recommended
  → Cost delta: €270K saved
  → Risk: LOW (Markus ready now)
  → Time: 6 weeks vs 18 external`,
  },
  {
    id: 4,
    name: 'Scenario Comparison',
    tag: 'Agent 4',
    tagColor: 'var(--color-success)',
    tagBg: 'var(--color-success-light)',
    desc: 'Re-runs the full scoring under a different business scenario. Shows exactly how rankings shift when context changes — proving that the right hire depends on the moment, not just the résumé.',
    output: `             CRISIS    GROWTH
Markus B.    84.2%     51.3%  ▼#1→#4
Sarah K.     71.5%     88.7%  ▲#2→#1
Thomas R.    68.9%     79.4%  ▲#3→#2

Sourcing shift: INTERNAL → EXTERNAL
  → Growth context favors new perspectives`,
  },
];

export default function AgentsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="agents" className="relative py-32 md:py-48" ref={ref}>
      {/* Background */}
      <div className="absolute left-0 top-1/3 w-[400px] h-[400px] opacity-15">
        <Scene3D className="w-full h-full" variant="agents" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10">
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
            The Architecture
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[clamp(28px,4.5vw,48px)] text-foreground leading-[1.15] mb-6 max-w-[650px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Four real agents.
          <br />
          <span className="text-muted-foreground">Not one prompt.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="text-[15px] text-muted-foreground leading-[1.7] max-w-[520px] mb-16"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Each agent has a separate reasoning chain, separate inputs, separate outputs.
          This is how you get dimension-level scoring that breaks the 7-out-of-8 bias.
        </motion.p>

        {/* Agent cards */}
        <div className="space-y-5">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.25 + i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-[hsl(var(--color-border-strong))] hover:shadow-lg transition-all duration-300"
            >
              <div className="grid md:grid-cols-[1fr,1fr] divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Left */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: `hsl(${agent.tagColor})`,
                        backgroundColor: `hsl(${agent.tagBg})`,
                      }}
                    >
                      {agent.tag}
                    </span>
                    <h3
                      className="text-[18px] text-foreground font-medium"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {agent.name}
                    </h3>
                  </div>
                  <p
                    className="text-[14px] text-muted-foreground leading-[1.7]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {agent.desc}
                  </p>
                </div>

                {/* Right - output preview */}
                <div className="bg-[#0F1117] p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    <span className="ml-auto text-[11px] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
                      output
                    </span>
                  </div>
                  <pre
                    className="text-[12px] leading-[1.9] text-white/70 whitespace-pre-wrap"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {agent.output}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
