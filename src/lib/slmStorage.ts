// Persistent browser storage and runner helpers for on-device Small Language Models (SLMs)

const SLM_STORAGE_KEY_PREFIX = 'muxai_slm_downloaded_';

export function isSLMDownloaded(modelId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${SLM_STORAGE_KEY_PREFIX}${modelId}`) === 'true';
  } catch {
    return false;
  }
}

export function setSLMDownloaded(modelId: string, downloaded: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (downloaded) {
      localStorage.setItem(`${SLM_STORAGE_KEY_PREFIX}${modelId}`, 'true');
    } else {
      localStorage.removeItem(`${SLM_STORAGE_KEY_PREFIX}${modelId}`);
    }
  } catch {}
}

export function deleteSLMModel(modelId: string): void {
  setSLMDownloaded(modelId, false);
}

export interface SLMModelSpec {
  id: string;
  name: string;
  personaId: string;
  modelId: string;
  architecture: string;
  sizeString: string;
  sizeMB: number;
  description: string;
}

export const SLM_MODELS_LIST: SLMModelSpec[] = [
  {
    id: 'Sera11_mini',
    name: 'Serafina v1.1-mini',
    personaId: 'Sera11_mini',
    modelId: 'SmolLM2-135M-Instruct',
    architecture: 'SmolLM2 (135M)',
    sizeString: '135M (~145 MB)',
    sizeMB: 145,
    description: 'Ultra-compact on-device SLM based on SmolLM2-135M running completely inside your browser.',
  },
  {
    id: 'Sera12_mini',
    name: 'Serafina v1.2-mini',
    personaId: 'Sera12_mini',
    modelId: 'SmolLM2-360M-Instruct',
    architecture: 'SmolLM2 (360M)',
    sizeString: '360M (~375 MB)',
    sizeMB: 375,
    description: 'Agile & responsive on-device SLM based on SmolLM2-360M for everyday conversational tasks.',
  },
  {
    id: 'Distil05_mini',
    name: 'Distil v0.5-mini',
    personaId: 'Distil05_mini',
    modelId: 'Qwen2.5-0.5B-Instruct',
    architecture: 'Qwen2.5 (0.5B)',
    sizeString: '0.5B (~495 MB)',
    sizeMB: 495,
    description: 'Compact reasoning & coding SLM based on Qwen2.5-0.5B running on WebAssembly & client resources.',
  },
];

export function getSLMSpecByPersonaId(personaId: string): SLMModelSpec | undefined {
  return SLM_MODELS_LIST.find((m) => m.personaId === personaId);
}

export function getSLMSpecByModelId(modelId: string): SLMModelSpec | undefined {
  return SLM_MODELS_LIST.find((m) => m.modelId === modelId);
}
