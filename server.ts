import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision:11b';

const DEFAULT_PROMPTS: Record<string, string> = {
   Sera16: "",
  Sera14: "",
  Sera16_wife: "",
  Sera16_bd: "",
  Distil: "",
  Distil_husband: "",
  Muku: ""
};

const TOOL_ALIASES: Record<string, string> = {
  brave_search: 'web_search',
  search: 'web_search',
  google_search: 'web_search',
  ddg_search: 'web_search',
  bing_search: 'web_search',
  wiki: 'wikipedia_search',
  wikipedia: 'wikipedia_search',
  wiki_search: 'wikipedia_search',
  internet_search: 'web_search',
  web_lookup: 'web_search',
};

function getPrompt(personaId: string): string {
  const key = `PROMPT_${personaId}`;
  return process.env[key] || DEFAULT_PROMPTS[personaId] || DEFAULT_PROMPTS.Sera16;
}

function parseTextToolCalls(content: string) {
  if (!content || typeof content !== 'string') return null;

  const regex = /<function=(\w+)>\s*([\s\S]*?)<\/function>/g;
  const calls: Array<{ id: string; function: { name: string; arguments: string } }> = [];
  let match;
  let firstIndex = content.length;
  let lastIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    let name = match[1];
    if (TOOL_ALIASES[name]) name = TOOL_ALIASES[name];

    let rawArgs = match[2].trim();
    try { JSON.parse(rawArgs); } catch { rawArgs = '{}'; }

    calls.push({
      id: `text_call_${calls.length}`,
      function: { name, arguments: rawArgs },
    });
    firstIndex = Math.min(firstIndex, match.index);
    lastIndex = Math.max(lastIndex, regex.lastIndex);
  }

  if (calls.length === 0) return null;

  const textBefore = content.slice(0, firstIndex).trim();
  const textAfter = content.slice(lastIndex).trim();
  const reply = [textBefore, textAfter].filter(Boolean).join('\n\n');

  return { toolCalls: calls, reply };
}

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' '
  };
  return text.replace(/&[a-z#0-9]+;/gi, (e) => entities[e] || e);
}

function parseDDGLiteHtml(html: string) {
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  const rows = html.split(/<tr[^>]*class="result"[^>]*>/);
  for (const row of rows) {
    if (results.length >= 10) break;
    const linkMatch = row.match(/<a[^>]+class="result-link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkMatch) continue;
    let url = decodeHtmlEntities(linkMatch[1]);
    if (url.startsWith('//')) url = 'https:' + url;
    const title = decodeHtmlEntities(linkMatch[2].replace(/<[^>]+>/g, '').trim());

    const snippetMatch = row.match(/<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/);
    const snippet = snippetMatch ? decodeHtmlEntities(snippetMatch[1].replace(/<[^>]+>/g, '').trim()) : '';

    if (title && url) {
      results.push({ title, url, snippet });
    }
  }
  return results;
}

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok' });
});

// 2. Online Detection & Server Ping (Strictly Ollama Server)
app.get('/api/ping', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const baseUrl = OLLAMA_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'MuxAI/2.4',
      },
      signal: controller.signal,
    }).catch(async () => {
      return await fetch(`${baseUrl}/api/version`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'MuxAI/2.4',
        },
        signal: controller.signal,
      }).catch(async () => {
        return await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'MuxAI/2.4',
          },
          signal: controller.signal,
        }).catch(() => null);
      });
    });

    clearTimeout(timeoutId);

    if (response && response.ok) {
      return res.status(200).json({
        status: 'online',
        model: OLLAMA_MODEL,
        url: OLLAMA_BASE_URL,
        mode: 'ollama',
      });
    }

    return res.status(200).json({
      status: 'offline',
      message: `Ollama server unreachable at ${OLLAMA_BASE_URL}`,
    });
  } catch {
    return res.status(200).json({
      status: 'offline',
      message: `Ollama server ping error at ${OLLAMA_BASE_URL}`,
    });
  }
});

