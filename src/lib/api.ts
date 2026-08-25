import { Message } from '../types';

export async function fetchAIReply(
  messages: Message[],
  personaId = 'Sera16',
  options: {
    jsonMode?: boolean;
    tools?: any;
    temperature?: number;
  } = {}
) {
  const { jsonMode = false, tools = null, temperature = 0.6 } = options;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      personaId,
      jsonMode,
      tools,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Server returned ${res.status}`);
  }

  return await res.json();
}

export async function generateTitle(messages: Message[], personaId = 'Sera16'): Promise<string | null> {
  try {
    const res = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, personaId }),
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

export async function checkServerPing(): Promise<{ online: boolean; model?: string; mode?: string }> {
  try {
    const res = await fetch('/api/ping');
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: data.status === 'online', model: data.model, mode: data.mode };
  } catch {
    return { online: false };
  }
}
