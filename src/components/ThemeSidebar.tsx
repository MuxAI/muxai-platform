import { motion, AnimatePresence } from 'motion/react';
import { Palette, X, Check, Sun, Moon, Plus, Edit2, Trash2 } from 'lucide-react';
import { getAllThemes, Theme } from '../lib/themes';

interface ThemeSidebarProps {
  activeTheme: string;
  onSelect: (themeId: string) => void;
  open: boolean;
  onClose: () => void;
  themes?: Theme[];
  onOpenCreateTheme?: () => void;
  onEditTheme?: (theme: Theme) => void;
  onDeleteTheme?: (id: string) => void;
}

export function ThemeSidebar({
  activeTheme,
  onSelect,
  open,
  onClose,
  themes,
  onOpenCreateTheme,
  onEditTheme,
  onDeleteTheme,
}: ThemeSidebarProps) {
  const themeList = themes || getAllThemes();

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
        className={`fixed top-0 right-0 h-full w-80 sm:w-88 z-50 flex flex-col transition-transform duration-300 border-l themed-theme-sidebar backdrop-blur-2xl shadow-2xl ${
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
            className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors hover:scale-105 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {themeList.map((theme) => {
            const isActive = theme.id === activeTheme;
            const isCustom = theme.id.startsWith('custom_theme_');

            return (
              <div
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`w-full text-left rounded-2xl border-2 p-3 transition-all duration-200 overflow-hidden themed-theme-card relative group cursor-pointer ${
                  isActive
                    ? 'themed-theme-card-active scale-[1.02] shadow-lg'
                    : 'hover:scale-[1.01] hover:border-zinc-400/40 opacity-85 hover:opacity-100'
                }`}
                style={isActive ? { borderColor: 'var(--accent, #ec4899)' } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {theme.isDark ? (
                      <Moon size={14} className="opacity-60" />
                    ) : (
                      <Sun size={14} className="text-amber-500" />
                    )}
                    <span className="font-bold text-xs sm:text-sm themed-theme-card-text truncate max-w-[130px]">
                      {theme.name}
                    </span>
                    {isCustom && (
                      <span className="text-[9px] font-bold bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isCustom && onEditTheme && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTheme(theme);
                        }}
                        className="p-1 rounded-lg hover:bg-black/20 text-zinc-400 hover:text-white transition-colors"
                        title="Edit custom theme"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    {isCustom && onDeleteTheme && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTheme(theme.id);
                        }}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete custom theme"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {isActive && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm text-white shrink-0 ml-0.5"
                        style={{ background: 'var(--accent, #ec4899)' }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
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
              </div>
            );
          })}
        </div>

        {/* Regular Create Custom Theme Button at Bottom */}
        {onOpenCreateTheme && (
          <div className="p-3.5 border-t border-inherit">
            <button
              onClick={onOpenCreateTheme}
              className="w-full py-2.5 px-4 rounded-xl themed-btn font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-sm"
            >
              <Plus size={16} />
              <span>Create Custom Theme</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

