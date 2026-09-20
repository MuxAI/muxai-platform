import { Conversation, RateInfo, Persona, ImportConflict } from '../types';

const STORAGE_KEY = 'muxai_state_v2';
const THEME_KEY = 'muxai_theme_v2';
const OPTIONS_KEY = 'muxai_options_v2';
const CUSTOM_PERSONAS_KEY = 'muxai_custom_personas_v2';
const CUSTOM_THEMES_KEY = 'muxai_custom_themes_v2';
const GRAPHICS_QUALITY_KEY = 'muxai_graphics_quality_v1';

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

export function loadCustomPersonas(): Persona[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PERSONAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPersonas(personas: Persona[]): void {
  try {
    localStorage.setItem(CUSTOM_PERSONAS_KEY, JSON.stringify(personas));
  } catch (e) {
    console.error('Failed to save custom personas to localStorage', e);
  }
}

export function addOrUpdateCustomPersona(persona: Persona): Persona[] {
  const list = loadCustomPersonas();
  const index = list.findIndex((p) => p.id === persona.id);
  if (index >= 0) {
    list[index] = persona;
  } else {
    list.push(persona);
  }
  saveCustomPersonas(list);
  return list;
}

export function deleteCustomPersona(id: string): Persona[] {
  const list = loadCustomPersonas().filter((p) => p.id !== id);
  saveCustomPersonas(list);
  return list;
}

export const removeCustomPersona = deleteCustomPersona;

export function loadCustomThemes(): any[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: any[]): void {
  try {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
  } catch (e) {
    console.error('Failed to save custom themes to localStorage', e);
  }
}

export function addOrUpdateCustomTheme(theme: any): any[] {
  const list = loadCustomThemes();
  const index = list.findIndex((t) => t.id === theme.id);
  if (index >= 0) {
    list[index] = theme;
  } else {
    list.push(theme);
  }
  saveCustomThemes(list);
  return list;
}

export function deleteCustomTheme(id: string): any[] {
  const list = loadCustomThemes().filter((t) => t.id !== id);
  saveCustomThemes(list);
  return list;
}

export const removeCustomTheme = deleteCustomTheme;

// Graphics Quality Preference ('fancy' | 'smooth')
export type GraphicsQuality = 'fancy' | 'smooth';

export function getGraphicsQuality(): GraphicsQuality {
  try {
    const val = localStorage.getItem(GRAPHICS_QUALITY_KEY);
    if (val === 'smooth' || val === 'fancy') return val;
    return 'fancy'; // Default to fancy (navierstokes effects enabled)
  } catch {
    return 'fancy';
  }
}

export function setGraphicsQuality(quality: GraphicsQuality): void {
  try {
    localStorage.setItem(GRAPHICS_QUALITY_KEY, quality);
  } catch (e) {
    console.error('Failed to set graphics quality', e);
  }
}

// Full Data Export Structure
export interface MuxAIExportPackage {
  format: 'muxai-backup';
  version: 2;
  exportedAt: number;
  exportedDate: string;
  data: {
    conversations: Conversation[];
    customPersonas: Persona[];
    customThemes: any[];
    activeTheme: string;
    graphicsQuality: GraphicsQuality;
    options: any;
    appState: AppStorageState;
  };
}

export function exportAllData(): { jsonString: string; filename: string } {
  const conversations = loadConversations();
  const customPersonas = loadCustomPersonas();
  const customThemes = loadCustomThemes();
  const activeTheme = getTheme();
  const graphicsQuality = getGraphicsQuality();
  const options = getSavedOptions();
  const appState = loadState();

  const pkg: MuxAIExportPackage = {
    format: 'muxai-backup',
    version: 2,
    exportedAt: Date.now(),
    exportedDate: new Date().toISOString(),
    data: {
      conversations,
      customPersonas,
      customThemes,
      activeTheme,
      graphicsQuality,
      options,
      appState,
    },
  };

  const jsonString = JSON.stringify(pkg, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `muxai-backup-${dateStr}.json`;

  return { jsonString, filename };
}

// Conflict Analysis for Data Import
export function parseAndDetectImportConflicts(jsonString: string): {
  success: boolean;
  dataPackage?: MuxAIExportPackage;
  conflicts: ImportConflict[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed) {
      return { success: false, conflicts: [], error: 'Invalid JSON file: file is empty.' };
    }

    // Support both standardized MuxAIExportPackage and raw direct objects
    const incomingData = parsed.data ? parsed.data : parsed;
    const incomingConversations: Conversation[] = Array.isArray(incomingData.conversations)
      ? incomingData.conversations
      : [];
    const incomingPersonas: Persona[] = Array.isArray(incomingData.customPersonas)
      ? incomingData.customPersonas
      : [];
    const incomingThemes: any[] = Array.isArray(incomingData.customThemes)
      ? incomingData.customThemes
      : [];

    const existingConversations = loadConversations();
    const existingPersonas = loadCustomPersonas();
    const existingThemes = loadCustomThemes();

    const conflicts: ImportConflict[] = [];

    // Check conversation clashes by ID
    for (const inConv of incomingConversations) {
      if (!inConv || !inConv.id) continue;
      const exist = existingConversations.find((c) => c.id === inConv.id);
      if (exist) {
        const diffs: string[] = [];
        if (exist.title !== inConv.title) diffs.push(`Title: "${exist.title}" vs "${inConv.title}"`);
        if ((exist.messages?.length || 0) !== (inConv.messages?.length || 0)) {
          diffs.push(`Messages count: ${exist.messages?.length || 0} vs ${inConv.messages?.length || 0}`);
        }
        if (exist.personaId !== inConv.personaId) diffs.push(`Persona: ${exist.personaId} vs ${inConv.personaId}`);

        if (diffs.length > 0) {
          conflicts.push({
            id: inConv.id,
            type: 'conversation',
            title: exist.title || inConv.title || 'Conversation Clash',
            existingItem: exist,
            incomingItem: inConv,
            differences: diffs,
          });
        }
      }
    }

    // Check custom persona clashes by ID
    for (const inPersona of incomingPersonas) {
      if (!inPersona || !inPersona.id) continue;
      const exist = existingPersonas.find((p) => p.id === inPersona.id);
      if (exist) {
        const diffs: string[] = [];
        if (exist.name !== inPersona.name) diffs.push(`Name: "${exist.name}" vs "${inPersona.name}"`);
        if (exist.tag !== inPersona.tag) diffs.push(`Tag: "${exist.tag}" vs "${inPersona.tag}"`);
        if (exist.systemPrompt !== inPersona.systemPrompt) diffs.push('System Prompt is different');
        if (exist.customLogo !== inPersona.customLogo) diffs.push('Custom Logo is different');

        if (diffs.length > 0) {
          conflicts.push({
            id: inPersona.id,
            type: 'persona',
            title: exist.name || inPersona.name || 'Persona Clash',
            existingItem: exist,
            incomingItem: inPersona,
            differences: diffs,
          });
        }
      }
    }

    // Check custom theme clashes by ID
    for (const inTheme of incomingThemes) {
      if (!inTheme || !inTheme.id) continue;
      const exist = existingThemes.find((t) => t.id === inTheme.id);
      if (exist) {
        const diffs: string[] = [];
        if (exist.name !== inTheme.name) diffs.push(`Theme Name: "${exist.name}" vs "${inTheme.name}"`);
        if (JSON.stringify(exist.vars) !== JSON.stringify(inTheme.vars)) diffs.push('Color palette variables differ');

        if (diffs.length > 0) {
          conflicts.push({
            id: inTheme.id,
            type: 'theme',
            title: exist.name || inTheme.name || 'Theme Clash',
            existingItem: exist,
            incomingItem: inTheme,
            differences: diffs,
          });
        }
      }
    }

    const pkg: MuxAIExportPackage = {
      format: 'muxai-backup',
      version: 2,
      exportedAt: parsed.exportedAt || Date.now(),
      exportedDate: parsed.exportedDate || new Date().toISOString(),
      data: {
        conversations: incomingConversations,
        customPersonas: incomingPersonas,
        customThemes: incomingThemes,
        activeTheme: incomingData.activeTheme || incomingData.theme,
        graphicsQuality: incomingData.graphicsQuality,
        options: incomingData.options,
        appState: incomingData.appState || {},
      },
    };

    return {
      success: true,
      dataPackage: pkg,
      conflicts,
    };
  } catch (err: any) {
    return {
      success: false,
      conflicts: [],
      error: `Failed to parse import file: ${err?.message || 'Invalid format'}`,
    };
  }
}

// Apply import data with clash resolution
export function applyImportedData(
  pkg: MuxAIExportPackage,
  resolutions: Record<string, 'keep_existing' | 'use_incoming' | 'keep_both'> = {}
): void {
  const { data } = pkg;
  if (!data) return;

  // 1. Conversations
  if (Array.isArray(data.conversations)) {
    const existing = loadConversations();
    const mergedMap = new Map<string, Conversation>();

    // Put existing first
    existing.forEach((c) => mergedMap.set(c.id, c));

    // Process incoming
    for (const inConv of data.conversations) {
      if (!inConv || !inConv.id) continue;
      const resolution = resolutions[inConv.id] || 'use_incoming';

      if (mergedMap.has(inConv.id)) {
        if (resolution === 'use_incoming') {
          mergedMap.set(inConv.id, inConv);
        } else if (resolution === 'keep_both') {
          const newId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          mergedMap.set(newId, { ...inConv, id: newId, title: `${inConv.title} (Imported)` });
        }
        // If keep_existing, leave current in map
      } else {
        mergedMap.set(inConv.id, inConv);
      }
    }

    const sorted = Array.from(mergedMap.values()).sort(
      (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
    );
    saveConversations(sorted);
  }

  // 2. Custom Personas
  if (Array.isArray(data.customPersonas)) {
    const existing = loadCustomPersonas();
    const mergedMap = new Map<string, Persona>();
    existing.forEach((p) => mergedMap.set(p.id, p));

    for (const inPersona of data.customPersonas) {
      if (!inPersona || !inPersona.id) continue;
      const resolution = resolutions[inPersona.id] || 'use_incoming';

      if (mergedMap.has(inPersona.id)) {
        if (resolution === 'use_incoming') {
          mergedMap.set(inPersona.id, inPersona);
        } else if (resolution === 'keep_both') {
          const newId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          mergedMap.set(newId, { ...inPersona, id: newId, name: `${inPersona.name} (Copy)` });
        }
      } else {
        mergedMap.set(inPersona.id, inPersona);
      }
    }
    saveCustomPersonas(Array.from(mergedMap.values()));
  }

  // 3. Custom Themes
  if (Array.isArray(data.customThemes)) {
    const existing = loadCustomThemes();
    const mergedMap = new Map<string, any>();
    existing.forEach((t) => mergedMap.set(t.id, t));

    for (const inTheme of data.customThemes) {
      if (!inTheme || !inTheme.id) continue;
      const resolution = resolutions[inTheme.id] || 'use_incoming';

      if (mergedMap.has(inTheme.id)) {
        if (resolution === 'use_incoming') {
          mergedMap.set(inTheme.id, inTheme);
        } else if (resolution === 'keep_both') {
          const newId = `custom-theme-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          mergedMap.set(newId, { ...inTheme, id: newId, name: `${inTheme.name} (Copy)` });
        }
      } else {
        mergedMap.set(inTheme.id, inTheme);
      }
    }
    saveCustomThemes(Array.from(mergedMap.values()));
  }

  // 4. Graphics Quality & Theme (if specified)
  if (data.graphicsQuality === 'fancy' || data.graphicsQuality === 'smooth') {
    setGraphicsQuality(data.graphicsQuality);
  }

  if (data.activeTheme) {
    setTheme(data.activeTheme);
  }

  if (data.options) {
    saveOptions(data.options);
  }
}

