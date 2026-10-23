import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, Code, FileText, Layers, ExternalLink, Download, ShieldCheck } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const SNIPPETS = {
    accessibilityKotlin: `// Save in: android/app/src/main/java/com/nova/assistant/NovaAccessibilityService.kt
package com.nova.assistant

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * NOVA AI Full Accessibility Service
 * Controls phone screen, taps buttons, auto-scrolls TikTok/YouTube,
 * takes screenshots, locks phone, and opens power dialog.
 */
class NovaAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Reads screen state, elements, and text
    }

    override fun onInterrupt() {}

    // Global Actions:
    fun lockPhone() = performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
    fun takeScreenshot() = performGlobalAction(GLOBAL_ACTION_TAKE_SCREENSHOT)
    fun openPowerDialog() = performGlobalAction(GLOBAL_ACTION_POWER_DIALOG)
    fun openNotifications() = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)

    // Screen Automation: Auto-scroll TikTok & tap buttons by text
    fun autoScroll(): Boolean {
        val root = rootInActiveWindow ?: return false
        val scrollable = findScrollable(root)
        return scrollable?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) ?: false
    }

    fun clickByText(text: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val nodes = root.findAccessibilityNodeInfosByText(text)
        return nodes.firstOrNull()?.performAction(AccessibilityNodeInfo.ACTION_CLICK) ?: false
    }

    private fun findScrollable(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.isScrollable) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findScrollable(child)
            if (found != null) return found
        }
        return null
    }
}`,

    accessibilityXml: `<!-- Save in: android/app/src/main/res/xml/accessibility_service_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_desc"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true" />`,

    capacitorSetup: `// 1. Install Capacitor CLI & Android platform
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "NOVA AI" "com.nova.assistant" --web-dir dist
npm run build
npx cap add android
npx cap copy`,

    voiceServiceXml: `<!-- Save in: android/app/src/main/res/xml/voice_interaction_service.xml -->
<?xml version="1.0" encoding="utf-8"?>
<voice-interaction-service
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:sessionService="com.nova.assistant.NovaVoiceInteractionSessionService"
    android:recognitionService="com.nova.assistant.NovaRecognitionService"
    android:supportsAssist="true"
    android:supportsLaunchVoiceAssistFromKeyguard="true"
    android:supportsLocalInteraction="true" />`,

    manifestEntries: `<!-- Add inside <application> in android/app/src/main/AndroidManifest.xml -->

<!-- Voice Interaction Service (Default Digital Assistant App) -->
<service
    android:name=".NovaVoiceInteractionService"
    android:label="NOVA Assistant"
    android:permission="android.permission.BIND_VOICE_INTERACTION"
    android:exported="true">
    <meta-data
        android:name="android.voice_interaction"
        android:resource="@xml/voice_interaction_service" />
    <intent-filter>
        <action android:name="android.service.voice.VoiceInteractionService" />
    </intent-filter>
</service>

<service
    android:name=".NovaVoiceInteractionSessionService"
    android:permission="android.permission.BIND_VOICE_INTERACTION"
    android:exported="true" />

<!-- Floating Overlay Permission -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.SET_ALARM" />
<uses-permission android:name="android.permission.VIBRATE" />`,

    voiceServiceKotlin: `// Save in: android/app/src/main/java/com/nova/assistant/NovaVoiceInteractionService.kt
package com.nova.assistant

import android.service.voice.VoiceInteractionService

class NovaVoiceInteractionService : VoiceInteractionService() {
    override fun onReady() {
        super.onReady()
        // Assistant ready for hotword or power button long-press
    }
}`,

    voiceSessionKotlin: `// Save in: android/app/src/main/java/com/nova/assistant/NovaVoiceInteractionSessionService.kt
package com.nova.assistant

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.service.voice.VoiceInteractionSession
import android.service.voice.VoiceInteractionSessionService

class NovaVoiceInteractionSessionService : VoiceInteractionSessionService() {
    override fun onNewSession(args: Bundle?): VoiceInteractionSession {
        return NovaVoiceInteractionSession(this)
    }
}

class NovaVoiceInteractionSession(context: Context) : VoiceInteractionSession(context) {
    override fun onShow(args: Bundle?, showFlags: Int) {
        super.onShow(args, showFlags)
        // Bring NOVA UI to front when triggered by long-pressing power button
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        launchIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        launchIntent?.putExtra("VOICE_TRIGGER", true)
        context.startActivity(launchIntent)
        hide()
    }
}`,

    overlayServiceKotlin: `// Save in: android/app/src/main/java/com/nova/assistant/NovaOverlayService.kt
package com.nova.assistant

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.WindowManager
import android.widget.ImageView

class NovaOverlayService : Service() {
    private var windowManager: WindowManager? = null
    private var floatingOrbView: ImageView? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        floatingOrbView = ImageView(this).apply {
            setImageResource(android.R.drawable.ic_btn_speak_now)
            setOnClickListener {
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                launchIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(launchIntent)
            }
        }

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            160, 160,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END
            x = 30
            y = 200
        }

        windowManager?.addView(floatingOrbView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        floatingOrbView?.let { windowManager?.removeView(it) }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-gray-950 p-6 shadow-2xl neon-glow-cyan text-left my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/30 text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Native Android Assistant Setup</h2>
              <p className="text-xs text-cyan-400 font-mono">
                Capacitor Export & Default Digital Assistant Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1 text-sm text-gray-300">
          {/* Quick Explanation */}
          <div className="rounded-2xl bg-cyan-950/30 border border-cyan-500/30 p-4">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4" /> Browser vs. Native Android Capabilities
            </h4>
            <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
              <li>
                <strong className="text-white">In Browser / PWA:</strong> Voice recognition (Urdu/Hindi/English), live camera vision OCR, deep app intents (YouTube, WhatsApp, TikTok), battery API, sound synthesizer, in-app alarms, flashlight torch.
              </li>
              <li>
                <strong className="text-white">With Native Capacitor wrapper:</strong> Opens directly when long-pressing power button (Default Digital Assistant), floating overlay orb over other apps (`SYSTEM_ALERT_WINDOW`), direct WiFi/Bluetooth system toggles without opening settings.
              </li>
            </ul>
          </div>

          {/* Accessibility Service Direct Download Card */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Android Accessibility Service Converted!
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Full Control
              </span>
            </div>
            <p className="text-xs text-gray-200 mb-3 leading-relaxed">
              Yeh project ab complete <strong>Accessibility Service</strong> mein convert ho chuka hai! Yeh background mein chal kar phone lock kar sakti hai, screenshot le sakti hai, TikTok/Shorts auto-scroll kar sakti hai, aur screen par auto-taps kar sakti hai.
            </p>
            <a
              href="/api/download-app"
              download="NOVA_Accessibility_Assistant_Mobile.zip"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>📥 Download Accessibility Package (.ZIP)</span>
            </a>
          </div>

          {/* Accessibility Service Kotlin Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                NovaAccessibilityService.kt (Auto-Scroll, Tap & Lock)
              </span>
              <button
                onClick={() => handleCopy('accessibility_kt', SNIPPETS.accessibilityKotlin)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'accessibility_kt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Kotlin
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
              {SNIPPETS.accessibilityKotlin}
            </pre>
          </div>

          {/* Step 1: Capacitor Init */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                1. Wrap with Capacitor
              </span>
              <button
                onClick={() => handleCopy('cap', SNIPPETS.capacitorSetup)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Commands
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
              {SNIPPETS.capacitorSetup}
            </pre>
          </div>

          {/* Step 2: voice_interaction_service.xml */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                2. res/xml/voice_interaction_service.xml
              </span>
              <button
                onClick={() => handleCopy('xml', SNIPPETS.voiceServiceXml)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'xml' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy XML
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-gray-300 overflow-x-auto">
              {SNIPPETS.voiceServiceXml}
            </pre>
          </div>

          {/* Step 3: AndroidManifest.xml */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                3. AndroidManifest.xml Entries
              </span>
              <button
                onClick={() => handleCopy('manifest', SNIPPETS.manifestEntries)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Manifest
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-gray-300 overflow-x-auto">
              {SNIPPETS.manifestEntries}
            </pre>
          </div>

          {/* Step 4: Kotlin VoiceInteractionSessionService */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                4. NovaVoiceInteractionSessionService.kt
              </span>
              <button
                onClick={() => handleCopy('kt_session', SNIPPETS.voiceSessionKotlin)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'kt_session' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Kotlin
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-gray-300 overflow-x-auto">
              {SNIPPETS.voiceSessionKotlin}
            </pre>
          </div>

          {/* Step 5: Floating Overlay Service */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                5. NovaOverlayService.kt (Display Over Other Apps)
              </span>
              <button
                onClick={() => handleCopy('kt_overlay', SNIPPETS.overlayServiceKotlin)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'kt_overlay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Kotlin
              </button>
            </div>
            <pre className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs font-mono text-gray-300 overflow-x-auto">
              {SNIPPETS.overlayServiceKotlin}
            </pre>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition shadow-lg shadow-cyan-900/40"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
