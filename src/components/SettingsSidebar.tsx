import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Sparkles,
  Zap,
  Download,
  Upload,
  Check,
  Lock,
  Palette,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Sun,
  Moon,
  Plus,
  Edit2,
  Trash2,
  Shield,
  FileText,
  Database,
} from 'lucide-react';
import { Theme, getAllThemes } from '../lib/themes';
import { GraphicsQuality } from '../lib/storage';

interface SettingsSidebarProps {
  open: boolean;
  onClose: () => void;
  graphicsQuality: GraphicsQuality;
  onSelectGraphicsQuality: (quality: GraphicsQuality) => void;
  onExportData: () => void;
  onImportDataFile: (file: File) => void;
  activeTheme: string;
  onSelectTheme: (themeId: string) => void;
  themes?: Theme[];
  onOpenCreateTheme?: () => void;
  onEditTheme?: (theme: Theme) => void;
  onDeleteTheme?: (id: string) => void;
}

export function SettingsSidebar({
  open,
  onClose,
  graphicsQuality,
  onSelectGraphicsQuality,
  onExportData,
  onImportDataFile,
  activeTheme,
  onSelectTheme,
  themes,
  onOpenCreateTheme,
  onEditTheme,
  onDeleteTheme,
}: SettingsSidebarProps) {
  const [currentView, setCurrentView] = useState<'main' | 'themes'>('main');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const themeList = themes || getAllThemes();
  const currentThemeObj = themeList.find((t) => t.id === activeTheme) || themeList[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDataFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset to main view when closed
  const handleClose = () => {
    onClose();
    setTimeout(() => setCurrentView('main'), 250);
  };

  const legalLinks = [
    { label: 'Terms of Service', href: 'https://muxai.github.io/terms-of-service' },
    { label: 'Privacy Policy', href: 'https://muxai.github.io/privacy-policy' },
    { label: 'Fair Use', href: 'https://muxai.github.io/fair-use' },
    { label: 'Account Data', href: 'https://muxai.github.io/account-data' },
    { label: 'Refund Policy', href: 'https://muxai.github.io/refund-policy' },
    { label: 'Users in European Union', href: 'https://muxai.github.io/eu-privacy' },
    { label: 'Users in United States', href: 'https://muxai.github.io/us-privacy' },
    { label: 'Users in Canada', href: 'https://muxai.github.io/ca-privacy' },
    { label: 'Users in Bangladesh', href: 'https://muxai.github.io/bd-privacy' },
  ];

  return (
    <>
      {/* Hidden Import File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-in Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-84 sm:w-96 z-50 flex flex-col transition-transform duration-300 border-l themed-theme-sidebar backdrop-blur-2xl shadow-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ===================== VIEW: MAIN SETTINGS ===================== */}
        {currentView === 'main' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-inherit shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-400">
                  <Settings size={18} />
                </div>
                <span className="font-extrabold text-base tracking-tight themed-sidebar-text">
                  Settings
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors hover:scale-105 active:scale-95"
                title="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* SECTION 1: Graphics Quality */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider themed-sidebar-muted">
                    Graphics Quality
                  </span>
                  <span className="text-[10px] font-mono opacity-60">Visual Engine</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Fancy Button */}
                  <button
                    type="button"
                    onClick={() => onSelectGraphicsQuality('fancy')}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      graphicsQuality === 'fancy'
                        ? 'border-pink-500/60 bg-pink-500/15 shadow-sm ring-1 ring-pink-500/30'
                        : 'border-inherit bg-black/10 hover:border-zinc-500/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Sparkles size={14} className="text-pink-400" />
                        <span>Fancy</span>
                      </div>
                      {graphicsQuality === 'fancy' && (
                        <div className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] opacity-70 leading-tight">
                      Dynamic effects (Default)
                    </p>
                  </button>

                  {/* Smooth Button */}
                  <button
                    type="button"
                    onClick={() => onSelectGraphicsQuality('smooth')}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      graphicsQuality === 'smooth'
                        ? 'border-indigo-500/60 bg-indigo-500/15 shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-inherit bg-black/10 hover:border-zinc-500/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Zap size={14} className="text-indigo-400" />
                        <span>Smooth</span>
                      </div>
                      {graphicsQuality === 'smooth' && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] opacity-70 leading-tight">
                      More performance
                    </p>
                  </button>
                </div>
              </div>

              {/* SECTION 2: Your Data */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider themed-sidebar-muted">
                    Your Data
                  </span>
                  <span className="text-[10px] font-mono opacity-60">Persistent Storage</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-inherit bg-black/10 space-y-3">
                  <p className="text-xs opacity-75 leading-relaxed">
                    Export your full workspace (conversations, custom personas, themes & settings) or import from a previous backup file.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onExportData}
                      className="py-2.5 px-3 rounded-xl border border-inherit hover:border-pink-500/40 bg-black/20 hover:bg-pink-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-98"
                    >
                      <Download size={14} className="text-pink-400" />
                      <span>Export Data</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border border-inherit hover:border-indigo-500/40 bg-black/20 hover:bg-indigo-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-98"
                    >
                      <Upload size={14} className="text-indigo-400" />
                      <span>Import Data</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Account Type */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider themed-sidebar-muted">
                    Account Type
                  </span>
                  <span className="text-[10px] font-mono opacity-60">Subscription</span>
                </div>

                <div className="space-y-2">
                  {/* Free Plan (Active) */}
                  <div className="p-3.5 rounded-2xl border border-pink-500/40 bg-pink-500/10 relative overflow-hidden flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm">Free</span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-sm">
                          Active Plan
                        </span>
                      </div>
                      <p className="text-xs opacity-80 leading-tight">
                        Unlimited access to everything
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Paid Plan (Blocked / Disabled) */}
                  <div className="p-3.5 rounded-2xl border border-inherit bg-black/15 opacity-60 relative overflow-hidden flex items-start justify-between gap-3 cursor-not-allowed">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm">Paid</span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Unavailable
                        </span>
                      </div>
                      <p className="text-xs opacity-80 leading-tight">
                        Unlocks cloud storage and conversation sharing.
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-700">
                      <Lock size={11} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Themes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider themed-sidebar-muted">
                    Themes & Styling
                  </span>
                  <span className="text-[10px] font-mono opacity-60">{themeList.length} themes</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-inherit bg-black/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
                      <Palette size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm truncate max-w-[130px]">
                        {currentThemeObj?.name || 'Default'}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {currentThemeObj?.swatches?.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentView('themes')}
                    className="py-2 px-3.5 rounded-xl themed-btn font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <span>Customize UI</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* SECTION 5: Legal Info */}
              <div className="space-y-2.5 pt-2 border-t border-inherit">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider themed-sidebar-muted flex items-center gap-1.5">
                    <Shield size={12} className="opacity-70" /> Legal Info
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Compliance & Privacy</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {legalLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 px-3 rounded-xl border border-inherit bg-black/5 hover:bg-black/20 text-xs font-medium flex items-center justify-between transition-colors group opacity-80 hover:opacity-100"
                    >
                      <span className="truncate">{link.label}</span>
                      <ExternalLink
                        size={12}
                        className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* App Version & Architecture */}
              <div className="text-center pt-2 pb-2 text-[10px] opacity-40 font-mono">
                MuxAI v2.4
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW: THEME SUBMENU ===================== */}
        {currentView === 'themes' && (
          <div className="flex flex-col h-full">
            {/* Submenu Header */}
            <div className="p-4 flex items-center justify-between border-b border-inherit shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('main')}
                  className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors hover:scale-105 active:scale-95"
                  title="Back to Settings"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-pink-400" />
                  <span className="font-extrabold text-base tracking-tight themed-sidebar-text">
                    Color Themes
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors hover:scale-105 active:scale-95"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Themes List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {themeList.map((theme) => {
                const isActive = theme.id === activeTheme;
                const isCustom = theme.id.startsWith('custom_theme_');

                return (
                  <div
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
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

            {/* Create Custom Theme Action at Bottom */}
            {onOpenCreateTheme && (
              <div className="p-3.5 border-t border-inherit shrink-0">
                <button
                  type="button"
                  onClick={onOpenCreateTheme}
                  className="w-full py-2.5 px-4 rounded-xl themed-btn font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Create Custom Theme</span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
