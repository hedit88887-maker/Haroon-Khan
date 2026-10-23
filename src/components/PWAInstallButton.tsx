import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-400 text-cyan-200 text-xs font-semibold shadow-md transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-400/40 text-indigo-300 text-xs font-semibold transition active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Install iOS
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-gray-950 border border-cyan-500/40 p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed space-y-2 mb-4">
              1. Tap Safari's <strong>Share</strong> button at bottom.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Launch NOVA directly as a standalone app!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 text-xs font-bold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
