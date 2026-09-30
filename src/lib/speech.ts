import { Persona, PersonaGender, VoiceProfile } from '../types';

// ============================================================================
// Text to Speech (Speech Synthesis) System
// ============================================================================

let currentUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Preload and cache available system voices
 */
function getSystemVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length > 0) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getSystemVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Determine if a voice name or URI matches female or male cues
 */
function voiceMatchesGender(voice: SpeechSynthesisVoice, gender: PersonaGender): boolean {
  const name = voice.name.toLowerCase();
  const uri = (voice.voiceURI || '').toLowerCase();
  const combined = `${name} ${uri}`;

  const femaleKeywords = [
    'female', 'woman', 'zira', 'samantha', 'karen', 'victoria', 'susan', 'fiona',
    'veena', 'serena', 'eva', 'olivia', 'moira', 'tessa', 'kate', 'allison', 'ava',
    'siri female', 'google us english female', 'catherine', 'helena', 'bangla', 'bengali'
  ];

  const maleKeywords = [
    'male', 'man', 'david', 'alex', 'daniel', 'fred', 'george', 'guy', 'mark',
    'tom', 'james', 'oliver', 'rishi', 'lee', 'aaron', 'microsoft david', 'siri male',
    'google uk english male'
  ];

  if (gender === 'female') {
    // If it contains explicit male indicator, reject
    if (maleKeywords.some((k) => combined.includes(k) && !combined.includes('female'))) {
      return false;
    }
    return femaleKeywords.some((k) => combined.includes(k));
  } else {
    // Male
    if (femaleKeywords.some((k) => combined.includes(k) && !combined.includes('male'))) {
      return false;
    }
    return maleKeywords.some((k) => combined.includes(k));
  }
}

/**
 * Select the best system voice for a given persona profile or gender
 */
export function getBestVoiceForPersona(persona?: Persona | null): SpeechSynthesisVoice | null {
  const voices = getSystemVoices();
  if (!voices || voices.length === 0) return null;

  const gender: PersonaGender = persona?.gender || persona?.voiceProfile?.gender || 'female';
  const preferredNames = persona?.voiceProfile?.preferredVoiceNames || [];
  const targetLang = persona?.voiceProfile?.lang;

  // 1. Try matching preferred voice names explicitly
  if (preferredNames.length > 0) {
    for (const pref of preferredNames) {
      const match = voices.find((v) => v.name.toLowerCase().includes(pref.toLowerCase()));
      if (match) return match;
    }
  }

  // 2. Try matching target language + gender
  if (targetLang) {
    const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase().slice(0, 2)));
    const genderAndLangMatch = langVoices.find((v) => voiceMatchesGender(v, gender));
    if (genderAndLangMatch) return genderAndLangMatch;
    if (langVoices.length > 0) return langVoices[0];
  }

  // 3. Match English system voices by gender
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const genderMatch = (englishVoices.length > 0 ? englishVoices : voices).find((v) => voiceMatchesGender(v, gender));
  if (genderMatch) return genderMatch;

  // 4. Default to first voice
  return englishVoices[0] || voices[0] || null;
}

/**
 * Clean markdown and symbols for clean spoken narration
 */
export function sanitizeTextForSpeech(text: string): string {
  return text
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove math dollar notations
    .replace(/\$\$[\s\S]*?\$\$/g, 'math equation')
    .replace(/\$([^$]+)\$/g, '$1')
    // Remove formatting symbols
    .replace(/[#*_~>]/g, '')
    // Replace multiple spaces / newlines
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Speak an AI persona message using Web Speech Synthesis API
 */
export function speakPersonaMessage(
  text: string,
  persona?: Persona | null,
  onEnd?: () => void,
  onError?: (err?: any) => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported in this browser.');
    return () => {};
  }

  // Stop any active speech
  stopSpeaking();

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voice = getBestVoiceForPersona(persona);
  if (voice) {
    utterance.voice = voice;
  }

  // Determine profile pitch and rate
  const gender: PersonaGender = persona?.gender || 'female';
  if (persona?.voiceProfile) {
    utterance.pitch = persona.voiceProfile.pitch;
    utterance.rate = persona.voiceProfile.rate;
  } else {
    // Custom persona default voice synthesis settings
    if (gender === 'female') {
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 0.92;
      utterance.rate = 1.0;
    }
  }

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    // User cancellations shouldn't be treated as critical failures
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      onError?.(e);
    } else {
      onEnd?.();
    }
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  return stopSpeaking;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

// ============================================================================
// Voice to Text (Web Speech Recognition API)
// ============================================================================

export interface SpeechRecognizerController {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

/**
 * Creates a SpeechRecognizer using the local browser Web Speech API
 */
export function createSpeechRecognizer(
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (errorMsg: string) => void
): SpeechRecognizerController {
  if (typeof window === 'undefined') {
    return {
      start: () => {},
      stop: () => {},
      isSupported: false,
    };
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      start: () => {
        onError('Speech Recognition is not supported by your current browser.');
      },
      stop: () => {},
      isSupported: false,
    };
  }

  let recognition: any = null;
  let isListening = false;

  const start = async () => {
    try {
      if (isListening && recognition) {
        recognition.stop();
      }

      // Proactively trigger the browser's native microphone permission prompt
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop media tracks immediately so SpeechRecognition can take over the device
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
            onError('Microphone permission denied. Please allow microphone access in your browser settings (click the lock or settings icon in the address bar).');
            onEnd();
            return;
          }
          // Continue in case browser delegates permission to SpeechRecognition
        }
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        isListening = true;
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onTranscript(text, Boolean(finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed') {
          onError('Microphone permission denied. Please allow microphone access in your browser settings (click the lock or settings icon in the address bar).');
        } else {
          onError(`Speech recognition error: ${event.error}`);
        }
        isListening = false;
        onEnd();
      };

      recognition.onend = () => {
        isListening = false;
        onEnd();
      };

      recognition.start();
    } catch (err: any) {
      isListening = false;
      onError(err?.message || 'Could not start microphone');
      onEnd();
    }
  };

  const stop = () => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch {}
    }
    isListening = false;
  };

  return {
    start,
    stop,
    isSupported: true,
  };
}
