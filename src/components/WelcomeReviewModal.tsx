import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ExternalLink, Check, Download } from 'lucide-react';
import { Logo } from './Logo';

interface WelcomeReviewModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onInstallApp?: () => void;
  canInstall?: boolean;
}

export const LEGAL_LINKS = [
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

export function WelcomeReviewModal({
  isOpen,
  onAccept,
  onInstallApp,
  canInstall,
}: WelcomeReviewModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-3xl themed-modal border shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Section with Logo & Brand */}
          <div className="p-6 pb-4 text-center flex flex-col items-center border-b border-inherit relative overflow-hidden shrink-0">
            {/* Ambient Background Aura */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 mb-3 flex items-center justify-center themed-logo-box border shadow-md relative z-10">
              <Logo isMain size={48} />
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight themed-text flex items-center gap-2 relative z-10">
              <span>MuxAI</span>
            </h2>
            <p className="text-xs themed-modal-muted mt-1 max-w-sm relative z-10">
              Conversational personas with LLM abilities.
            </p>
          </div>

          {/* Body Section */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold themed-text px-3 py-1 rounded-full themed-chip border">
                <Shield size={15} className="text-pink-500 shrink-0" />
                <span>Before You Go Crazy...</span>
              </div>
            </div>

            {/* Links Grid / Wrap */}
            <div className="flex flex-wrap gap-2 justify-center py-1">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold themed-ai-bubble border transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-sm hover:border-pink-500/50 hover:text-pink-500"
                >
                  <span>{link.label}</span>
                  <ExternalLink
                    size={11}
                    className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </a>
              ))}
            </div>

            {/* Optional Install Web App button if browser supports prompt */}
            {canInstall && onInstallApp && (
              <button
                type="button"
                onClick={onInstallApp}
                className="w-full py-2.5 px-4 rounded-2xl themed-btn hover:border-pink-500/40 border border-inherit font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download size={14} className="text-pink-500" />
                <span>Install MuxAI Web App to Desktop / Device</span>
              </button>
            )}
          </div>

          {/* Footer with Acknowledge Button & Best Results Home Shortcut Notice */}
          <div className="p-5 pt-3 border-t border-inherit bg-black/5 dark:bg-black/20 flex flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={onAccept}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>I Understand & Continue</span>
            </button>

            <p className="text-[11px] text-center themed-modal-muted leading-relaxed px-2 font-normal">
              For best results, install/add a shortcut to your homescreen from your browser settings sidebar.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
