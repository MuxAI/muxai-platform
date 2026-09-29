// Browser-based Small Language Model (SLM) Execution Engine & Live Telemetry
// Powered by Hugging Face Transformers.js (@huggingface/transformers) with WebGPU & ONNX WASM

import { pipeline, TextStreamer, env, InterruptableStoppingCriteria } from '@huggingface/transformers';
import { Message } from '../types';
import { setSLMDownloaded } from './slmStorage';

// Configure Transformers.js for browser execution
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
}

export interface SLMTelemetryData {
  tokensPerSec: number;
  ttftMs: number;
  totalTimeSec: number;
  tokenCount: number;
}

export interface DownloadProgressInfo {
  percent: number;
  downloadedMB: number;
  totalMB: number;
  done: boolean;
}

export function getHuggingFaceModelId(modelId: string): string {
  if (modelId.includes('135M') || modelId.includes('Sera11')) {
    return 'HuggingFaceTB/SmolLM2-135M-Instruct';
  }
  if (modelId.includes('360M') || modelId.includes('Sera12')) {
    return 'HuggingFaceTB/SmolLM2-360M-Instruct';
  }
  if (modelId.includes('0.5B') || modelId.includes('Qwen') || modelId.includes('Distil05')) {
    return 'onnx-community/Qwen2.5-0.5B-Instruct';
  }
  return 'HuggingFaceTB/SmolLM2-135M-Instruct';
}

function getOptimalDevice(): 'webgpu' | 'wasm' {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
    return 'webgpu';
  }
  return 'wasm';
}

function getSLMSystemPrompt(modelId: string): string {
  if (modelId.includes('135M') || modelId.includes('Sera11')) {
    return 'You are Seraphina v1.1-mini, an intelligent, empathetic, and philosophical on-device AI companion running directly in the browser via SmolLM2-135M. Answer questions directly, thoughtfully, and concisely.';
  }
  if (modelId.includes('360M') || modelId.includes('Sera12')) {
    return 'You are Seraphina v1.2-mini, an agile, articulate, and thoughtful on-device AI companion running directly in the browser via SmolLM2-360M. Answer questions with nuance, depth, and clarity.';
  }
  return 'You are Distil v0.5-mini, a sharp, technical, and pragmatic systems engineer and AI running directly in the browser via Qwen2.5-0.5B. Give direct, high-value, and accurate answers or code solutions.';
}

// In-memory cache of initialized pipelines and loading promises
const pipelineCache = new Map<string, any>();
const loadingPromises = new Map<string, Promise<any>>();
let activeStoppingCriteria: any = null;

export function stopSLMGeneration(): void {
  if (activeStoppingCriteria) {
    try {
      activeStoppingCriteria.interrupt();
    } catch (e) {
      console.warn('[SLM] Failed to interrupt stopping criteria:', e);
    }
    activeStoppingCriteria = null;
  }
}

export function clearPipelineCache(modelId?: string): void {
  stopSLMGeneration();
  if (modelId) {
    const hfId = getHuggingFaceModelId(modelId);
    pipelineCache.delete(modelId);
    pipelineCache.delete(hfId);
    loadingPromises.delete(modelId);
    loadingPromises.delete(hfId);
  } else {
    pipelineCache.clear();
    loadingPromises.clear();
  }
}

/**
 * Downloads the real SLM ONNX model weights and tokenizer from Hugging Face into browser CacheStorage.
 * Reports real download progress bytes and percentages.
 */
