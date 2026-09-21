// src/lib/api.js
export async function fetchAIReply(
  messages, 
  personaId = 'Sera16', 
  options = {}
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
      temperature 
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Request failed (${res.status})`);
  }

  const data = await res.json();
  return data;
}

//export async function generateTitle(messages, personaId = 'Sera16') {
export async function generateTitle(messages, version = 'v1.6') {
  const res = await fetch('/api/generate-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    //body: JSON.stringify({ messages, personaId }),
    body: JSON.stringify({ messages, version }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data.title || null;
}

export async function analyzeImageWithVision(prompt, images, model) {
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