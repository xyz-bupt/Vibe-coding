/**
 * VoidInput Component
 *
 * The minimal, centered input component for capturing thoughts.
 * Designed to be distraction-free with smooth animations.
 */

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';

interface VoidInputProps {
  /** Callback when user submits a thought */
  onSubmit: (content: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function VoidInput({
  onSubmit,
  placeholder = '你的闪念...',
  disabled = false,
}: VoidInputProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Submit the thought with smooth clear animation
  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting || isClearing) return;

    setIsSubmitting(true);
    onSubmit(trimmed);

    // Start clear animation
    setIsClearing(true);

    // Fade out and scale down
    setTimeout(() => {
      setContent('');
      setIsClearing(false);
      setIsSubmitting(false);

      // Re-focus after clear
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-8">
      <div
        className={`relative w-full max-w-2xl transition-all duration-300 ${
          isFocused ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Subtle glow effect when focused */}
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
            isFocused
              ? 'bg-purple-500/5 blur-xl scale-105'
              : 'bg-transparent blur-none scale-100'
          }`}
        />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          aria-label="闪念输入框"
          aria-describedby="keyboard-hint"
          className={`
            relative w-full min-h-[120px] p-6
            bg-transparent border-0 outline-none
            text-2xl text-zinc-300 placeholder:text-zinc-700
            text-center leading-relaxed
            resize-none overflow-hidden
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused ? 'text-zinc-100' : ''}
            ${isClearing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
          style={{
            textShadow: isFocused ? '0 0 30px rgba(255,255,255,0.1)' : 'none',
          }}
        />

        {/* Keyboard hint */}
        {content.length === 0 && !isClearing && (
          <div id="keyboard-hint" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-800 transition-opacity duration-300">
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
              Enter · 提交 &nbsp;|&nbsp; Shift + Enter · 换行
            </span>
          </div>
        )}
      </div>

      {/* Character count (subtle) */}
      {content.length > 0 && !isClearing && (
        <div className="mt-4 text-xs text-zinc-800 transition-opacity duration-300">
          {content.length} 字符
        </div>
      )}
    </div>
  );
}
