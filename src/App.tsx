import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Palette,
  Sparkles,
  RefreshCw,
  Plus,
  Server,
  Heart,
  Bot,
  Terminal,
  Zap,
  Sliders,
  ChevronDown,
  UserPlus,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ChatInput } from './components/ChatInput';
import { BlockScreen } from './components/BlockScreen';
import { DeleteModal } from './components/DeleteModal';
import { ToolProgressDisplay } from './components/ToolProgress';
import { MessageItem } from './components/MessageItem';
import { PersonaSelectorDeck } from './components/PersonaSelectorDeck';
import { NavierStokesGlyphs } from './components/NavierStokesGlyphs';
import { CustomPersonaModal } from './components/CustomPersonaModal';
import { CustomThemeModal } from './components/CustomThemeModal';
import { ImportConflictModal } from './components/ImportConflictModal';
import { PERSONAS, getAllPersonas } from './lib/constants';
import { THEMES, getAllThemes, applyTheme, Theme } from './lib/themes';
import {
  fetchAIReply,
  generateTitle,
  analyzeImageWithVision,
  checkServerPing,
} from './lib/api';
import { TOOL_DEFINITIONS, executeTool, getBrowserInfo } from './lib/tools';
import { formatFileForContext } from './lib/fileParser';
import {
  loadConversations,
  createConversation,
  deleteConversation,
  updateConversation,
  getRateInfo,
  recordMessage,
  getTheme,
  setTheme,
  loadCustomPersonas,
  addOrUpdateCustomPersona,
  removeCustomPersona,
  loadCustomThemes,
  addOrUpdateCustomTheme,
  removeCustomTheme,
  getGraphicsQuality,
  setGraphicsQuality,
  GraphicsQuality,
  exportAllData,
  parseAndDetectImportConflicts,
  applyImportedData,
  MuxAIExportPackage,
} from './lib/storage';
import {
  Conversation,
  Message,
  ModelOptions,
  RateInfo,
  ToolProgress,
  Attachment,
  Persona,
  ImportConflict,
} from './types';

const GENERIC_ERROR =
  "Could not complete the response. Ensure your self-hosted Ollama instance is online and reachable (check top-right badge).";

