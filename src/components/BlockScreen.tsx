import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, Timer } from 'lucide-react';

interface BlockScreenProps {
  resetIn: number;
}

export function BlockScreen({ resetIn }: BlockScreenProps) {
  const mins = Math.ceil(resetIn / 60000);
  const secs = Math.ceil((resetIn % 60000) / 1000);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] themed-block-screen backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center relative z-10 text-red-500 shadow-2xl">
            <Lock size={38} />
          </div>
          <div className="absolute -top-1 -right-1 z-20 p-1.5 bg-red-500 rounded-full text-white shadow-lg animate-bounce">
            <ShieldAlert size={16} />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight themed-text">
          Cooldown Active
        </h2>
        <div className="text-red-500 font-mono uppercase tracking-[0.25em] text-xs font-bold mb-5">
          Rate Limit Protection Engaged
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-lg sm:text-xl font-mono font-bold text-red-400 mb-4 shadow-sm">
          <Timer size={20} className="animate-spin" />
          <span>{mins > 0 ? `${mins}m ${secs}s remaining` : 'Resetting…'}</span>
        </div>

        <p className="text-xs sm:text-sm max-w-sm themed-modal-muted leading-relaxed">
          To maintain server responsiveness and model stability, please wait before initiating new chat requests.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
