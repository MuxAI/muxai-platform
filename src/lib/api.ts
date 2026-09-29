import { Message } from '../types';
import { getServerConfig } from './storage';

function getActiveServerUrl(): string | undefined {
  const cfg = getServerConfig();
  if (cfg.mode === 'custom' && cfg.customUrl && cfg.customUrl.trim()) {
    return cfg.customUrl.trim();
  }
  return undefined;
}

export async function fetchAIReply(
  messages: Message[],
  personaId: string | null = null,
  options: {
    jsonMode?: boolean;
    tools?: any;
    temperature?: number;
    systemPrompt?: string;
    serverUrl?: string;
  } = {}
) {
  const { jsonMode = false, tools = null, temperature = 0.6, systemPrompt } = options;

  const serverUrl = options.serverUrl || getActiveServerUrl();

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      personaId: personaId || undefined,
      systemPrompt,
      jsonMode,
      tools,
      serverUrl,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Server might be offline/unstable. Received error: ${res.status}`);
  }

  return await res.json();
}

export async function generateTitle(messages: Message[], personaId: string | null = null): Promise<string | null> {
  try {
    const serverUrl = getActiveServerUrl();
    const res = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, personaId: personaId || undefined, serverUrl }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.title || null;
  } catch {
    return null;
  }
}

export async function analyzeImageWithVision(prompt: string, images: string[], model?: string): Promise<string> {
  const serverUrl = getActiveServerUrl();
  const res = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, images, model, serverUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Vision request failed (${res.status})`);
  }

  const data = await res.json();
  return data.reply || '';
}


export async function checkServerPing(): Promise<{ online: boolean; model?: string }> {
  try {
    const config = getServerConfig();
    const serverUrl = getActiveServerUrl();

    // Query server status & dynamically discovered model via server URL API
    const pingEndpoint = serverUrl
      ? `/api/ping?serverUrl=${encodeURIComponent(serverUrl)}`
      : '/api/ping';

    const res = await fetch(pingEndpoint);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'online') {
        return { online: true, model: data.model };
      }
    }

    // Direct browser fetch fallback if proxy route returned offline for custom URL
    if (config.mode === 'custom' && config.customUrl) {
      const baseUrl = config.customUrl.replace(/\/+$/, '');
      try {
        const directRes = await fetch(`${baseUrl}/api/tags`, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        if (directRes.ok) {
          const data = await directRes.json().catch(() => null);
          const activeModel = data?.models?.[0]?.name || 'Ollama Server';
          return { online: true, model: activeModel };
        }
      } catch {}

      try {
        const rootRes = await fetch(`${baseUrl}/`, { method: 'GET' });
        if (rootRes.ok) {
          return { online: true, model: 'Custom Endpoint' };
        }
      } catch {}
    }

    return { online: false };
  } catch {
    return { online: false };
  }
}