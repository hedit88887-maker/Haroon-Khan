import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Video,
  Camera,
  Grid,
  Clock,
  Phone,
  Settings,
  Smartphone,
  Eye,
  Layers,
  CircleDot,
  Download,
} from 'lucide-react';
import {
  AssistantTab,
  ChatMessage,
  ToolCall,
  UserMemory,
  AssistantLanguage,
  InAppAlarm,
} from './types/assistant';
import { useSpeech } from './hooks/useSpeech';
import { useDeviceStatus } from './hooks/useDeviceStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { sounds } from './utils/audioAlarm';
import {
  openAppOrLink,
  openSettingIntent,
  triggerPhoneCall,
  triggerSMS,
  triggerWhatsApp,
  triggerAndroidAlarmIntent,
  triggerAndroidTimerIntent,
  triggerDownload,
} from './utils/phoneIntents';
import { CoreTab } from './components/CoreTab';
import { StudioTab } from './components/StudioTab';
import { VisionTab } from './components/VisionTab';
import { AppsTab } from './components/AppsTab';
import { AlarmsTab } from './components/AlarmsTab';
import { CallTab } from './components/CallTab';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PermissionsModal } from './components/PermissionsModal';
import { MemoryModal } from './components/MemoryModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { APKDownloadModal } from './components/APKDownloadModal';
import { FloatingOverlayOrb } from './components/FloatingOverlayOrb';
import { PWAInstallButton } from './components/PWAInstallButton';

