import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Conversation } from '../types';

interface DeleteModalProps {
  conversation: Conversation | { id: string; title: string };
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ conversation, onConfirm, onCancel }: DeleteModalProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<any>(null);

  const HOLD_MS = 3000; // 3 seconds safety hold
  const TICK_MS = 40;
  const INCREMENT = (TICK_MS / HOLD_MS) * 100;

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + INCREMENT;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setDone(true);
          setTimeout(() => onConfirm(), 250);
          return 100;
        }
        return next;
      });
    }, TICK_MS);
  }, [INCREMENT, onConfirm]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!done) setProgress(0);
  }, [done]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="border rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl text-center themed-modal relative"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 opacity-60 hover:opacity-100"
          >
            <X size={16} />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Trash2 size={28} />
            </div>
          </div>

          <h3 className="text-lg font-bold mb-1.5 themed-modal-text">
            Delete Conversation?
          </h3>
          <p className="text-xs sm:text-sm mb-2 themed-modal-muted">
            "{conversation.title || 'New chat'}" and its history will be deleted.
          </p>

          <p className="text-[11px] mb-5 flex items-center justify-center gap-1.5 text-amber-500 font-medium">
            <AlertTriangle size={13} />
            <span>Press & hold for 3s to confirm</span>
          </p>

          <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            className="relative w-full h-13 rounded-2xl border overflow-hidden select-none touch-none transition-all active:scale-[0.99] themed-hold-btn font-bold text-xs sm:text-sm"
          >
            <div
              className="absolute inset-0 bg-red-500 origin-left"
              style={{
                width: `${progress}%`,
                transition: progress === 0 ? 'width 0.2s ease-out' : 'none',
              }}
            />
            <span className="relative z-10 font-bold flex items-center justify-center gap-2">
              {done ? (
                'Deleting…'
              ) : progress > 0 ? (
                `Holding… ${Math.ceil((100 - progress) / 33)}s`
              ) : (
                'Hold to Delete'
              )}
            </span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 mt-2 text-xs font-semibold themed-modal-muted hover:opacity-100 transition-opacity"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
