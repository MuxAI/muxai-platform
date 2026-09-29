import { motion, AnimatePresence } from 'motion/react';
import { Cpu, HardDrive, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { SLMModelSpec, isSLMDownloaded, deleteSLMModel } from '../lib/slmStorage';
import { clearPipelineCache } from '../lib/slmEngine';

interface SLMManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelSpec: SLMModelSpec | null;
  onModelDeleted?: () => void;
}

export function SLMManageModal({
  isOpen,
  onClose,
  modelSpec,
  onModelDeleted,
}: SLMManageModalProps) {
  if (!isOpen || !modelSpec) return null;

  const isDownloaded = isSLMDownloaded(modelSpec.modelId);

  const handleDelete = async () => {
    await deleteSLMModel(modelSpec.modelId);
    clearPipelineCache(modelSpec.modelId);
    if (onModelDeleted) {
      onModelDeleted();
    }
    onClose();
  };

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
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--accent, #ec4899)' }}
              >
                SLM Model Manager
              </span>
              <h3 className="text-lg font-bold themed-text leading-tight">
                {modelSpec.name}
              </h3>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="p-3.5 rounded-2xl themed-ai-bubble border space-y-2.5">
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
                  <HardDrive size={13} /> Model Size:
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: 'var(--accent, #ec4899)' }}
                >
                  {modelSpec.sizeString}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70 flex items-center gap-1.5 font-medium">
                  Status in Browser:
                </span>
                {isDownloaded ? (
                  <span
                    className="inline-flex items-center gap-1 font-bold"
                    style={{ color: 'var(--accent, #ec4899)' }}
                  >
                    <CheckCircle2 size={13} /> Downloaded & Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-zinc-400 font-medium">
                    <AlertCircle size={13} /> Not downloaded yet
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] opacity-60 leading-normal">
              {modelSpec.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-inherit">
            {isDownloaded ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete Model from Storage
              </button>
            ) : (
              <span className="text-[11px] opacity-50">No saved files to delete</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl themed-btn border border-inherit text-xs font-semibold hover:opacity-80"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
