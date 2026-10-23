import React, { useState } from 'react';
import {
  Grid,
  ExternalLink,
  Settings,
  Wifi,
  Bluetooth,
  Volume2,
  Sun,
  Shield,
  Smartphone,
  Sparkles,
  Search,
  MessageCircle,
  Video,
  Camera,
  Play,
  Scissors,
  Share2,
} from 'lucide-react';
import { APP_REGISTRY, SETTINGS_INTENTS, openAppOrLink, openSettingIntent } from '../utils/phoneIntents';
import { AppDeepLink } from '../types/assistant';

interface AppsTabProps {
  onAskInAppHelp: (appName: string, actionPrompt: string) => void;
}

export const AppsTab: React.FC<AppsTabProps> = ({ onAskInAppHelp }) => {
  const [selectedApp, setSelectedApp] = useState<AppDeepLink | null>(null);
  const [inAppActionText, setInAppActionText] = useState('');

  const appList = Object.values(APP_REGISTRY);

  const SETTINGS_SHORTCUTS = [
    { key: 'wifi' as const, label: 'Wi-Fi Settings', icon: <Wifi className="w-4 h-4 text-cyan-400" /> },
    { key: 'bluetooth' as const, label: 'Bluetooth Settings', icon: <Bluetooth className="w-4 h-4 text-blue-400" /> },
    { key: 'sound' as const, label: 'Sound & Volume', icon: <Volume2 className="w-4 h-4 text-emerald-400" /> },
    { key: 'display' as const, label: 'Display & Brightness', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { key: 'battery' as const, label: 'Battery Saver', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { key: 'apps' as const, label: 'App Permissions', icon: <Grid className="w-4 h-4 text-purple-400" /> },
  ];

  const handleLaunchApp = (app: AppDeepLink) => {
    openAppOrLink(app.id);
  };

  const handleExecuteInApp = (app: AppDeepLink, action: string) => {
    onAskInAppHelp(app.name, action);
  };

  const getInAppActions = (appId: string) => {
    switch (appId) {
      case 'youtube':
        return [
          'Search Urdu lo-fi chill beats',
          'Find trending tech podcasts',
          'Search viral video editing tutorials',
        ];
      case 'tiktok':
        return [
          'Generate viral trending sound ideas',
          'Hook scripts for 30s TikTok videos',
          'High reach hashtag strategy (#fyp)',
        ];
      case 'instagram':
        return [
          'Generate aesthetic Reels caption with tags',
          'Bio optimization for content creators',
          'DM outreach pitch template',
        ];
      case 'whatsapp':
        return [
          'Compose quick formal WhatsApp message',
          'Create announcement for WhatsApp group',
          'Professional follow-up note',
        ];
      case 'capcut':
      case 'inshot':
        return [
          'Step-by-step velocity beat-sync cut',
          'How to add trending glowing text & captions',
          '4K 60FPS export preset guidelines',
        ];
      default:
        return [
          `Search trending content inside ${selectedApp?.name}`,
          `Guide me through settings in ${selectedApp?.name}`,
        ];
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Apps & Phone Control
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            Android Intent Deep Links & Inside-App Automation
          </p>
        </div>
      </div>

      {/* Android System Settings Intent Direct Triggers */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          Android System Settings Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SETTINGS_SHORTCUTS.map((item) => (
            <button
              key={item.key}
              onClick={() => openSettingIntent(item.key)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-cyan-500/30 text-xs font-semibold text-gray-200 transition active:scale-95 text-left"
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-500">
          *Tapping opens the native Android OS system settings screen directly via intent URLs.
        </p>
      </div>

      {/* Installed Mobile Apps Grid */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          Application Launcher & Automation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {appList.map((app) => {
            const isSelected = selectedApp?.id === app.id;
            return (
              <div
                key={app.id}
                className={`relative rounded-2xl p-3 border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 neon-glow-cyan'
                    : 'bg-gray-900/90 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-cyan-400">
                    {app.id === 'youtube' && <Video className="w-5 h-5 text-red-500" />}
                    {app.id === 'tiktok' && <Play className="w-5 h-5 text-cyan-400" />}
                    {app.id === 'instagram' && <Camera className="w-5 h-5 text-pink-500" />}
                    {app.id === 'whatsapp' && <MessageCircle className="w-5 h-5 text-emerald-400" />}
                    {app.id === 'capcut' && <Scissors className="w-5 h-5 text-cyan-300" />}
                    {app.id === 'inshot' && <Video className="w-5 h-5 text-amber-400" />}
                    {['chrome', 'camera', 'gallery', 'facebook', 'snapchat', 'settings', 'maps', 'clock'].includes(app.id) && (
                      <Smartphone className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>

                  <button
                    onClick={() => handleLaunchApp(app)}
                    title={`Open ${app.name}`}
                    className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white transition active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-sm font-bold text-white mb-0.5">{app.name}</div>
                <div className="text-[11px] text-gray-400 line-clamp-1 mb-2">
                  {app.description}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLaunchApp(app)}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold text-center transition"
                  >
                    Launch
                  </button>
                  <button
                    onClick={() => setSelectedApp(isSelected ? null : app)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                      isSelected
                        ? 'bg-cyan-400 text-black border-cyan-400'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Actions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Inside-App Action Assistant Drawer */}
      {selectedApp && (
        <div className="rounded-2xl bg-gray-900 border border-cyan-500/40 p-4 shadow-xl animate-fade-in mb-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                Inside-App Assistant for {selectedApp.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedApp(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-gray-300 mb-3">
            Choose an automated action or ask NOVA to guide you step-by-step:
          </p>

          <div className="space-y-1.5 mb-3">
            {getInAppActions(selectedApp.id).map((actionText, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteInApp(selectedApp, actionText)}
                className="w-full text-left px-3 py-2 rounded-xl bg-gray-950/80 hover:bg-cyan-950/40 border border-gray-800 hover:border-cyan-500/30 text-xs text-gray-200 transition"
              >
                👉 {actionText}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inAppActionText}
              onChange={(e) => setInAppActionText(e.target.value)}
              placeholder={`Ask NOVA to do something inside ${selectedApp.name}...`}
              className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inAppActionText.trim()) {
                  handleExecuteInApp(selectedApp, inAppActionText.trim());
                  setInAppActionText('');
                }
              }}
            />
            <button
              onClick={() => {
                if (inAppActionText.trim()) {
                  handleExecuteInApp(selectedApp, inAppActionText.trim());
                  setInAppActionText('');
                }
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-900/40"
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
