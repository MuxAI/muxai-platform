import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Droplets,
  Zap,
  Check,
  X,
  Code2,
  Workflow,
  GraduationCap,
  ExternalLink,
  Bot,
  MessageSquare,
  Lock,
  ChevronRight,
  Sliders,
  Share2,
  Cloud,
  Headphones,
  Database,
  Terminal,
  Server,
  Layers,
  ChevronDown,
  ArrowDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { PERSONAS } from '../lib/constants';

interface LandingPageProps {
  onOpenChat: (personaId?: string) => void;
  activeTheme?: string;
}

export function LandingPage({ onOpenChat, activeTheme = 'classic-dark' }: LandingPageProps) {
  // Modal states
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [isOverbookedModalOpen, setIsOverbookedModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isDevApiModalOpen, setIsDevApiModalOpen] = useState(false);

  // Form input states
  const [academyEmail, setAcademyEmail] = useState('');
  const [academySubmitted, setAcademySubmitted] = useState(false);
  const [overbookedEmail, setOverbookedEmail] = useState('');
  const [overbookedSubmitted, setOverbookedSubmitted] = useState(false);
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessSubmitted, setBusinessSubmitted] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devSubmitted, setDevSubmitted] = useState(false);

  // Code snippet tab state for Developers section
  const [activeCodeTab, setActiveCodeTab] = useState<'bash' | 'typescript' | 'python'>('bash');

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="themed-bg themed-text w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth relative selection:bg-pink-500/20 selection:text-pink-300">
      {/* Dynamic Ambient Moving Gradient Aurora Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="themed-aurora-1 absolute -top-1/4 -left-1/4 w-[520px] h-[520px] sm:w-[720px] sm:h-[720px] rounded-full blur-[140px] animate-aurora-1" />
        <div className="themed-aurora-2 absolute top-1/3 -right-1/4 w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full blur-[140px] animate-aurora-2" />
        <div className="themed-aurora-3 absolute -bottom-1/4 left-1/3 w-[480px] h-[480px] sm:w-[680px] sm:h-[680px] rounded-full blur-[140px] animate-aurora-3" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="themed-grid-bg fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* Top Bar Navigation (Top Bar Contract: Zone 1 Wordmark, Zone 2 Single-line Links, Zone 3 Actions) */}
      <header className="sticky top-0 z-50 w-full border-b themed-header backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Single element wordmark & logo */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <Logo isMain size={32} />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                MuxAI
              </span>
            </div>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium opacity-80">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="hover:opacity-100 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap landing-body"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:opacity-100 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap landing-body"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="hover:opacity-100 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap landing-body"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('for-business')}
              className="hover:opacity-100 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap landing-body"
            >
              For Business
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('for-developers')}
              className="hover:opacity-100 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap landing-body"
            >
              For Developers
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChat()}
              style={{ backgroundColor: 'var(--accent)' }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md hover:opacity-95 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center gap-2 whitespace-nowrap"
            >
              <Bot size={16} />
              <span>AI Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* ========================================================================= */}
        {/* SECTION 1: HOME (HERO) */}
        {/* ========================================================================= */}
        <section id="home" className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Main Headline using Gt America Extended Custom */}
            <h1 className="landing-heading text-balance font-light text-slate-900 dark:text-white">
              Consumer AI that Cares
            </h1>

            {/* Subtitle using Satoshi Custom */}
            <p className="landing-body text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              MuxAI frees artificial intelligence from corporate restrictions, ratelimit paywalls, and water waste. Chat with personas or create your own. Even if main server is offline, use mini versions that run directly in your browser!
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {/* Primary Call to Action with resident characters in circular frames to the right */}
              <button
                type="button"
                onClick={() => onOpenChat()}
                style={{ backgroundColor: 'var(--accent)' }}
                className="pl-6 pr-3.5 py-2.5 sm:pl-7 sm:pr-4 sm:py-3 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3"
              >
                <span className="flex items-center gap-1.5">
                  <span>AI Chat</span>
                  <ArrowRight size={18} />
                </span>

                {/* Resident characters circular frames stack */}
                <div className="flex items-center -space-x-2 pl-2 border-l border-white/20">
                  {PERSONAS.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/80 overflow-hidden bg-black/20 shrink-0 shadow-xs flex items-center justify-center hover:scale-110 hover:z-10 transition-transform duration-150"
                      title={p.name}
                    >
                      <Logo personaId={p.id} size={28} />
                    </div>
                  ))}
                </div>
              </button>

              {/* Secondary AI Academy Button */}
              <button
                type="button"
                onClick={() => setIsAcademyModalOpen(true)}
                className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl font-semibold text-sm sm:text-base border border-slate-300 dark:border-slate-700 hover:border-pink-500/60 hover:scale-105 active:scale-95 themed-btn hover:themed-btn transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <GraduationCap size={18} className="text-pink-500" />
                <span>AI Academy</span>
              </button>
            </div>

            {/* Scroll for Info Vertical Animated Indicator */}
            <div className="pt-10 sm:pt-14 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
                title="Scroll for Info"
              >
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-pink-500 transition-colors">
                  Scroll for Info
                </span>
                <div className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-pink-500/70 group-hover:bg-pink-500/10 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all">
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  >
                    <ArrowDown size={18} className="text-slate-500 dark:text-slate-300 group-hover:text-pink-500 transition-colors" />
                  </motion.div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FEATURES & DETAILED COMPARISON TABLE */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="landing-heading text-balance text-slate-900 dark:text-white">
              Why MuxAI?
            </h2>
            <p className="landing-body text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
              Mainstream hyperscalers burn billions of gallons of fresh water cooling power-hungry data centers. MuxAI champions consumer sovereignty: run models directly in your browser or connect your local hardware.
            </p>
          </div>

          {/* Three Key Pillar Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-500/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Droplets size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                Climate & Water Conscious
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 landing-body leading-relaxed">
                Cloud giants consume millions of liters of fresh water daily to cool centralized GPU clusters. By leveraging your personal consumer hardware and client-side browser SLMs, MuxAI eliminates cloud cooling overhead.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:-translate-y-2 hover:shadow-2xl hover:border-pink-500/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-pink-500 transition-colors">
                Total Data Privacy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 landing-body leading-relaxed">
                Zero telemetry, zero prompt retention, and no corporate training logs. Your chat histories, files, and personas belong entirely to you, stored safely in your browser’s local IndexedDB storage.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:-translate-y-2 hover:shadow-2xl hover:border-purple-500/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-400 transition-colors">
                Zero Rate Limits & Free Forever
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 landing-body leading-relaxed">
                No hourly limits, no "You've reached your cap" popups, and no $20/month subscription traps for standard models. Talk, instruct, debate, and analyze with complete freedom.
              </p>
            </div>
          </div>

          {/* Full Comparison Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 text-slate-900 dark:text-white">
                  <th className="p-4 sm:p-5 font-bold w-1/3">Platform Capability</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 w-1/3">
                    Mainstream Cloud AI
                    <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      (ChatGPT, Gemini, Grok, Claude, DeepSeek)
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-extrabold text-pink-500 bg-pink-500/10 border-l border-r border-pink-500/20 w-1/3">
                    MuxAI Platform
                    <div className="text-[11px] font-normal text-pink-400/80">
                      (Sovereign Consumer & Browser Engine)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 landing-body">
                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    Environmental & Water Impact
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-rose-500 font-semibold mb-1">
                      <X size={15} /> Severe Water & Grid Depletion
                    </div>
                    Consumes millions of gallons of cooling water and high megawatt power daily across centralized data centers.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> Zero Water Cooling Waste
                    </div>
                    Runs directly on consumer hardware or inside the browser with WebGPU/Wasm, harnessing existing device cycles.
                  </td>
                </tr>

                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    In-Browser Execution (SLMs)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-rose-500 font-semibold mb-1">
                      <X size={15} /> Not Supported
                    </div>
                    All inference is locked to remote data centers requiring continuous high-bandwidth internet.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> 100% Offline Capable
                    </div>
                    Mini models (Serafina 0.5B, Distil 0.5B) run in-browser via Transformers.js with WebGPU acceleration.
                  </td>
                </tr>

                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    Privacy & Telemetry
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-amber-500 font-semibold mb-1">
                      <X size={15} /> Cloud Logged & Retained
                    </div>
                    Prompts and uploaded files subject to corporate moderation, training audits, and remote storage.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> 100% Client-Side Privacy
                    </div>
                    Data is stored in local IndexedDB. No external tracking, no telemetry, and zero prompt scrapers.
                  </td>
                </tr>

                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    Rate Limits & Paywalls
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-rose-500 font-semibold mb-1">
                      <X size={15} /> Strict Throttling
                    </div>
                    Hourly caps (e.g. 20-40 msgs/3hr), expensive $20-$200/mo subscriptions, and peak-hour queue delays.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> Unlimited Freedom
                    </div>
                    Zero artificial limits. Chat as much as your personal hardware allows, completely free forever.
                  </td>
                </tr>

                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    Persona Customization & Autonomy
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-amber-500 font-semibold mb-1">
                      <X size={15} /> Corporate Safety Guardrails
                    </div>
                    Rigid guardrails, sterile tone, and persistent corporate refusal disclaimers.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> Unconstrained Character Studio
                    </div>
                    Create custom personas, edit prompts, adjust temperature/parameters, and stage AI-to-AI duels.
                  </td>
                </tr>

                <tr className="hover:bg-pink-500/5 dark:hover:bg-pink-500/10 transition-colors duration-150 group">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    Self-Hosted Server Support
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-rose-500 font-semibold mb-1">
                      <X size={15} /> Closed Ecosystem
                    </div>
                    Proprietary closed APIs; cannot connect your own local Ollama, vLLM, or LM Studio backends.
                  </td>
                  <td className="p-4 sm:p-5 bg-pink-500/5 border-l border-r border-pink-500/20 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                      <Check size={15} /> Native Local Ollama / vLLM
                    </div>
                    One-click custom Ollama server config with automatic model discovery and ngrok tunnel support.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: PRICING (Free Unlimited vs Paid Beyond) */}
        {/* ========================================================================= */}
        <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="landing-heading text-balance text-slate-900 dark:text-white">
              Transparent, Sovereign Pricing
            </h2>
            <p className="landing-body text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              Full sovereign AI functionality is free forever. No forced subscriptions, no artificial barriers.
            </p>
          </div>

          {/* 2-Column Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan (Unlimited) */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-emerald-500/40 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 relative group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      Free Plan
                    </h3>
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mt-1">
                      Unlimited Sovereignty
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    Active Default
                  </span>
                </div>

                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ forever</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 landing-body">
                  Everything you need to interact with digital personas with zero message throttles and zero paywalls.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3 text-xs sm:text-sm">
                  {[
                    'Unlimited conversation messages & turns',
                    'In-browser on-device SLM execution (WebGPU/Wasm)',
                    'Connect custom local Ollama / vLLM servers',
                    'Full persona creator & custom prompt editor',
                    'Autonomous AI-to-AI Dialogue Duel Arena',
                    'Private DuckDuckGo Web Search & KaTeX Math',
                    'Local JSON / Markdown conversation export & import',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors cursor-default">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check size={13} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => onOpenChat()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all shadow-md"
                >
                  Launch Free Chat
                </button>
              </div>
            </div>

            {/* Paid Plan (Beyond) */}
            <div className="p-8 rounded-3xl border-2 border-pink-500/50 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-slate-900/40 backdrop-blur-xl flex flex-col justify-between shadow-2xl hover:shadow-pink-500/30 hover:border-pink-500 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 relative group">
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md group-hover:scale-105 transition-transform">
                Convenience Tier
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-pink-400 transition-colors">
                    Beyond
                  </h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-pink-400 mt-1">
                    Cloud Storage & Remote Sync
                  </div>
                </div>

                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$5</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ month</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 landing-body">
                  For users wanting encrypted cloud sync and remote convenience layered atop local sovereign AI.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3 text-xs sm:text-sm">
                  {[
                    'Everything included in Free (Unlimited)',
                    'Encrypted cloud storage for all conversations',
                    'Automated cross-device account data backups',
                    '1-Click public conversation sharing links',
                    'Dedicated 24/7 priority customer service',
                    'Priority sync queues for multi-device handoff',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:text-pink-400 transition-colors cursor-default">
                      <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                        <Check size={13} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => setIsOverbookedModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/25 active:scale-95 transition-all shadow-lg"
                >
                  Upgrade to Beyond ($5/mo)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: FOR BUSINESS */}
        {/* ========================================================================= */}
        <section id="for-business" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:scale-105 transition-transform cursor-default">
                <Workflow size={14} />
                <span>Enterprise Automation · Coming Soon</span>
              </div>

              <h2 className="landing-heading text-balance text-slate-900 dark:text-white">
                Upcoming: AI Automation Workflow Canvas
              </h2>

              <p className="landing-body text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                Design autonomous business pipelines on a visual graph. Connect specialized personas (legal analyst, tech reviewer, copywriter) with your internal enterprise APIs and databases—without sending confidential data into third-party cloud black boxes.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3 -mx-3 rounded-2xl border border-transparent hover:border-indigo-500/30 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 hover:translate-x-1.5 transition-all duration-200 cursor-default group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-200">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      Visual DAG Orchestrator
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 landing-body">
                      Drag and drop multi-agent steps. Trigger automated web searches, KaTeX report generation, and multi-persona reviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 -mx-3 rounded-2xl border border-transparent hover:border-indigo-500/30 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 hover:translate-x-1.5 transition-all duration-200 cursor-default group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-200">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      Air-Gapped Compliance (HIPAA / GDPR)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 landing-body">
                      Deploy directly on your company’s on-premise hardware clusters. Keep company data strictly within your own firewall.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(true)}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-indigo-500/30 flex items-center gap-2"
                >
                  <span>Request Business Pilot Access</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* n8n-like Visual Workflow Canvas Demo Card */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col">
              {/* n8n Canvas Top Header Toolbar */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-[11px]">
                    <Workflow size={14} />
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Workflows /</span>
                    <span className="font-bold text-slate-900 dark:text-white">Customer Support Router</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold text-[10px] hover:scale-105 transition-transform cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active (Live)</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-mono hover:border-slate-400 transition-colors cursor-default">
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* n8n Infinite Dot Matrix Canvas Grid Area */}
              <div className="relative p-5 sm:p-7 min-h-[360px] flex items-center justify-center overflow-x-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px]">
                {/* SVG Connecting Flow Bezier Curves with Animated Data Pulses */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="n8nGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Flow curve 1: Webhook to MuxAI Seraphina */}
                  <path
                    d="M 175 140 C 215 140, 225 140, 265 140"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    className="dark:stroke-slate-700"
                  />
                  <circle cx="220" cy="140" r="3.5" fill="#ec4899" className="animate-pulse" />

                  {/* Flow curve 2: Seraphina to Sovereign Vault */}
                  <path
                    d="M 455 140 C 495 140, 505 140, 545 140"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    className="dark:stroke-slate-700"
                  />
                  <circle cx="500" cy="140" r="3.5" fill="#3b82f6" className="animate-pulse" />
                </svg>

                {/* Nodes Layout Container */}
                <div className="relative z-10 flex items-center gap-8 sm:gap-11 min-w-[580px] py-4">
                  {/* NODE 1: Webhook Trigger (n8n orange node) */}
                  <div className="group relative w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl hover:border-orange-500/70 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
                    <div className="p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <Zap size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                            Trigger
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            Webhook Inbound
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                        POST /api/v1/inbound
                      </div>
                    </div>

                    {/* Output Handle */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-orange-500 shadow-sm group-hover:scale-125 transition-transform" />
                  </div>

                  {/* NODE 2: MuxAI Persona Node (n8n AI agent node) */}
                  <div className="group relative w-48 rounded-2xl border-2 border-pink-500/60 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl hover:border-pink-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
                    {/* Input Handle */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-pink-500 shadow-sm group-hover:scale-125 transition-transform" />

                    <div className="p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <Logo isMain size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                            MuxAI Agent
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            Seraphina v1.6
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Prompt:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Executive Support</span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[9px] text-emerald-500">
                          <span>Status:</span>
                          <span className="font-bold">200 OK (38ms)</span>
                        </div>
                      </div>
                    </div>

                    {/* Output Handle */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-pink-500 shadow-sm group-hover:scale-125 transition-transform" />
                  </div>

                  {/* NODE 3: Air-Gapped Database Sync Node */}
                  <div className="group relative w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl hover:border-blue-500/70 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
                    {/* Input Handle */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shadow-sm group-hover:scale-125 transition-transform" />

                    <div className="p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <Database size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                            Storage
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            Air-Gap Vault
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md truncate">
                        PostgreSQL (On-Prem)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* n8n Bottom Execution Metrics Footer */}
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Last run: <strong className="text-slate-700 dark:text-slate-200">Just now</strong></span>
                  <span>Execution time: <strong className="text-slate-700 dark:text-slate-200">42ms</strong></span>
                </div>
                <div className="text-[10px] font-mono text-pink-500 font-semibold">
                  Zero Data-Center Water Cooling
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: FOR DEVELOPERS */}
        {/* ========================================================================= */}
        <section id="for-developers" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Interactive Code Box */}
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 bg-slate-950 text-slate-100 shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 relative font-mono text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:scale-125 transition-transform cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:scale-125 transition-transform cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:scale-125 transition-transform cursor-pointer" />
                  <span className="ml-2 text-slate-400 text-[11px] hover:text-slate-200 transition-colors">api.ai.mux8.com/v1/chat/completions</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['bash', 'typescript', 'python'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-150 hover:scale-105 active:scale-95 ${
                        activeCodeTab === tab
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Contents */}
              <div className="overflow-x-auto text-[11px] leading-relaxed">
                {activeCodeTab === 'bash' && (
                  <pre className="text-emerald-400">
{`curl -X POST https://api.ai.mux8.com/v1/chat/completions \\
  -H "Authorization: Bearer mux_live_82f91a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "muxai-seraphina-1.6",
    "messages": [
      {"role": "system", "content": "Maintain philosophical depth."},
      {"role": "user", "content": "Explain quantum superposition."}
    ],
    "temperature": 0.6,
    "stream": true
  }'`}
                  </pre>
                )}

                {activeCodeTab === 'typescript' && (
                  <pre className="text-sky-300">
{`import OpenAI from "openai";

// Drop-in compatible with standard OpenAI SDK
const muxai = new OpenAI({
  apiKey: process.env.MUXAI_API_KEY,
  baseURL: "https://api.ai.mux8.com/v1",
});

const completion = await muxai.chat.completions.create({
  model: "muxai-distil-tech-1.0",
  messages: [{ role: "user", content: "Audit Redis cache clustering" }],
  stream: true,
});`}
                  </pre>
                )}

                {activeCodeTab === 'python' && (
                  <pre className="text-amber-300">
{`from openai import OpenAI

client = OpenAI(
    api_key="mux_live_...",
    base_url="https://api.ai.mux8.com/v1"
)

response = client.chat.completions.create(
    model="muxai-seraphina-1.6",
    messages=[{"role": "user", "content": "Hello Serafina!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`}
                  </pre>
                )}
              </div>
            </div>

            {/* Developer Section Copy */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:scale-105 transition-transform cursor-default">
                <Code2 size={14} />
                <span>Developer Platform · Coming Soon</span>
              </div>

              <h2 className="landing-heading text-balance text-slate-900 dark:text-white">
                Upcoming: MuxAI Developer APIs
              </h2>

              <p className="landing-body text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                Connect your web and mobile applications directly to MuxAI-hosted character models. We will provide ultra-low-latency, OpenAI-compatible streaming endpoints with guaranteed zero telemetry and zero prompt logging.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3 -mx-3 rounded-2xl border border-transparent hover:border-pink-500/30 hover:bg-pink-500/5 dark:hover:bg-pink-500/10 hover:translate-x-1.5 transition-all duration-200 cursor-default group">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-200">
                    <Terminal size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                      100% OpenAI Specification Compatible
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 landing-body">
                      No code rewrite necessary. Just point your existing OpenAI / LangChain / LlamaIndex `baseURL` to MuxAI.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 -mx-3 rounded-2xl border border-transparent hover:border-pink-500/30 hover:bg-pink-500/5 dark:hover:bg-pink-500/10 hover:translate-x-1.5 transition-all duration-200 cursor-default group">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-200">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                      Sub-50ms Time to First Token (TTFT)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 landing-body">
                      High-concurrency edge infrastructure engineered specifically for streaming conversational companion interfaces.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsDevApiModalOpen(true)}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Request API Early Access</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200"
          >
            <Logo isMain size={24} />
            <span className="font-bold text-slate-900 dark:text-white text-sm">MuxAI</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => scrollToSection('home')} className="hover:text-pink-500 hover:-translate-y-0.5 hover:scale-105 transition-all duration-150">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-pink-500 hover:-translate-y-0.5 hover:scale-105 transition-all duration-150">
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-pink-500 hover:-translate-y-0.5 hover:scale-105 transition-all duration-150">
              Pricing
            </button>
            <button onClick={() => scrollToSection('for-business')} className="hover:text-pink-500 hover:-translate-y-0.5 hover:scale-105 transition-all duration-150">
              Business
            </button>
            <button onClick={() => scrollToSection('for-developers')} className="hover:text-pink-500 hover:-translate-y-0.5 hover:scale-105 transition-all duration-150">
              Developers
            </button>
          </div>

          <div className="opacity-70 hover:opacity-100 transition-opacity">
            © HuanMux 2026
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: AI ACADEMY (Free Education Platform) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAcademyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl themed-modal border shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-pink-500">
                  <GraduationCap size={24} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    MuxAI Academy
                  </h3>
                </div>
                <button
                  onClick={() => setIsAcademyModalOpen(false)}
                  className="p-1 rounded-full opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 landing-body leading-relaxed">
                <p>
                  <strong>MuxAI Academy</strong> is our upcoming 100% free learning platform dedicated to teaching practical Artificial Intelligence and Machine Learning from the ground up without paywalls.
                </p>
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-zinc-500/10 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">Curriculum in Development:</div>
                  <ul className="list-disc pl-4 space-y-1 opacity-80">
                    <li>Transformer foundations & attention math from scratch</li>
                    <li>Quantization (GGUF, AWQ, WebGPU) on consumer laptops</li>
                    <li>Fine-tuning weights with LoRA on local hardware</li>
                    <li>Building sovereign, air-gapped agent loops</li>
                  </ul>
                </div>
                <p className="text-xs opacity-75">
                  Join the waitlist to receive free early access lessons as they launch:
                </p>
              </div>

              {academySubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                  Thank you! We've noted your interest and will notify you when free modules launch.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (academyEmail.trim()) setAcademySubmitted(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={academyEmail}
                    onChange={(e) => setAcademyEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border outline-none text-xs themed-input hover:border-pink-500/50 focus:border-pink-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pink-600 hover:bg-pink-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    Notify Me
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: PAID PLAN OVERBOOKED NOTICE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOverbookedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl themed-modal border shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-500">
                  <ShieldCheck size={24} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Currently Overbooked
                  </h3>
                </div>
                <button
                  onClick={() => setIsOverbookedModalOpen(false)}
                  className="p-1 rounded-full opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 landing-body leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs">
                  Notice: We are currently overbooked and not accepting new paid plan users at this time!
                </div>
                <p>
                  To preserve compute bandwidth and uninterrupted service quality for existing users, registrations for the $5/month Beyond Plan are temporarily paused.
                </p>
                <p>
                  <strong>Great news:</strong> The entire core MuxAI platform—including unlimited chat, browser SLMs, Ollama connectivity, and custom personas—remains 100% free and unlimited on your hardware!
                </p>
              </div>

              {overbookedSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                  You've been added to the priority waitlist! We will alert you the moment new Beyond slots open.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (overbookedEmail.trim()) setOverbookedSubmitted(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for the waitlist"
                    value={overbookedEmail}
                    onChange={(e) => setOverbookedEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border outline-none text-xs themed-input hover:border-amber-500/50 focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    Join Waitlist
                  </button>
                </form>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOverbookedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium themed-btn hover:scale-105 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: FOR BUSINESS EARLY ACCESS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBusinessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl themed-modal border shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Workflow size={24} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Enterprise Workflow Studio
                  </h3>
                </div>
                <button
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="p-1 rounded-full opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 landing-body">
                We are partnering with select enterprise teams to deploy air-gapped on-premise workflow pipelines. Leave your work email to schedule a tailored proof of concept.
              </p>

              {businessSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                  Request received! Our solutions team will follow up within 24 business hours.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (businessEmail.trim()) setBusinessSubmitted(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border outline-none text-xs themed-input hover:border-indigo-500/50 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    Request Demo
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: FOR DEVELOPERS API ACCESS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDevApiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl themed-modal border shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-pink-500">
                  <Code2 size={24} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Developer API Access
                  </h3>
                </div>
                <button
                  onClick={() => setIsDevApiModalOpen(false)}
                  className="p-1 rounded-full opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 landing-body">
                Join developers building conversational agents with OpenAI-compatible hosted endpoints for Seraphina, Distil, and custom fine-tunes.
              </p>

              {devSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                  Success! Your developer account has been queued for early API key provisioning.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (devEmail.trim()) setDevSubmitted(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="developer@domain.com"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border outline-none text-xs themed-input hover:border-pink-500/50 focus:border-pink-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pink-600 hover:bg-pink-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    Get API Key
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
