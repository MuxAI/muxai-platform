// api/generate-title.js
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

function getPromptForVersion(version) {
  if (version === 'v1.4') {
    return process.env.PROMPT_V14;
  }
  return process.env.PROMPT;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, version, serverUrl = null } = req.body || {};
    const activeBaseUrl = (serverUrl && typeof serverUrl === 'string' && serverUrl.trim())
      ? serverUrl.trim()
      : OLLAMA_BASE_URL;

    let activeModel = OLLAMA_MODEL;
    try {
      const tagsRes = await fetch(`${activeBaseUrl.replace(/\/+$/, '')}/api/tags`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        if (Array.isArray(data?.models) && data.models.length > 0) {
          activeModel = data.models[0].name || data.models[0].model || activeModel;
        }
      }
    } catch {}

    const history = Array.isArray(messages) ? messages : [];
    const ver = version === 'v1.4' ? 'v1.4' : 'v1.6';
    const prompt = getPromptForVersion(ver);

    const systemContent = (
      `${prompt}\n\n` +
      `Based on the system prompt above and the conversation messages below, ` +
      `generate a short title that summarizes the topic of this conversation in 5 words or fewer. ` +
      `Return only the title text, no quotes, no punctuation at the end.`
    );

    const payload = {
      model: activeModel,
      temperature: 0.3,
      max_tokens: 30,
      messages: [
        { role: 'system', content: systemContent },
        ...history.slice(-6),
      ],
    };

    const endpoint = `${activeBaseUrl.replace(/\/+$/, '')}/v1/chat/completions`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) return res.status(502).json({ error: 'Upstream error' });

    const data = await upstream.json();
    const rawTitle = data.choices?.[0]?.message?.content?.trim();
    const title = rawTitle ? rawTitle.slice(0, 60) : null;
    
    return res.status(200).json({ title });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error' });
  }
}