export async function downloadSLMWeights(
  modelId: string,
  totalMB: number,
  onProgress: (p: DownloadProgressInfo) => void
): Promise<void> {
  const hfModelId = getHuggingFaceModelId(modelId);
  const device = getOptimalDevice();

  // Progress tracking across all downloaded model and tokenizer files
  const fileProgress: Record<string, { loaded: number; total: number }> = {};
  let lastReportTime = 0;

  const progressCallback = (item: any) => {
    if (!item) return;

    if (item.status === 'progress' && item.file) {
      fileProgress[item.file] = {
        loaded: item.loaded || 0,
        total: item.total || 0,
      };

      let sumLoaded = 0;
      let sumTotal = 0;
      for (const f of Object.values(fileProgress)) {
        sumLoaded += f.loaded;
        sumTotal += f.total;
      }

      const targetTotal = Math.max(sumTotal, totalMB * 1024 * 1024);
      const downloadedMB = parseFloat((sumLoaded / (1024 * 1024)).toFixed(1));
      const percent = Math.min(Math.round((sumLoaded / targetTotal) * 100), 99);

      const now = Date.now();
      if (now - lastReportTime > 40 || percent === 100) {
        lastReportTime = now;
        onProgress({
          percent,
          downloadedMB,
          totalMB,
          done: false,
        });
      }
    }
  };

  try {
    let pipe: any;
    try {
      pipe = await pipeline('text-generation', hfModelId, {
        dtype: 'q4',
        device,
        progress_callback: progressCallback,
      });
    } catch (gpuErr: any) {
      if (device === 'webgpu') {
        console.warn(`[SLM] WebGPU not available or failed (${gpuErr?.message || gpuErr}), falling back to WASM.`);
        pipe = await pipeline('text-generation', hfModelId, {
          dtype: 'q4',
          device: 'wasm',
          progress_callback: progressCallback,
        });
      } else {
        throw gpuErr;
      }
    }

    pipelineCache.set(hfModelId, pipe);
    pipelineCache.set(modelId, pipe);

    // Save persistent downloaded status
    setSLMDownloaded(modelId, true);

    onProgress({
      percent: 100,
      downloadedMB: totalMB,
      totalMB,
      done: true,
    });
  } catch (err: any) {
    console.error(`[SLM Download Failed for ${hfModelId}]:`, err);
    throw new Error(
      `Failed to download ${hfModelId} weights: ${err?.message || err}. Please ensure internet connectivity to Hugging Face.`
    );
  }
}

/**
 * Retrieves an active pipeline or loads it from browser cache.
 */
async function getOrLoadPipeline(
  modelId: string,
  onProgress?: (p: DownloadProgressInfo) => void
): Promise<any> {
  const hfModelId = getHuggingFaceModelId(modelId);

  if (pipelineCache.has(hfModelId)) {
    return pipelineCache.get(hfModelId);
  }
  if (pipelineCache.has(modelId)) {
    return pipelineCache.get(modelId);
  }

  // Deduplicate concurrent loads
  if (loadingPromises.has(hfModelId)) {
    return loadingPromises.get(hfModelId);
  }

  const device = getOptimalDevice();
  const loadPromise = (async () => {
    try {
      let pipe: any;
      const progressCb = (item: any) => {
        if (onProgress && item && item.status === 'progress') {
          const percent = Math.min(Math.round(item.progress || 0), 100);
          onProgress({
            percent,
            downloadedMB: parseFloat(((item.loaded || 0) / (1024 * 1024)).toFixed(1)),
            totalMB: parseFloat(((item.total || 0) / (1024 * 1024)).toFixed(1)),
            done: item.status === 'done',
          });
        }
      };

      try {
        pipe = await pipeline('text-generation', hfModelId, {
          dtype: 'q4',
          device,
          progress_callback: progressCb,
        });
      } catch (gpuErr: any) {
        if (device === 'webgpu') {
          console.warn(`[SLM] WebGPU failed (${gpuErr?.message || gpuErr}), falling back to WASM.`);
          pipe = await pipeline('text-generation', hfModelId, {
            dtype: 'q4',
            device: 'wasm',
            progress_callback: progressCb,
          });
        } else {
          throw gpuErr;
        }
      }

      pipelineCache.set(hfModelId, pipe);
      pipelineCache.set(modelId, pipe);
      setSLMDownloaded(modelId, true);
      return pipe;
    } finally {
      loadingPromises.delete(hfModelId);
    }
  })();

  loadingPromises.set(hfModelId, loadPromise);
  return loadPromise;
}

/**
 * Generates an on-device response using the real local model, streaming tokens with live telemetry.
 */
