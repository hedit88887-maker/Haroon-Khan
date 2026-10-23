import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Radio,
  Send,
  Camera,
  Play,
  Copy,
  Check,
  Sparkles,
  Layers,
  StopCircle,
  Download,
} from 'lucide-react';
import { ChatMessage, DeviceStatus, AssistantLanguage, ToolCall } from '../types/assistant';
import { sounds } from '../utils/audioAlarm';

interface CoreTabProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (val: string) => void;
  onSendMessage: (text: string) => void;
  onExecuteTool: (tool: ToolCall) => void;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  transcript: string;
  language: AssistantLanguage;
  setLanguage: (lang: AssistantLanguage) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onToggleMute: () => void;
  onSpeakMessage: (text: string) => void;
  deviceStatus: DeviceStatus;
  onToggleTorch: () => void;
  isWakeWordActive: boolean;
  onOpenVision: () => void;
  isLoading: boolean;
}

export const CoreTab: React.FC<CoreTabProps> = ({
  messages,
  inputText,
  setInputText,
  onSendMessage,
  onExecuteTool,
  isListening,
  isSpeaking,
  isMuted,
  transcript,
  language,
  setLanguage,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onToggleMute,
  onSpeakMessage,
  deviceStatus,
  onToggleTorch,
  isWakeWordActive,
  onOpenVision,
  isLoading,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOrbClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const QUICK_ACTIONS = [
    { label: '📲 Install / APK', prompt: 'Is app ko mobile me install aur APK kaise banayein?' },
    { label: '🎬 YouTube', prompt: 'YouTube open karo' },
    { label: '💬 WhatsApp', prompt: 'WhatsApp kholo' },
    { label: '🔋 Battery & SIM', prompt: 'Phone status check karo' },
    { label: '🔦 Flashlight', prompt: 'Flashlight toggle karo' },
    { label: '⏰ Alarm 5:00 PM', prompt: 'Set an alarm for 5:00 PM' },
    { label: '✨ TikTok Ideas', prompt: 'Mujhe viral TikTok shorts ke 3 trending ideas do' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100">
      {/* Persistent Direct Download Mobile Package Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-indigo-950 to-cyan-950 border-b border-cyan-400/40 px-3.5 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="text-xs font-bold text-white">Mobile Package (.ZIP):</span>
        </div>
        <a
          href="/api/download-app"
          download="NOVA_AI_Assistant_Mobile.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-xs font-black tracking-wide text-white shadow-md shadow-cyan-900/50 transition active:scale-95 border border-cyan-300/40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Mobile Package</span>
        </a>
      </div>

      {/* Top HUD Status Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-gray-950/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          {/* Online / Network status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900 border border-gray-800 text-[11px] font-mono">
            {deviceStatus.isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 uppercase">{deviceStatus.networkType}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400">Offline</span>
              </>
            )}
          </div>

          {/* Battery Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900 border border-gray-800 text-[11px] font-mono">
            {deviceStatus.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-gray-300">
              {deviceStatus.batteryLevel !== null ? `${deviceStatus.batteryLevel}%` : '85%'}
            </span>
          </div>

          {/* Wake Word indicator */}
          {isWakeWordActive && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-300">
              <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Wake Word Active</span>
            </div>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Torch toggle */}
          <button
            onClick={onToggleTorch}
            title="Toggle Flashlight Torch"
            className={`p-1.5 rounded-full border transition active:scale-95 ${
              deviceStatus.torchActive
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-400/30'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${deviceStatus.torchActive ? 'fill-amber-300' : ''}`} />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute NOVA' : 'Mute NOVA voice output'}
            className="p-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AssistantLanguage)}
            className="bg-gray-900 border border-gray-800 text-[11px] font-semibold text-cyan-300 rounded-full px-2 py-1 focus:outline-none focus:border-cyan-500"
          >
            <option value="auto">🌐 Auto</option>
            <option value="ur-PK">اردو Urdu</option>
            <option value="hi-IN">हिन्दी Hindi</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>

      {/* Holographic Orb Section */}
      <div className="relative flex flex-col items-center justify-center py-6 px-4">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-64 h-64 rounded-full filter blur-3xl opacity-25 transition-all duration-700 ${
              isListening
                ? 'bg-emerald-500 scale-125 opacity-40'
                : isSpeaking
                ? 'bg-cyan-400 scale-110 opacity-35'
                : isLoading
                ? 'bg-purple-600 scale-105 opacity-35'
                : 'bg-cyan-600'
            }`}
          />
        </div>

        {/* Holographic Rings Container */}
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Outer tech dashed ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 animate-orb-spin ${
              isListening
                ? 'border-emerald-400/60'
                : isSpeaking
                ? 'border-cyan-400/70'
                : 'border-cyan-500/30'
            }`}
          />

          {/* Middle rotating orbit */}
          <div
            className={`absolute inset-3 rounded-full border transition-all duration-500 ${
              isListening
                ? 'border-emerald-400/40 animate-ping'
                : isSpeaking
                ? 'border-cyan-400/50'
                : 'border-indigo-500/30'
            }`}
            style={{ animationDuration: '8s' }}
          />

          {/* Core Interactive Orb Button */}
          <button
            onClick={handleOrbClick}
            className={`relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-500 active:scale-95 group shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 neon-glow-emerald scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 neon-glow-cyan animate-pulse'
                : isLoading
                ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-600 neon-glow-indigo animate-spin'
                : 'bg-gradient-to-tr from-cyan-900/90 via-cyan-600 to-indigo-700 neon-glow-cyan hover:scale-102'
            }`}
          >
            {/* Center icon / visualizer */}
            {isListening ? (
              <div className="flex flex-col items-center">
                <Mic className="w-10 h-10 text-white animate-bounce" />
                <span className="text-[10px] font-mono tracking-widest text-emerald-100 uppercase mt-1">
                  Listening
                </span>
              </div>
            ) : isSpeaking ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-1 h-6 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-9 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-8 bg-white rounded-full animate-pulse delay-100" />
                  <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-200" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-cyan-100 uppercase">
                  Speaking
                </span>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center">
                <Sparkles className="w-9 h-9 text-white animate-spin" />
                <span className="text-[10px] font-mono tracking-widest text-purple-100 uppercase mt-1">
                  Thinking
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Sparkles className="w-9 h-9 text-cyan-200 group-hover:scale-110 transition" />
                </div>
                <span className="text-xs font-black tracking-widest text-white mt-1 drop-shadow">
                  NOVA
                </span>
                <span className="text-[9px] font-mono text-cyan-200/80">Tap to Speak</span>
              </div>
            )}
          </button>
        </div>

        {/* Speaking controller (Stop button when speaking) */}
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs hover:bg-rose-900 transition active:scale-95"
          >
            <StopCircle className="w-3.5 h-3.5" /> Stop Voice
          </button>
        )}

        {/* Live Transcript / Assistant Speech feedback */}
        {(transcript || isListening) && (
          <div className="mt-3 max-w-sm px-4 py-2 rounded-2xl bg-gray-900/90 border border-cyan-500/30 text-center shadow-lg animate-fade-in">
            <p className="text-xs text-cyan-300 font-mono italic">
              {transcript ? `"${transcript}"` : 'Listening... bolain (Urdu/Hindi/English)'}
            </p>
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-md px-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(action.prompt)}
              className="px-3 py-1.5 rounded-full bg-gray-900/80 hover:bg-cyan-950/60 border border-gray-800 hover:border-cyan-500/40 text-xs text-gray-300 hover:text-cyan-300 transition active:scale-95"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* 1-Click Direct Download Mobile Package Button */}
        <div className="mt-3 w-full max-w-sm px-2">
          <button
            onClick={() => {
              sounds.playActivate();
              window.location.href = '/api/download-app';
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-xs font-black tracking-wide text-white shadow-lg shadow-cyan-900/50 transition active:scale-95 border border-cyan-400/40"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>📥 Direct Download Mobile Package (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Conversation & Tool Execution Log */}
      <div className="flex-1 px-4 space-y-4 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-8 px-4 rounded-3xl bg-gray-950/60 border border-gray-800/80">
            <h3 className="text-base font-bold text-white mb-1">
              Main NOVA hoon — Aapka Mobile Assistant!
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Urdu, Roman Urdu, Hindi ya English mein baat karein. Main phone apps open karne, calls, SMS, alarms, camera vision aur viral content banane me madad kar sakta hoon.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-mono text-gray-500">
                  {isUser ? 'You' : 'NOVA'} •{' '}
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-950/40'
                    : 'bg-gray-900/90 text-gray-100 rounded-bl-none border border-gray-800/90 shadow-lg'
                }`}
              >
                {/* Image preview if provided */}
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="Visual query"
                    className="mb-2 rounded-xl max-h-48 object-cover border border-gray-700"
                  />
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Tool calls rendered in futuristic HUD cards */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-gray-800">
                    {msg.toolCalls.map((tc, tIdx) => (
                      <div
                        key={tIdx}
                        className="rounded-xl bg-gray-950/90 border border-cyan-500/30 p-2.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between text-cyan-400 mb-1">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Layers className="w-3.5 h-3.5" />
                            {tc.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                            {tc.status || 'executed'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300 break-all bg-gray-900/60 p-1.5 rounded border border-gray-800">
                          {JSON.stringify(tc.args)}
                        </div>
                        <button
                          onClick={() => onExecuteTool(tc)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 py-1 text-[11px] text-cyan-300 transition"
                        >
                          <Play className="w-3 h-3" /> Re-execute Action
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer actions for assistant bubble */}
                {!isUser && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-gray-400 pt-1">
                    <button
                      onClick={() => onSpeakMessage(msg.content)}
                      title="Speak response"
                      className="p-1 hover:text-cyan-400 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy text"
                      className="p-1 hover:text-cyan-400 transition"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>NOVA is thinking & executing tools...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-3 py-2 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 max-w-2xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim()) {
              onSendMessage(inputText.trim());
              setInputText('');
            }
          }}
          className="flex items-center gap-2"
        >
          {/* Camera snapshot shortcut */}
          <button
            type="button"
            onClick={onOpenVision}
            title="Open Camera Vision"
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 transition active:scale-95"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleOrbClick}
            title={isListening ? 'Stop Listening' : 'Tap to Speak'}
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              isListening
                ? 'bg-emerald-500 border-emerald-400 text-black animate-pulse'
                : 'bg-gray-900 border-gray-800 text-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask NOVA anything or give phone command..."
            className="flex-1 bg-gray-900/90 border border-gray-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
