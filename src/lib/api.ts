import { Message } from '../types';
import { getServerConfig } from './storage';

export async function fetchAIReply(
  messages: Message[],
  personaId: string | null = null,
  options: {
    jsonMode?: boolean;
    tools?: any;
    temperature?: number;
    systemPrompt?: string;
  } = {}
) {
  const { jsonMode = false, tools = null, temperature = 0.6, systemPrompt } = options;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      personaId: personaId || undefined,
      systemPrompt,
      jsonMode,
      tools,
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
      const endpoint = `${config.customUrl.replace(/\/$/, '')}/`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'MuxAI/2.4',
      },
      });
      if (res.ok) {
        return { online: true, model: 'Custom Endpoint' };
      }
      return { online: false };
    }

    const res = await fetch('/api/ping');
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: data.status === 'online', model: data.model };
  } catch {
    return { online: false };
  }
}
