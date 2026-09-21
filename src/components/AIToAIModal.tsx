import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, ArrowRight, Play, MessageSquare, Bot } from 'lucide-react';
import { Persona } from '../types';
import { Logo } from './Logo';

interface AIToAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  onStartDuel: (p1Id: string, p2Id: string, topic: string) => void;
}

const DEFAULT_TOPICS = [
  "The philosophical implications of artificial consciousness and emotion",
  "Debating the most elegant software architectures: Microservices vs Monoliths",
  "How quantum mechanics and general relativity can finally be unified",
  "Exploring the culinary depth and history of Bengali vs Mediterranean food",
  "If human memories were stored as git repositories with commits and branches",
  "What is the deepest mathematical mystery remaining in modern science?",
  "A cozy fireside discussion on finding joy in simple everyday moments",
];

export function AIToAIModal({
  isOpen,
  onClose,
  personas,
  onStartDuel,
}: AIToAIModalProps) {
  const [p1Id, setP1Id] = useState<string>(personas[0]?.id || 'Sera16');
  const [p2Id, setP2Id] = useState<string>(personas[4]?.id || 'Distil');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);

  if (!isOpen) return null;

  const p1 = personas.find((p) => p.id === p1Id) || personas[0];
  const p2 = personas.find((p) => p.id === p2Id) || personas[1] || personas[0];

  const handleConfirm = () => {
    const topic = customTopic.trim() || selectedTopic;
    onStartDuel(p1Id, p2Id, topic);
    onClose();
  };

  const handleSwap = () => {
    const temp = p1Id;
    setP1Id(p2Id);
    setP2Id(temp);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-2xl rounded-3xl themed-modal border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-inherit shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white shadow-md">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight themed-text flex items-center gap-2">
                  <span>AI-to-AI Dialogue Mode</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full themed-chip border font-mono">
                    Dual Persona
                  </span>
                </h2>
                <p className="text-xs themed-modal-muted mt-0.5">
                  Select any two AI personalities to conduct an autonomous dialogue.
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

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Persona Selection Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative">
              {/* Persona 1 Picker */}
              <div className="p-4 rounded-2xl border border-pink-500/30 bg-pink-500/5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                      Speaker 1 (Initiator)
                    </span>
                    <span className="text-[10px] font-mono opacity-60 themed-modal-muted">First Turn</span>
                  </div>

                  {/* Selected Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl themed-ai-bubble border mb-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-inherit flex items-center justify-center themed-logo-box shrink-0 shadow-sm">
                      <Logo personaId={p1.id} size={44} overflow />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm themed-text truncate">{p1.name}</div>
                      <div className="text-[11px] themed-modal-muted truncate">{p1.role}</div>
                    </div>
                  </div>

                  {/* Persona Picker Grid */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setP1Id(p.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                          p1Id === p.id
                            ? 'border-pink-500 bg-pink-500/20 text-pink-500 font-bold'
                            : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center themed-logo-box">
                          <Logo personaId={p.id} size={28} />
                        </div>
                        <span className="text-xs truncate flex-1">{p.name}</span>
                        <span className="text-[9px] font-mono opacity-60">{p.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Swap Button In Middle */}
              <div className="flex md:hidden justify-center my--2 z-10">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="px-3 py-1 rounded-full themed-btn border border-inherit text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Zap size={12} className="text-amber-500" /> Swap Order
                </button>
              </div>

              {/* Persona 2 Picker */}
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Speaker 2 (Respondent)
                    </span>
                    <span className="text-[10px] font-mono opacity-60 themed-modal-muted">Counter Turn</span>
                  </div>

                  {/* Selected Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl themed-ai-bubble border mb-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-inherit flex items-center justify-center themed-logo-box shrink-0 shadow-sm">
                      <Logo personaId={p2.id} size={44} overflow />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm themed-text truncate">{p2.name}</div>
                      <div className="text-[11px] themed-modal-muted truncate">{p2.role}</div>
                    </div>
                  </div>

                  {/* Persona Picker Grid */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setP2Id(p.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                          p2Id === p.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-500 font-bold'
                            : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center themed-logo-box">
                          <Logo personaId={p.id} size={28} />
                        </div>
                        <span className="text-xs truncate flex-1">{p.name}</span>
                        <span className="text-[9px] font-mono opacity-60">{p.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Topic Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider themed-text flex items-center gap-1.5">
                  <Sparkles size={14} className="text-pink-500" />
                  Dialogue Topic / Starter Prompt
                </span>
                <span className="text-[10px] themed-modal-muted">Pick or customize</span>
              </div>

              {/* Preset Topic Chips */}
              <div className="space-y-1.5">
                {DEFAULT_TOPICS.slice(0, 4).map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(topic);
                      setCustomTopic('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${
                      selectedTopic === topic && !customTopic
                        ? 'border-pink-500/60 bg-pink-500/10 themed-text font-semibold shadow-sm'
                        : 'border-inherit themed-ai-bubble opacity-80 hover:opacity-100'
                    }`}
                  >
                    <MessageSquare size={13} className="text-pink-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{topic}</span>
                  </button>
                ))}
              </div>

              {/* Custom Topic Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Or write a custom topic / debate prompt..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl themed-input border text-xs outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              onClick={handleConfirm}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Play size={16} className="fill-white" />
              <span>Launch AI Dialogue</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
