# MuxAI — Privacy-First Conversational Intelligence & On-Device SLM Platform

MuxAI is a next-generation, local-first conversational AI web application featuring browser-based **Small Language Models (SLMs)** running client-side via WebGPU and WebAssembly, multimodal remote LLM connections, self-hosted Ollama server integration, and decentralized customization.

Derived, upgraded, and upscaled from the original open-source [Serafina web platform](https://github.com/dwmk/serafina) created by **Dewan Mukto**, MuxAI evolves that foundation into a full-stack, local-first intelligence environment with complete user data sovereignty.

---

## 🚀 Key Features & Architectural Highlights

### 1. 🧠 True On-Device Small Language Models (SLMs)
MuxAI executes quantized Small Language Models directly inside the user's browser sandbox using **Transformers.js**:
- **100% Offline & Private**: Zero prompt text or conversation history leaves the client device once weights are cached in browser `CacheStorage`.
- **Hardware Acceleration**: Automatically leverages **WebGPU** compute pipelines when supported, with seamless graceful fallback to multi-threaded **WebAssembly (WASM)** SIMD.
- **Live Hardware Telemetry**: Real-time measurement of Tokens per Second (tok/s), Time to First Token (TTFT in ms), total generation duration, and live token count.
- **Non-Destructive Interruption (`InterruptableStoppingCriteria`)**:
  - The send button transforms into an active red **X cross button** during real-time generation.
  - Users can force-stop output at any time.
  - **Safe Navigation & Auto-Commit**: Navigating away or creating a new chat immediately halts inference, saves whatever partial response was generated to browser storage, and sets the message as complete without data loss.

### 2. ⚡ Multimodal Remote LLMs & Ollama Server System
MuxAI connects with self-hosted and remote language model backends through a unified local proxy:
- **Self-Hosted Ollama Server Integration**:
  - Connects to local or remote Ollama instances (defaulting to `http://localhost:11434` or custom reverse-proxy / ngrok / Cloudflare Tunnel / VPS endpoints).
  - **Dynamic Model Discovery**: Queries Ollama's `/api/tags` endpoint to automatically detect installed models (e.g. Llama 3, Mistral, Qwen, Gemma, Phi, DeepSeek).
  - **Intelligent Vision Routing**: Auto-detects vision-capable models (e.g., `llava`, `llama3.2-vision`, `qwen2-vl`) to route multimodal image and diagram prompts.
  - **Server Diagnostics & Custom Configuration**: The in-app **Server Configuration Modal** enables live connectivity checks (`/api/ping` and `/api/health`), base URL overrides, round-trip latency checks, and model tag inspection.
- **Streaming SSE Chat**: Low-latency token streaming with markdown formatting, syntax-highlighted code blocks, and copy helpers.
- **Tool Calling Agent**: Automatic function calling for real-time external knowledge (Open-Meteo Weather, DuckDuckGo web search, CoinGecko crypto tickers, and Wikipedia summaries).
- **Structured JSON Mode**: Enforces strict JSON responses for developer and schema extraction workflows.
- **Multimodal File Attachments**: Client-side parsing for images, PDFs, Word documents (`.docx`), Excel spreadsheets (`.xlsx`), and code files with OCR / image analysis.

### 3. 🌐 MuxAI vs. Mainstream AI Platforms & Decentralized Data Ownership

#### Feature Matrix: MuxAI vs. Mainstream Cloud AI Platforms

| Feature / Dimension | **MuxAI** | **Mainstream Cloud Platforms** (ChatGPT, Gemini, Claude, Grok) |
| :--- | :--- | :--- |
| **In-Browser On-Device SLMs** | ✅ **Yes** — WebGPU / WASM execution right in the browser sandbox | ❌ **No** — Closed cloud servers only; all prompts are uploaded |
| **100% Offline Capability** | ✅ **Yes** — Fully functional offline after initial model weight cache | ❌ **No** — Constant high-speed internet connection required |
| **Self-Hosted Ollama Support** | ✅ **Yes** — Native auto-discovery of local/remote Ollama models | ❌ **No** — Locked to proprietary closed corporate cloud APIs |
| **Data Privacy & Zero Tracking** | ✅ **100% Client-Side** — Zero telemetry, tracking, or training scraping | ❌ **No** — Prompts logged and retained for model training unless opted out |
| **Account & Subscription Barrier** | ✅ **Zero Paywall / Free** — No account, email, or credit card needed | ❌ **Yes** — Mandatory accounts, phone verification, and paid tiers |
| **Decentralized Custom Personas** | ✅ **Full In-App Studio** — Create unlimited avatars, prompts, and settings | ⚠️ **Limited** — Cloud-tied GPTs/Gems restricted by corporate guardrails |
| **Dynamic Custom Theme Engine** | ✅ **Full Custom Styling** — Live CSS variable injection and custom palettes | ❌ **No** — Fixed light/dark modes with no customizable aesthetics |
| **Data Portability & Conflict Merge** | ✅ **Granular 3-Way Merge** — Single JSON export/import with conflict resolution | ⚠️ **Limited** — Bulk raw dump or Takeout without interactive merge tooling |
| **Live Hardware Telemetry** | ✅ **tok/s, TTFT, Token Count** — Real-time performance transparency | ❌ **Hidden** — Proprietary infrastructure metrics hidden from users |
| **Safe Interruption & Auto-Commit** | ✅ **Non-Destructive Stop** — Halts and commits partial output on navigation | ⚠️ **Fragile** — Stopping or navigating away often cancels or discards text |

#### Benefits of Decentralized Customization & Complete Data Ownership
MuxAI places conversational state and customization strictly in user custody:
- **Cloud Sovereignty**: All chat histories, custom personas, and themes are retained within the local browser sandbox (`localStorage` / `CacheStorage`), immune to remote outages, corporate data breaches, or commercial scraping.
- **Custom Persona Studio**: Configure custom personas with unique avatars, system prompts, reasoning guidelines, temperature preferences, and personalized greeting phrases.
- **Dynamic Theme Engine**: Tailor visual presentation through real-time CSS variable updates, custom accents, gradients, and typography hierarchies.
- **Data Transfer & Conflict Resolution**: Export all data into a clean, portable JSON bundle and import it with an interactive 3-way conflict resolver (*Keep Existing*, *Overwrite*, or *Keep Both*).

---

## 🛠️ Tech Stack & Libraries

| Domain | Technology / Library |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript |
| **Build System** | Vite 6 |
| **Styling & Design** | Tailwind CSS 4, CSS Variables, Glassmorphism UI |
| **Animation & Transitions** | Motion (`motion/react` / Framer Motion) |
| **On-Device Inference** | `@huggingface/transformers` (Transformers.js v3), ONNX Runtime Web |
| **Self-Hosted Inference** | Ollama API Proxy (`/api/tags`, `/api/chat`) |
| **Icons** | Lucide React |
| **Server & API Proxy** | Node.js, Express, `server.ts` |
| **PWA & Offline** | Web App Manifest, Service Worker CacheStorage |

---

## 🔌 API Endpoints & Interfaces

MuxAI provides an Express-based server proxy (`server.ts`) for secure external LLM calls, Ollama server routing, and system health diagnostics:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/chat` | `POST` | Core LLM streaming chat endpoint supporting messages, attachments, tools, and JSON mode (proxies Ollama / remote LLM). |
| `/api/models` | `GET` | Model enumeration returning active model name, context window limit, and capability flags. |
| `/api/health` | `GET` | Dev server and backend connectivity heartbeat probe. |
| `/api/ping` | `GET` | Latency and Ollama model provider verification endpoint. |
| `/api/title` | `POST` | Generates concise, context-aware chat session titles automatically. |
| `/api/generate-image` | `POST` | Multimodal text-to-image synthesis pipeline. |

---

## 🎨 UI/UX Design Principles

- **Unified Idle Experience**: The chat input maintains a clean, uniform placeholder (`"Type a message..."`) across all modes, models, and personas when idle, and transitions dynamically to `"Responding..."` during active generation.
- **In-Bubble Message Editing**: User messages feature a quick-action hover toolbar with **Copy**, **Edit**, and **Retry**. Clicking **Edit** opens an inline editor directly inside the user message bubble, and confirming changes automatically updates history and triggers a fresh AI response.
- **Responsive Mobile Telemetry**: On mobile screens (`< 640px`), the SLM status bar displays an uncluttered format showing strictly **Tokens/sec** and **Token Count** (e.g. `34.2 Tokens/sec, 95 Tokens`) alongside the active model badge.
- **Capability Isolation for SLMs**: When an on-device SLM persona is active, incompatible options (file attachments, structured JSON mode, external tool calling) are automatically hidden and disabled from the input panel, preventing user errors while keeping temperature and max-token sliders accessible.
- **Keyboard-First Workflow**: Full support for rapid interaction (`Enter` to send, `Shift+Enter` for newlines, `Esc` to cancel editing or dismiss modals).

---

## 📦 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- *(Optional)* [Ollama](https://ollama.com/) running locally (`ollama run llama3`) for local model hosting.

### Installation
```bash
# Clone the repository
git clone https://github.com/example/muxai-platform.git
cd muxai-platform

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server on port 3000
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build
```bash
# Compile and package application
npm run build

# Start production server
npm run start
```

---

## 📄 License & Credits
- **Parent Project**: Derived and upscaled from the [Serafina web platform](https://github.com/dwmk/serafina) by **Dewan Mukto**.
- **Character Lore & Personas**: Seraphina, Distil, and Muku are original characters (OCs) and intellectual properties (IPs) of **Dewan Mukto**.
- **Application Codebase**: Released under the Apache 2.0 / MIT Open-Source License.
