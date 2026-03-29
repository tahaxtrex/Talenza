import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="h-14 bg-[hsl(0,0%,100%)]/90 backdrop-blur-xl border-b border-[hsl(var(--color-border))] sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-body text-[13px] text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="w-px h-5 bg-[hsl(var(--color-border))]" />

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <div className="w-[2px] h-4 bg-[hsl(var(--color-accent))]" />
          <span style={{ fontFamily: 'var(--font-display)' }} className="text-[16px] text-[hsl(var(--color-text-primary))]">
            Talenza
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {[
          { path: '/app', label: 'Analyse', icon: <Home size={15} /> },
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 font-body text-[13px] px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))] font-medium'
                : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-surface-2))]'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
