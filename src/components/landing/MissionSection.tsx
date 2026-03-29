import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function MissionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  return (
    <section id="mission" className="relative py-32 md:py-48" ref={ref}>
      <div className="max-w-[800px] mx-auto px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="mb-6"
        >
          <span
            className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-medium"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The Mission
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[clamp(28px,4.5vw,52px)] text-foreground leading-[1.12] mb-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The right leader in the right context
          <br />
          <span className="text-brand">changes everything.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
          className="text-[16px] text-muted-foreground leading-[1.75] max-w-[540px] mx-auto mb-12"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Talenza exists because executive hiring decisions are too important to be reduced to
          compressed 7-out-of-10 scores. Context determines who succeeds. We make context visible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/app')}
            className="group inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-2xl text-[16px] font-medium hover:bg-brand-hover hover:-translate-y-0.5 transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 32px rgba(10,102,194,0.25)',
            }}
          >
            Launch Talenza
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-24 pt-8 border-t border-border"
        >
          <p className="text-[12px] text-muted-foreground/60" style={{ fontFamily: 'var(--font-body)' }}>
            © 2026 Talenza · Executive Hiring Intelligence · Built with precision
          </p>
        </motion.div>
      </div>
    </section>
  );
}
