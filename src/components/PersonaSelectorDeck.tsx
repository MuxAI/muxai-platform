import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Heart, Code2, Globe, Shield, MessageCircle } from 'lucide-react';
import { PERSONAS, getPersonaImageUrl } from '../lib/constants';
import { Persona } from '../types';

interface PersonaSelectorDeckProps {
  selectedPersona: string;
  onSelect: (id: string) => void;
}

export function PersonaSelectorDeck({ selectedPersona, onSelect }: PersonaSelectorDeckProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="themed-tool-accent" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Choose Persona Companion
          </span>
        </div>
        <span className="text-[11px] opacity-60">
          {PERSONAS.length} Specialized Personas
        </span>
      </div>

      <div className="w-full overflow-x-auto pb-4 pt-1 snap-x snap-mandatory flex gap-3.5 custom-scrollbar px-1">
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          const portraitUrl = getPersonaImageUrl(p.id, 'portrait');
          const hasError = imgErrors[p.id];

          return (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(p.id)}
              className={`shrink-0 w-44 sm:w-52 aspect-[9/14] rounded-3xl border-2 overflow-hidden relative cursor-pointer snap-center transition-all duration-300 select-none shadow-md ${
                isSelected
                  ? 'scale-[1.03] shadow-xl ring-2 ring-indigo-500/40 z-10'
                  : 'border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/30'
              }`}
              style={isSelected ? { borderColor: 'var(--accent, #4f46e5)' } : {}}
            >
              {/* Background Portrait Image or Gradient Fallback */}
              {!hasError ? (
                <img
                  src={portraitUrl}
                  alt={p.name}
                  onError={() => handleImgError(p.id)}
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black flex flex-col items-center justify-center p-4 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg"
                    style={{ background: p.badgeColor || '#4f46e5' }}
                  >
                    {p.id.slice(0, 2)}
                  </div>
                  <span className="text-sm font-bold text-white mb-1">{p.name}</span>
                  <span className="text-[10px] text-indigo-400 font-mono">{p.role}</span>
                </div>
              )}

              {/* Gradient Darkening Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Selected Badge */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg animate-scaleIn"
                  style={{ background: 'var(--accent, #4f46e5)' }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Tag at Top Left */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-md border border-white/15">
                  {p.tag}
                </span>
              </div>

              {/* Persona Details at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm leading-tight drop-shadow-sm truncate mr-1">
                    {p.name}
                  </h4>
                </div>

                <div className="text-[10px] font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                  <span>{p.role}</span>
                </div>

                <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
