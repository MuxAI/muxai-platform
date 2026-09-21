import { motion } from 'motion/react';
import {
  Loader2,
  CheckCircle2,
  Wrench,
  Brain,
  RefreshCw,
  CloudSun,
  Clock,
  Globe,
  Monitor,
  Coins,
  Search,
  BookOpen,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { ToolProgress } from '../types';

const TOOL_ICONS: Record<string, any> = {
  get_current_weather: CloudSun,
  get_current_time: Clock,
  get_ip_info: Globe,
  get_browser_info: Monitor,
  get_crypto_price: Coins,
  web_search: Search,
  wikipedia_search: BookOpen,
  generate_image: ImageIcon,
  analyze_image: Eye,
};

const TOOL_LABELS: Record<string, string> = {
  get_current_weather: 'Weather Forecast',
  get_current_time: 'Current Time & Zone',
  get_ip_info: 'Network & Location Info',
  get_browser_info: 'Browser Capabilities',
  get_crypto_price: 'Crypto Price Check',
  web_search: 'Live Web Search',
  wikipedia_search: 'Wikipedia Reference',
  generate_image: 'Image Generation',
  analyze_image: 'Vision Model Analysis',
};

export function ToolProgressDisplay({ progress }: { progress: ToolProgress }) {
  if (progress.phase === 'thinking') {
    return (
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium opacity-80">
        <Loader2 size={16} className="animate-spin text-pink-500" />
        <span>Thinking…</span>
      </div>
    );
  }

  if (progress.phase === 'thinking_after_tools') {
    return (
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium opacity-80">
        <Brain size={16} className="text-blue-500 animate-pulse" />
        <span>Synthesizing response from tools…</span>
      </div>
    );
  }

  if (progress.phase === 'processing_results') {
    return (
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium opacity-80">
        <RefreshCw size={16} className="animate-spin text-amber-500" />
        <span>Processing real-time data…</span>
      </div>
    );
  }

  if (progress.phase === 'calling_tools' && progress.tools) {
    return (
      <div className="flex flex-col gap-2 min-w-[200px] py-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90 text-pink-500">
          <Wrench size={14} />
          <span>Executing Live Tools</span>
        </div>
        <div className="space-y-1.5">
          {progress.tools.map((tool, i) => {
            const IconComponent = TOOL_ICONS[tool.name] || Wrench;
            const label = TOOL_LABELS[tool.name] || tool.name;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-xs sm:text-sm py-0.5"
              >
                {tool.status === 'done' ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : tool.status === 'executing' ? (
                  <Loader2 size={15} className="animate-spin text-blue-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current opacity-30 shrink-0" />
                )}

                <div className="flex items-center gap-1.5 truncate">
                  <IconComponent size={14} className="opacity-70" />
                  <span className="font-medium truncate">{label}</span>
                </div>

                {tool.status === 'executing' && (
                  <span className="text-[11px] italic text-blue-400 font-normal ml-auto">running</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
