// api/vision.js
// Handles image understanding via an Ollama vision model (llama3.2-vision:11b)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision:11b';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, images, model, serverUrl = null } = req.body || {};

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image (base64) is required' });
    }

    const activeBaseUrl = (serverUrl && typeof serverUrl === 'string' && serverUrl.trim())
      ? serverUrl.trim()
      : OLLAMA_BASE_URL;

    let targetModel = model || OLLAMA_VISION_MODEL;
    if (!model) {
      try {
        const tagsRes = await fetch(`${activeBaseUrl.replace(/\/+$/, '')}/api/tags`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (tagsRes.ok) {
          const data = await tagsRes.json();
          if (Array.isArray(data?.models) && data.models.length > 0) {
            const names = data.models.map(m => m.name || m.model).filter(Boolean);
            const visionMatch = names.find(n => /vision|llava|vl|multimodal|clip/i.test(n));
            targetModel = visionMatch || names[0] || targetModel;
          }
        }
      } catch {}
    }

    const visionPrompt = prompt || 'Describe this image in detail.';

    // Use Ollama's native /api/chat endpoint which supports multimodal images
    const endpoint = `${activeBaseUrl.replace(/\/+$/, '')}/api/chat`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          {
            role: 'user',
            content: visionPrompt,
            images: images, // array of base64 strings (no data URL prefix)
          },
        ],
        stream: false,
        options: {
          temperature: 0.4,
          num_predict: 512,
        },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({
        error: 'Vision model request failed',
        detail,
      });
    }

    const data = await upstream.json();
    const reply = data.message?.content?.trim() || '';

    return res.status(200).json({ reply, model: targetModel });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