const QUICK_STARTERS: Record<string, string[]> = {
  Sera16: [
    "Tell me an intriguing philosophy question to ponder",
    "How does quantum superposition work in simple terms?",
    "Write a short, engaging story about an AI discovering emotions",
    "What are the top 3 productivity habits of high performers?",
  ],
  Sera16_wife: [
    "I had a really long day today, how are you?",
    "Can you plan a cozy weekend for us?",
    "What's your favorite thing about spending time together?",
    "Cheer me up with something sweet and funny",
  ],
  Sera16_bd: [
    "Arey, ki khobor! Tell me a fun story from Dhaka or Kolkata",
    "What's the best traditional Bengali recipe for ilish or mishti?",
    "Can we chat in Banglish about everyday life?",
    "Explain a deep concept with Bengali warmth",
  ],
  Sera14: [
    "Help me organize my study schedule for next week",
    "Explain how gradient descent works step by step",
    "Draft a kind and professional email response",
    "What are some classic book recommendations?",
  ],
  Distil: [
    "Review my system architecture: microservices vs modular monolith",
    "How do I optimize Node.js event loop performance under heavy I/O?",
    "Explain Rust memory safety without a garbage collector",
    "What's the best way to implement distributed caching with Redis?",
  ],
  Distil_husband: [
    "Hey babe, need a quick break from work. What are you up to?",
    "Can you help me solve this tech bug while we chat?",
    "Remind me to drink water and take care of myself today",
    "Tell me about something cool you built today",
  ],
  Muku: [
    "Where does consciousness go when we dream?",
    "Speak in riddles about the birth of the galaxy",
    "What is the mathematical equation for beauty?",
    "If colors had sound, what would purple sing?",
  ],
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);
  const [graphicsQuality, setGraphicsQualityState] = useState<GraphicsQuality>(() => getGraphicsQuality());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import conflicts state
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [importConflicts, setImportConflicts] = useState<ImportConflict[]>([]);
  const [pendingImportPackage, setPendingImportPackage] = useState<MuxAIExportPackage | null>(null);

  const [rateInfo, setRateInfo] = useState<RateInfo>({
    blocked: false,
    resetIn: 0,
    remaining: 60,
    count: 0,
    oldest: null,
    max: 60,
  });
  const [error, setError] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('Sera16');
  const [theme, setThemeState] = useState('classic-dark');
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [serverModel, setServerModel] = useState<string | undefined>();
  const [modelOptions, setModelOptions] = useState<ModelOptions>({
    jsonMode: false,
    toolCalling: false,
    temperature: 0.6,
  });
  const [toolProgress, setToolProgress] = useState<ToolProgress | null>(null);

  // Custom Persona & Theme Modals state
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(() => loadCustomPersonas());
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<Persona | null>(null);

  const [customThemes, setCustomThemes] = useState<Theme[]>(() => loadCustomThemes());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null);

  const allPersonas = useMemo(() => {
    return [...PERSONAS, ...customPersonas];
  }, [customPersonas]);

  const allThemes = useMemo(() => {
    return [...THEMES, ...customThemes];
  }, [customThemes]);

  const [autoConfig, setAutoConfig] = useState<{ p1: string; p2: string } | null>(null);
  const isAutoRunning = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Ping backend check
  useEffect(() => {
    const checkPing = async () => {
      const info = await checkServerPing();
      setIsOnline(info.online);
      if (info.model) setServerModel(info.model);
    };
    checkPing();
    const interval = setInterval(checkPing, 8000);
    return () => clearInterval(interval);
  }, []);

  // Load conversations and initial query parameters
  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);

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
    } else if (convs.length > 0) {
      setActiveId(convs[0].id);
    }
  }, []);

  // Sync active chat in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeId) {
      url.searchParams.set('chat', activeId);
    } else {
      url.searchParams.delete('chat');
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeId]);

  // Sync active messages
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const conv = conversations.find((c) => c.id === activeId);
    if (conv) {
      setMessages(conv.messages || []);
      if (conv.personaId) setSelectedPersona(conv.personaId);
    } else {
      setMessages([]);
    }
  }, [activeId, conversations]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, toolProgress]);

  // Rate info timer
  useEffect(() => {
    const t = setInterval(() => {
      const info = getRateInfo();
      setRateInfo(info);
      if (!info.blocked) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleNew = () => {
    const conv = createConversation('New chat', selectedPersona);
    const convs = loadConversations();
    setConversations(convs);
    setActiveId(conv.id);
    setMessages([]);
    setSidebarOpen(false);
    setError('');
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError('');
  };

  const handleRename = (id: string, newTitle: string) => {
    const updated = updateConversation(id, (c) => ({ ...c, title: newTitle, customTitle: true }));
    setConversations(updated);
  };

  const handleDeleteRequest = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) setDeleteTarget(conv);
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

  const persistMessages = (convId: string, msgs: Message[]) => {
    const updated = updateConversation(convId, (c) => ({ ...c, messages: msgs }));
    setConversations(updated);
  };

  const maybeGenerateTitle = async (convId: string, msgs: Message[], personaId: string) => {
    if (!msgs || msgs.length === 0) return;
    const activeConv = conversations.find((c) => c.id === convId);
    if (activeConv?.customTitle) return;

    try {
      const title = await generateTitle(msgs, personaId);
      if (title && title !== 'New chat') {
        const updated = updateConversation(convId, (c) => ({ ...c, title }));
        setConversations(updated);
      }
    } catch {}
  };

  // Custom Persona Management
  const handleSaveCustomPersona = (p: Persona) => {
    addOrUpdateCustomPersona(p);
    setCustomPersonas(loadCustomPersonas());
    setSelectedPersona(p.id);
    if (activeId) {
      updateConversation(activeId, (c) => ({ ...c, personaId: p.id }));
      setConversations(loadConversations());
    }
  };

  const handleDeleteCustomPersona = (id: string) => {
    removeCustomPersona(id);
    setCustomPersonas(loadCustomPersonas());
    if (selectedPersona === id) {
      setSelectedPersona('Sera16');
      if (activeId) {
        updateConversation(activeId, (c) => ({ ...c, personaId: 'Sera16' }));
        setConversations(loadConversations());
      }
    }
  };

  // Custom Theme Management
  const handleSaveCustomTheme = (t: Theme) => {
    addOrUpdateCustomTheme(t);
    setCustomThemes(loadCustomThemes());
    setThemeState(t.id);
    setTheme(t.id);
    applyTheme(t.id);
  };

  const handleDeleteCustomTheme = (id: string) => {
    removeCustomTheme(id);
    setCustomThemes(loadCustomThemes());
    if (theme === id) {
      setThemeState('classic-dark');
      setTheme('classic-dark');
      applyTheme('classic-dark');
    }
  };

  // Toast notification helper with auto-dismiss
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Storage Reload Helper
  const reloadAllStorageData = () => {
    const convs = loadConversations();
    setConversations(convs);
    if (convs.length > 0 && (!activeId || !convs.some((c) => c.id === activeId))) {
      setActiveId(convs[0].id);
    }
    setCustomPersonas(loadCustomPersonas());
    setCustomThemes(loadCustomThemes());
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    const q = getGraphicsQuality();
    setGraphicsQualityState(q);
  };

  // Export Data Handler
  const handleExportData = () => {
    try {
      const { jsonString, filename } = exportAllData();
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('All workspace data exported successfully!');
    } catch (err: any) {
      setError(`Failed to export data: ${err?.message || err}`);
    }
  };

  // Import Data Handler
  const handleImportDataFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseAndDetectImportConflicts(text);
        if (!result.success || !result.dataPackage) {
          setError(result.error || 'Failed to parse import backup file.');
          return;
        }

        if (result.conflicts.length > 0) {
          setPendingImportPackage(result.dataPackage);
          setImportConflicts(result.conflicts);
          setIsConflictModalOpen(true);
        } else {
          applyImportedData(result.dataPackage);
          reloadAllStorageData();
          showToast('Data imported and merged successfully!');
        }
      } catch (err: any) {
        setError(`Failed to process backup file: ${err?.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  // Resolved Conflicts Import Handler
  const handleResolveAndImport = (
    pkg: MuxAIExportPackage,
    resolutions: Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'>
  ) => {
    applyImportedData(pkg, resolutions);
    reloadAllStorageData();
    showToast('Import completed with your conflict selections!');
  };


  // Dual-Agent Auto Chat loop (when `?auto=0` or `?auto=1`)
  const autoChatLoop = async (convId: string, initialMsgs: Message[], p1: string, p2: string) => {
    isAutoRunning.current = true;
    let currentMsgs = [...initialMsgs];
    let currentSpeaker = p2;

    const stopLoop = () => {
      isAutoRunning.current = false;
    };
    window.addEventListener('beforeunload', stopLoop);

    while (isAutoRunning.current) {
      setLoading(true);
      setError('');

      const apiHistory: Message[] = currentMsgs.map((m) => ({
        role: m.personaId === currentSpeaker ? 'assistant' : 'user',
        content: m.content,
      }));

      try {
        const speakerPersonaObj = allPersonas.find((p) => p.id === currentSpeaker);
        const data = await fetchAIReply(apiHistory, currentSpeaker, {
          jsonMode: false,
          temperature: speakerPersonaObj?.temperature ?? 0.7,
          systemPrompt: speakerPersonaObj?.systemPrompt,
        });

        const replyText = data.reply || '';
        const uiRole: 'user' | 'assistant' = currentSpeaker === p1 ? 'user' : 'assistant';
        const aiMsg: Message = { role: uiRole, personaId: currentSpeaker, content: replyText };

        currentMsgs = [...currentMsgs, aiMsg];
        setMessages(currentMsgs);
        persistMessages(convId, currentMsgs);

        currentSpeaker = currentSpeaker === p1 ? p2 : p1;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      } catch {
        setError(GENERIC_ERROR);
        isAutoRunning.current = false;
      }
    }
    setLoading(false);
    window.removeEventListener('beforeunload', stopLoop);
  };

  // Direct Image Generation Action
  const handleGenerateImage = async (prompt: string) => {
    let convId = activeId;
    let currentConvs = conversations;

    if (!convId) {
      const conv = createConversation(`Art: ${prompt.slice(0, 20)}`, selectedPersona);
      convId = conv.id;
      currentConvs = loadConversations();
      setConversations(currentConvs);
      setActiveId(convId);
    }

    const activeConv = currentConvs.find((c) => c.id === convId);
    const personaToUse = activeConv?.personaId || selectedPersona;

    const userMsg: Message = { role: 'user', content: `Generate image: ${prompt}`, attachments: [] };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);

    setLoading(true);
    setError('');
    setToolProgress({
      phase: 'calling_tools',
      tools: [{ name: 'generate_image', status: 'executing' }],
    });

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Image generation endpoint failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        role: 'assistant',
        personaId: personaToUse,
        content: `Here is the artwork generated for **"${prompt}"**:\n\n![${prompt}](${data.imageUrl})`,
      };

      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      persistMessages(convId, finalMsgs);
      maybeGenerateTitle(convId, finalMsgs, personaToUse);
    } catch (err: any) {
      setError(err?.message || 'Image generation failed.');
    } finally {
      setLoading(false);
      setToolProgress(null);
    }
  };

  // Retry a user message: keeps messages up to this user message, and regenerates the response without duplicating the user prompt bubble
  const handleRetry = async (msgIndex: number, userMessage: Message) => {
    if (loading || !isOnline) return;

    let convId = activeId;
    if (!convId) return;

    const trimmedMsgs = messages.slice(0, msgIndex + 1);
    setMessages(trimmedMsgs);
    persistMessages(convId, trimmedMsgs);

    const activeConv = conversations.find((c) => c.id === convId);
    const personaToUse = activeConv?.personaId || selectedPersona;
    const activePersonaObj = allPersonas.find((p) => p.id === personaToUse);

    setLoading(true);
    setError('');
    setToolProgress({ phase: 'thinking' });

    const tools = modelOptions.toolCalling ? TOOL_DEFINITIONS : null;
    const browserInfo = getBrowserInfo();
    const MAX_TOOL_ROUNDS = 4;

    let conversationHistory: Message[] = trimmedMsgs.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    let gotFinalReply = false;

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const data = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: round === 0 ? tools : null,
          systemPrompt: activePersonaObj?.systemPrompt,
        });

        if (!data.toolCalls || !Array.isArray(data.toolCalls) || data.toolCalls.length === 0) {
          const replyText = data.reply || '';
          const aiMsg: Message = {
            role: 'assistant',
            personaId: personaToUse,
            content: replyText,
          };
          const finalMsgs = [...trimmedMsgs, aiMsg];
          setMessages(finalMsgs);
          persistMessages(convId, finalMsgs);
          recordMessage();
          gotFinalReply = true;
          break;
        }

        if (data.reply) {
          conversationHistory.push({ role: 'assistant', content: data.reply });
        }

        const toolProgressList: Array<{
          name: string;
          status: 'pending' | 'executing' | 'done';
        }> = data.toolCalls.map((tc: any) => ({
          name: tc.function?.name || 'unknown',
          status: 'pending',
        }));
        setToolProgress({ phase: 'calling_tools', tools: toolProgressList });

        const toolResultParts = [];

        for (let i = 0; i < data.toolCalls.length; i++) {
          const tc = data.toolCalls[i];
          const toolName = tc.function?.name || 'unknown';
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(tc.function?.arguments || '{}');
          } catch {}

          toolProgressList[i].status = 'executing';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          const result = await executeTool(toolName, parsedArgs, browserInfo);

          toolProgressList[i].status = 'done';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          toolResultParts.push(
            `[Tool: ${toolName}]\nArguments: ${JSON.stringify(parsedArgs)}\nResult: ${result}`
          );
        }

        setToolProgress({ phase: 'processing_results' });

        conversationHistory.push({
          role: 'user',
          content: `Here are the real-time tool results. Answer the user question naturally using this data:\n\n${toolResultParts.join(
            '\n\n'
          )}`,
        });
      }

      if (!gotFinalReply) {
        setToolProgress({ phase: 'thinking_after_tools' });
        const finalData = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: null,
          systemPrompt: activePersonaObj?.systemPrompt,
        });
        const replyText = finalData.reply || 'Data retrieved successfully.';
        const aiMsg: Message = {
          role: 'assistant',
          personaId: personaToUse,
          content: replyText,
        };
        const finalMsgs = [...trimmedMsgs, aiMsg];
        setMessages(finalMsgs);
        persistMessages(convId, finalMsgs);
        recordMessage();
      }
    } catch (err: any) {
      setError(err?.message || GENERIC_ERROR);
    } finally {
      setLoading(false);
      setToolProgress(null);
    }
  };

  // Send message handler
  const handleSend = async (text: string, attachments: Attachment[] = []) => {
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

    const activeConv = currentConvs.find((c) => c.id === convId);
    const personaToUse = activeConv?.personaId || selectedPersona;
    const activePersonaObj = allPersonas.find((p) => p.id === personaToUse);

    if (activeConv && activeConv.title === 'New chat' && messages.length === 0) {
      const firstWords = text ? text.slice(0, 24) : `Chat #${currentConvs.length}`;
      updateConversation(convId, (c) => ({ ...c, title: firstWords }));
      currentConvs = loadConversations();
      setConversations(currentConvs);
    }

    if (autoConfig) {
      const userMsg: Message = {
        role: 'user',
        personaId: autoConfig.p1,
        content: text,
        attachments,
      };
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
      fullContextContent = `${fullContextContent}\n\n${docParts.join('\n\n')}`.trim();
    }

    let visionAnalysis = '';
    if (imageAttachments.length > 0) {
      setLoading(true);
      setToolProgress({
        phase: 'calling_tools',
        tools: imageAttachments.map((_, i) => ({
          name: 'analyze_image',
          status: i === 0 ? 'executing' : 'pending',
        })),
      });

      try {
        const visionPrompt = text || 'Describe this image in detail. What do you see?';
        const imageBase64s = imageAttachments.map((a) => a.base64 || '');
        visionAnalysis = await analyzeImageWithVision(visionPrompt, imageBase64s);
        setToolProgress({
          phase: 'calling_tools',
          tools: imageAttachments.map(() => ({ name: 'analyze_image', status: 'done' })),
        });
      } catch (err: any) {
        visionAnalysis = `[Vision analysis: ${err?.message || 'processed'}]`;
        setToolProgress({
          phase: 'calling_tools',
          tools: imageAttachments.map(() => ({ name: 'analyze_image', status: 'done' })),
        });
      }

      if (visionAnalysis) {
        const imageNames = imageAttachments.map((a) => a.name).join(', ');
        fullContextContent = `${fullContextContent}\n\n--- IMAGE ANALYSIS (${imageNames}) ---\n${visionAnalysis}`.trim();
      }
    }

    const userMsg: Message = { role: 'user', content: displayText, attachments };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    persistMessages(convId, newMsgs);

    setLoading(true);
    setError('');
    setToolProgress({ phase: 'thinking' });

    const tools = modelOptions.toolCalling ? TOOL_DEFINITIONS : null;
    const browserInfo = getBrowserInfo();
    const MAX_TOOL_ROUNDS = 4;
    let conversationHistory: Message[] = [
      ...messages,
      { role: 'user', content: fullContextContent },
    ];
    let gotFinalReply = false;

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const data = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: round === 0 ? tools : null,
          systemPrompt: activePersonaObj?.systemPrompt,
        });

        if (!data.toolCalls || !Array.isArray(data.toolCalls) || data.toolCalls.length === 0) {
          const replyText = data.reply || '';
          const aiMsg: Message = {
            role: 'assistant',
            personaId: personaToUse,
            content: replyText,
          };
          const finalMsgs = [...newMsgs, aiMsg];
          setMessages(finalMsgs);
          persistMessages(convId, finalMsgs);
          recordMessage();
          maybeGenerateTitle(convId, finalMsgs, personaToUse);
          gotFinalReply = true;
          break;
        }

        if (data.reply) {
          conversationHistory.push({ role: 'assistant', content: data.reply });
        }

        const toolProgressList: Array<{
          name: string;
          status: 'pending' | 'executing' | 'done';
        }> = data.toolCalls.map((tc: any) => ({
          name: tc.function?.name || 'unknown',
          status: 'pending',
        }));
        setToolProgress({ phase: 'calling_tools', tools: toolProgressList });

        const toolResultParts = [];

        for (let i = 0; i < data.toolCalls.length; i++) {
          const tc = data.toolCalls[i];
          const toolName = tc.function?.name || 'unknown';
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(tc.function?.arguments || '{}');
          } catch {}

          toolProgressList[i].status = 'executing';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          const result = await executeTool(toolName, parsedArgs, browserInfo);

          toolProgressList[i].status = 'done';
          setToolProgress({ phase: 'calling_tools', tools: [...toolProgressList] });

          toolResultParts.push(
            `[Tool: ${toolName}]\nArguments: ${JSON.stringify(parsedArgs)}\nResult: ${result}`
          );
        }

        setToolProgress({ phase: 'processing_results' });

        conversationHistory.push({
          role: 'user',
          content: `Here are the real-time tool results. Answer the user question naturally using this data:\n\n${toolResultParts.join(
            '\n\n'
          )}`,
        });
      }

      if (!gotFinalReply) {
        setToolProgress({ phase: 'thinking_after_tools' });
        const finalData = await fetchAIReply(conversationHistory, personaToUse, {
          jsonMode: modelOptions.jsonMode,
          temperature: modelOptions.temperature,
          tools: null,
          systemPrompt: activePersonaObj?.systemPrompt,
        });
        const replyText = finalData.reply || 'Data retrieved successfully.';
        const aiMsg: Message = {
          role: 'assistant',
          personaId: personaToUse,
          content: replyText,
        };
        const finalMsgs = [...newMsgs, aiMsg];
        setMessages(finalMsgs);
        persistMessages(convId, finalMsgs);
        recordMessage();
        maybeGenerateTitle(convId, finalMsgs, personaToUse);
      }
    } catch (err: any) {
      setError(err?.message || GENERIC_ERROR);
    } finally {
      setLoading(false);
      setToolProgress(null);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId);
  const currentPersonaId = activeConv?.personaId || selectedPersona;
  const currentPersonaInfo =
    allPersonas.find((p) => p.id === currentPersonaId) || allPersonas[0];

  return (
    <div className="themed-bg themed-text h-screen w-screen overflow-hidden relative select-text">
      {/* Navier-Stokes Fluid Glyphs Simulation snaking in background */}
      {graphicsQuality === 'fancy' && (
        <NavierStokesGlyphs className="z-0 pointer-events-none opacity-40" />
      )}

      {/* Dynamic Ambient Moving Gradient Aurora Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="themed-aurora-1 absolute -top-1/4 -left-1/4 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-[140px] animate-aurora-1" />
        <div className="themed-aurora-2 absolute top-1/3 -right-1/4 w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] rounded-full blur-[140px] animate-aurora-2" />
        <div className="themed-aurora-3 absolute -bottom-1/4 left-1/3 w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full blur-[140px] animate-aurora-3" />
      </div>

      <div className="themed-grid-bg fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* Left Navigation Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDeleteRequest}
        onRename={handleRename}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isOnline={isOnline}
      />

      {/* Right Settings & Theme Submenu Sidebar */}
      <SettingsSidebar
        open={settingsSidebarOpen}
        onClose={() => setSettingsSidebarOpen(false)}
        graphicsQuality={graphicsQuality}
        onSelectGraphicsQuality={(q) => {
          setGraphicsQualityState(q);
          setGraphicsQuality(q);
          showToast(`Visual engine set to ${q === 'fancy' ? 'Fancy (Fluid dynamic on)' : 'Smooth (Efficiency mode)'}`);
        }}
        onExportData={handleExportData}
        onImportDataFile={handleImportDataFile}
        activeTheme={theme}
        onSelectTheme={(newTheme) => {
          setThemeState(newTheme);
          setTheme(newTheme);
        }}
        themes={allThemes}
        onOpenCreateTheme={() => {
          setThemeToEdit(null);
          setIsThemeModalOpen(true);
        }}
        onEditTheme={(t) => {
          setThemeToEdit(t);
          setIsThemeModalOpen(true);
        }}
        onDeleteTheme={handleDeleteCustomTheme}
      />

      {/* Main View Container */}
      <div className="absolute inset-0 flex flex-col z-10">
        {/* Top Navbar */}
        <header className="themed-header flex items-center justify-between p-3 sm:p-4 border-b backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="themed-burger p-2 rounded-xl border border-transparent hover:border-zinc-500/20 transition-all hover:scale-105 active:scale-95"
              title="Conversations history"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0 border border-zinc-500/20 flex items-center justify-center">
                <Logo personaId={currentPersonaId} size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight">
                    {currentPersonaInfo.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full themed-chip border">
                    {currentPersonaInfo.tag}
                  </span>
                </div>
                <div className="text-[10px] opacity-60 hidden sm:block truncate max-w-xs">
                  {currentPersonaInfo.role}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Server Online Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold transition-all shadow-sm ${
                isOnline ? 'themed-online' : 'themed-offline'
              }`}
              title={
                isOnline
                  ? `Self-hosted Ollama connection active (${serverModel || 'Ready'})`
                  : 'Ollama model server unreachable'
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span className="xs:inline">{isOnline ? 'ON' : 'OFF'}</span>
            </div>

            {/* Settings Toggle Button */}
            <button
              onClick={() => setSettingsSidebarOpen((v) => !v)}
              className="themed-btn p-2 sm:p-2.5 rounded-xl border border-transparent hover:border-zinc-500/20 transition-all hover:scale-105 active:scale-95 themed-tool-accent"
              title="Settings & Appearance"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Chat History & Welcome Screen */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-4 sm:pt-8"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-3"
                >
                  <Logo isMain size={64} />
                </motion.div>

                <h2 className="themed-welcome-text text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
                  Welcome to MuxAI
                </h2>
                <p className="themed-welcome-sub text-xs sm:text-sm mb-6 max-w-md">
                  Pick your companion persona below or create a custom one to begin chatting!
                </p>

                {/* Persona Selector Deck */}
                <div className="w-full mb-6">
                  <PersonaSelectorDeck
                    selectedPersona={selectedPersona}
                    personas={allPersonas}
                    onSelect={(id) => {
                      setSelectedPersona(id);
                      if (activeId) {
                        updateConversation(activeId, (c) => ({ ...c, personaId: id }));
                        setConversations(loadConversations());
                      }
                    }}
                    onOpenCreatePersona={() => {
                      setPersonaToEdit(null);
                      setIsPersonaModalOpen(true);
                    }}
                    onEditPersona={(p) => {
                      setPersonaToEdit(p);
                      setIsPersonaModalOpen(true);
                    }}
                    onDeletePersona={handleDeleteCustomPersona}
                  />
                </div>

                {/* Quick Prompt Starters */}
                <div className="w-full text-left mt-2">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2.5 px-1">
                    Try Asking {currentPersonaInfo.name}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(QUICK_STARTERS[selectedPersona] || QUICK_STARTERS.Sera16).map(
                      (prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="text-left p-3 rounded-2xl border border-inherit themed-ai-bubble text-xs sm:text-sm font-medium transition-all hover:scale-[1.01] hover:border-pink-400 active:scale-[0.99] shadow-sm flex items-start gap-2.5 group"
                        >
                          <Sparkles
                            size={15}
                            className="themed-tool-accent shrink-0 mt-0.5 group-hover:rotate-12 transition-transform"
                          />
                          <span className="leading-snug">{prompt}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Render Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <MessageItem
                  key={i}
                  message={msg}
                  personaId={currentPersonaId}
                  isAutoChat={Boolean(autoConfig)}
                  onRetry={msg.role === 'user' ? () => handleRetry(i, msg) : undefined}
                />
              ))}
            </AnimatePresence>

            {/* Live Tool Execution & Thinking Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 sm:gap-4 justify-start"
              >
                <div className="themed-logo-box w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 overflow-hidden shadow-sm">
                  <Logo personaId={currentPersonaId} size={48} overflow />
                </div>
                <div className="themed-ai-bubble px-4 sm:px-5 py-3.5 rounded-2xl rounded-tl-sm border min-h-[48px] flex items-center shadow-sm">
                  <ToolProgressDisplay progress={toolProgress || { phase: 'thinking' }} />
                </div>
              </motion.div>
            )}

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="themed-error max-w-3xl mx-auto text-xs sm:text-sm border rounded-2xl px-4 py-3 shadow-md flex items-start justify-between gap-3"
              >
                <div>{error}</div>
                <button
                  onClick={() => setError('')}
                  className="font-bold opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>
        </main>

        {/* Input Bar */}
        <ChatInput
          onSend={handleSend}
          onGenerateImage={handleGenerateImage}
          disabled={loading || rateInfo.blocked}
          isOnline={isOnline}
          options={modelOptions}
          onOptionsChange={setModelOptions}
        />
      </div>

      {/* Custom Persona Modal */}
      <CustomPersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSave={handleSaveCustomPersona}
        onDelete={handleDeleteCustomPersona}
        personaToEdit={personaToEdit}
      />

      {/* Custom Theme Modal */}
      <CustomThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSave={handleSaveCustomTheme}
        onDelete={handleDeleteCustomTheme}
        themeToEdit={themeToEdit}
      />

      {/* Rate limit screen */}
      {rateInfo.blocked && <BlockScreen resetIn={rateInfo.resetIn} />}

      {/* Delete confirmation modal with 3s safety hold */}
      {deleteTarget && (
        <DeleteModal
          conversation={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Import Conflict Resolution Modal */}
      {pendingImportPackage && (
        <ImportConflictModal
          isOpen={isConflictModalOpen}
          onClose={() => {
            setIsConflictModalOpen(false);
            setPendingImportPackage(null);
            setImportConflicts([]);
          }}
          conflicts={importConflicts}
          dataPackage={pendingImportPackage}
          onResolveAndImport={handleResolveAndImport}
        />
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-950/90 text-zinc-100 border border-pink-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-semibold pointer-events-none"
          >
            <CheckCircle2 size={16} className="text-pink-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


