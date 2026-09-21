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
    serverUrl: string;
  } = {}
) {
  const { jsonMode = false, tools = null, temperature = 0.6, systemPrompt } = options;

  const serverUrl = getActiveServerUrl();

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
    const res = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, personaId: personaId || undefined }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.title || null;
  } catch {
    return null;
  }
}

export async function analyzeImageWithVision(prompt: string, images: string[], model?: string): Promise<string> {
  const res = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, images, model }),
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

    if (config.mode === 'custom' && config.customUrl) {
      const baseUrl = config.customUrl.replace(/\/+$/, '');

      // 1. Primary check: Hit Ollama / standard LLM tags endpoint to get active model
      try {
        const res = await fetch(`${baseUrl}/api/tags`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          const activeModel = data?.models?.[0]?.name || 'Custom Endpoint';
          return { online: true, model: activeModel };
        }
      } catch {
        // Fall through to basic root ping if CORS/preflight fails on /api/tags
      }

      // 2. Fallback check: Hit root endpoint for custom proxies or non-Ollama servers
      const rootRes = await fetch(`${baseUrl}/`, {
        method: 'GET',
      });

      if (rootRes.ok) {
        return { online: true, model: 'Custom Endpoint' };
      }

      return { online: false };
    }

    // Default internal API ping route
    const res = await fetch('/api/ping');
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: data.status === 'online', model: data.model };
  } catch {
    return { online: false };
  }
}