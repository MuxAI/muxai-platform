// api/ping.js
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export default async function handler(req, res) {
  try {
    const requestedUrl =
      (req.query?.serverUrl && typeof req.query.serverUrl === 'string' && req.query.serverUrl.trim()) ||
      (req.query?.url && typeof req.query.url === 'string' && req.query.url.trim()) ||
      OLLAMA_BASE_URL;
    const baseUrl = requestedUrl.replace(/\/+$/, '');

    // Ping the Ollama instance via the tags endpoint
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    }).catch(async () => {
      return await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      }).catch(async () => {
        return await fetch(baseUrl, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }).catch(() => null);
      });
    });

    if (response && response.ok) {
      let activeModel = OLLAMA_MODEL;
      try {
        const data = await response.json().catch(() => null);
        if (Array.isArray(data?.models) && data.models.length > 0) {
          activeModel = data.models[0].name || data.models[0].model || activeModel;
        } else if (Array.isArray(data?.data) && data.data.length > 0) {
          activeModel = data.data[0].id || activeModel;
        }
      } catch {}

      return res.status(200).json({ status: 'online', model: activeModel, url: baseUrl, mode: 'ollama' });
    }
    return res.status(200).json({ status: 'offline', message: `Server unreachable at ${baseUrl}` });
  } catch (error) {
    return res.status(200).json({ status: 'offline', error: String(error) });
  }
}