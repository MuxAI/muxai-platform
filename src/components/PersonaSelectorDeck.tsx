import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Plus, Edit2, Bot, User, Trash2 } from 'lucide-react';
import { getAllPersonas, getPersonaImageUrl } from '../lib/constants';
import { Persona } from '../types';

interface PersonaSelectorDeckProps {
  selectedPersona: string;
  onSelect: (id: string) => void;
  personas?: Persona[];
  onOpenCreatePersona?: () => void;
  onEditPersona?: (persona: Persona) => void;
  onDeletePersona?: (id: string) => void;
}

export function PersonaSelectorDeck({
  selectedPersona,
  onSelect,
  personas,
  onOpenCreatePersona,
  onEditPersona,
  onDeletePersona,
}: PersonaSelectorDeckProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const list = personas || getAllPersonas();

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
        <div className="flex items-center gap-3">
          <span className="text-[11px] opacity-60">
            {list.length} Companion{list.length > 1 ? 's' : ''}
          </span>
          {onOpenCreatePersona && (
            <button
              onClick={onOpenCreatePersona}
              className="text-xs font-bold text-pink-500 hover:text-pink-400 flex items-center gap-1 hover:underline transition-colors active:scale-95"
            >
              <Plus size={14} /> Create
            </button>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 pt-1 snap-x snap-mandatory flex gap-3.5 custom-scrollbar px-1 items-stretch">
        {list.map((p) => {
          const isSelected = selectedPersona === p.id;
          const portraitUrl = p.customPortrait || getPersonaImageUrl(p.id, 'portrait');
          const hasError = imgErrors[p.id] && !p.customPortrait;

          return (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p.id)}
              className={`shrink-0 w-44 sm:w-52 aspect-[9/14] rounded-3xl border-2 overflow-hidden relative cursor-pointer snap-center transition-all duration-300 select-none shadow-md group ${
                isSelected
                  ? 'scale-[1.03] shadow-xl ring-2 ring-pink-500/40 z-10'
                  : 'border-slate-200 dark:border-white/10 opacity-85 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/30'
              }`}
              style={isSelected ? { borderColor: 'var(--accent, #ec4899)' } : {}}
            >
              {/* Background Portrait Image or Gradient Fallback */}
              {!hasError && portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={p.name}
                  onError={() => handleImgError(p.id)}
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black flex flex-col items-center justify-center p-4 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg"
                    style={{ background: p.badgeColor || '#ec4899' }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-white mb-1">{p.name}</span>
                  <span className="text-[10px] text-pink-400 font-mono">{p.role}</span>
                </div>
              )}

              {/* Gradient Darkening Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Custom Persona Actions at Top Right */}
              {p.isCustom && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                  {isSelected && (
                    <div
                      className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg animate-scaleIn"
                      style={{ background: 'var(--accent, #ec4899)' }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  {onEditPersona && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPersona(p);
                      }}
                      className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                      title="Edit custom persona"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                  {onDeletePersona && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePersona(p.id);
                      }}
                      className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                      title="Delete custom persona"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Standard Selected Badge if not custom */}
              {!p.isCustom && isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg animate-scaleIn z-20"
                  style={{ background: 'var(--accent, #ec4899)' }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Tag at Top Left */}
              <div className="absolute top-3 left-3 flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-md border border-white/15">
                  {p.tag}
                </span>
                {p.isCustom && (
                  <span className="text-[9px] font-bold bg-pink-500/80 text-white px-1.5 py-0.5 rounded-full backdrop-blur-md">
                    Custom
                  </span>
                )}
              </div>

              {/* Persona Details at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm leading-tight drop-shadow-sm truncate mr-1">
                    {p.name}
                  </h4>
                </div>

                <div className="text-[10px] font-semibold text-pink-300 mb-1 flex items-center gap-1">
                  <span>{p.role}</span>
                </div>

                <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* "+" Create Custom Persona Card at the Far Right */}
        {onOpenCreatePersona && (
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCreatePersona}
            className="shrink-0 w-44 sm:w-52 aspect-[9/14] rounded-3xl border-2 border-dashed border-zinc-400/40 hover:border-pink-500/80 bg-zinc-900/40 hover:bg-pink-500/5 backdrop-blur-sm overflow-hidden relative cursor-pointer snap-center transition-all duration-300 select-none shadow-md flex flex-col items-center justify-center p-4 text-center group"
          >
            <div className="w-14 h-14 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-lg">
              <Plus size={28} strokeWidth={2.5} />
            </div>
            <h4 className="font-extrabold text-sm text-white mb-1 group-hover:text-pink-400 transition-colors">
              Create Persona
            </h4>
            <p className="text-[11px] text-zinc-400 leading-snug px-2">
              Add your own character with custom prompt, avatar & style
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

