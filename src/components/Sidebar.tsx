import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  MessageSquare,
  X,
  Edit2,
  Check,
  Search,
  Download,
  Pin,
  Sparkles,
  Server,
  ExternalLink,
} from 'lucide-react';
import { Conversation } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  open: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  open,
  onClose,
  isOnline,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const startRename = (e: React.MouseEvent, c: Conversation) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditingTitle(c.title);
  };

  const saveRename = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRename(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const exportConversation = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    const md = `# ${conv.title}\n\nDate: ${new Date(
      conv.createdAt
    ).toLocaleString()}\nPersona: ${conv.personaId}\n\n---\n\n` +
      conv.messages
        .map(
          (m) =>
            `### ${m.role.toUpperCase()} (${m.personaId || conv.personaId})\n\n${m.content}\n`
        )
        .join('\n---\n\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 border-r themed-sidebar-panel backdrop-blur-2xl shadow-2xl ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <Logo isMain size={30} />
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none themed-sidebar-text">
                MuxAI
              </h1>
              <span className="text-[10px] text-pink-500 font-semibold tracking-wider uppercase">
                Self-Hosted Studio
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl themed-sidebar-hover themed-sidebar-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 pb-2">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-98 themed-new-chat"
          >
            <Plus size={18} /> New Conversation
          </button>
        </div>

        {/* Search filter */}
        {conversations.length > 3 && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 border border-zinc-500/10 text-xs">
              <Search size={14} className="opacity-50" />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 text-xs themed-sidebar-text"
              />
              {search && (
                <button onClick={() => setSearch('')} className="opacity-50 hover:opacity-100">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
          {filtered.length === 0 && (
            <div className="text-center text-xs py-10 px-4 themed-sidebar-muted">
              {search ? 'No conversations matching search.' : 'No conversations saved yet.'}
            </div>
          )}

          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => editingId !== c.id && onSelect(c.id)}
              className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                c.id === activeId
                  ? 'themed-sidebar-active font-semibold shadow-sm'
                  : 'themed-sidebar-hover themed-sidebar-secondary'
              }`}
            >
              <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-black/5">
                <Logo personaId={c.personaId} size={20} />
              </div>

              {editingId === c.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(e, c.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-xs rounded-lg border outline-none themed-sidebar-input font-normal"
                  />
                  <button
                    onClick={(e) => saveRename(e, c.id)}
                    className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate font-medium">{c.title}</div>
                    <div className="text-[10px] opacity-50 truncate">
                      {c.messages.length} msg{c.messages.length === 1 ? '' : 's'} · {c.personaId}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => exportConversation(e, c)}
                      className="p-1 hover:text-pink-500 rounded hover:bg-black/5 transition-colors"
                      title="Export Markdown"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={(e) => startRename(e, c)}
                      className="p-1 hover:text-blue-500 rounded hover:bg-black/5 transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      className="p-1 hover:text-red-500 rounded hover:bg-black/5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-inherit text-xs themed-sidebar-muted space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5">
              <Server size={12} className={isOnline ? 'text-lime-500' : 'text-zinc-500'} />
              <span>Ollama Self-Hosted</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline
                  ? 'bg-lime-500/10 text-lime-500 border border-lime-500/20'
                  : 'bg-zinc-500/10 text-zinc-400'
              }`}
            >
              {isOnline ? 'ONLINE' : 'STANDBY'}
            </span>
          </div>
          <div className="text-[10px] text-center opacity-60">
            MuxAI Platform © 2026 · HuanMux
          </div>
        </div>
      </aside>
    </>
  );
}
