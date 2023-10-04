import React, { useState } from 'react';
import { Flow, Theme } from '../types';

interface HeaderProps {
  flow?: Flow;
  onOpenVisualizer: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ flow, onOpenVisualizer, currentTheme, onThemeChange }) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const themes: {id: Theme, icon: string, label: string}[] = [
    { id: 'peach', icon: 'fa-heart', label: 'Peach & Yellow' },
    { id: 'onyx', icon: 'fa-mask', label: 'Batman (Onyx)' },
    { id: 'cyber', icon: 'fa-microchip', label: 'Cyber Neon' }
  ];

  const completedTasks = flow?.tasks.filter(t => t.status === 'done').length || 0;
  const progress = flow && flow.tasks.length > 0 ? (completedTasks / flow.tasks.length) * 100 : 0;

  return (
    <header className="px-10 py-8 border-b-2 border-slate-200/5 bg-white/5 backdrop-blur-xl flex justify-between items-center z-40">
      <div className="max-w-xl">
        {flow ? (
          <>
            <h1 className="text-3xl font-black flex items-center gap-4">
              <div className="w-2.5 h-10 bg-[var(--primary)] rounded-full shadow-lg"></div>
              {flow.name}
            </h1>
            <p className="opacity-50 text-sm font-semibold mt-1 ml-6 tracking-tight">{flow.description}</p>
          </>
        ) : (
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center rotate-3 shadow-xl">
               <i className="fa-solid fa-bolt text-[var(--accent)] text-xl"></i>
             </div>
             <h2 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--primary)' }}>ActionFlow</h2>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        {flow && (
          <>
            <div className="flex flex-col items-end">
              <div className="text-[11px] font-black uppercase tracking-widest mb-2 opacity-60">PROGRESS • {Math.round(progress)}%</div>
              <div className="w-48 h-3.5 bg-slate-200/15 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div className="h-full bg-[var(--primary)] transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="h-10 w-[2px] bg-slate-200/10" />
            <button 
              onClick={onOpenVisualizer} 
              className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 shadow-sm" 
              title="Graph View"
            >
              <i className="fa-solid fa-diagram-project text-lg"></i>
            </button>
          </>
        )}

        {/* Theme Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="px-6 py-4 bg-slate-900/10 hover:bg-slate-900/20 text-current rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-4 border-2 border-[var(--primary)] shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <i className="fa-solid fa-palette text-sm"></i>
            Themes
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isThemeMenuOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {isThemeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>
              <div className="absolute right-0 mt-4 w-64 bg-[var(--dropdown-bg)] border-2 border-[var(--primary)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest opacity-40">Choose Atmosphere</div>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-5 px-6 py-5 text-sm font-black transition-all hover:bg-[var(--element-bg)] ${currentTheme === t.id ? 'text-[var(--primary)]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTheme === t.id ? 'bg-[var(--primary)]/10 border-[var(--primary)] border-2' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <i className={`fa-solid ${t.icon} text-lg`}></i>
                    </div>
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;