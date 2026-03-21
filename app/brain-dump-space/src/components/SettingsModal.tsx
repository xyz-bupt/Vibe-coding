/**
 * SettingsModal Component
 *
 * Minimal settings dialog for API key configuration and preferences.
 */

import { useState, useRef, useEffect } from 'react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  /** Current settings */
  settings: AppSettings;
  /** Callback when settings are saved */
  onSave: (settings: AppSettings) => void;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Copy text to clipboard with visual feedback
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Input field with copy button
 */
function InputWithCopy({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'password',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = async () => {
    if (value) {
      const success = await copyToClipboard(value);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      // Paste not supported or denied
    }
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm text-zinc-400 block mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type={isVisible ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="px-3 py-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={copied ? '已复制!' : '复制'}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handlePaste}
          className="px-3 py-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
          title="粘贴"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        {type === 'password' && value && (
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="px-3 py-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
            title={isVisible ? '隐藏' : '显示'}
          >
            {isVisible ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsModal({ settings, onSave, isOpen, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    console.log('[SettingsModal] Saving settings - useRealAI:', localSettings.useRealAI);
    console.log('[SettingsModal] Model:', localSettings.modelName || 'default');
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-6 m-4 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-zinc-100">设置</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-4">
          {/* AI Provider Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <label htmlFor="useRealAI" className="text-sm text-zinc-300 block">
                使用真实 AI 分析
              </label>
              <p className="text-xs text-zinc-500 mt-1">
                启用后将使用大模型进行标签提取
              </p>
            </div>
            <button
              id="useRealAI"
              role="switch"
              aria-checked={localSettings.useRealAI}
              onClick={() => setLocalSettings({ ...localSettings, useRealAI: !localSettings.useRealAI })}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${localSettings.useRealAI ? 'bg-purple-600' : 'bg-zinc-700'}
              `}
            >
              <span
                className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                  ${localSettings.useRealAI ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* AI Status Indicator */}
          <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-500">当前模式:</span>
              <span className={`text-xs font-medium ${
                localSettings.useRealAI && (localSettings.openaiApiKey || localSettings.anthropicApiKey)
                  ? 'text-purple-400'
                  : 'text-zinc-400'
              }`}>
                {localSettings.useRealAI && (localSettings.openaiApiKey || localSettings.anthropicApiKey)
                  ? '🤖 AI 分析'
                  : '🔤 关键词匹配'
                }
              </span>
            </div>
            {localSettings.useRealAI && !(localSettings.openaiApiKey || localSettings.anthropicApiKey) && (
              <p className="text-xs text-yellow-500/80">
                ⚠️ 已开启 AI 分析但未配置 API Key，将使用关键词匹配
              </p>
            )}
            {!localSettings.useRealAI && (
              <p className="text-xs text-zinc-600">
                关键词匹配: python, java, react, vue, api, bug, 游泳, 跑步...
              </p>
            )}
          </div>

          {/* API URL */}
          <div>
            <label htmlFor="apiUrl" className="text-sm text-zinc-400 block mb-2">
              API 端点地址
            </label>
            <input
              id="apiUrl"
              type="url"
              value={localSettings.apiUrl || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
            />
            <p className="text-xs text-zinc-600 mt-1">自定义 API 端点 URL（可选）</p>
          </div>

          {/* Model Name */}
          <div>
            <label htmlFor="modelName" className="text-sm text-zinc-400 block mb-2">
              模型名称
            </label>
            <input
              id="modelName"
              type="text"
              value={localSettings.modelName || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
            />
            <p className="text-xs text-zinc-600 mt-1">
              常用模型: gpt-4o-mini, glm-4-flash, qwen-plus, deepseek-chat
            </p>
          </div>

          {/* OpenAI API Key */}
          <InputWithCopy
            id="openaiKey"
            label="OpenAI API Key"
            value={localSettings.openaiApiKey || ''}
            onChange={(value) => setLocalSettings({ ...localSettings, openaiApiKey: value })}
            placeholder="sk-..."
          />

          {/* Anthropic API Key */}
          <InputWithCopy
            id="anthropicKey"
            label="Anthropic API Key"
            value={localSettings.anthropicApiKey || ''}
            onChange={(value) => setLocalSettings({ ...localSettings, anthropicApiKey: value })}
            placeholder="sk-ant-..."
          />

          {/* Data Management */}
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3">数据管理</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = localStorage.getItem('brain-dump-thoughts');
                  if (data) {
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `brain-dump-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    // Clean up the object URL to prevent memory leaks
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                  }
                }}
                className="flex-1 px-3 py-2 text-xs text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                导出数据
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要清空所有闪念吗？此操作不可恢复。')) {
                    localStorage.removeItem('brain-dump-thoughts');
                    window.location.reload();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-950/50 transition-colors"
              >
                清空数据
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings button component for triggering the modal
 */
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-40 p-2 text-zinc-700 hover:text-zinc-400 transition-colors"
      aria-label="打开设置"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}
