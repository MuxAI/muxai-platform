// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, CaretDown, Palette } from '@phosphor-icons/react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { ThemeSidebar } from './components/ThemeSidebar';
import { THEMES } from './lib/themes';
import { ChatInput } from './components/ChatInput';
import { BlockScreen } from './components/BlockScreen';
import { DeleteModal } from './components/DeleteModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { fetchAIReply, generateTitle, analyzeImageWithVision } from './lib/api';
import { TOOL_DEFINITIONS, executeTool, getBrowserInfo } from './lib/tools';
import { formatFileForContext } from './lib/fileParser';
import {
  loadConversations, createConversation, deleteConversation, updateConversation,
  getRateInfo, recordMessage, getTheme, setTheme,
} from './lib/storage';
import { ToolProgressDisplay } from './components/ToolProgress';

const PERSONAS = [
  { id: 'Sera16', name: 'Seraphina v1.6', desc: 'The featured icon of MuxAI', tag: '28F' },
  { id: 'Sera16_wife', name: 'Seraphina v1.6', desc: 'Your online wife', tag: '28F' },
  { id: 'Sera16_bd', name: 'Seraphina v1.6', desc: 'Bengali vibes', tag: '28F' },
  { id: 'Sera14', name: 'Seraphina v1.4', desc: 'Classic version', tag: '25F' },
  { id: 'Distil', name: 'Distil v1', desc: 'Tech bro at your service', tag: '30M' },
  { id: 'Distil_husband', name: 'Distil v1', desc: 'Your online husband', tag: '30M' },
  { id: 'Muku', name: 'Muku v1', desc: '?????', tag: '??' },
];

const GENERIC_ERROR = "Action could not be completed. The AI couldn't receive your message or she/he couldn't react to it. Please check top-right corner for server status (online/offline).";

