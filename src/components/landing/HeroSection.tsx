import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Scene3D from './Scene3D';
import bmwLogo from '@/assets/bmw-logo.png';

const ease = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D className="w-full h-full opacity-40" variant="hero" />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, hsl(var(--background)) 70%)',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
        {/* BMW Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2.5 bg-surface/60 backdrop-blur-md border border-border rounded-full px-5 py-2">
            <span className="text-[13px] font-medium text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              Built for
            </span>
            <img src={bmwLogo} alt="BMW" className="h-6 w-6 object-contain" />
            <span className="text-[13px] font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              BMW Group
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          style={{ fontFamily: 'var(--font-display)', lineHeight: 1.08 }}
          className="text-[clamp(36px,7vw,72px)] text-foreground mb-6"
        >
          Stop guessing.
          <br />
          <span className="text-brand">Start knowing.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.35 }}
          style={{ fontFamily: 'var(--font-body)', lineHeight: 1.65 }}
          className="text-[clamp(15px,1.8vw,18px)] text-muted-foreground max-w-[560px] mx-auto mb-12"
        >
          Four AI agents analyze your hiring context, score candidates on real
          competency dimensions, and reveal which scenario changes everything.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/app')}
            className="group flex items-center gap-2.5 bg-brand text-white px-8 py-4 rounded-2xl text-[15px] font-medium hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 32px rgba(10,102,194,0.3)',
            }}
          >
            Try Talenza Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-t-secondary hover:text-t-primary text-[14px] font-medium transition-colors duration-200 px-6 py-4"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            See how it works ↓
          </button>
        </motion.div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.7 }}
          className="mt-20 flex items-center justify-center gap-8 md:gap-16 flex-wrap"
        >
          {[
            ['4', 'AI Agents'],
            ['5', 'Dimensions'],
            ['<6s', 'Full Analysis'],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <div
                className="text-[28px] font-medium text-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {value}
              </div>
              <div
                className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
