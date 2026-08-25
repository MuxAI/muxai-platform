import { Conversation, RateInfo } from '../types';

const STORAGE_KEY = 'muxai_state_v2';
const THEME_KEY = 'muxai_theme_v2';
const OPTIONS_KEY = 'muxai_options_v2';

interface AppStorageState {
  conversations?: Conversation[];
  rateTimestamps?: number[];
  selectedPersona?: string;
}

export function loadState(): AppStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveState(state: AppStorageState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function loadConversations(): Conversation[] {
  return loadState().conversations || [];
}

export function saveConversations(conversations: Conversation[]): void {
  const state = loadState();
  state.conversations = conversations;
  saveState(state);
}

export function createConversation(title = 'New chat', personaId = 'Sera16'): Conversation {
  const conv: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    personaId,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const convs = loadConversations();
  convs.unshift(conv);
  saveConversations(convs);
  return conv;
}

export function deleteConversation(id: string): Conversation[] {
  const convs = loadConversations().filter((c) => c.id !== id);
  saveConversations(convs);
  return convs;
}

export function updateConversation(
  id: string,
  updater: (c: Conversation) => Conversation
): Conversation[] {
  const convs = loadConversations();
  const idx = convs.findIndex((c) => c.id === id);
  if (idx === -1) return convs;
  convs[idx] = { ...updater(convs[idx]), updatedAt: Date.now() };
  saveConversations(convs);
  return convs;
}

const RATE_MAX = 60;
const RATE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export function getRateInfo(): RateInfo {
  const state = loadState();
  const now = Date.now();
  const timestamps = (state.rateTimestamps || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  return {
    count: timestamps.length,
    remaining: Math.max(0, RATE_MAX - timestamps.length),
    blocked: timestamps.length >= RATE_MAX,
    oldest: timestamps[0] || null,
    resetIn: timestamps[0]
      ? Math.max(0, RATE_WINDOW_MS - (now - timestamps[0]))
      : 0,
    max: RATE_MAX,
  };
}

export function recordMessage(): RateInfo {
  const state = loadState();
  const now = Date.now();
  const timestamps = (state.rateTimestamps || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  timestamps.push(now);
  state.rateTimestamps = timestamps;
  saveState(state);
  return getRateInfo();
}

export function getTheme(): string {
  return localStorage.getItem(THEME_KEY) || 'professional-polish';
}

export function setTheme(theme: string): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getSavedOptions() {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOptions(options: any): void {
  try {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch {}
}
