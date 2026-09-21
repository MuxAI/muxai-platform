import { useState, useRef, useEffect, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Plus,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Code2,
  Wrench,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Attachment, ModelOptions } from '../types';
import { ACCEPTED_FILE_TYPES, parseFile, formatBytes } from '../lib/fileParser';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILES = 5;

interface ChatInputProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onGenerateImage: (prompt: string) => void;
  disabled?: boolean;
  options: ModelOptions;
  onOptionsChange: (opts: ModelOptions) => void;
}

export function ChatInput({
  onSend,
  onGenerateImage,
  disabled = false,
  options,
  onOptionsChange,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE);
    const room = MAX_FILES - attachments.length;
    const toAdd = validFiles.slice(0, room);
    if (toAdd.length === 0) return;

    setParsing(true);
    const placeholders: Attachment[] = toAdd.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      mimeType: file.type,
      size: file.size,
      parsing: true,
      error: null,
    }));
    setAttachments((prev) => [...prev, ...placeholders]);

    for (let i = 0; i < toAdd.length; i++) {
      const file = toAdd[i];
      const placeholder = placeholders[i];
      try {
        const parsed = await parseFile(file);
        setAttachments((prev) =>
          prev.map((a) => (a.id === placeholder.id ? { ...parsed, parsing: false } : a))
        );
      } catch (err: any) {
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === placeholder.id
              ? { ...a, parsing: false, error: String(err?.message || err) }
              : a
          )
        );
      }
    }
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasText = value.trim().length > 0;
    const readyAttachments = attachments.filter((a) => !a.error && !a.parsing);
    const hasReadyAttachments = readyAttachments.length > 0;

    if ((!hasText && !hasReadyAttachments) || disabled || parsing) return;

    onSend(value.trim(), readyAttachments);
    setValue('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full px-3 sm:px-6 pb-4 pt-2 relative z-20 transition-all ${
        isDragging ? 'ring-2 ring-pink-500 rounded-3xl bg-pink-500/5' : ''
      }`}
    >
      <form onSubmit={submit} className="relative max-w-3xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          multiple
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
        />

        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-2.5 overflow-hidden"
            >
              {attachments.map((att) => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-2xl border themed-chip shadow-sm"
                >
                  {att.dataUrl || att.preview ? (
                    <img
                      src={att.dataUrl || att.preview || ''}
                      alt={att.name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 themed-chip-icon text-pink-500">
                      <FileText size={15} />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 max-w-[130px]">
                    <span className="text-xs font-semibold truncate">{att.name}</span>
                    <span className="text-[10px] opacity-70">
                      {att.parsing ? (
                        <span className="flex items-center gap-1 text-pink-500">
                          <Loader2 size={10} className="animate-spin" /> Parsing…
                        </span>
                      ) : att.error ? (
                        <span className="text-red-500">Failed</span>
                      ) : (
                        formatBytes(att.size)
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 rounded-full hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 ml-1"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popover Capabilities Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-3 w-80 p-3.5 border rounded-3xl shadow-2xl z-40 themed-menu backdrop-blur-xl"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5 px-1 opacity-60">
                  Model Capabilities & Tools
                </div>

                {/* Attach Files */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMenuOpen(false);
                  }}
                  disabled={disabled || attachments.length >= MAX_FILES}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors mb-1.5 themed-sidebar-hover disabled:opacity-40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Paperclip size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Attach Files</div>
                      <div className="text-[10px] opacity-60">PDF, DOCX, XLSX, Code, Images</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5">
                    {attachments.length}/{MAX_FILES}
                  </span>
                </button>

                {/* Direct Image Generation */}
                <button
                  type="button"
                  disabled={disabled || !value.trim()}
                  onClick={() => {
                    if (value.trim()) {
                      onGenerateImage(value.trim());
                      setValue('');
                      setMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors mb-1.5 themed-sidebar-hover disabled:opacity-40"
                  title="Type your visual prompt in the box, then click here to render directly"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                      <ImageIcon size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Generate Image</div>
                      <div className="text-[10px] opacity-60">Render artwork from prompt</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-500">
                    Direct
                  </span>
                </button>

                {/* JSON Mode Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onOptionsChange({ ...options, jsonMode: !options.jsonMode })
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors mb-1.5 ${
                    options.jsonMode
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'themed-sidebar-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Code2 size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Structured JSON Mode</div>
                      <div className="text-[10px] opacity-60">Strict schema response</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-current">
                    {options.jsonMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Tool Calling Agent Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onOptionsChange({ ...options, toolCalling: !options.toolCalling })
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors mb-1.5 ${
                    options.toolCalling
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'themed-sidebar-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Wrench size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Tool Calling Agent</div>
                      <div className="text-[10px] opacity-60">Weather, Web, Crypto, Wiki</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-current">
                    {options.toolCalling ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Creativity / Temperature Slider */}
                <div className="p-3 rounded-2xl border border-white/10 mt-2 bg-black/5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-semibold opacity-80">
                      <Sliders size={14} /> Creativity (Temp)
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-500">
                      {options.temperature ?? 0.6}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={options.temperature ?? 0.6}
                    onChange={(e) =>
                      onOptionsChange({
                        ...options,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-zinc-700/50 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] opacity-50 mt-1">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Input Pill Container */}
        <div className="flex items-end gap-2 border rounded-3xl shadow-xl transition-all pl-2.5 sm:pl-3.5 pr-2.5 py-2.5 themed-input backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`p-2 sm:p-2.5 rounded-full transition-transform active:scale-95 themed-btn shrink-0 ${
              menuOpen ? 'rotate-45 text-pink-500' : ''
            }`}
            title="Capabilities & Tools"
          >
            <Plus size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a message or drop files..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none resize-none font-normal text-sm sm:text-base py-2 max-h-44 disabled:opacity-50 themed-text min-h-[26px]"
          />

          <button
            type="submit"
            disabled={
              disabled ||
              (!value.trim() && attachments.filter((a) => !a.error && !a.parsing).length === 0) ||
              parsing
            }
            className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 themed-send-btn shadow-md"
          >
            {parsing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        {/* Capability Status Chips */}
        <div className="flex items-center justify-between mt-2.5 px-3">
          <div className="text-[11px] opacity-60 hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">Shift+Enter</kbd> for newline
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {options.jsonMode && (
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Code2 size={10} /> JSON
              </span>
            )}
            {options.toolCalling && (
              <span className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Wrench size={10} /> Tools
              </span>
            )}
            {attachments.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                {attachments.length} File{attachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
