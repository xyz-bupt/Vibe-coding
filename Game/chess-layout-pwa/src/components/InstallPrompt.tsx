import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      if (result.outcome === 'accepted') {
        console.log('用户接受安装提示');
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('安装失败:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 max-w-sm',
      'bg-white border border-gray-200 rounded-lg shadow-lg p-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            安装象棋教学应用
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            将应用安装到您的设备上，获得更好的学习体验
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          立即安装
        </button>
        <button
          onClick={handleDismiss}
          className="border border-gray-300 hover:border-gray-400 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          稍后再说
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;