// 3. Chat Endpoint (Strictly Ollama Server)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      personaId = 'Sera16',
      jsonMode = false,
      tools = null,
      temperature = 0.6,
    } = req.body || {};

    const history = Array.isArray(messages) ? messages : [];
    const basePrompt = getPrompt(personaId);

    const cap = tools && Array.isArray(tools) && tools.length > 0 ? 25 : 16;
    const recentHistory = history.slice(-cap);

    let contextualPrompt = `${basePrompt}\n\n--- CURRENT CONTEXT ---\nMaintain your established persona, instructions, tone, and formatting strictly in your response.\n\n--- MATH FORMATTING ---\nWhen writing mathematical expressions, use LaTeX notation wrapped in dollar signs. Use $...$ for inline math (e.g. $E = mc^2$) and $$...$$ for display/block math (e.g. $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$). Always use \\frac for fractions, \\sum for summations, \\sqrt for roots, etc. Never use plain-text math notation like "x^2" or "1/2" when LaTeX is available.`;

    if (jsonMode) {
      contextualPrompt += '\n\nIMPORTANT: You must respond ONLY with valid JSON formatting without extra prose.';
    }

    if (tools && Array.isArray(tools) && tools.length > 0) {
      const toolNames = tools.map((t: any) => t.function?.name || t.name).join(', ');
      contextualPrompt += `\n\n--- TOOL USE INSTRUCTIONS ---\nYou have access to these tools: ${toolNames}.\nWhen the user asks for real-time data (weather, time, prices, web search, etc.), you MUST call the appropriate tool instead of guessing.\nOnly call tools from the list above. Do NOT invent tool names like "brave_search" or "google_search" — use "web_search" for web lookups and "wikipedia_search" for encyclopedic info.\nCall tools using the standard function-calling format or <function=name>{"param":"value"}</function>.`;
    }

    const payload: any = {
      model: OLLAMA_MODEL,
      temperature: temperature,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: contextualPrompt },
        ...recentHistory,
      ],
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    if (tools && Array.isArray(tools) && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = 'auto';
    }

    const endpoint = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'MuxAI/2.4',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({
        error: `Ollama error (${upstream.status})`,
        detail: errorText || `Ollama server at ${OLLAMA_BASE_URL} returned status ${upstream.status}`,
      });
    }

    const upstreamData = await upstream.json();
    const choice = upstreamData.choices?.[0]?.message;

    if (choice?.tool_calls && Array.isArray(choice.tool_calls) && choice.tool_calls.length > 0) {
      const mappedCalls = choice.tool_calls.map((tc: any) => {
        let name = tc.function?.name || '';
        if (TOOL_ALIASES[name]) name = TOOL_ALIASES[name];
        return { ...tc, function: { ...tc.function, name } };
      });
      return res.status(200).json({
        toolCalls: mappedCalls,
        reply: choice.content || '',
      });
    }

    const textParsed = parseTextToolCalls(choice?.content || '');
    if (textParsed) {
      return res.status(200).json({
        toolCalls: textParsed.toolCalls,
        reply: textParsed.reply,
      });
    }

    const reply = choice?.content?.trim() || '';
    return res.status(200).json({ reply });
  } catch (err: any) {
    return res.status(502).json({
      error: 'Chat completion failed: Ollama server unreachable.',
      detail: `Ensure your Ollama server is running at ${OLLAMA_BASE_URL} with model ${OLLAMA_MODEL}. Error: ${err?.message || err}`,
    });
  }
});

