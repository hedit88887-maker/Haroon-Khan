export type AssistantTab = 'core' | 'studio' | 'vision' | 'apps' | 'alarms' | 'call';

export type AssistantLanguage = 'auto' | 'ur-PK' | 'hi-IN' | 'en-US';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  imagePreview?: string;
}

export interface ToolCall {
  name: string;
  args: Record<string, any>;
  status?: 'pending' | 'confirmed' | 'executed' | 'rejected' | 'failed';
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  message: string;
  data?: any;
}

export interface UserMemory {
  userName: string;
  preferredLanguage: string;
  wakeWordEnabled: boolean;
  autoSpeakResponse: boolean;
  speechRate: number;
  speechPitch: number;
  favoriteApps: string[];
  contacts: { name: string; phone: string; nickname?: string }[];
  customNotes: string[];
}

export interface DeviceStatus {
  batteryLevel: number | null;
  isCharging: boolean | null;
  networkType: string;
  isOnline: boolean;
  storageUsedMB: number | null;
  storageTotalMB: number | null;
  torchActive: boolean;
  volumeLevel: number;
  brightnessLevel: number;
}

export interface InAppAlarm {
  id: string;
  time: string; // HH:MM
  label: string;
  enabled: boolean;
  repeatDays?: string[];
}

export interface InAppTimer {
  id: string;
  totalSeconds: number;
  remainingSeconds: number;
  label: string;
  isRunning: boolean;
}

export interface AppDeepLink {
  id: string;
  name: string;
  packageName: string;
  intentUrl: string;
  webUrl: string;
  icon: string;
  category: 'social' | 'media' | 'utility' | 'creation' | 'system';
  description: string;
}
