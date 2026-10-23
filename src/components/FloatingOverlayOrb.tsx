import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface FloatingOverlayOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

export const FloatingOverlayOrb: React.FC<FloatingOverlayOrbProps> = ({
  isListening,
  isSpeaking,
  onClick,
}) => {
  return (
    <div className="fixed right-4 bottom-24 z-40 animate-fade-in">
      <button
        onClick={onClick}
        aria-label="Activate NOVA Assistant"
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
          isListening
            ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg scale-105'
            : isSpeaking
            ? 'bg-cyan-500 shadow-cyan-500/50 shadow-lg animate-pulse'
            : 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-cyan-500/30 shadow-md hover:scale-105'
        }`}
      >
        {/* Animated aura ring */}
        <span
          className={`absolute -inset-1.5 rounded-full border border-cyan-400/50 ${
            isListening ? 'animate-ping opacity-75 border-emerald-400' : 'animate-pulse opacity-40'
          }`}
        />

        {isListening ? (
          <Mic className="w-6 h-6 text-black animate-bounce" />
        ) : isSpeaking ? (
          <Sparkles className="w-6 h-6 text-white animate-spin" />
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="text-xs font-black tracking-widest text-white drop-shadow">
              NOVA
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
