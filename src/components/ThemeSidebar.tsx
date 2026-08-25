import { motion, AnimatePresence } from 'motion/react';
import { Palette, X, Check, Sun, Moon } from 'lucide-react';
import { THEMES } from '../lib/themes';

interface ThemeSidebarProps {
  activeTheme: string;
  onSelect: (themeId: string) => void;
  open: boolean;
  onClose: () => void;
}

export function ThemeSidebar({ activeTheme, onSelect, open, onClose }: ThemeSidebarProps) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 border-l themed-theme-sidebar backdrop-blur-2xl shadow-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-inherit">
          <div className="flex items-center gap-2">
            <Palette size={20} className="themed-tool-accent" />
            <span className="font-bold text-base themed-sidebar-text">Color Themes</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {THEMES.map((theme) => {
            const isActive = theme.id === activeTheme;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`w-full text-left rounded-2xl border-2 p-3 transition-all duration-200 overflow-hidden themed-theme-card relative group ${
                  isActive
                    ? 'themed-theme-card-active scale-[1.02] shadow-lg'
                    : 'hover:scale-[1.01] hover:border-zinc-400/40 opacity-80 hover:opacity-100'
                }`}
                style={isActive ? { borderColor: 'var(--accent, #4f46e5)' } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {theme.isDark ? (
                      <Moon size={14} className="opacity-60" />
                    ) : (
                      <Sun size={14} className="text-amber-500" />
                    )}
                    <span className="font-bold text-xs sm:text-sm themed-theme-card-text">
                      {theme.name}
                    </span>
                  </div>

                  {isActive && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm text-white"
                      style={{ background: 'var(--accent, #4f46e5)' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 h-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 p-0.5 bg-black/5">
                  {theme.swatches.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-md"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3.5 border-t border-inherit text-xs text-center themed-sidebar-muted">
          Themes instantly adapt background, chat bubbles, accents & glows.
        </div>
      </aside>
    </>
  );
}