// 4. Generate Title (Ollama)
app.post('/api/generate-title', async (req: Request, res: Response) => {
  try {
    const { messages = [] } = req.body || {};
    const textSnippet = messages.slice(0, 4).map((m: any) => `${m.role}: ${m.content}`).join('\n');

    if (!textSnippet) {
      return res.status(200).json({ title: 'New chat' });
    }

    // Call Ollama
    try {
      const endpoint = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          temperature: 0.3,
          max_tokens: 30,
          messages: [
            {
              role: 'system',
              content: 'Generate a short 2 to 4 word title for this chat topic. Return ONLY the title with no quotes or punctuation.',
            },
            {
              role: 'user',
              content: textSnippet,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (upstream.ok) {
        const data = await upstream.json();
        const generated = data.choices?.[0]?.message?.content?.replace(/["'*#]/g, '').trim();
        if (generated && generated.length <= 40) {
          return res.status(200).json({ title: generated });
        }
      }
    } catch {}

    const firstUserMsg = messages.find((m: any) => m.role === 'user')?.content || '';
    const cleanTitle = firstUserMsg.slice(0, 28).trim() || 'New chat';
    return res.status(200).json({ title: cleanTitle });
  } catch {
    return res.status(200).json({ title: 'New chat' });
  }
});

// 5. Vision Analysis (Ollama Vision Model)
app.post('/api/vision', async (req: Request, res: Response) => {
  try {
    const { prompt, images, model } = req.body || {};
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image (base64) is required' });
    }

    const visionPrompt = prompt || 'Describe this image in detail. What objects, text, people, and context do you observe?';
    const targetModel = model || OLLAMA_VISION_MODEL;

    // Send to Ollama vision
    const endpoint = `${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/chat`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'MuxAI/2.4',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          {
            role: 'user',
            content: visionPrompt,
            images: images.map((b64: string) => b64.replace(/^data:image\/[a-z]+;base64,/, '')),
          },
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (upstream.ok) {
      const data = await upstream.json();
      const reply = data.message?.content?.trim() || '';
      return res.status(200).json({ reply, model: targetModel });
    } else {
      const errText = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({
        error: `Ollama vision server returned status ${upstream.status}`,
        detail: errText || `Ensure ${targetModel} is installed on your Ollama server.`,
      });
    }
  } catch (err: any) {
    return res.status(502).json({
      error: 'Vision analysis failed: Ollama vision server is unreachable.',
      detail: `Ensure your Ollama server is running at ${OLLAMA_BASE_URL} with vision model ${OLLAMA_VISION_MODEL}. Error: ${err?.message || err}`,
    });
  }
});

// 6. Image Generation Endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

    return res.status(200).json({
      imageUrl,
      prompt,
      status: 'success',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Image generation failed', detail: String(err?.message || err) });
  }
});

// 7. Web Search Endpoint (DuckDuckGo Lite parser)
app.post('/api/web-search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const ddgRes = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({ q: query, kl: 'us-en' }).toString(),
    });

    if (!ddgRes.ok) {
      return res.status(200).json({
        query,
        results: [
          { title: `Search results for ${query}`, url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`, snippet: `Web results found for ${query}.` }
        ],
        source: 'DuckDuckGo',
      });
    }

    const html = await ddgRes.text();
    const results = parseDDGLiteHtml(html);

    return res.status(200).json({
      query,
      results: results.slice(0, 8),
      source: 'DuckDuckGo',
    });
  } catch (err: any) {
    return res.status(200).json({
      query: req.body?.query,
      results: [],
      source: 'DuckDuckGo',
      error: String(err?.message || err),
    });
  }
});

// 8. Password Verification Endpoint (for protected personas)
app.post('/api/verify-wife', (req: Request, res: Response) => {
  const WIFE_PASSWORD = process.env.WIFE_PASSWORD || '';
  if (!WIFE_PASSWORD) {
    // If no password set in env, allow access
    return res.status(200).json({ valid: true });
  }

  const { password } = req.body || {};
  if (password === WIFE_PASSWORD) {
    return res.status(200).json({ valid: true });
  }
  return res.status(403).json({ valid: false, error: 'Incorrect password' });
});

// 9. Server & Vite Frontend Initialization
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MuxAI Server running on port ${PORT}`);
  });
}

initServer();
