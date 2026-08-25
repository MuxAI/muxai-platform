import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  FileText,
  Volume2,
  VolumeX,
  ExternalLink,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { Message } from '../types';
import { Logo, UserAvatar } from './Logo';

interface MessageItemProps {
  message: Message;
  personaId: string;
  isAutoChat?: boolean;
}

export function MessageItem({ message, personaId, isAutoChat = false }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isUser = message.role === 'user';
  const effectivePersona = message.personaId || personaId;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = message.content.replace(/[#*`$_[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = effectivePersona.includes('Distil') ? 0.9 : 1.1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex gap-3 sm:gap-4 ${isUser && !isAutoChat ? 'justify-end' : 'justify-start'}`}
      >
        {(!isUser || isAutoChat) && (
          <div className="themed-logo-box w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 overflow-hidden shadow-sm">
            <Logo personaId={effectivePersona} size={48} overflow />
          </div>
        )}

        <div
          className={`group/msg relative max-w-[88%] sm:max-w-[82%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-base leading-relaxed transition-all shadow-sm ${
            isUser && !isAutoChat
              ? 'themed-user-bubble rounded-tr-sm'
              : 'themed-ai-bubble rounded-tl-sm border'
          }`}
        >
          {/* Header indicator in auto mode */}
          {isAutoChat && message.personaId && (
            <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70 flex items-center gap-1">
              <Sparkles size={11} className="text-pink-500" />
              <span>{message.personaId}</span>
            </div>
          )}

          {/* Markdown Content with LaTeX & KaTeX */}
          <div className="break-words space-y-2 text-sm sm:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="whitespace-pre-wrap leading-relaxed inline-block w-full" {...props} />
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return (
                      <code className="themed-code-inline rounded px-1.5 py-0.5 text-[0.875em] font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  const codeText = String(children).replace(/\n$/, '');
                  return (
                    <div className="themed-code-block rounded-xl overflow-hidden my-3 border font-mono text-xs sm:text-sm">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border-b border-white/5 text-xs text-zinc-400">
                        <span>Code</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(codeText);
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Copy size={12} />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="p-3 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    </div>
                  );
                },
                img: ({ node, ...props }: any) => (
                  <div className="my-3 group/img relative inline-block">
                    <img
                      {...props}
                      onClick={() => setPreviewImage(props.src)}
                      className="max-w-full h-auto rounded-xl border border-zinc-500/20 max-h-96 object-contain shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
                      alt={props.alt || 'Generated image'}
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => window.open(props.src, '_blank')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                      title="Open full resolution"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="themed-quote border-l-4 pl-3.5 my-2 italic opacity-90" {...props} />
                ),
                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-1 my-1.5" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-1 my-1.5" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold opacity-100" {...props} />,
                a: ({ node, ...props }) => (
                  <a className="themed-link font-medium underline underline-offset-2 hover:opacity-80" target="_blank" rel="noreferrer" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Attached Files / Previews */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-zinc-500/10">
              {message.attachments.map((file, idx) =>
                file.type === 'image' ? (
                  <img
                    key={idx}
                    src={file.dataUrl || file.preview || ''}
                    alt={file.name}
                    onClick={() => setPreviewImage(file.dataUrl || file.preview || null)}
                    className="max-w-full h-auto rounded-xl border border-zinc-500/20 max-h-48 object-cover shadow-sm cursor-pointer hover:opacity-95"
                  />
                ) : (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 border border-zinc-500/20 text-xs font-medium"
                  >
                    <FileText size={16} className="text-pink-500 shrink-0" />
                    <span className="truncate max-w-[160px]">{file.name}</span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Quick Action Toolbar on hover */}
          <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-zinc-500/10 opacity-0 group-hover/msg:opacity-100 transition-opacity">
            {!isUser && 'speechSynthesis' in window && (
              <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-black/10 text-xs transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
              title="Copy message"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>

              <button
                onClick={handleSpeak}
                className="p-1 rounded-md hover:bg-black/10 text-xs transition-colors flex items-center gap-1 opacity-70 hover:opacity-100 ml-1"
                title="Read aloud"
              >
                {speaking ? (
                  <VolumeX size={13} className="text-pink-500" />
                ) : (
                  <Volume2 size={13} />
                )}
                <span className="text-[11px]">{speaking ? 'Stop' : 'Speak'}</span>
              </button>
            )}
          </div>
        </div>

        {isUser && !isAutoChat && <UserAvatar size={42} />}
      </motion.div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[400] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
