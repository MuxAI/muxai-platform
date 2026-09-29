import { motion } from 'motion/react';
import { Cpu, DownloadCloud, Activity } from 'lucide-react';
import { SLMTelemetryData, DownloadProgressInfo } from '../lib/slmEngine';

interface SLMStatusBarProps {
  modelName: string;
  isDownloading: boolean;
  downloadProgress: DownloadProgressInfo | null;
  telemetry: SLMTelemetryData | null;
  isGenerating?: boolean;
}

export function SLMStatusBar({
  modelName,
  isDownloading,
  downloadProgress,
  telemetry,
  isGenerating = false,
}: SLMStatusBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="w-full px-4 py-1.5 mb-1 rounded-2xl themed-ai-bubble border shadow-md backdrop-blur-md text-xs select-none"
      style={{
        borderColor: 'color-mix(in srgb, var(--accent, #ec4899) 35%, transparent)',
      }}
    >
      {isDownloading && downloadProgress ? (
        <div className="flex flex-col gap-1 py-0.5">
          <div
            className="flex items-center justify-between text-[11px] font-medium"
            style={{ color: 'var(--accent, #ec4899)' }}
          >
            <span className="flex items-center gap-1.5 font-bold">
              <DownloadCloud size={13} className="animate-bounce" />
              Downloading {modelName}...
            </span>
            <span className="font-mono">
              {downloadProgress.percent}% ({downloadProgress.downloadedMB} MB / {downloadProgress.totalMB} MB)
            </span>
          </div>

          <div className="w-full h-1.5 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${downloadProgress.percent}%`,
                backgroundColor: 'var(--accent, #ec4899)',
              }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
          <div
            className="flex items-center gap-2 font-bold shrink-0"
            style={{ color: 'var(--accent, #ec4899)' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: 'var(--accent, #ec4899)',
                boxShadow: '0 0 8px var(--accent, #ec4899)',
              }}
            />
            <span className="flex items-center gap-1">
              <Cpu size={12} />
              <span className="hidden sm:inline">
                {modelName} (On-Device SLM)
              </span>
              <span className="inline sm:hidden truncate max-w-[100px]">
                {modelName}
              </span>
            </span>
          </div>

          {/* Telemetry Stats: On mobile devices, show only tokens/sec and token count info */}
          {telemetry && telemetry.tokenCount > 0 ? (
            <div
              className="text-right font-medium truncate"
              style={{ color: 'var(--accent, #ec4899)' }}
            >
              {/* Full details on desktop/tablet */}
              <span className="hidden sm:inline">
                {telemetry.tokensPerSec} Tokens/sec, {telemetry.ttftMs}ms TTFT, {telemetry.totalTimeSec}s Total Time, {telemetry.tokenCount} Token Count
              </span>
              {/* Mobile devices: only show tokens/sec and token count info */}
              <span className="inline sm:hidden font-mono font-bold">
                {telemetry.tokensPerSec} Tokens/sec, {telemetry.tokenCount} Tokens
              </span>
            </div>
          ) : (
            <div className="text-right opacity-60 text-[10px] flex items-center gap-1">
              <Activity
                size={11}
                className={isGenerating ? 'animate-spin' : 'opacity-60'}
                style={isGenerating ? { color: 'var(--accent, #ec4899)' } : {}}
              />
              <span className="hidden sm:inline">{isGenerating ? 'Computing on-device...' : 'Ready for local generation'}</span>
              <span className="inline sm:hidden">{isGenerating ? 'Computing...' : 'Ready'}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
