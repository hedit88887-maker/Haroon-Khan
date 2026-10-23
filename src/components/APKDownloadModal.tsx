import React from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Zap,
  Play,
  Package,
} from 'lucide-react';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
  isInstallable: boolean;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOpenAppsGeyser = () => {
    window.open('https://appsgeyser.com/create-url-app/', '_blank');
  };

  const handleOpenPlayStore = () => {
    window.open('https://play.google.com/store/search?q=website+to+apk&c=apps', '_blank');
  };

  const handleDirectDownload = () => {
    window.location.href = '/api/download-app';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-gray-950 p-6 shadow-2xl neon-glow-cyan text-left my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/30 text-cyan-400">
              <Package className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Direct Download & Install</h2>
              <p className="text-xs text-cyan-400 font-mono">Mobile File Download & Options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {/* Direct File Download Card */}
          <div className="rounded-2xl bg-cyan-950/50 border border-cyan-400/50 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
                1-Click Direct File Download
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Direct
              </span>
            </div>

            <p className="text-xs text-gray-200 mb-3 leading-relaxed">
              Is button ko dabate hi aapke mobile mein <strong>NOVA AI Assistant ka poora Mobile Package</strong> foran download folder mein save ho jayega:
            </p>

            <button
              onClick={handleDirectDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-cyan-900/50 transition active:scale-95"
            >
              <Download className="w-4 h-4" /> 📥 Direct Download Mobile Package (.ZIP)
            </button>
          </div>
          {/* Rasta 1: Play Store Web2APK App (Direct Mobile Se APK) */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-cyan-950/40 border border-emerald-500/40 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Rasta 1: Play Store Se Direct APK Banayein (Sab se aasan)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                100% Working
              </span>
            </div>

            <p className="text-xs text-gray-200 mb-3 leading-relaxed">
              Agar aapko seedha <strong>.apk file</strong> chahiye jo mobile me install ho:
            </p>

            <div className="space-y-2 bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-xs text-gray-300 mb-3">
              <p>1. Play Store se <strong>"Website to APK"</strong> ya <strong>"Web2Apk"</strong> app download karein.</p>
              <p>2. App mein App Name <strong>"NOVA AI"</strong> likhein aur link daal kar <strong>"Build APK"</strong> dabayein.</p>
              <p>3. Aapke mobile ke Download folder mein <strong>asli APK file</strong> ban kar aa jayegi!</p>
            </div>

            <button
              onClick={handleOpenPlayStore}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-900/40 transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4" /> Open Play Store (Website to APK Apps)
            </button>
          </div>

          {/* Rasta 2: AppsGeyser (Direct Mobile APK Download) */}
          <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Rasta 2: AppsGeyser 1-Click APK Generator
              </span>
            </div>

            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              Mobile browser se direct bina coding ke APK download karne ke liye:
            </p>

            <button
              onClick={handleOpenAppsGeyser}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition active:scale-95"
            >
              <Download className="w-4 h-4" /> Open AppsGeyser (Direct APK Maker)
            </button>
          </div>

          {/* Rasta 3: Create Shortcut Fix */}
          <div className="rounded-2xl bg-cyan-950/30 border border-cyan-500/30 p-4 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block mb-1">
              Rasta 3: Pehle Screenshot Ka Sahi Tareeqa
            </span>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Aapke screenshot mein 2 options aayi theen:
            </p>
            <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 text-xs text-gray-200 space-y-1">
              <div>❌ <em>This app is already installed</em> (Yeh Google AI Studio tha)</div>
              <div>✅ <strong>Create shortcut</strong> (Yeh NOVA tha!)</div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Chrome ke 3 dots (⋮) daba kar agar aap <strong>"Create shortcut"</strong> chunein ge toh foran aapke mobile par app icon ban jaye ga!
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition"
          >
            Band karein
          </button>
        </div>
      </div>
    </div>
  );
};
