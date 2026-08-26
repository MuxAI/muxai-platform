import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, X, Check, Trash2, Sun, Moon, Sparkles, Sliders } from 'lucide-react';
import { Theme, BASE } from '../lib/themes';

interface CustomThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: Theme) => void;
  onDelete?: (id: string) => void;
  themeToEdit?: Theme | null;
}

export function CustomThemeModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  themeToEdit,
}: CustomThemeModalProps) {
  const isEditing = Boolean(themeToEdit && themeToEdit.id.startsWith('custom_theme_'));

  const [name, setName] = useState('My Custom Theme');
  const [isDark, setIsDark] = useState(true);
  const [bgColor, setBgColor] = useState('#0f172a');
  const [textColor, setTextColor] = useState('#f8fafc');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [userBubbleBg, setUserBubbleBg] = useState('#4f46e5');
  const [userBubbleText, setUserBubbleText] = useState('#ffffff');
  const [aiBubbleBg, setAiBubbleBg] = useState('#1e293b');
  const [aiBubbleText, setAiBubbleText] = useState('#e2e8f0');
  const [sidebarBg, setSidebarBg] = useState('#0f172a');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (themeToEdit) {
      setName(themeToEdit.name || 'Custom Theme');
      setIsDark(themeToEdit.isDark);
      const v = themeToEdit.vars;
      setBgColor(v['--bg-base'] || (themeToEdit.isDark ? '#0f172a' : '#fafafa'));
      setTextColor(v['--text-base'] || (themeToEdit.isDark ? '#f8fafc' : '#18181b'));
      setAccentColor(v['--accent'] || '#6366f1');
      setUserBubbleBg(v['--user-bubble-bg'] || '#4f46e5');
      setUserBubbleText(v['--user-bubble-text'] || '#ffffff');
      setAiBubbleBg(v['--ai-bubble-bg'] || (themeToEdit.isDark ? '#1e293b' : '#ffffff'));
      setAiBubbleText(v['--ai-bubble-text'] || (themeToEdit.isDark ? '#e2e8f0' : '#334155'));
      setSidebarBg(v['--sidebar-bg'] || (themeToEdit.isDark ? '#0f172a' : '#ffffff'));
    } else {
      setName('Neon Pulse');
      setIsDark(true);
      setBgColor('#09090b');
      setTextColor('#f4f4f5');
      setAccentColor('#ec4899');
      setUserBubbleBg('#db2777');
      setUserBubbleText('#ffffff');
      setAiBubbleBg('#18181b');
      setAiBubbleText('#e4e4e7');
      setSidebarBg('#09090b');
    }
  }, [themeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const themeId = themeToEdit?.id || `custom_theme_${Date.now()}`;

    // Construct full variable mappings derived from base
    const customVars: Record<string, string> = {
      ...BASE,
      '--bg-base': bgColor,
      '--text-base': textColor,
      '--header-bg': isDark ? `${bgColor}cc` : `${bgColor}ee`,
      '--header-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      '--user-bubble-bg': userBubbleBg,
      '--user-bubble-text': userBubbleText,
      '--ai-bubble-bg': aiBubbleBg,
      '--ai-bubble-border': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      '--ai-bubble-text': aiBubbleText,
      '--ai-bubble-hover-bg': aiBubbleBg,
      '--ai-bubble-hover-border': accentColor,
      '--logo-box-bg': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      '--logo-box-border': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      '--input-bg': isDark ? aiBubbleBg : '#ffffff',
      '--input-border': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      '--input-focus-border': accentColor,
      '--input-text': textColor,
      '--input-placeholder': isDark ? '#71717a' : '#94a3b8',
      '--send-btn-bg': accentColor,
      '--send-btn-text': '#ffffff',
      '--send-btn-hover': accentColor,
      '--sidebar-bg': sidebarBg,
      '--sidebar-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      '--sidebar-text': textColor,
      '--sidebar-text-secondary': isDark ? '#a1a1aa' : '#64748b',
      '--sidebar-hover-bg': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      '--sidebar-active-bg': `${accentColor}25`,
      '--new-chat-bg': accentColor,
      '--new-chat-text': '#ffffff',
      '--new-chat-hover': accentColor,
      '--accent': accentColor,
      '--accent-bg': `${accentColor}20`,
      '--accent-border': `${accentColor}40`,
      '--accent-text': accentColor,
      '--aurora-1': `${accentColor}18`,
      '--aurora-2': `${userBubbleBg}15`,
      '--aurora-3': `${aiBubbleBg}20`,
      '--theme-sidebar-bg': sidebarBg,
      '--theme-sidebar-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      '--theme-card-bg': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      '--theme-card-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      '--theme-card-active-border': accentColor,
      '--theme-card-text': textColor,
      '--theme-card-muted': isDark ? '#71717a' : '#94a3b8',
      '--chip-bg': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      '--chip-border': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      '--chip-text': textColor,
      '--link-text': accentColor,
    };

    const swatches = [bgColor, textColor, accentColor, userBubbleBg, aiBubbleBg];

    const newTheme: Theme = {
      id: themeId,
      name: name.trim(),
      isDark,
      vars: customVars,
      swatches,
    };

    onSave(newTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 text-white rounded-3xl p-5 sm:p-7 shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: accentColor }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
                {isEditing ? 'Edit Custom Theme' : 'Create Custom Theme'}
              </h3>
              <p className="text-xs text-zinc-400">
                Design your own aesthetic color palette and bubble styles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Miniature Preview */}
        <div
          className="mt-4 p-4 rounded-2xl border transition-all duration-300 shadow-inner flex flex-col gap-2.5"
          style={{ background: bgColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: textColor }}>
            <span>Preview Mode</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px]"
              style={{ background: `${accentColor}30`, color: accentColor }}
            >
              {name || 'Theme Preview'}
            </span>
          </div>

          <div className="flex justify-end">
            <div
              className="px-3 py-2 rounded-xl text-xs font-medium max-w-[75%]"
              style={{ background: userBubbleBg, color: userBubbleText }}
            >
              Hello! This is how user messages will look.
            </div>
          </div>

          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-xl text-xs font-medium max-w-[75%] border"
              style={{
                background: aiBubbleBg,
                color: aiBubbleText,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              And this is how AI responses appear! ✨
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Theme Name & Dark/Light Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Theme Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midnight Iris, Solar Flare"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 focus:border-pink-500 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Base Tone
              </label>
              <button
                type="button"
                onClick={() => setIsDark((v) => !v)}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-800/80 border border-zinc-700 hover:bg-zinc-700/80 active:scale-95 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {isDark ? (
                  <>
                    <Moon size={14} className="text-indigo-400" /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-amber-400" /> Light Mode
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Color Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Background Color */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Background</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{bgColor}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Base Text</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{textColor}</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Accent Glow */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Accent & Buttons</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{accentColor}</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Sidebar Background */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Sidebar / Header</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{sidebarBg}</span>
                <input
                  type="color"
                  value={sidebarBg}
                  onChange={(e) => setSidebarBg(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* User Bubble Background */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">User Bubble Bg</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{userBubbleBg}</span>
                <input
                  type="color"
                  value={userBubbleBg}
                  onChange={(e) => setUserBubbleBg(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* AI Bubble Background */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">AI Bubble Bg</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">{aiBubbleBg}</span>
                <input
                  type="color"
                  value={aiBubbleBg}
                  onChange={(e) => setAiBubbleBg(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            {isEditing && onDelete && themeToEdit ? (
              <div className="flex items-center gap-2">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(themeToEdit.id);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all animate-pulse flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-4 py-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs sm:text-sm font-semibold transition-all text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 active:scale-95 text-xs sm:text-sm font-bold text-white shadow-xl transition-all flex items-center gap-2"
              >
                <Check size={16} strokeWidth={2.5} />
                {isEditing ? 'Save Theme' : 'Create & Apply'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