function TalkingAvatar({ personaId, size = 56 }) {
  return (
    <div className="themed-logo-box w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 mt-1 overflow-hidden">
      <Logo personaId={personaId} size={size} overflow />
    </div>
  );
}

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeSidebarOpen, setThemeSidebarOpen] = useState(false);
  const [rateInfo, setRateInfo] = useState({ blocked: false, resetIn: 0, remaining: 30, max: 30 });
  const [error, setError] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('Sera16');
  const [theme, setThemeState] = useState('classic-light');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [modelOptions, setModelOptions] = useState({
    jsonMode: false,
    toolCalling: false,
    temperature: 0.6,
  });
  const [toolProgress, setToolProgress] = useState(null);
  
  const [autoConfig, setAutoConfig] = useState(null);
  const isAutoRunning = useRef(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    const activeThemeData = THEMES.find((t) => t.id === theme) || THEMES[0];
    const root = document.documentElement;
    Object.entries(activeThemeData.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  useEffect(() => {
    const checkPing = async () => {
      try {
        const res = await fetch('/api/ping');
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkPing();
    const pingInterval = setInterval(checkPing, 5000);
    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    // setRateInfo(getRateInfo());
    setThemeState(getTheme());

    const params = new URLSearchParams(window.location.search);
    
    const autoVal = params.get('auto');
    if (autoVal === '0') {
      setAutoConfig({ p1: 'Distil', p2: 'Sera16' });
    } else if (autoVal === '1') {
      setAutoConfig({ p1: 'Distil_husband', p2: 'Sera16_wife' });
    }

    const urlChatId = params.get('chat');
    if (urlChatId && convs.some((c) => c.id === urlChatId)) {
      setActiveId(urlChatId);
    } else if (urlChatId) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location);
    if (activeId) {
      url.searchParams.set('chat', activeId);
    } else {
      url.searchParams.delete('chat');
    }
    window.history.replaceState({}, '', url);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const conv = conversations.find((c) => c.id === activeId);
    setMessages(conv ? conv.messages : []);
  }, [activeId, conversations]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const t = setInterval(() => {
      const info = getRateInfo();
      // setRateInfo(info);
      if (!info.blocked) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => { isAutoRunning.current = false; };
  }, []);

  const handleNew = () => {
    const conv = createConversation('New chat', selectedPersona);
    setConversations(loadConversations());
    setActiveId(conv.id);
    setMessages([]);
    setSidebarOpen(false);
    setError('');
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError('');
  };

  const handleRename = (id, newTitle) => {
    updateConversation(id, (c) => ({ ...c, title: newTitle, customTitle: true }));
    setConversations(loadConversations());
  };

  const handleDeleteRequest = (id) => {
    const conv = conversations.find((c) => c.id === id);
    setDeleteTarget(conv || { id, title: 'New chat' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const remaining = deleteConversation(deleteTarget.id);
    setConversations(remaining);
    if (activeId === deleteTarget.id) {
      setActiveId(remaining[0]?.id || null);
      setMessages(remaining[0]?.messages || []);
    }
    setDeleteTarget(null);
  };

  const persistMessages = (convId, msgs) => {
    updateConversation(convId, (c) => ({ ...c, messages: msgs }));
    setConversations(loadConversations());
  };

  const maybeGenerateTitle = async (convId, msgs, personaId) => {
    if (!msgs || msgs.length === 0 || msgs.length % 5 !== 0) return;
    const activeConv = conversations.find((c) => c.id === convId);
    if (activeConv?.customTitle) return;
    try {
      const title = await generateTitle(msgs, personaId);
      if (title && title !== 'New chat') {
        updateConversation(convId, (c) => ({ ...c, title }));
        setConversations(loadConversations());
      }
    } catch {
       // Suppress error output
    }
  };

  const autoChatLoop = async (convId, initialMsgs, p1, p2) => {
    isAutoRunning.current = true;
    let currentMsgs = [...initialMsgs];
    let currentSpeaker = p2; 

    const stopLoop = () => { isAutoRunning.current = false; };
    window.addEventListener('beforeunload', stopLoop);

    while (isAutoRunning.current) {
      setLoading(true);
      setError('');

      const apiHistory = currentMsgs.map(m => ({
        role: m.personaId === currentSpeaker ? 'assistant' : 'user',
        content: m.content
      }));

      try {
        const data = await fetchAIReply(apiHistory, currentSpeaker, {
          jsonMode: false,
          temperature: 0.7,
          tools: null 
        });

        const replyText = data.reply || '';
        
        const uiRole = currentSpeaker === p1 ? 'user' : 'assistant';
        const aiMsg = { role: uiRole, personaId: currentSpeaker, content: replyText };
        
        currentMsgs = [...currentMsgs, aiMsg];
        setMessages(currentMsgs);
        persistMessages(convId, currentMsgs);

        currentSpeaker = currentSpeaker === p1 ? p2 : p1;

        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (err) {
        setError(GENERIC_ERROR);
        isAutoRunning.current = false;
      }
    }
    setLoading(false);
    window.removeEventListener('beforeunload', stopLoop);
  };

  const handleGenerateImage = async (prompt) => {
    let convId = activeId;
    let currentConvs = conversations;

    // 1. Ensure conversation exists
    if (!convId) {
      const conv = createConversation('New chat', selectedPersona);
      convId = conv.id;
      currentConvs = loadConversations();
      setConversations(currentConvs);
      setActiveId(convId);
    }
    
    const activeConv = currentConvs.find(c => c.id === convId);
    const personaToUse = activeConv?.personaId || selectedPersona;

    // 2. Add user message
    const userMsg = { role: 'user', content: prompt, attachments: [] };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);

    setLoading(true);
    setError('');
    // Use the existing tool progress UI to show execution
    setToolProgress({ phase: 'calling_tools', tools: [{ name: 'generate_image', status: 'executing' }] });

    try {
      // 3. Directly hit the image generation API, completely bypassing text LLM
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Image generation failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 4. Inject the result directly as the AI's response
      const aiMsg = { 
        role: 'assistant', 
        content: `![${prompt}](${data.imageUrl})` 
      };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      persistMessages(convId, finalMsgs);
      maybeGenerateTitle(convId, finalMsgs, personaToUse);

    } catch (err) {
      setError(err.message || 'Image generation failed.');
    } finally {
      setLoading(false);
      setToolProgress(null);
    }
  };

  const handleSend = async (text, attachments = []) => {
    let convId = activeId;
    let currentConvs = conversations;

    if (!convId) {
      const conv = createConversation('New chat', selectedPersona);
      convId = conv.id;
      currentConvs = loadConversations();
      setConversations(currentConvs);
      setActiveId(convId);
    } else if (messages.length === 0) {
      updateConversation(convId, (c) => ({ ...c, personaId: selectedPersona }));
      currentConvs = loadConversations();
      setConversations(currentConvs);
    }
    
    const activeConv = currentConvs.find(c => c.id === convId);
    const personaToUse = activeConv?.personaId || selectedPersona;

    if (activeConv && activeConv.title === 'New chat' && messages.length === 0) {
      const newTitle = `Chat #${currentConvs.length}`;
      updateConversation(convId, (c) => ({ ...c, title: newTitle }));
      currentConvs = loadConversations();
      setConversations(currentConvs);
    }

    if (autoConfig) {
      const userMsg = { role: 'user', personaId: autoConfig.p1, content: text, attachments };
      const newMsgs = [...messages, userMsg];
      setMessages(newMsgs);
      persistMessages(convId, newMsgs);
      
      if (!isAutoRunning.current) {
        autoChatLoop(convId, newMsgs, autoConfig.p1, autoConfig.p2);
      }
      return; 
    }

    const displayText = text || (attachments.length > 0 ? `[Attached ${attachments.length} file(s)]` : '');
    let fullContextContent = text;
    const imageAttachments = attachments.filter((a) => a.type === 'image');
    const docAttachments = attachments.filter((a) => a.type !== 'image');

    if (docAttachments.length > 0) {
      const docParts = docAttachments.map((a) => formatFileForContext(a));
      fullContextContent = `${fullContextContent}\n\n--- ATTACHED FILES ---\n${docParts.join('\n\n')}`.trim();
    }

    let visionAnalysis = '';
    if (imageAttachments.length > 0) {
      setLoading(true);
      setToolProgress({ phase: 'calling_tools', tools: imageAttachments.map((_, i) => ({ name: 'analyze_image', status: i === 0 ? 'executing' : 'pending' })) });
      try {
        const visionPrompt = text || 'Describe this image in detail. What do you see?';
        const imageBase64s = imageAttachments.map((a) => a.base64);
        visionAnalysis = await analyzeImageWithVision(visionPrompt, imageBase64s);
        setToolProgress({ phase: 'calling_tools', tools: imageAttachments.map(() => ({ name: 'analyze_image', status: 'done' })) });
      } catch (err) {
        visionAnalysis = `[Vision analysis failed: ${err.message || 'Unknown error'}]`;
        setToolProgress({ phase: 'calling_tools', tools: imageAttachments.map(() => ({ name: 'analyze_image', status: 'done' })) });
      }

      if (visionAnalysis) {
        const imageNames = imageAttachments.map((a) => a.name).join(', ');
        fullContextContent = `${fullContextContent}\n\n--- IMAGE ANALYSIS (${imageNames}) ---\nThe vision model analyzed the attached image(s) and produced this description:\n${visionAnalysis}`.trim();
      }
    }

    const userMsg = { role: 'user', content: displayText, attachments };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);

    setLoading(true);
    setError('');
    setToolProgress({ phase: 'thinking' });

    const tools = modelOptions.toolCalling ? TOOL_DEFINITIONS : null;
    const browserInfo = getBrowserInfo();
    const MAX_TOOL_ROUNDS = 5;
    let conversationHistory = [...messages, { role: 'user', content: fullContextContent }];
    let gotFinalReply = false;

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const data = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: round === 0 ? tools : null,
        });

        if (!data.toolCalls || !Array.isArray(data.toolCalls) || data.toolCalls.length === 0) {
          const replyText = data.reply || '';
          const aiMsg = { role: 'assistant', content: replyText };
          const finalMsgs = [...newMsgs, aiMsg];
          setMessages(finalMsgs);
          persistMessages(convId, finalMsgs);
          const info = recordMessage();
          // setRateInfo(info);
          maybeGenerateTitle(convId, finalMsgs, personaToUse);
          gotFinalReply = true;
          break;
        }

        if (data.reply) {
          conversationHistory.push({ role: 'assistant', content: data.reply });
        }

        const toolProgressList = data.toolCalls.map((tc) => ({
          name: tc.function?.name || 'unknown',
          status: 'pending',
        }));
        setToolProgress({ phase: 'calling_tools', tools: toolProgressList });

        const toolResultParts = [];

        for (let i = 0; i < data.toolCalls.length; i++) {
          const tc = data.toolCalls[i];
          const toolName = tc.function?.name || 'unknown';
          let parsedArgs = {};
          try { parsedArgs = JSON.parse(tc.function?.arguments || '{}'); } catch {}

          toolProgressList[i].status = 'executing';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          const result = await executeTool(toolName, parsedArgs, browserInfo);

          toolProgressList[i].status = 'done';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          toolResultParts.push(`[Tool: ${toolName}]\nArguments: ${JSON.stringify(parsedArgs)}\nResult: ${result}`);
        }

        setToolProgress({ phase: 'processing_results' });

        conversationHistory.push({
          role: 'user',
          content: `Here are the real-time tool results. Use this data to answer the user's question. Do NOT call any more tools — just respond naturally using this data.\n\n${toolResultParts.join('\n\n')}`,
        });
      }

      if (!gotFinalReply) {
        setToolProgress({ phase: 'thinking_after_tools' });
        const finalData = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: null,
        });
        const replyText = finalData.reply || 'I was unable to process the tool results.';
        const aiMsg = { role: 'assistant', content: replyText };
        const finalMsgs = [...newMsgs, aiMsg];
        setMessages(finalMsgs);
        persistMessages(convId, finalMsgs);
        const info = recordMessage();
        // setRateInfo(info);
        maybeGenerateTitle(convId, finalMsgs, personaToUse);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
      setToolProgress(null);
    }
  };

  const activeConv = conversations.find(c => c.id === activeId);
  const currentPersonaId = activeConv?.personaId || selectedPersona;
  const currentPersonaInfo = PERSONAS.find(p => p.id === currentPersonaId) || PERSONAS[0];

  return (
    <div className="themed-bg themed-text h-screen w-screen overflow-hidden relative">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="themed-aurora-1 absolute -top-1/4 -left-1/4 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full blur-[120px] animate-aurora-1" />
        <div className="themed-aurora-2 absolute top-1/3 -right-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full blur-[120px] animate-aurora-2" />
        <div className="themed-aurora-3 absolute -bottom-1/4 left-1/3 w-[450px] h-[450px] sm:w-[550px] sm:h-[550px] rounded-full blur-[120px] animate-aurora-3" />
      </div>

      <div className="themed-grid-bg fixed inset-0 z-0 pointer-events-none opacity-[0.03]" />

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDeleteRequest}
        onRename={handleRename}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="absolute inset-0 flex flex-col z-10">
        <header className="themed-header flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="themed-burger p-2 rounded-lg transition-colors"
          >
            <List size={22} />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg">{currentPersonaInfo.name}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-bold transition-colors ${
                isOnline ? 'themed-online' : 'themed-offline'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)] animate-pulse' : 'bg-zinc-400'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={() => setThemeSidebarOpen((v) => !v)}
              className="themed-btn p-2 rounded-lg transition-colors"
              title="Change theme"
            >
              <Palette size={18} />
            </button>
          </div>
        </header>

        <ThemeSidebar
          activeTheme={theme}
          onSelect={(newTheme) => {
            setThemeState(newTheme);
            setTheme(newTheme);
          }}
          open={themeSidebarOpen}
          onClose={() => setThemeSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-8 sm:pt-12"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-4 sm:mb-6"
                >
                  <Logo isMain size={56} />
                </motion.div>
                <h2 className="themed-welcome-text text-xl sm:text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="themed-welcome-sub text-sm mb-8">Select who you want to talk with in this new conversation, and begin by typing and sending a message.</p>
                
                {/* Tinder-like Swipe Grid for Personas */}
                <div className="w-full overflow-x-auto pb-4 snap-x snap-mandatory flex gap-4 px-4 custom-scrollbar">
                  {PERSONAS.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPersona(p.id)}
                      className={`shrink-0 w-40 sm:w-48 aspect-[9/16] rounded-2xl border-2 overflow-hidden relative cursor-pointer snap-center transition-all ${selectedPersona === p.id ? 'border-pink-500 scale-105 shadow-xl' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={`/portrait_${p.id}.png`} alt={p.name} className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-left">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-bold text-sm">{p.name}</span>
                          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">{p.tag}</span>
                        </div>
                        <p className="text-[10px] text-white/80 leading-tight">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <TalkingAvatar personaId={msg.personaId || currentPersonaId} size={56} />
                  )}
                  <div
                    className={`group/msg max-w-[85%] sm:max-w-[80%] px-4 sm:px-5 py-3 rounded-2xl text-sm sm:text-base leading-relaxed transition-all duration-200 cursor-default ${
                      msg.role === 'user'
                        ? `themed-user-bubble rounded-tr-sm hover:shadow-lg hover:-translate-y-0.5`
                        : `themed-ai-bubble rounded-tl-sm backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5`
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="break-words space-y-2 text-sm sm:text-base"
                      components={{
                        p: ({ node, ...props }) => <p className="whitespace-pre-wrap leading-relaxed inline-block w-full" {...props} />,
                        code: ({ node, inline, className, children, ...props }) => {
                          return !inline ? (
                            <div className="themed-code-block p-3 rounded-md overflow-x-auto my-2 text-xs sm:text-sm font-mono border shadow-sm">
                              <code className={className} {...props}>{children}</code>
                            </div>
                          ) : (
                            <code className="themed-code-inline rounded px-1.5 py-0.5 text-[0.875em] font-mono" {...props}>{children}</code>
                          );
                        },
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            className="max-w-full h-auto rounded-xl border border-zinc-500/20 max-h-96 object-contain my-2 shadow-md"
                            alt={props.alt || 'Generated image'}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="themed-quote border-l-4 pl-3 my-1 italic" {...props} />
                        ),
                        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        a: ({ node, ...props }) => <a className="themed-link hover:underline" target="_blank" rel="noreferrer" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.attachments.map((file, idx) => (
                          file.type === 'image' ? (
                            <img 
                              key={idx} 
                              src={file.dataUrl} 
                              alt={file.name} 
                              className="max-w-full h-auto rounded-xl border border-zinc-500/20 max-h-48 object-cover shadow-sm" 
                            />
                          ) : (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 border border-zinc-500/20 text-xs font-medium"
                            >
                              <span className="text-xl">📄</span> 
                              <span className="truncate max-w-[150px]">{file.name}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && msg.personaId && autoConfig && (
                    <TalkingAvatar personaId={msg.personaId} size={56} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 sm:gap-3 justify-start"
              >
                <TalkingAvatar personaId={currentPersonaId} size={56} />
                <div className="themed-ai-bubble px-4 sm:px-5 py-4 rounded-2xl border min-h-[56px] flex items-center">
                  <ToolProgressDisplay progress={toolProgress || { phase: 'thinking' }} />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="themed-error max-w-3xl mx-auto text-sm border rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </main>

        <ChatInput
          onSend={handleSend}
          onGenerateImage={handleGenerateImage}
          disabled={loading || rateInfo.blocked}
          options={modelOptions}
          onOptionsChange={setModelOptions}
        />
      </div>

      {rateInfo.blocked && <BlockScreen resetIn={rateInfo.resetIn} />}

      {deleteTarget && (
        <DeleteModal
          conversation={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}