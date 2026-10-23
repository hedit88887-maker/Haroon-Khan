import React from 'react';
import { Mic, Camera, Bell, ShieldCheck, Sparkles } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onComplete }) => {
  if (!isOpen) return null;

  const handleGrant = async () => {
    // Attempt microphone and camera prompt
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // User or browser may deny or partially permit
    }

    // Attempt notification prompt
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch {}

    localStorage.setItem('nova_permissions_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gray-950 p-6 shadow-2xl neon-glow-cyan text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-white">Initialize NOVA</h2>
            <p className="text-xs text-cyan-400 font-mono">Personal AI Assistant Permissions</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-5 leading-relaxed">
          To provide instantaneous voice replies, live camera visual intelligence, and alarm notifications, NOVA requires standard device permissions:
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 rounded-xl bg-gray-900/90 p-3 border border-gray-800">
            <div className="mt-0.5 p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/20">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Voice & Microphone</div>
              <div className="text-xs text-gray-400">Tap-to-speak orb in Urdu, Hindi & English with wake word detection.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-gray-900/90 p-3 border border-gray-800">
            <div className="mt-0.5 p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Camera & Flashlight Torch</div>
              <div className="text-xs text-gray-400">Live OCR document scanning, object recognition, and hardware torch control.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-gray-900/90 p-3 border border-gray-800">
            <div className="mt-0.5 p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Alarms & Notifications</div>
              <div className="text-xs text-gray-400">Scheduled reminders, timer rings, and background alert chimes.</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGrant}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/40 hover:opacity-95 transition active:scale-98"
        >
          <ShieldCheck className="w-5 h-5" />
          Grant & Activate Assistant
        </button>

        <button
          onClick={() => {
            localStorage.setItem('nova_permissions_onboarded', 'true');
            onComplete();
          }}
          className="w-full mt-2 py-2 text-xs text-center text-gray-500 hover:text-gray-300"
        >
          Skip for now (some features will be restricted)
        </button>
      </div>
    </div>
  );
};
