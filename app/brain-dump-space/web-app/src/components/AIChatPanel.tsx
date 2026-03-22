/**
 * AI Chat Panel - 极客聊天框
 *
 * 毛玻璃质感的悬浮面板，提供RAG驱动的AI对话功能。
 * 支持流式响应和极简Vibe设计。
 *
 * @module AIChatPanel
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { streamRAGResponse, isValidConfig } from '../services/ragChat';

/**
 * 聊天消息角色
 */
type MessageRole = 'user' | 'assistant';

/**
 * 聊天消息
 */
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

/**
 * LLM 配置
 */
interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 聊天面板组件属性
 */
interface AIChatPanelProps {
  /** 是否显示面板 */
  isOpen: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
}

/**
 * 生成空状态
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
    <svg
      className="w-12 h-12 mb-4 text-zinc-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
    <p className="text-sm">向你的AI助手提问</p>
    <p className="text-xs text-zinc-600 mt-2">
      基于你的闪念记录回答
    </p>
  </div>
);

/**
 * 主面板组件
 */
export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // 临时配置状态
  const [tempConfig, setTempConfig] = useState<LLMConfig>({
    apiUrl: '',
    apiKey: '',
    model: ''
  });

  // 当前有效配置
  const [effectiveConfig, setEffectiveConfig] = useState<LLMConfig | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 从localStorage加载配置
  useEffect(() => {
    const saved = localStorage.getItem('ai-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTempConfig(parsed);
        setEffectiveConfig(parsed);
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  // 添加欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是基于你的闪念记录的AI助手。问问我关于你过去的想法吧～'
      }]);
    }
  }, [isOpen, messages.length]);

  /**
   * 发送消息
   */
  const handleSend = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const currentConfig = effectiveConfig || tempConfig;
    if (!isValidConfig(currentConfig)) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '请先配置 API（点击右上角齿轮图标）\n\n支持 DeepSeek、通义千问等兼容 OpenAI 格式的 API。'
      }]);
      setIsConfigOpen(true);
      return;
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput
    };

    // 创建流式助手消息
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsLoading(true);

    // 聚焦回输入框
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      await streamRAGResponse(trimmedInput, currentConfig, {
        onChunk: (chunk) => {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.id === assistantMessage.id) {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + chunk }
              ];
            }
            return prev;
          });
        },
        onComplete: (fullText) => {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.id === assistantMessage.id) {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, content: fullText, isStreaming: false }
              ];
            }
            return prev;
          });
        },
        onError: (error) => {
          console.error('Chat error:', error);
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.id === assistantMessage.id) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: '抱歉，我遇到了一些问题。请检查API配置或稍后重试。',
                  isStreaming: false
                }
              ];
            }
            return prev;
          });
        }
      });

    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, effectiveConfig, tempConfig, messages]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /**
   * 保存配置
   */
  const handleSaveConfig = useCallback(() => {
    if (!tempConfig.apiUrl || !tempConfig.apiKey || !tempConfig.model) {
      alert('请填写完整的API配置');
      return;
    }
    setEffectiveConfig(tempConfig);
    setIsConfigOpen(false);
    localStorage.setItem('ai-config', JSON.stringify(tempConfig));
  }, [tempConfig]);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* 主面板 */}
      <div className="fixed right-0 top-0 bottom-0 w-96 max-w-[calc(100vw-2rem)] bg-zinc-950/80
                    backdrop-blur-xl border-l border-white/10 shadow-2xl z-50
                    flex flex-col">

        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-medium text-zinc-100">AI 助手</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="API配置"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 4.725 0 3.796-2.497 7-5.92 7-.39 0-.779-.073-1.154-.218a1.535 1.535 0 01-.363-1.106c.656-1.01 1.748-1.643 2.941-1.643 1.57 0 2.674.913 3.12 1.602.426.695.86 1.493.86 2.39H16c1.103 0 2-.897 2-2 0-.39-.157-.744-.4-1.072l-4-2.86c-.17-.121-.37-.182-.578-.182-.556 0-1.035.449-1.206 1.022l-.892 3.06c-.055.19-.12.376-.195.558a3.523 3.523 0 01-.562 1.956c-.736.828-1.822 1.336-2.949 1.336-.85 0-1.636-.295-2.206-.786-.585-.496-1.252-.716-1.945-.622-1.515-.182-2.836.534-3.605 1.254-.784.734-1.143 1.86-1.605 2.94-.054.133-.105.27-.154.408l-.195-.678a1.535 1.535 0 01-.363-1.106c.656-1.01 1.748-1.643 2.941-1.643 1.57 0 2.674.913 3.12 1.602.426.695.86 1.493.86 2.39H16c1.103 0 2-.897 2-2 0-.39-.157-.744-.4-1.072l-4-2.86z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="关闭"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'bg-zinc-800 text-zinc-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-zinc-500 ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题..."
              disabled={isLoading}
              rows={1}
              className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3
                       text-sm text-zinc-200 placeholder:text-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-zinc-600
                       focus:border-zinc-500 resize-none
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-lg
                       bg-zinc-700 text-zinc-300
                       hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
              title="发送 (Enter)"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-3 9-2-9-3 9-2 9-2 9-3 9-2-9-3 9-2 9z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
            <span>Shift + Enter 换行</span>
            {effectiveConfig ? (
              <span className="text-green-500">● 已配置</span>
            ) : (
              <span className="text-zinc-600">未配置 API</span>
            )}
          </div>
        </div>

        {/* 配置模态框 */}
        {isConfigOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-medium text-zinc-200 mb-4">API 配置</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">API 端点</label>
                  <input
                    type="text"
                    value={tempConfig.apiUrl}
                    onChange={(e) => setTempConfig({ ...tempConfig, apiUrl: e.target.value })}
                    placeholder="请输入 API 端点地址"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2
                             text-sm text-zinc-200 placeholder:text-zinc-500
                             focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">API Key</label>
                  <input
                    type="password"
                    value={tempConfig.apiKey}
                    onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                    placeholder="请输入 API Key"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2
                             text-sm text-zinc-200 placeholder:text-zinc-500
                             focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">模型名称</label>
                  <input
                    type="text"
                    value={tempConfig.model}
                    onChange={(e) => setTempConfig({ ...tempConfig, model: e.target.value })}
                    placeholder="请输入模型名称"
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2
                             text-sm text-zinc-200 placeholder:text-zinc-500
                             focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 rounded-lg text-sm bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
                >
                  保存
                </button>
              </div>

              <p className="text-xs text-zinc-500 mt-4 text-center">
                配置仅保存在本地浏览器中
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * 聊天按钮（悬浮）
 */
interface ChatToggleButtonProps {
  onClick: () => void;
  hasConfig: boolean;
}

export function ChatToggleButton({ onClick, hasConfig }: ChatToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-6 z-30 p-4 rounded-full
                   bg-zinc-900/80 backdrop-blur-xl border border-white/10
                   shadow-2xl hover:bg-zinc-800/80 transition-all
                   group"
      title="AI 助手"
    >
      <svg
        className="w-6 h-6 text-zinc-300 group-hover:text-zinc-100 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {hasConfig && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
      )}
    </button>
  );
}

export default AIChatPanel;
