import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Swords, Check, Play } from 'lucide-react';
import { Persona } from '../types';
import { Logo } from './Logo';

interface ChessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  onStartGame: (personaId: string, playerColor: 'w' | 'b') => void;
}

export function ChessSetupModal({
  isOpen,
  onClose,
  personas,
  onStartGame,
}: ChessSetupModalProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0]?.id || 'Sera16');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');

  if (!isOpen) return null;

  const handleLaunch = () => {
    onStartGame(selectedPersonaId, playerColor);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-xl rounded-3xl themed-modal border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-inherit shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-md">
                <Trophy size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight themed-text flex items-center gap-2">
                  <span>MuxAI Chess Arena</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full themed-chip border font-mono">
                    64 Squares
                  </span>
                </h2>
                <p className="text-xs themed-modal-muted mt-0.5">
                  Challenge any persona to a live chess game with conversational commentary.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl themed-btn border border-transparent hover:border-inherit transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Step 1: Select Opponent */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider themed-text flex items-center gap-1.5">
                  <Swords size={14} className="text-amber-500" />
                  Choose Persona Opponent
                </span>
                <span className="text-[10px] themed-modal-muted font-mono">Opponent Gallery</span>
              </div>

              {/* Persona Horizontal / Grid Deck */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-1.5 ${
                      selectedPersonaId === p.id
                        ? 'border-amber-500 bg-amber-500/15 shadow-md ring-1 ring-amber-500/40 themed-text'
                        : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center themed-logo-box border border-inherit shrink-0">
                      <Logo personaId={p.id} size={40} overflow />
                    </div>
                    <div className="min-w-0 w-full">
                      <div className="font-bold text-xs truncate themed-text">{p.name.split(' ')[0]}</div>
                      <div className="text-[9px] themed-modal-muted font-mono truncate">{p.tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Player Side / Color */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider themed-text">
                Choose Your Pieces
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* White Pieces */}
                <button
                  type="button"
                  onClick={() => setPlayerColor('w')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    playerColor === 'w'
                      ? 'border-pink-500 bg-pink-500/15 shadow-sm ring-1 ring-pink-500/30 themed-text'
                      : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">♔</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm themed-text">Play as White</div>
                      <div className="text-[10px] themed-modal-muted">Moves first</div>
                    </div>
                  </div>
                  {playerColor === 'w' && (
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Black Pieces */}
                <button
                  type="button"
                  onClick={() => setPlayerColor('b')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    playerColor === 'b'
                      ? 'border-pink-500 bg-pink-500/15 shadow-sm ring-1 ring-pink-500/30 themed-text'
                      : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">♚</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm themed-text">Play as Black</div>
                      <div className="text-[10px] themed-modal-muted">AI moves first</div>
                    </div>
                  </div>
                  {playerColor === 'b' && (
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-inherit bg-black/5 dark:bg-black/20 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold themed-btn border border-inherit hover:opacity-80 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLaunch}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Play size={16} className="fill-white" />
              <span>Start Chess Match</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
