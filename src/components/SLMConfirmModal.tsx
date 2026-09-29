import { motion, AnimatePresence } from 'motion/react';
import { Cpu, HardDrive, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { SLMModelSpec } from '../lib/slmStorage';

interface SLMConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modelSpec: SLMModelSpec | null;
}

export function SLMConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  modelSpec,
}: SLMConfirmModalProps) {
  if (!isOpen || !modelSpec) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md p-6 rounded-3xl themed-modal border shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 15%, transparent)',
                color: 'var(--accent, #ec4899)',
                borderColor: 'color-mix(in srgb, var(--accent, #ec4899) 35%, transparent)',
              }}
            >
              <Cpu size={24} />
            </div>
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 12%, transparent)',
                  color: 'var(--accent, #ec4899)',
                }}
              >
                <Zap size={11} /> On-Device SLM
              </div>
              <h3 className="text-lg font-bold themed-text leading-tight">
                {modelSpec.name}
              </h3>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="space-y-3.5 mb-6 text-xs leading-relaxed opacity-90">
            <p
              className="p-3.5 rounded-2xl border leading-relaxed"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent, #ec4899) 25%, transparent)',
              }}
            >
              This specific persona runs a <strong>Small Language Model (SLM)</strong> entirely inside your device&apos;s browser memory. No external server, no network queries, and complete offline privacy.
            </p>

            <div className="p-3.5 rounded-2xl themed-ai-bubble border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70 flex items-center gap-1.5 font-medium">
                  <HardDrive size={13} /> Model Download Size:
                </span>
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: 'var(--accent, #ec4899)' }}
                >
                  {modelSpec.sizeString}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70 flex items-center gap-1.5 font-medium">
                  <Cpu size={13} /> Architecture:
                </span>
                <span className="font-mono font-semibold opacity-90">
                  {modelSpec.architecture}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={13} /> Storage:
                </span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--accent, #ec4899)' }}
                >
                  Browser Persistent Storage
                </span>
              </div>
            </div>

            <p className="text-[11px] opacity-60">
              The model weights will be stored in your browser storage so you won&apos;t need to redownload them in future sessions. You can delete them anytime.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl themed-btn border border-inherit text-xs font-semibold hover:opacity-80 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                backgroundColor: 'var(--accent, #ec4899)',
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5"
            >
              <Check size={15} strokeWidth={2.5} />
              Agree & Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
