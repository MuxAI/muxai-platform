// api/generate-image.js
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
const OLLAMA_IMAGE_MODEL = process.env.OLLAMA_IMAGE_MODEL || 'x/flux2-klein:4b';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const endpoint = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/generate`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        model: OLLAMA_IMAGE_MODEL,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: 'Image generation failed', detail });
    }

    const data = await upstream.json();
    const rawImage = data.image || data.response;
    const imageUrl = rawImage.startsWith('data:') ? rawImage : `data:image/png;base64,${rawImage}`;

    return res.status(200).json({
      status: 'success',
      imageUrl,
      prompt,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}