import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowRight, Shield, TrendingUp } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <nav className="h-14 border-b border-border/60 backdrop-blur-xl bg-card/80 sticky top-0 z-50 flex items-center justify-between px-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-[2px] h-4 bg-primary rounded-full" />
          <span style={{ fontFamily: 'var(--font-display)' }} className="text-[16px] text-foreground">
            Talenza
          </span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          ← Back to Home
        </button>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-[840px] w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="text-center mb-16"
          >
            <h1
              style={{ fontFamily: 'var(--font-display)', lineHeight: 1.1 }}
              className="text-[clamp(28px,5vw,48px)] text-foreground mb-4"
            >
              Choose your pipeline
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
              className="text-[clamp(14px,1.6vw,17px)] text-muted-foreground max-w-[480px] mx-auto"
            >
              Analyze candidates with AI-powered scoring across five competency dimensions.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Internal */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
              onClick={() => navigate('/internal')}
              className="group relative text-left bg-card border border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_hsl(var(--color-accent)/0.15)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>

              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-[22px] text-foreground mb-3"
              >
                Internal Pipeline
              </h2>

              <p
                style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
                className="text-[14px] text-muted-foreground mb-6"
              >
                Evaluate existing employees for new roles or promotions. Includes HR opinion integration and internal vs. external cost analysis.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  HR Opinion
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
                  Cost Analysis
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.button>

            {/* External */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              onClick={() => navigate('/external')}
              className="group relative text-left bg-card border border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_hsl(var(--color-accent)/0.15)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-accent-foreground" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>

              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-[22px] text-foreground mb-3"
              >
                External Pipeline
              </h2>

              <p
                style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
                className="text-[14px] text-muted-foreground mb-6"
              >
                Screen outside candidates with CV parsing, scenario-based scoring, and comprehensive competency breakdowns.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <Users className="w-3.5 h-3.5 text-accent-foreground/60" />
                  CV Parsing
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-accent-foreground/60" />
                  5D Scoring
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
