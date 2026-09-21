export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_current_weather',
      description: 'Get current weather conditions, temperature, humidity, wind, and forecast for any city or location. Use this when the user asks about weather.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City or location name, e.g. "Tokyo", "London", "New York"' },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get accurate date, time, and timezone information. Defaults to user local timezone or specific IANA timezone.',
      parameters: {
        type: 'object',
        properties: {
          timezone: { type: 'string', description: 'Optional IANA timezone identifier, e.g. "America/New_York", "Asia/Tokyo", "Europe/London"' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ip_info',
      description: 'Get geolocation and ISP network information about the current user connection.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_browser_info',
      description: 'Get details on browser engine, operating system, screen dimensions, device capabilities, and platform specs.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_crypto_price',
      description: 'Get the live spot price of a cryptocurrency (BTC, ETH, SOL, DOGE, etc.) in USD.',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency ticker symbol, e.g. "BTC", "ETH", "SOL", "DOGE"' },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the live web for recent news, articles, facts, websites, and query answers.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query to look up on the web' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'wikipedia_search',
      description: 'Search Wikipedia articles and encyclopedic summaries for people, scientific concepts, historical events, places, and technology.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Topic or term to search on Wikipedia' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate or render an image or artwork from a visual prompt.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Detailed visual description of the image to generate' },
        },
        required: ['prompt'],
      },
    },
  },
];

export function getBrowserInfo() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return null;
  const nav = navigator;
  const scr = window.screen;
  return {
    browser: getBrowserName(nav.userAgent),
    os: getOS(nav.userAgent, nav.platform),
    language: nav.language,
    online: nav.onLine,
    cpu_cores: nav.hardwareConcurrency || 'N/A',
    screen: {
      width: scr?.width,
      height: scr?.height,
      pixel_ratio: window.devicePixelRatio,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function getBrowserName(ua: string) {
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  return 'Web Browser';
}

function getOS(ua: string, platform: string) {
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return platform || 'Unknown OS';
}

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky ☀️', 1: 'Mainly clear 🌤️', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️',
  45: 'Fog 🌫️', 48: 'Depositing rime fog 🌫️',
  51: 'Light drizzle 🌦️', 53: 'Moderate drizzle 🌧️', 55: 'Dense drizzle 🌧️',
  61: 'Slight rain 🌧️', 63: 'Moderate rain 🌧️', 65: 'Heavy rain 🌧️',
  71: 'Slight snow 🌨️', 73: 'Moderate snow 🌨️', 75: 'Heavy snow ❄️',
  80: 'Rain showers 🌦️', 81: 'Heavy showers 🌧️', 82: 'Violent showers ⛈️',
  95: 'Thunderstorm ⛈️', 96: 'Thunderstorm with hail ⛈️',
};

export async function executeTool(name: string, args: any = {}, browserInfo: any = null): Promise<string> {
  try {
    let result: any;
    switch (name) {
      case 'get_current_weather':
        result = await executeWeather(args.location);
        break;
      case 'get_current_time':
        result = executeTime(args.timezone, browserInfo);
        break;
      case 'get_ip_info':
        result = await executeIpInfo();
        break;
      case 'get_browser_info':
        result = browserInfo || getBrowserInfo() || { error: 'Browser info unavailable' };
        break;
      case 'get_crypto_price':
        result = await executeCryptoPrice(args.symbol);
        break;
      case 'web_search':
        result = await executeWebSearch(args.query);
        break;
      case 'wikipedia_search':
        result = await executeWikipediaSearch(args.query);
        break;
      case 'generate_image':
        result = await executeGenerateImage(args.prompt);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
    }
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  } catch (err: any) {
    return JSON.stringify({ error: String(err?.message || err) });
  }
}

async function executeGenerateImage(prompt: string) {
  if (!prompt) return { error: 'Prompt is required' };
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) return { error: 'Image generation failed' };
  const data = await res.json();
  return {
    status: 'success',
    result: `![${prompt}](${data.imageUrl})`,
    message: `Image generated successfully: ![${prompt}](${data.imageUrl})`,
  };
}

async function executeWeather(location: string) {
  if (!location) return { error: 'Location is required' };
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) return { error: 'Failed to find location' };
  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) return { error: `Location "${location}" not found` };

  const place = geoData.results[0];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&temperature_unit=celsius&wind_speed_unit=kmh`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) return { error: 'Failed to fetch weather data' };
  const weatherData = await weatherRes.json();

  const w = weatherData.current;
  return {
    location: `${place.name}, ${place.country || ''}`,
    temperature: `${w.temperature_2m}°C`,
    feels_like: `${w.apparent_temperature}°C`,
    humidity: `${w.relative_humidity_2m}%`,
    wind_speed: `${w.wind_speed_10m} km/h`,
    condition: WMO_CODES[w.weather_code] || 'Clear',
    recorded_at: w.time,
  };
}

function executeTime(timezone?: string, browserInfo?: any) {
  const tz = timezone || browserInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  try {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(now);

    return {
      timezone: tz,
      current_time: formatted,
      iso_timestamp: now.toISOString(),
    };
  } catch {
    return { error: `Invalid timezone: ${tz}` };
  }
}

async function executeIpInfo() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (!res.ok) return { error: 'Failed to fetch IP information' };
    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      isp: data.connection?.isp,
      timezone: data.timezone?.id,
    };
  } catch {
    return { status: 'Direct network info unavailable' };
  }
}

async function executeCryptoPrice(symbol: string) {
  if (!symbol) return { error: 'Symbol is required' };
  const sym = symbol.toUpperCase().replace('USD', '').trim();
  const res = await fetch(`https://api.coinbase.com/v2/prices/${sym}-USD/spot`);
  if (!res.ok) return { error: `Could not retrieve crypto price for ${sym}` };
  const data = await res.json();
  return {
    symbol: sym,
    price_usd: `$${parseFloat(data.data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    currency: 'USD',
    source: 'Coinbase Spot API',
  };
}

async function executeWebSearch(query: string) {
  if (!query) return { error: 'Query is required' };
  const res = await fetch('/api/web-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return { error: 'Web search failed' };
  const data = await res.json();
  return {
    query,
    results: data.results || [],
    source: data.source || 'DuckDuckGo',
  };
}

async function executeWikipediaSearch(query: string) {
  if (!query) return { error: 'Query is required' };
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return { error: 'Wikipedia lookup failed' };
  const searchData = await searchRes.json();
  const searchResults = searchData.query?.search;
  if (!searchResults || searchResults.length === 0) return { query, error: 'No Wikipedia article found.' };

  const title = searchResults[0].title;
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) return { error: 'Failed to fetch Wikipedia summary' };
  const summaryData = await summaryRes.json();

  return {
    query,
    title: summaryData.title,
    summary: summaryData.extract,
    url: summaryData.content_urls?.desktop?.page,
    thumbnail: summaryData.thumbnail?.source || null,
  };
}
