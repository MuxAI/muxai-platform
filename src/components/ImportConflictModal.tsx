import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Check, ArrowRight, Database, FileText, Palette, Users, Copy } from 'lucide-react';
import { ImportConflict } from '../types';
import { MuxAIExportPackage } from '../lib/storage';

interface ImportConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ImportConflict[];
  dataPackage: MuxAIExportPackage;
  onResolveAndImport: (
    dataPackage: MuxAIExportPackage,
    resolutions: Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'>
  ) => void;
}

export function ImportConflictModal({
  isOpen,
  onClose,
  conflicts,
  dataPackage,
  onResolveAndImport,
}: ImportConflictModalProps) {
  // Key: conflict ID, Value: 'keep_existing' | 'use_incoming' | 'keep_both'
  const [resolutions, setResolutions] = useState<
    Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'>
  >(() => {
    const initial: Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'> = {};
    conflicts.forEach((c) => {
      initial[c.id] = 'use_incoming'; // default to incoming
    });
    return initial;
  });

  if (!isOpen || conflicts.length === 0) return null;

  const setAllResolutions = (choice: 'keep_existing' | 'use_incoming' | 'keep_both') => {
    const updated: Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'> = {};
    conflicts.forEach((c) => {
      updated[c.id] = choice;
    });
    setResolutions(updated);
  };

  const handleApply = () => {
    onResolveAndImport(dataPackage, resolutions);
    onClose();
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <FileText size={16} className="text-blue-400" />;
      case 'persona':
        return <Users size={16} className="text-pink-400" />;
      case 'theme':
        return <Palette size={16} className="text-purple-400" />;
      default:
        return <Database size={16} className="text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl themed-modal border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-inherit bg-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 themed-text">
                  Data Import Conflict Detected
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                    {conflicts.length} {conflicts.length === 1 ? 'clash' : 'clashes'}
                  </span>
                </h3>
                <p className="text-xs themed-modal-muted mt-0.5">
                  Some items in the imported file share existing IDs. Compare side-by-side and choose which version to keep.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl themed-btn border border-transparent hover:border-inherit transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Bulk Action Bar */}
          <div className="px-6 py-3 themed-ai-bubble border-b border-inherit flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="themed-modal-muted font-medium">Quick Bulk Select:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllResolutions('keep_existing')}
                className="px-3 py-1.5 rounded-xl themed-btn border border-inherit font-semibold transition-colors"
              >
                Keep All Current (A)
              </button>
              <button
                type="button"
                onClick={() => setAllResolutions('use_incoming')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 font-semibold transition-colors border border-amber-500/40"
              >
                Use All Incoming (B)
              </button>
              <button
                type="button"
                onClick={() => setAllResolutions('keep_both')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 font-semibold transition-colors border border-blue-500/40"
              >
                Keep Both (Duplicate)
              </button>
            </div>
          </div>

          {/* Conflict Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {conflicts.map((conflict, idx) => {
              const currentChoice = resolutions[conflict.id] || 'use_incoming';

              return (
                <div
                  key={conflict.id}
                  className="p-4 sm:p-5 rounded-2xl themed-ai-bubble border border-inherit shadow-md space-y-4"
                >
                  {/* Conflict Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-inherit">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono opacity-50">#{idx + 1}</span>
                      <div className="p-1.5 rounded-lg themed-logo-box">{getItemIcon(conflict.type)}</div>
                      <div>
                        <span className="font-bold text-sm themed-text">{conflict.title}</span>
                        <span className="ml-2 text-[11px] uppercase tracking-wider themed-modal-muted font-mono">
                          [{conflict.type}]
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] themed-modal-muted">
                      Differences:{' '}
                      <span className="text-amber-500 font-medium">
                        {conflict.differences.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Side by Side Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Option A: Current in Browser */}
                    <div
                      onClick={() =>
                        setResolutions((prev) => ({ ...prev, [conflict.id]: 'keep_existing' }))
                      }
                      className={`cursor-pointer p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        currentChoice === 'keep_existing'
                          ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'themed-modal-input border-inherit hover:border-blue-400/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Option A: Current in Browser
                          </span>
                          {currentChoice === 'keep_existing' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1">
                              <Check size={10} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1 themed-text opacity-90">
                          {conflict.type === 'conversation' && (
                            <>
                              <div><strong className="themed-modal-muted">Title:</strong> {conflict.existingItem?.title}</div>
                              <div><strong className="themed-modal-muted">Messages:</strong> {conflict.existingItem?.messages?.length || 0} messages</div>
                              <div><strong className="themed-modal-muted">Persona:</strong> {conflict.existingItem?.personaId}</div>
                              {conflict.existingItem?.messages?.[0] && (
                                <div className="text-[11px] themed-modal-muted italic truncate themed-logo-box p-1.5 rounded-lg">
                                  "{conflict.existingItem.messages[0].content?.slice(0, 75)}..."
                                </div>
                              )}
                            </>
                          )}

                          {conflict.type === 'persona' && (
                            <>
                              <div><strong className="themed-modal-muted">Name:</strong> {conflict.existingItem?.name}</div>
                              <div><strong className="themed-modal-muted">Role:</strong> {conflict.existingItem?.role}</div>
                              <div><strong className="themed-modal-muted">Tag:</strong> {conflict.existingItem?.tag}</div>
                              <div className="text-[11px] themed-modal-muted italic truncate themed-logo-box p-1.5 rounded-lg">
                                Prompt: {conflict.existingItem?.systemPrompt?.slice(0, 75)}...
                              </div>
                            </>
                          )}

                          {conflict.type === 'theme' && (
                            <>
                              <div><strong className="themed-modal-muted">Theme Name:</strong> {conflict.existingItem?.name}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="themed-modal-muted text-[11px]">Palette:</span>
                                {conflict.existingItem?.swatches?.map((c: string, sIdx: number) => (
                                  <span key={sIdx} className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: c }} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResolutions((prev) => ({ ...prev, [conflict.id]: 'keep_existing' }));
                        }}
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentChoice === 'keep_existing'
                            ? 'bg-blue-500 text-white'
                            : 'themed-btn border border-inherit'
                        }`}
                      >
                        {currentChoice === 'keep_existing' ? <Check size={12} /> : null}
                        Keep Current Version (A)
                      </button>
                    </div>

                    {/* Option B: Incoming Backup File */}
                    <div
                      onClick={() =>
                        setResolutions((prev) => ({ ...prev, [conflict.id]: 'use_incoming' }))
                      }
                      className={`cursor-pointer p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        currentChoice === 'use_incoming'
                          ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                          : 'themed-modal-input border-inherit hover:border-amber-400/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Option B: Incoming from File
                          </span>
                          {currentChoice === 'use_incoming' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center gap-1">
                              <Check size={10} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1 themed-text opacity-90">
                          {conflict.type === 'conversation' && (
                            <>
                              <div><strong className="themed-modal-muted">Title:</strong> {conflict.incomingItem?.title}</div>
                              <div><strong className="themed-modal-muted">Messages:</strong> {conflict.incomingItem?.messages?.length || 0} messages</div>
                              <div><strong className="themed-modal-muted">Persona:</strong> {conflict.incomingItem?.personaId}</div>
                              {conflict.incomingItem?.messages?.[0] && (
                                <div className="text-[11px] themed-modal-muted italic truncate themed-logo-box p-1.5 rounded-lg">
                                  "{conflict.incomingItem.messages[0].content?.slice(0, 75)}..."
                                </div>
                              )}
                            </>
                          )}

                          {conflict.type === 'persona' && (
                            <>
                              <div><strong className="themed-modal-muted">Name:</strong> {conflict.incomingItem?.name}</div>
                              <div><strong className="themed-modal-muted">Role:</strong> {conflict.incomingItem?.role}</div>
                              <div><strong className="themed-modal-muted">Tag:</strong> {conflict.incomingItem?.tag}</div>
                              <div className="text-[11px] themed-modal-muted italic truncate themed-logo-box p-1.5 rounded-lg">
                                Prompt: {conflict.incomingItem?.systemPrompt?.slice(0, 75)}...
                              </div>
                            </>
                          )}

                          {conflict.type === 'theme' && (
                            <>
                              <div><strong className="themed-modal-muted">Theme Name:</strong> {conflict.incomingItem?.name}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="themed-modal-muted text-[11px]">Palette:</span>
                                {conflict.incomingItem?.swatches?.map((c: string, sIdx: number) => (
                                  <span key={sIdx} className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: c }} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResolutions((prev) => ({ ...prev, [conflict.id]: 'use_incoming' }));
                        }}
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentChoice === 'use_incoming'
                            ? 'bg-amber-500 text-black'
                            : 'themed-btn border border-inherit'
                        }`}
                      >
                        {currentChoice === 'use_incoming' ? <Check size={12} /> : null}
                        Overwrite with File (B)
                      </button>
                    </div>
                  </div>

                  {/* Option to keep both */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setResolutions((prev) => ({ ...prev, [conflict.id]: 'keep_both' }))
                      }
                      className={`text-xs px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        currentChoice === 'keep_both'
                          ? 'bg-blue-500/20 text-blue-500 border-blue-500/50 font-bold'
                          : 'bg-transparent themed-modal-muted border-inherit hover:opacity-100'
                      }`}
                    >
                      <Copy size={12} />
                      Keep Both (Save incoming as a separate copy)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action Bar */}
          <div className="px-6 py-4 themed-ai-bubble border-t border-inherit flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl themed-btn border border-inherit text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel Import
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2"
            >
              <span>Apply Resolutions & Import</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