const INITIAL_MEMORY: UserMemory = {
  userName: 'Haroon Khan',
  preferredLanguage: 'auto',
  wakeWordEnabled: false,
  autoSpeakResponse: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  favoriteApps: ['youtube', 'tiktok', 'whatsapp', 'capcut', 'inshot'],
  contacts: [
    { name: 'Ali', phone: '+923001234567', nickname: 'Bhai' },
    { name: 'Hamza', phone: '+923129876543', nickname: 'Editor' },
    { name: 'Khan', phone: '+923335551212', nickname: 'Team' },
    { name: 'Office', phone: '+923214449900', nickname: 'Work' },
  ],
  customNotes: [
    'User prefers natural Urdu and Roman Urdu',
    'User creates videos with CapCut and InShot for TikTok & Reels',
    'Always confirm before calling, sending messages, or deleting data',
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AssistantTab>('core');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nova_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content:
          'Salam! Main NOVA hoon — aapka personal mobile AI assistant. Phone control, camera vision, apps, calls, alarms ya viral content, boliye kya madad karun?',
        timestamp: Date.now(),
      },
    ];
  });

  const [memory, setMemory] = useState<UserMemory>(() => {
    try {
      const saved = localStorage.getItem('nova_user_memory');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEMORY;
  });

  const [alarms, setAlarms] = useState<InAppAlarm[]>(() => {
    try {
      const saved = localStorage.getItem('nova_in_app_alarms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', time: '07:00', label: 'Morning Wakeup', enabled: true },
      { id: '2', time: '17:00', label: 'Gym & Workout', enabled: true },
    ];
  });

  const [reminders, setReminders] = useState<{ id: string; time: string; text: string }[]>(() => {
    try {
      const saved = localStorage.getItem('nova_in_app_reminders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: '1', time: '17:00', text: 'Finish video export' }];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<AssistantLanguage>('auto');

  // Modals state
  const [pendingConfirmationTool, setPendingConfirmationTool] = useState<ToolCall | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(() => {
    return !localStorage.getItem('nova_permissions_onboarded');
  });
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showAndroidCodeModal, setShowAndroidCodeModal] = useState(false);
  const [showAPKModal, setShowAPKModal] = useState(false);
  const [showFloatingOrb, setShowFloatingOrb] = useState(true);

  const { install: triggerPWAInstall, isInstallable } = usePWAInstall();

  // Device hooks
  const { deviceStatus, toggleTorch, setVolume, setBrightness, triggerVibration } =
    useDeviceStatus();

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_chat_messages', JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_user_memory', JSON.stringify(memory));
    } catch {}
  }, [memory]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_in_app_alarms', JSON.stringify(alarms));
    } catch {}
  }, [alarms]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_in_app_reminders', JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // Handle Speech Hook
  const {
    isListening,
    isSpeaking,
    isMuted,
    transcript,
    isWakeWordActive,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleMute,
  } = useSpeech({
    language,
    autoSpeak: memory.autoSpeakResponse,
    rate: memory.speechRate,
    pitch: memory.speechPitch,
    wakeWordEnabled: memory.wakeWordEnabled,
    onTranscriptFinal: (finalText) => {
      if (finalText.trim()) {
        handleUserSend(finalText.trim());
      }
    },
  });

  // Tool Execution Engine
  const executeToolAction = async (tool: ToolCall): Promise<{ success: boolean; message: string }> => {
    triggerVibration(50);

    switch (tool.name) {
      case 'open_app': {
        const res = openAppOrLink(tool.args.app || 'youtube');
        sounds.playSuccess();
        return { success: true, message: `Opened ${tool.args.app} (${res.type})` };
      }

      case 'call': {
        const phone = tool.args.phone || '';
        triggerPhoneCall(phone);
        return { success: true, message: `Calling ${tool.args.contact || phone}` };
      }

      case 'send_sms': {
        triggerSMS(tool.args.phone || '', tool.args.text || '');
        return { success: true, message: `SMS triggered for ${tool.args.contact || tool.args.phone}` };
      }

      case 'send_whatsapp': {
        triggerWhatsApp(tool.args.phone || '', tool.args.text || '');
        return { success: true, message: `WhatsApp sent to ${tool.args.contact || tool.args.phone}` };
      }

      case 'toggle': {
        const setting = (tool.args.setting || '').toLowerCase();
        const state = tool.args.state === 'on';

        if (setting === 'flashlight' || setting === 'torch') {
          await toggleTorch(state);
          sounds.playSuccess();
          return { success: true, message: `Flashlight switched ${state ? 'ON' : 'OFF'}` };
        } else if (setting === 'wifi') {
          openSettingIntent('wifi');
          return { success: true, message: 'Opening Android Wi-Fi settings' };
        } else if (setting === 'bluetooth') {
          openSettingIntent('bluetooth');
          return { success: true, message: 'Opening Android Bluetooth settings' };
        } else if (setting === 'sound' || setting === 'dnd') {
          openSettingIntent('sound');
          return { success: true, message: 'Opening Sound & DND settings' };
        } else {
          openSettingIntent('main');
          return { success: true, message: `Opening Android ${setting} settings` };
        }
      }

      case 'set_volume': {
        const lvl = parseInt(tool.args.level, 10) || 75;
        setVolume(lvl);
        sounds.playSuccess();
        return { success: true, message: `Volume set to ${lvl}%` };
      }

      case 'set_brightness': {
        const lvl = parseInt(tool.args.level, 10) || 80;
        setBrightness(lvl);
        sounds.playSuccess();
        return { success: true, message: `Brightness adjusted to ${lvl}%` };
      }

      case 'set_alarm': {
        const time = tool.args.time || '17:00';
        const label = tool.args.label || 'NOVA Alarm';
        setAlarms((prev) => [
          ...prev,
          { id: Date.now().toString(), time, label, enabled: true },
        ]);
        const [h, m] = time.split(':').map(Number);
        triggerAndroidAlarmIntent(h, m, label);
        sounds.playSuccess();
        return { success: true, message: `Alarm set for ${time} (${label})` };
      }

      case 'set_timer': {
        const seconds = parseInt(tool.args.seconds, 10) || 300;
        const label = tool.args.label || 'Timer';
        triggerAndroidTimerIntent(seconds, label);
        sounds.playSuccess();
        return { success: true, message: `Timer set for ${seconds} seconds` };
      }

      case 'set_reminder': {
        const time = tool.args.time || '17:00';
        const text = tool.args.text || 'Reminder';
        setReminders((prev) => [...prev, { id: Date.now().toString(), time, text }]);
        sounds.playSuccess();
        return { success: true, message: `Reminder set for ${time}: ${text}` };
      }

      case 'phone_info': {
        sounds.playSuccess();
        return {
          success: true,
          message: `Battery: ${deviceStatus.batteryLevel ?? 85}%, Network: ${deviceStatus.networkType}, Storage: ${deviceStatus.storageUsedMB ?? 120}MB used`,
        };
      }

      case 'copy_text': {
        if (tool.args.text) {
          navigator.clipboard.writeText(tool.args.text);
          sounds.playSuccess();
          return { success: true, message: 'Text copied to clipboard' };
        }
        return { success: false, message: 'No text provided' };
      }

      case 'download': {
        if (tool.args.url) {
          window.open(tool.args.url, '_blank');
          return { success: true, message: `Downloading ${tool.args.url}` };
        }
        return { success: false, message: 'No download url' };
      }

      case 'delete_file': {
        sounds.playSuccess();
        return { success: true, message: `File at ${tool.args.path} deleted` };
      }

      case 'power': {
        sounds.playSuccess();
        openSettingIntent('main');
        return { success: true, message: `Power action (${tool.args.action}) acknowledged` };
      }

      default:
        return { success: true, message: `Action ${tool.name} executed` };
    }
  };

  // Parse `<tool>{...}</tool>` blocks from model text
  const parseToolCalls = (text: string): { cleanText: string; toolCalls: ToolCall[] } => {
    const regex = /<tool>([\s\S]*?)<\/tool>/g;
    const toolCalls: ToolCall[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.name) {
          toolCalls.push({
            name: parsed.name,
            args: parsed.args || {},
            status: 'pending',
          });
        }
      } catch (e) {
        console.warn('Failed to parse tool call JSON:', match[1]);
      }
    }

    const cleanText = text.replace(/<tool>[\s\S]*?<\/tool>/g, '').trim();
    return { cleanText, toolCalls };
  };

  // Send User Message
  const handleUserSend = async (userText: string, imagePreview?: string) => {
    if (!userText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      imagePreview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payloadMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          memory,
          deviceStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');

      const rawReply = data.reply || "Main yahan hoon! Aap kis cheez me madad chahte hain?";
      const { cleanText, toolCalls } = parseToolCalls(rawReply);

      // Check if any tool call requires safety confirmation
      const sensitiveTools = ['call', 'send_sms', 'send_whatsapp', 'delete_file', 'power'];
      const sensitiveCall = toolCalls.find((tc) => sensitiveTools.includes(tc.name));

      if (sensitiveCall) {
        setPendingConfirmationTool(sensitiveCall);
      } else {
        // Auto-execute non-sensitive tools
        for (const tc of toolCalls) {
          await executeToolAction(tc);
          tc.status = 'executed';
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText || rawReply,
        timestamp: Date.now(),
        toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak response if autoSpeak is enabled
      if (memory.autoSpeakResponse && !isMuted) {
        speakText(cleanText || rawReply);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Maaf kijiye, error aya: ${err.message || 'Server se connect nahi ho saka'}. Baraye mehrbani dobara koshish karein.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Tool Call Execution
  const handleConfirmTool = async () => {
    if (!pendingConfirmationTool) return;
    const tool = pendingConfirmationTool;
    setPendingConfirmationTool(null);

    await executeToolAction(tool);

    // Update message tool status
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.toolCalls) return msg;
        return {
          ...msg,
          toolCalls: msg.toolCalls.map((tc) =>
            tc.name === tool.name ? { ...tc, status: 'executed' } : tc
          ),
        };
      })
    );
  };

  const handleCancelTool = () => {
    if (!pendingConfirmationTool) return;
    setPendingConfirmationTool(null);
    sounds.playStop();
  };

  // Studio Generation Helper
  const handleStudioGenerate = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          memory,
        }),
      });
      const data = await res.json();
      const reply = data.reply || '';
      const { cleanText } = parseToolCalls(reply);
      return cleanText || reply;
    } catch (err: any) {
      return `Generation failed: ${err.message}`;
    } finally {
      setIsLoading(false);
    }
  };

  // Vision Analysis Helper
  const handleVisionAnalyze = async (imageBase64: string, prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          prompt,
        }),
      });
      const data = await res.json();
      return data.reply || 'Analysis completed.';
    } catch (err: any) {
      return `Vision scan error: ${err.message}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans"
      style={{
        filter: `brightness(${Math.max(30, deviceStatus.brightnessLevel)}%)`,
      }}
    >
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-md shadow-cyan-900/50">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-white flex items-center gap-1.5">
              NOVA <span className="text-[10px] font-mono text-cyan-400 font-normal">AI CORE</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono -mt-0.5">
              Haroon Khan AI Assistant
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Direct Download Mobile Package Anchor Button */}
          <a
            href="/api/download-app"
            download="NOVA_AI_Assistant_Mobile.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-xs font-black tracking-wide text-white shadow-md shadow-cyan-900/50 transition active:scale-95 border border-cyan-400/40"
          >
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span>Download Mobile Package</span>
          </a>

          {/* Android Studio / Capacitor instructions */}
          <button
            onClick={() => setShowAndroidCodeModal(true)}
            title="Native Android Assistant Setup (Kotlin & Capacitor)"
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 hover:text-white transition active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* User Memory & Identity Modal */}
          <button
            onClick={() => setShowMemoryModal(true)}
            title="Memory & User Settings"
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition active:scale-95"
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'core' && (
          <CoreTab
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleUserSend}
            onExecuteTool={executeToolAction}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            transcript={transcript}
            language={language}
            setLanguage={setLanguage}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
            onToggleMute={toggleMute}
            onSpeakMessage={speakText}
            deviceStatus={deviceStatus}
            onToggleTorch={toggleTorch}
            isWakeWordActive={isWakeWordActive}
            onOpenVision={() => setActiveTab('vision')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'studio' && (
          <StudioTab
            onGenerate={handleStudioGenerate}
            onSpeak={speakText}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'vision' && (
          <VisionTab
            onAnalyzeVision={handleVisionAnalyze}
            onSpeak={speakText}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'apps' && (
          <AppsTab
            onAskInAppHelp={(appName, actionPrompt) => {
              setActiveTab('core');
              handleUserSend(`Help me with ${appName}: ${actionPrompt}`);
            }}
          />
        )}

        {activeTab === 'alarms' && (
          <AlarmsTab
            alarms={alarms}
            setAlarms={setAlarms}
            reminders={reminders}
            setReminders={setReminders}
          />
        )}

        {activeTab === 'call' && (
          <CallTab
            contacts={memory.contacts}
            onRequestCall={(contact, phone) => {
              setPendingConfirmationTool({
                name: 'call',
                args: { contact, phone },
              });
            }}
            onRequestSMS={(contact, phone, text) => {
              setPendingConfirmationTool({
                name: 'send_sms',
                args: { contact, phone, text },
              });
            }}
            onRequestWhatsApp={(contact, phone, text) => {
              setPendingConfirmationTool({
                name: 'send_whatsapp',
                args: { contact, phone, text },
              });
            }}
          />
        )}
      </main>

      {/* Floating Overlay Orb (Quick Tap-to-Speak Anywhere) */}
      {showFloatingOrb && activeTab !== 'core' && (
        <FloatingOverlayOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={() => {
            setActiveTab('core');
            startListening();
          }}
        />
      )}

      {/* Bottom Navigation Dock (Tabs: CORE, STUDIO, VISION, APPS, ALARMS, CALL) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800/90 max-w-2xl mx-auto">
        <div className="grid grid-cols-6 h-16 items-center px-1">
          <button
            onClick={() => setActiveTab('core')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'core' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'core' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <CircleDot className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">CORE</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'studio' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'studio' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">STUDIO</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'vision' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'vision' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">VISION</span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'apps' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'apps' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">APPS</span>
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'alarms' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'alarms' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">ALARMS</span>
          </button>

          <button
            onClick={() => setActiveTab('call')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'call' ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'call' ? 'bg-cyan-950/80 border border-cyan-500/40' : ''
              }`}
            >
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wider uppercase mt-0.5">CALL</span>
          </button>
        </div>
      </nav>

      {/* Safety Confirmation Modal */}
      <ConfirmationModal
        toolCall={pendingConfirmationTool}
        onConfirm={handleConfirmTool}
        onCancel={handleCancelTool}
      />

      {/* Permissions Onboarding Modal */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onComplete={() => setShowPermissionsModal(false)}
      />

      {/* User Memory & Custom Preferences Modal */}
      <MemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        memory={memory}
        onSave={(updated) => setMemory(updated)}
      />

      {/* Android Studio & Capacitor Instructions Modal */}
      <AndroidCodeModal
        isOpen={showAndroidCodeModal}
        onClose={() => setShowAndroidCodeModal(false)}
      />

      {/* APK & Mobile Installation Modal */}
      <APKDownloadModal
        isOpen={showAPKModal}
        onClose={() => setShowAPKModal(false)}
        onTriggerInstall={triggerPWAInstall}
        isInstallable={isInstallable}
      />
    </div>
  );
}
