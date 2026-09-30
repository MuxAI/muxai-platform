import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Upload,
  Crop,
  AlertTriangle,
  Check,
  Trash2,
  Sliders,
  Palette,
  Bot,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Persona } from '../types';
import { ImageCropperModal } from './ImageCropperModal';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: Persona) => void;
  onDelete?: (id: string) => void;
  personaToEdit?: Persona | null;
}

export function CustomPersonaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  personaToEdit,
}: CustomPersonaModalProps) {
  const isEditing = Boolean(personaToEdit && personaToEdit.isCustom);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [desc, setDesc] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [customPortrait, setCustomPortrait] = useState<string>('');
  const [customLogo, setCustomLogo] = useState<string>('');
  const [gender, setGender] = useState<'female' | 'male'>('female');

  // Warning acknowledgment state
  const [warnAcknowledged, setWarnAcknowledged] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Image Cropper State
  const [cropperData, setCropperData] = useState<{
    src: string;
    type: 'portrait' | 'logo';
  } | null>(null);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Reset or populate fields
  useEffect(() => {
    if (personaToEdit) {
      setName(personaToEdit.name || '');
      setRole(personaToEdit.role || '');
      setDesc(personaToEdit.desc || '');
      setSystemPrompt(
        personaToEdit.systemPrompt ||
          `You are ${personaToEdit.name}, a helpful and articulate AI companion.`
      );
      setCustomPortrait(personaToEdit.customPortrait || '');
      setCustomLogo(personaToEdit.customLogo || '');
      setGender(personaToEdit.gender || 'female');
      setWarnAcknowledged(true);
    } else {
      setName('');
      setRole('');
      setDesc('');
      setSystemPrompt('You are an expert conversational companion who is insightful, friendly, and articulate.');
      setCustomPortrait('');
      setCustomLogo('');
      setGender('female');
      setWarnAcknowledged(false);
    }
  }, [personaToEdit, isOpen]);

  if (!isOpen) return null;

  // File Upload Handlers
  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropperData({ src: reader.result, type: 'portrait' });
      }
    };
    reader.readAsDataURL(file);
    if (portraitInputRef.current) portraitInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropperData({ src: reader.result, type: 'logo' });
      }
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isEditing && !warnAcknowledged) {
      setShowWarningModal(true);
      return;
    }

    const personaId = personaToEdit?.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPersona: Persona = {
      id: personaId,
      name: name.trim(),
      tag: 'AI',
      role: role.trim() || 'Custom Companion',
      desc: desc.trim() || `Custom AI companion created by user.`,
      systemPrompt: systemPrompt.trim(),
      badgeColor: '#ec4899',
      customPortrait: customPortrait || undefined,
      customLogo: customLogo || undefined,
      gender,
      isCustom: true,
    };

    onSave(newPersona);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl themed-modal border shadow-2xl rounded-3xl p-5 sm:p-7 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg bg-pink-500"
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight themed-text">
                  {isEditing ? 'Edit Custom Persona' : 'Create Custom Persona'}
                </h3>
                <p className="text-xs themed-modal-muted">
                  Build your own personalized conversational companion
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

          {/* Persistent Local Storage Warning Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
            <div className="leading-relaxed">
              <span className="font-bold">Persistent Browser Storage Notice:</span> All custom personas, prompts, and avatars are stored in your browser&apos;s local storage. Clearing cache, cookies, or website data will delete them.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Persona Name & Role / Title on the same line */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider themed-modal-muted mb-1.5">
                  Persona Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya, Dr. Atlas, Nova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl themed-modal-input border focus:border-pink-500 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider themed-modal-muted mb-1.5">
                  Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creative Muse, Quantum Physicist, Caring Friend"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl themed-modal-input border focus:border-pink-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Short Card Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider themed-modal-muted mb-1.5">
                Card Description (Summary)
              </label>
              <input
                type="text"
                placeholder="A short punchy line introducing this persona in the deck"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl themed-modal-input border focus:border-pink-500 text-sm outline-none transition-colors"
              />
            </div>

            {/* Voice Gender Selection (Default voice synthesis) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider themed-modal-muted mb-1.5">
                Voice Gender (Speech Synthesis)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'border-pink-500 bg-pink-500/15 text-pink-500 shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 themed-btn opacity-70 hover:opacity-100'
                  }`}
                >
                  <span>Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'border-blue-500 bg-blue-500/15 text-blue-500 shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 themed-btn opacity-70 hover:opacity-100'
                  }`}
                >
                  <span>Male</span>
                </button>
              </div>
            </div>

            {/* Images: Portrait (9:14) and Logo/Avatar (1:1) with Interactive Cropper */}
            <div className="p-4 rounded-2xl themed-ai-bubble border space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider themed-text">
                Avatar & Portrait Images (Croppable & Rotatable)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Portrait Card Image */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] themed-modal-muted font-medium">
                    1. Card Portrait (9:14 Aspect)
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-24 rounded-xl border border-inherit overflow-hidden themed-logo-box shrink-0 flex items-center justify-center relative shadow-inner">
                      {customPortrait ? (
                        <img
                          src={customPortrait}
                          alt="Portrait preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="opacity-40" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={portraitInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePortraitUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => portraitInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl themed-btn border border-inherit active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Upload size={13} /> Upload & Crop
                      </button>
                      {customPortrait && (
                        <button
                          type="button"
                          onClick={() => setCustomPortrait('')}
                          className="text-[11px] text-red-500 hover:opacity-80 text-left transition-colors font-semibold"
                        >
                          Remove portrait
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Logo / Avatar Icon */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] themed-modal-muted font-medium">
                    2. Chat Avatar Logo (1:1 Square)
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl border border-inherit overflow-hidden themed-logo-box shrink-0 flex items-center justify-center relative shadow-inner">
                      {customLogo ? (
                        <img
                          src={customLogo}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bot size={24} className="opacity-40" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl themed-btn border border-inherit active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Upload size={13} /> Upload & Crop
                      </button>
                      {customLogo && (
                        <button
                          type="button"
                          onClick={() => setCustomLogo('')}
                          className="text-[11px] text-red-500 hover:opacity-80 text-left transition-colors font-semibold"
                        >
                          Remove avatar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom System Prompt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider themed-modal-muted mb-1.5">
                System Instructions & Personality *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Instruct how this persona speaks, responds, and thinks..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl themed-modal-input border focus:border-pink-500 text-xs sm:text-sm outline-none transition-colors resize-y font-mono"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-inherit">
              {isEditing && onDelete && personaToEdit ? (
                <div className="flex items-center gap-2">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(personaToEdit.id);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all animate-pulse flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-2 rounded-xl themed-btn border border-inherit text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-4 py-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500/25 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl themed-btn border border-inherit hover:opacity-80 active:scale-95 text-xs sm:text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 active:scale-95 text-xs sm:text-sm font-bold text-white shadow-xl transition-all flex items-center gap-2"
                >
                  <Check size={16} strokeWidth={2.5} />
                  {isEditing ? 'Save Changes' : 'Create Persona'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Confirmation Warning Modal Before Initial Creation */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full themed-modal border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-lg font-bold themed-text mb-2">Local Storage Notice</h4>
            <p className="text-xs themed-modal-muted leading-relaxed mb-6">
              This AI platform stores all custom personas, configurations, and chat memories in your browser&apos;s local storage. Clearing cache, cookies, or website data will permanently delete all created personas.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-2.5 rounded-xl themed-btn border border-inherit text-xs font-semibold"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setWarnAcknowledged(true);
                  setShowWarningModal(false);
                  // Trigger save
                  const personaId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                  onSave({
                    id: personaId,
                    name: name.trim(),
                    tag: 'AI',
                    role: role.trim() || 'Custom Companion',
                    desc: desc.trim() || `Custom AI companion created by user.`,
                    systemPrompt: systemPrompt.trim(),
                    badgeColor: '#ec4899',
                    customPortrait: customPortrait || undefined,
                    customLogo: customLogo || undefined,
                    isCustom: true,
                  });
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-xs font-bold text-white shadow-lg"
              >
                I Understand & Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Interactive Image Cropper Modal */}
      {cropperData && (
        <ImageCropperModal
          imageSrc={cropperData.src}
          aspectRatio={cropperData.type}
          title={cropperData.type === 'portrait' ? 'Crop Card Portrait (9:14)' : 'Crop Chat Avatar (1:1)'}
          onConfirm={(base64) => {
            if (cropperData.type === 'portrait') {
              setCustomPortrait(base64);
            } else {
              setCustomLogo(base64);
            }
            setCropperData(null);
          }}
          onCancel={() => setCropperData(null)}
        />
      )}
    </>
  );
}
