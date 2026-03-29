import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import bmwLogo from '@/assets/bmw-logo.png';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/85 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-foreground">
            Talenza
          </span>
          <span className="text-[13px] text-muted-foreground font-medium uppercase tracking-wider">×</span>
          <img src={bmwLogo} alt="BMW" className="h-11 w-11 object-contain drop-shadow-sm" />
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {[
            ['Problem', 'problem'],
            ['Pipeline', 'pipeline'],
            ['Agents', 'agents'],
            ['Mission', 'mission'],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[15px] font-medium text-t-secondary hover:text-t-primary transition-colors duration-200"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2.5 bg-brand text-white text-[15px] font-medium px-6 py-3 rounded-full hover:bg-brand-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ fontFamily: 'var(--font-body)', boxShadow: scrolled ? '0 4px 12px rgba(10,102,194,0.3)' : 'none' }}
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {[
                ['Problem', 'problem'],
                ['Pipeline', 'pipeline'],
                ['Agents', 'agents'],
                ['Mission', 'mission'],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left text-[15px] text-muted-foreground hover:text-foreground py-2 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => navigate('/app')}
                className="mt-2 flex items-center justify-center gap-2 bg-brand text-white text-[14px] font-medium px-5 py-3 rounded-xl hover:bg-brand-hover"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
