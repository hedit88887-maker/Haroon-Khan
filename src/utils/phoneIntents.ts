import { AppDeepLink } from '../types/assistant';

// Supported App Deep Links with Android Intents & Web fallbacks
export const APP_REGISTRY: Record<string, AppDeepLink> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    intentUrl: 'intent:#Intent;package=com.google.android.youtube;scheme=https;end',
    webUrl: 'https://youtube.com',
    icon: 'youtube',
    category: 'media',
    description: 'Videos, music, podcasts and shorts',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    intentUrl: 'intent:#Intent;package=com.zhiliaoapp.musically;scheme=snssdk1233;end',
    webUrl: 'https://tiktok.com',
    icon: 'video',
    category: 'social',
    description: 'Short viral videos & trends',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    intentUrl: 'intent:#Intent;package=com.instagram.android;scheme=instagram;end',
    webUrl: 'https://instagram.com',
    icon: 'camera',
    category: 'social',
    description: 'Reels, stories, photos & DM',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    intentUrl: 'intent:#Intent;package=com.whatsapp;scheme=whatsapp;end',
    webUrl: 'https://web.whatsapp.com',
    icon: 'message-circle',
    category: 'social',
    description: 'Chat, voice & video calls',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    intentUrl: 'intent:#Intent;package=com.facebook.katana;scheme=fb;end',
    webUrl: 'https://facebook.com',
    icon: 'share-2',
    category: 'social',
    description: 'Social networking & feeds',
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    intentUrl: 'intent:#Intent;package=com.snapchat.android;scheme=snapchat;end',
    webUrl: 'https://snapchat.com',
    icon: 'zap',
    category: 'social',
    description: 'Snaps, lenses & streaks',
  },
  capcut: {
    id: 'capcut',
    name: 'CapCut',
    packageName: 'com.lemon.lvoverseas',
    intentUrl: 'intent:#Intent;package=com.lemon.lvoverseas;end',
    webUrl: 'https://capcut.com',
    icon: 'scissors',
    category: 'creation',
    description: 'Mobile video editor & effects',
  },
  inshot: {
    id: 'inshot',
    name: 'InShot',
    packageName: 'com.camerasideas.instashot',
    intentUrl: 'intent:#Intent;package=com.camerasideas.instashot;end',
    webUrl: 'https://inshot.com',
    icon: 'film',
    category: 'creation',
    description: 'Quick video cuts & reels',
  },
  chrome: {
    id: 'chrome',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    intentUrl: 'intent:#Intent;package=com.android.chrome;scheme=googlechrome;end',
    webUrl: 'https://google.com',
    icon: 'globe',
    category: 'utility',
    description: 'Fast web browsing & search',
  },
  camera: {
    id: 'camera',
    name: 'Camera',
    packageName: 'com.android.camera',
    intentUrl: 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end',
    webUrl: '',
    icon: 'camera',
    category: 'utility',
    description: 'Photo & video capture',
  },
  gallery: {
    id: 'gallery',
    name: 'Gallery / Photos',
    packageName: 'com.google.android.apps.photos',
    intentUrl: 'intent:#Intent;action=android.intent.action.VIEW;type=image/*;end',
    webUrl: 'https://photos.google.com',
    icon: 'image',
    category: 'utility',
    description: 'View photos & albums',
  },
  settings: {
    id: 'settings',
    name: 'Android Settings',
    packageName: 'com.android.settings',
    intentUrl: 'intent:#Intent;action=android.settings.SETTINGS;end',
    webUrl: '',
    icon: 'settings',
    category: 'system',
    description: 'Phone system preferences',
  },
  maps: {
    id: 'maps',
    name: 'Google Maps',
    packageName: 'com.google.android.apps.maps',
    intentUrl: 'intent:#Intent;package=com.google.android.apps.maps;scheme=geo;end',
    webUrl: 'https://maps.google.com',
    icon: 'map-pin',
    category: 'utility',
    description: 'GPS navigation & places',
  },
  clock: {
    id: 'clock',
    name: 'Clock & Alarms',
    packageName: 'com.google.android.deskclock',
    intentUrl: 'intent:#Intent;action=android.intent.action.SHOW_ALARMS;end',
    webUrl: '',
    icon: 'clock',
    category: 'utility',
    description: 'Timers, alarms & stopwatch',
  },
};

// Android System Settings Shortcuts (via Android Intents)
export const SETTINGS_INTENTS = {
  main: 'intent:#Intent;action=android.settings.SETTINGS;end',
  wifi: 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end',
  bluetooth: 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end',
  sound: 'intent:#Intent;action=android.settings.SOUND_SETTINGS;end',
  display: 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
  airplane: 'intent:#Intent;action=android.settings.AIRPLANE_MODE_SETTINGS;end',
  battery: 'intent:#Intent;action=android.settings.BATTERY_SAVER_SETTINGS;end',
  apps: 'intent:#Intent;action=android.settings.APPLICATION_SETTINGS;end',
  hotspot: 'intent:#Intent;action=android.settings.TETHER_SETTINGS;end',
  dnd: 'intent:#Intent;action=android.settings.ZEN_MODE_PRIORITY_SETTINGS;end',
};

// Helper to launch App via Intent or fallback URL
export function openAppOrLink(appKeyOrUrl: string): { opened: boolean; type: string } {
  const normalized = appKeyOrUrl.toLowerCase().trim();
  const app = APP_REGISTRY[normalized];

  if (app) {
    // Try opening Android intent
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (isMobile && app.intentUrl) {
      window.location.href = app.intentUrl;
      return { opened: true, type: 'intent' };
    } else if (app.webUrl) {
      window.open(app.webUrl, '_blank');
      return { opened: true, type: 'web' };
    }
  }

  // If it's a URL, open it
  if (appKeyOrUrl.startsWith('http://') || appKeyOrUrl.startsWith('https://')) {
    window.open(appKeyOrUrl, '_blank');
    return { opened: true, type: 'url' };
  }

  // Fallback search
  window.open(`https://www.google.com/search?q=${encodeURIComponent(appKeyOrUrl)}`, '_blank');
  return { opened: true, type: 'search' };
}

// Open Specific Android Setting Intent
export function openSettingIntent(settingKey: keyof typeof SETTINGS_INTENTS) {
  const intent = SETTINGS_INTENTS[settingKey] || SETTINGS_INTENTS.main;
  window.location.href = intent;
}

// Make a phone call via tel: link
export function triggerPhoneCall(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${cleaned}`;
}

// Send an SMS message via sms: link
export function triggerSMS(phoneNumber: string, messageText = '') {
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
  const encoded = encodeURIComponent(messageText);
  window.location.href = `sms:${cleaned}?body=${encoded}`;
}

// Send a WhatsApp message via wa.me link
export function triggerWhatsApp(phoneNumber: string, messageText = '') {
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(messageText);
  const url = cleaned ? `https://wa.me/${cleaned}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank');
}

// Trigger Android native AlarmClock intent
export function triggerAndroidAlarmIntent(hour: number, minute: number, message = 'NOVA Alarm') {
  // android.intent.action.SET_ALARM with extras
  const intentUrl = `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hour};i.android.intent.extra.alarm.MINUTES=${minute};s.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};B.android.intent.extra.alarm.SKIP_UI=true;end`;
  window.location.href = intentUrl;
}

// Trigger Android native Timer intent
export function triggerAndroidTimerIntent(seconds: number, message = 'NOVA Timer') {
  const intentUrl = `intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH=${seconds};s.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};B.android.intent.extra.alarm.SKIP_UI=true;end`;
  window.location.href = intentUrl;
}

// Download file helper
export function triggerDownload(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
