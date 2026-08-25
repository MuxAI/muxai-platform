export interface Attachment {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  textContent?: string;
  base64?: string;
  dataUrl?: string;
  preview?: string | null;
  parsing?: boolean;
  error?: string | null;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  personaId?: string;
  attachments?: Attachment[];
  timestamp?: number;
  toolCalls?: ToolCall[];
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  personaId: string;
  messages: Message[];
  createdAt: number;
  updatedAt?: number;
  customTitle?: boolean;
  pinned?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  desc: string;
  tag: string;
  role: string;
  badgeColor?: string;
  greeting?: string;
  avatarSeed?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  isDark: boolean;
  swatches: string[];
  vars: Record<string, string>;
}

export interface ModelOptions {
  jsonMode: boolean;
  toolCalling: boolean;
  temperature: number;
  customSystemPrompt?: string;
}

export interface ToolProgress {
  phase: 'thinking' | 'calling_tools' | 'processing_results' | 'thinking_after_tools';
  tools?: Array<{
    name: string;
    status: 'pending' | 'executing' | 'done' | 'failed';
    error?: string;
  }>;
}

export interface RateInfo {
  count: number;
  remaining: number;
  blocked: boolean;
  oldest: number | null;
  resetIn: number;
  max: number;
}
