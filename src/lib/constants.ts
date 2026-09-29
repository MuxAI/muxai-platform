import { Persona } from '../types';
import { loadCustomPersonas } from './storage';

export const REMOTE_IMAGE_PREFIX = '';

export const BASE_PERSONAS: Persona[] = [
  {
    id: 'Sera16',
    name: 'Seraphina v1.6',
    desc: 'The featured AI icon of MuxAI with unmatched intelligence and charisma',
    role: 'Virtual Consultant',
    badgeColor: '#ec4899',
    greeting: "Hey there! I'm Seraphina. Ready to explore ideas, solve problems, or build something brilliant together?",
    avatarSeed: 'seraphina',
    systemPrompt: '',
  },
  {
    id: 'Sera16_wife',
    name: 'Seraphina (Wife)',
    desc: 'Your devoted, loving, and supportive virtual companion',
    role: 'Virtual Wife',
    badgeColor: '#f43f5e',
    greeting: "Welcome home! I've been thinking about you. How has your day been going, darling?",
    avatarSeed: 'seraphina-wife',
    systemPrompt: '',
  },
  {
    id: 'Sera16_bd',
    name: 'Seraphina (Bengali)',
    desc: 'Warm Bengali cultural flair, hospitality, and bilingual wit',
    role: 'Bengali Consultant',
    badgeColor: '#059669',
    greeting: 'Arey, ki khobor! Kemon achen? Let me know what you want to talk about or work on today!',
    avatarSeed: 'seraphina-bd',
    systemPrompt: '',
  },
  {
    id: 'Sera14',
    name: 'Seraphina v1.4',
    desc: 'Classic version: gentle, patient, and detail-oriented',
    role: 'Classic Consultant',
    badgeColor: '#8b5cf6',
    greeting: 'Hello! Seraphina v1.4 ready to assist you with care, clarity, and thoughtful answers.',
    avatarSeed: 'seraphina-classic',
    systemPrompt: '',
  },
  {
    id: 'Distil',
    name: 'Distil v1',
    desc: 'Senior tech lead & architect ready to debug, optimize, and discuss systems',
    role: 'Tech Bro',
    badgeColor: '#3b82f6',
    greeting: "Yo. Distil here. What stack are we working on today? Let's write some clean code.",
    avatarSeed: 'distil',
    systemPrompt: '',
  },
  {
    id: 'Distil_husband',
    name: 'Distil (Husband)',
    desc: 'Your protective, reliable, tech-savvy online husband',
    role: 'Virtual Husband',
    badgeColor: '#0ea5e9',
    greeting: "Hey babe! I'm right here whenever you need me. Take a breath and tell me what's on your mind.",
    avatarSeed: 'distil-husband',
    systemPrompt: '',
  },
  {
    id: 'Muku',
    name: 'Muku v1',
    desc: 'Cosmic philosopher and playful enigma from another dimension',
    role: 'Mysterious Person',
    badgeColor: '#d946ef',
    greeting: 'Greetings, traveler of spacetime! What wonders shall we weave across the cosmos today?',
    avatarSeed: 'muku',
    systemPrompt: '',
  },
  {
    id: 'Sera11_mini',
    name: 'Serafina v1.1-mini',
    desc: 'Ultra-compact on-device SLM based on SmolLM2-135M running directly in browser',
    role: 'SmolLM2 (135M)',
    badgeColor: '#10b981',
    greeting: "Hello! I'm Serafina v1.1-mini, running on-device SmolLM2 (135M) completely inside your browser.",
    avatarSeed: 'serafina-11-mini',
    systemPrompt: 'You are Serafina v1.1-mini, an on-device SmolLM2 (135M) companion.',
    isSLM: true,
    slmModelId: 'SmolLM2-135M-Instruct',
    slmModelName: 'SmolLM2 (135M)',
    slmSize: '135M (~145 MB)',
    slmSizeBytes: 145 * 1024 * 1024,
  },
  {
    id: 'Sera12_mini',
    name: 'Serafina v1.2-mini',
    desc: 'Lightweight on-device SLM based on SmolLM2-360M with fast browser inference',
    role: 'SmolLM2 (360M)',
    badgeColor: '#06b6d4',
    greeting: "Greetings! I'm Serafina v1.2-mini, running SmolLM2 (360M) locally on your hardware.",
    avatarSeed: 'serafina-12-mini',
    systemPrompt: 'You are Serafina v1.2-mini, an on-device SmolLM2 (360M) companion.',
    isSLM: true,
    slmModelId: 'SmolLM2-360M-Instruct',
    slmModelName: 'SmolLM2 (360M)',
    slmSize: '360M (~375 MB)',
    slmSizeBytes: 375 * 1024 * 1024,
  },
  {
    id: 'Distil05_mini',
    name: 'Distil v0.5-mini',
    desc: 'Fast on-device reasoning and coding SLM based on Qwen2.5-0.5B',
    role: 'Qwen2.5-0.5B',
    badgeColor: '#8b5cf6',
    greeting: "Yo! Distil v0.5-mini online. Running Qwen2.5 (0.5B) directly in your browser.",
    avatarSeed: 'distil-05-mini',
    systemPrompt: 'You are Distil v0.5-mini, an on-device Qwen2.5 (0.5B) tech lead.',
    isSLM: true,
    slmModelId: 'Qwen2.5-0.5B-Instruct',
    slmModelName: 'Qwen2.5 (0.5B)',
    slmSize: '0.5B (~495 MB)',
    slmSizeBytes: 495 * 1024 * 1024,
  },
];

export const PERSONAS = BASE_PERSONAS;

export function getAllPersonas(): Persona[] {
  const custom = loadCustomPersonas();
  return [...BASE_PERSONAS, ...custom];
}

export function getPersonaById(id?: string | null): Persona | null {
  if (!id) return null;
  const all = getAllPersonas();
  return all.find((p) => p.id === id) || null;
}

export function getPersonaImageUrl(personaId?: string | null, type: 'logo' | 'portrait' = 'logo'): string {
  if (!personaId) {
    return type === 'portrait'
      ? `${REMOTE_IMAGE_PREFIX}/portrait_Sera16.png`
      : `${REMOTE_IMAGE_PREFIX}/logo_Sera16.png`;
  }
  const custom = loadCustomPersonas().find((p) => p.id === personaId);
  if (custom) {
    if (type === 'portrait' && custom.customPortrait) {
      return custom.customPortrait;
    }
    if (type === 'logo' && custom.customLogo) {
      return custom.customLogo;
    }
    if (custom.customPortrait) return custom.customPortrait;
    if (custom.customLogo) return custom.customLogo;
  }

  if (type === 'portrait') {
    return `${REMOTE_IMAGE_PREFIX}/portrait_${personaId}.png`;
  }
  return `${REMOTE_IMAGE_PREFIX}/logo_${personaId}.png`;
}

export function getMainLogoUrl(): string {
  return `${REMOTE_IMAGE_PREFIX}/logo.png`;
}

