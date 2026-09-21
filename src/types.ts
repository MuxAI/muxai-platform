import { ChessGameState, ChessMove, PieceColor } from './lib/chessEngine';

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
  chessMove?: ChessMove;
  chessBoardText?: string;
  chessMoveSan?: string;
  isChessComment?: boolean;
}

export interface AIDuelConfig {
  p1Id: string;
  p2Id: string;
  topic: string;
  active: boolean;
  speed?: number;
  currentSpeakerId: string;
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
  mode?: 'standard' | 'ai_duel' | 'chess';
  aiDuelConfig?: AIDuelConfig;
  chessState?: ChessGameState;
  chessPlayerColor?: PieceColor;
  chessOpponentId?: string;
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
  isCustom?: boolean;
  systemPrompt?: string;
  customLogo?: string;
  customPortrait?: string;
  temperature?: number;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  isDark: boolean;
  swatches: string[];
  vars: Record<string, string>;
  isCustom?: boolean;
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

export interface ImportConflict {
  id: string;
  type: 'conversation' | 'persona' | 'theme';
  title: string;
  existingItem: any;
  incomingItem: any;
  differences: string[];
}