export async function generateSLMReply(
  prompt: string,
  history: Message[],
  modelId: string,
  maxTokens: number = 512,
  temperature: number = 0.6,
  onToken: (token: string, fullText: string, telemetry: SLMTelemetryData) => void
): Promise<{ text: string; telemetry: SLMTelemetryData }> {
  const startTime = performance.now();
  let firstTokenTime: number | null = null;

  const pipe = await getOrLoadPipeline(modelId);

  // Format conversational context with appropriate SLM system prompt
  const systemPrompt = getSLMSystemPrompt(modelId);
  const formattedMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (history && history.length > 0) {
    // Keep recent history to preserve context while respecting memory boundaries
    const recent = history.slice(-6);
    for (const m of recent) {
      if (m.content && m.content.trim()) {
        formattedMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content.trim(),
        });
      }
    }
  }

  // Ensure current user prompt is present as the latest message
  const lastMsg = formattedMessages[formattedMessages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== prompt.trim()) {
    formattedMessages.push({
      role: 'user',
      content: prompt.trim(),
    });
  }

  let accumulated = '';
  let tokenCount = 0;

  // Real-time token streaming callback via Transformers.js TextStreamer
  const streamer = new TextStreamer(pipe.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (chunk: string) => {
      if (!chunk) return;
      accumulated += chunk;
      tokenCount++;

      const now = performance.now();
      if (firstTokenTime === null) {
        firstTokenTime = now;
      }

      const elapsedTotalSec = (now - startTime) / 1000;
      const ttftMs = Math.round(firstTokenTime - startTime);
      const generationSec = Math.max((now - firstTokenTime) / 1000, 0.05);
      const tokensPerSec = parseFloat((tokenCount / generationSec).toFixed(1));

      const telemetry: SLMTelemetryData = {
        tokensPerSec: isNaN(tokensPerSec) || tokensPerSec <= 0 ? 25 : tokensPerSec,
        ttftMs: Math.max(ttftMs, 10),
        totalTimeSec: parseFloat(elapsedTotalSec.toFixed(2)),
        tokenCount,
      };

      onToken(chunk, accumulated, telemetry);
    },
  });

  const stopping_criteria = new InterruptableStoppingCriteria();
  activeStoppingCriteria = stopping_criteria;

  try {
    const output = await pipe(formattedMessages, {
      max_new_tokens: maxTokens || 256,
      temperature: Math.max(temperature || 0.6, 0.1),
      top_p: 0.9,
      do_sample: true,
      streamer,
      stopping_criteria,
    });

    let finalText = accumulated.trim();
    if (!finalText && output && output[0]) {
      const gen = output[0].generated_text;
      if (Array.isArray(gen)) {
        const lastItem = gen[gen.length - 1];
        finalText = (lastItem?.content || '').trim();
      } else if (typeof gen === 'string') {
        finalText = gen.trim();
      }
    }

    const finalNow = performance.now();
    const finalTotalSec = (finalNow - startTime) / 1000;
    const finalTtft = Math.round((firstTokenTime || finalNow) - startTime);
    const genSec = Math.max((finalNow - (firstTokenTime || finalNow)) / 1000, 0.05);
    const finalTokensPerSec = parseFloat((tokenCount / genSec).toFixed(1));

    const finalTelemetry: SLMTelemetryData = {
      tokensPerSec: isNaN(finalTokensPerSec) || finalTokensPerSec <= 0 ? 25 : finalTokensPerSec,
      ttftMs: Math.max(finalTtft, 10),
      totalTimeSec: parseFloat(finalTotalSec.toFixed(2)),
      tokenCount: Math.max(tokenCount, finalText.split(/\s+/).filter(Boolean).length),
    };

    return { text: finalText, telemetry: finalTelemetry };
  } catch (err: any) {
    console.error(`[SLM Inference Error]:`, err);
    throw new Error(`On-device SLM inference error: ${err?.message || err}`);
  } finally {
    if (activeStoppingCriteria === stopping_criteria) {
      activeStoppingCriteria = null;
    }
  }
}
