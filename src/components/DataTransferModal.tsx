import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Upload,
  X,
  Check,
  MessageSquare,
  Users,
  Palette,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { MuxAIExportPackage, DataSelectionFilter } from '../lib/storage';

interface DataTransferModalProps {
  isOpen: boolean;
  mode: 'export' | 'import';
  onClose: () => void;
  onConfirmExport?: (filter: DataSelectionFilter) => void;
  onConfirmImport?: (filter: DataSelectionFilter, pkg: MuxAIExportPackage) => void;
  importPackage?: MuxAIExportPackage | null;
  conversationCount?: number;
  personaCount?: number;
  themeCount?: number;
}

export function DataTransferModal({
  isOpen,
  mode,
  onClose,
  onConfirmExport,
  onConfirmImport,
  importPackage,
  conversationCount = 0,
  personaCount = 0,
  themeCount = 0,
}: DataTransferModalProps) {
  const [selected, setSelected] = useState<DataSelectionFilter>({
    conversations: true,
    personas: true,
    themes: true,
  });

  // Reset to all selected whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'import' && importPackage?.data) {
        setSelected({
          conversations: Boolean(importPackage.data.conversations?.length),
          personas: Boolean(importPackage.data.customPersonas?.length),
          themes: Boolean(importPackage.data.customThemes?.length),
        });
      } else {
        setSelected({
          conversations: true,
          personas: true,
          themes: true,
        });
      }
    }
  }, [isOpen, mode, importPackage]);

  if (!isOpen) return null;

  const isAllSelected = selected.conversations && selected.personas && selected.themes;
  const isNoneSelected = !selected.conversations && !selected.personas && !selected.themes;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelected({ conversations: false, personas: false, themes: false });
    } else {
      setSelected({ conversations: true, personas: true, themes: true });
    }
  };

  const handleConfirm = () => {
    if (isNoneSelected) return;
    if (mode === 'export' && onConfirmExport) {
      onConfirmExport(selected);
      onClose();
    } else if (mode === 'import' && onConfirmImport && importPackage) {
      onConfirmImport(selected, importPackage);
      onClose();
    }
  };

  const importConvCount = importPackage?.data?.conversations?.length || 0;
  const importPersonaCount = importPackage?.data?.customPersonas?.length || 0;
  const importThemeCount = importPackage?.data?.customThemes?.length || 0;

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
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 15%, transparent)',
                color: 'var(--accent, #ec4899)',
                borderColor: 'color-mix(in srgb, var(--accent, #ec4899) 35%, transparent)',
              }}
            >
              {mode === 'export' ? <Download size={24} /> : <Upload size={24} />}
            </div>
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--accent, #ec4899)' }}
              >
                Workspace Data
              </span>
              <h3 className="text-lg font-bold themed-text leading-tight">
                {mode === 'export' ? 'Export Data' : 'Import Data'}
              </h3>
            </div>
          </div>

          <p className="text-xs opacity-75 leading-relaxed mb-4">
            {mode === 'export'
              ? 'Select all or specific categories of data you wish to download as a backup JSON file.'
              : 'Select which categories from this backup file you wish to restore into your workspace.'}
          </p>

          {/* Select All Toggle Bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
              Select Data Items
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs font-bold flex items-center gap-1.5 transition-colors hover:opacity-80 active:scale-95"
              style={{ color: 'var(--accent, #ec4899)' }}
            >
              {isAllSelected ? (
                <>
                  <CheckSquare size={14} /> Deselect All
                </>
              ) : (
                <>
                  <Square size={14} /> Select All
                </>
              )}
            </button>
          </div>

          {/* Category Checkbox Cards */}
          <div className="space-y-2.5 mb-6">
            {/* Conversations */}
            <div
              onClick={() =>
                setSelected((prev) => ({ ...prev, conversations: !prev.conversations }))
              }
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selected.conversations
                  ? 'border-inherit bg-black/15 shadow-sm'
                  : 'border-inherit bg-black/5 opacity-55 hover:opacity-80'
              }`}
              style={
                selected.conversations
                  ? { borderColor: 'var(--accent, #ec4899)' }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 15%, transparent)',
                    color: 'var(--accent, #ec4899)',
                  }}
                >
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Conversations & Chats</div>
                  <div className="text-[10px] opacity-70">
                    {mode === 'export'
                      ? `${conversationCount} saved chat thread${conversationCount === 1 ? '' : 's'}`
                      : `${importConvCount} chat${importConvCount === 1 ? '' : 's'} in backup`}
                  </div>
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center transition-colors"
                style={
                  selected.conversations
                    ? { backgroundColor: 'var(--accent, #ec4899)', color: '#ffffff' }
                    : { border: '1px solid rgba(128,128,128,0.4)' }
                }
              >
                {selected.conversations && <Check size={13} strokeWidth={3} />}
              </div>
            </div>

            {/* Custom Personas */}
            <div
              onClick={() =>
                setSelected((prev) => ({ ...prev, personas: !prev.personas }))
              }
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selected.personas
                  ? 'border-inherit bg-black/15 shadow-sm'
                  : 'border-inherit bg-black/5 opacity-55 hover:opacity-80'
              }`}
              style={
                selected.personas
                  ? { borderColor: 'var(--accent, #ec4899)' }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 15%, transparent)',
                    color: 'var(--accent, #ec4899)',
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Custom Personas</div>
                  <div className="text-[10px] opacity-70">
                    {mode === 'export'
                      ? `${personaCount} persona${personaCount === 1 ? '' : 's'}`
                      : `${importPersonaCount} custom persona${importPersonaCount === 1 ? '' : 's'} in backup`}
                  </div>
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center transition-colors"
                style={
                  selected.personas
                    ? { backgroundColor: 'var(--accent, #ec4899)', color: '#ffffff' }
                    : { border: '1px solid rgba(128,128,128,0.4)' }
                }
              >
                {selected.personas && <Check size={13} strokeWidth={3} />}
              </div>
            </div>

            {/* Custom Themes */}
            <div
              onClick={() =>
                setSelected((prev) => ({ ...prev, themes: !prev.themes }))
              }
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selected.themes
                  ? 'border-inherit bg-black/15 shadow-sm'
                  : 'border-inherit bg-black/5 opacity-55 hover:opacity-80'
              }`}
              style={
                selected.themes
                  ? { borderColor: 'var(--accent, #ec4899)' }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent, #ec4899) 15%, transparent)',
                    color: 'var(--accent, #ec4899)',
                  }}
                >
                  <Palette size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Custom Color Themes</div>
                  <div className="text-[10px] opacity-70">
                    {mode === 'export'
                      ? `${themeCount} custom theme${themeCount === 1 ? '' : 's'}`
                      : `${importThemeCount} custom theme${importThemeCount === 1 ? '' : 's'} in backup`}
                  </div>
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center transition-colors"
                style={
                  selected.themes
                    ? { backgroundColor: 'var(--accent, #ec4899)', color: '#ffffff' }
                    : { border: '1px solid rgba(128,128,128,0.4)' }
                }
              >
                {selected.themes && <Check size={13} strokeWidth={3} />}
              </div>
            </div>
          </div>

          {isNoneSelected && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-4 px-1">
              <AlertCircle size={14} />
              <span>Please select at least one item to continue.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl themed-btn border border-inherit text-xs font-semibold hover:opacity-80 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isNoneSelected}
              onClick={handleConfirm}
              style={{
                backgroundColor: 'var(--accent, #ec4899)',
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              {mode === 'export' ? (
                <>
                  <Download size={14} />
                  <span>Download Backup</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Import Selected Data</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
