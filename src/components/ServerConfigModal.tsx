import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Download, X, Check, Globe } from 'lucide-react';
import { getServerConfig, saveServerConfig } from '../lib/storage';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function ServerConfigModal({ isOpen, onClose, onConfigSaved }: ServerConfigModalProps) {
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getServerConfig();
      setMode(cfg.mode);
      setCustomUrl(cfg.customUrl);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveServerConfig(mode, customUrl);
    onConfigSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md p-6 rounded-3xl themed-menu border shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Backend Server Settings</h3>
              <p className="text-xs opacity-60">Configure your primary AI model endpoint</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {/* Option 1: Default */}
            <label
              onClick={() => setMode('default')}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'default'
                  ? 'border-pink-500 bg-pink-500/10 font-semibold'
                  : 'border-inherit hover:bg-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="serverMode"
                  checked={mode === 'default'}
                  onChange={() => setMode('default')}
                  className="accent-pink-500 w-4 h-4"
                />
                <span className="text-sm">Default Server</span>
              </div>
              {mode === 'default' && <Check size={16} className="text-pink-400" />}
            </label>

            {/* Option 2: Custom URL */}
            <label
              onClick={() => setMode('custom')}
              className={`flex flex-col gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'custom'
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-inherit hover:bg-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="serverMode"
                    checked={mode === 'custom'}
                    onChange={() => setMode('custom')}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Custom Backend URL</span>
                </div>
                {mode === 'custom' && <Check size={16} className="text-pink-400" />}
              </div>

              {mode === 'custom' && (
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="relative flex items-center">
                    <Globe size={16} className="absolute left-3 text-pink-400 opacity-70" />
                    <input
                      type="url"
                      placeholder="https://your-ngrok-or-server.ngrok-free.app"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/20 bg-black/30 text-xs font-mono outline-none focus:border-pink-500"
                    />
                  </div>
                  <p className="text-[10px] opacity-60 mt-1.5">
                    Saved in persistent browser storage for future sessions.
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Download IPYNB Link */}
          <div className="mb-6 pt-3 border-t border-inherit text-center">
            <p className="text-xs opacity-75 mb-1">Want to host the server on your own?</p>
            <a
              href="/muxai_backend_runner.ipynb"
              download
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 hover:underline"
            >
              <Download size={13} />
              Download this ipynb file.
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-all"
            >
              Save Endpoint
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}