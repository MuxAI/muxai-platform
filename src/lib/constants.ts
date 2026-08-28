import { Persona } from '../types';
import { loadCustomPersonas } from './storage';

export const REMOTE_IMAGE_PREFIX = '';

export const BASE_PERSONAS: Persona[] = [
  {
    id: 'Sera16',
    name: 'Seraphina v1.6',
    desc: 'The featured AI icon of MuxAI with unmatched intelligence and charisma',
    tag: '28F',
    role: 'Default All-Rounder',
    badgeColor: '#ec4899',
    greeting: "Hey there! I'm Seraphina. Ready to explore ideas, solve problems, or build something brilliant together?",
    avatarSeed: 'seraphina',
    systemPrompt: '',
  },
  {
    id: 'Sera16_wife',
    name: 'Seraphina (Wife)',
    desc: 'Your devoted, loving, and supportive virtual companion',
    tag: '28F',
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
    tag: '28F',
    role: 'Bengali Persona',
    badgeColor: '#059669',
    greeting: 'Arey, ki khobor! Kemon achen? Let me know what you want to talk about or work on today!',
    avatarSeed: 'seraphina-bd',
    systemPrompt: '',
  },
  {
    id: 'Sera14',
    name: 'Seraphina v1.4',
    desc: 'Classic version: gentle, patient, and detail-oriented',
    tag: '25F',
    role: 'Classic Companion',
    badgeColor: '#8b5cf6',
    greeting: 'Hello! Seraphina v1.4 ready to assist you with care, clarity, and thoughtful answers.',
    avatarSeed: 'seraphina-classic',
    systemPrompt: '',
  },
  {
    id: 'Distil',
    name: 'Distil v1',
    desc: 'Senior tech lead & architect ready to debug, optimize, and discuss systems',
    tag: '30M',
    role: 'Tech Lead',
    badgeColor: '#3b82f6',
    greeting: "Yo. Distil here. What stack are we working on today? Let's write some clean code.",
    avatarSeed: 'distil',
    systemPrompt: '',
  },
  {
    id: 'Distil_husband',
    name: 'Distil (Husband)',
    desc: 'Your protective, reliable, tech-savvy online husband',
    tag: '30M',
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
    tag: '??',
    role: 'Mysterious Person',
    badgeColor: '#d946ef',
    greeting: 'Greetings, traveler of spacetime! What wonders shall we weave across the cosmos today?',
    avatarSeed: 'muku',
    systemPrompt: '',
  },
];

export const PERSONAS = BASE_PERSONAS;

export function getAllPersonas(): Persona[] {
  const custom = loadCustomPersonas();
  return [...BASE_PERSONAS, ...custom];
}

export function getPersonaById(id: string): Persona {
  const all = getAllPersonas();
  return all.find((p) => p.id === id) || BASE_PERSONAS[0];
}

export function getPersonaImageUrl(personaId: string, type: 'logo' | 'portrait' = 'logo'): string {
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

