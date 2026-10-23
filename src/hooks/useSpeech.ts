import { useState, useEffect, useRef, useCallback } from 'react';
import { AssistantLanguage } from '../types/assistant';
import { sounds } from '../utils/audioAlarm';

interface UseSpeechProps {
  language: AssistantLanguage;
  autoSpeak: boolean;
  rate?: number;
  pitch?: number;
  wakeWordEnabled?: boolean;
  onTranscriptFinal?: (text: string) => void;
}

export function useSpeech({
  language,
  autoSpeak,
  rate = 1.0,
  pitch = 1.0,
  wakeWordEnabled = false,
  onTranscriptFinal,
}: UseSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(!autoSpeak);
  const [transcript, setTranscript] = useState('');
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Map assistant language code to BCP 47
  const getRecognitionLang = useCallback((lang: AssistantLanguage) => {
    switch (lang) {
      case 'ur-PK':
        return 'ur-PK';
      case 'hi-IN':
        return 'hi-IN';
      case 'en-US':
        return 'en-US';
      default:
        return 'ur-PK'; // Default to Urdu/Hinglish
    }
  }, []);

  // Stop SpeechSynthesis
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    sounds.playStop();
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        stopSpeaking();
      }
      return !prev;
    });
  }, [stopSpeaking]);

  // Speak Text Function
  const speakText = useCallback(
    (text: string, forceLanguage?: string) => {
      if (!synthRef.current || isMuted) return;

      // Clean markdown and tool tags from spoken text
      const cleanText = text
        .replace(/<tool>[\s\S]*?<\/tool>/gi, '')
        .replace(/<result>[\s\S]*?<\/result>/gi, '')
        .replace(/[*#`_~]/g, '')
        .trim();

      if (!cleanText) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Detect language or use preference
      let targetLang = forceLanguage || getRecognitionLang(language);
      // If Urdu script or Roman Urdu
      const hasArabicScript = /[\u0600-\u06FF]/.test(cleanText);
      const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);

      if (hasArabicScript) {
        targetLang = 'ur-PK';
      } else if (hasDevanagari) {
        targetLang = 'hi-IN';
      }

      utterance.lang = targetLang;

      // Select available voice
      const voices = synthRef.current.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang.slice(0, 2)) || v.lang === targetLang
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [isMuted, language, rate, pitch, getRecognitionLang]
  );

  // Initialize and start main Speech Recognition
  const startListening = useCallback(() => {
    stopSpeaking();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getRecognitionLang(language);

      recognition.onstart = () => {
        setIsListening(true);
        sounds.playActivate();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        setTranscript(currentText);

        if (final && onTranscriptFinal) {
          onTranscriptFinal(final);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  }, [language, getRecognitionLang, onTranscriptFinal, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Background Wake-Word Detection ("Hey Jarvis" / "Hey Nova")
  useEffect(() => {
    if (!wakeWordEnabled) {
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.stop();
        } catch {}
      }
      setIsWakeWordActive(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const wakeRecognition = new SpeechRecognition();
      wakeRecognition.continuous = true;
      wakeRecognition.interimResults = false;
      wakeRecognition.lang = 'en-US';

      wakeRecognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult.isFinal) {
          const phrase = lastResult[0].transcript.toLowerCase();
          if (
            phrase.includes('hey jarvis') ||
            phrase.includes('jarvis') ||
            phrase.includes('hey nova') ||
            phrase.includes('nova') ||
            phrase.includes('haroon')
          ) {
            sounds.playActivate();
            startListening();
          }
        }
      };

      wakeRecognition.onend = () => {
        if (wakeWordEnabled && !isListening) {
          try {
            wakeRecognition.start();
          } catch {}
        }
      };

      wakeRecognition.start();
      wakeRecognitionRef.current = wakeRecognition;
      setIsWakeWordActive(true);
    } catch {
      // Wake word may fail if mic is already captured
    }

    return () => {
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, [wakeWordEnabled, isListening, startListening]);

  return {
    isListening,
    isSpeaking,
    isMuted,
    transcript,
    speechSupported,
    isWakeWordActive,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleMute,
    setTranscript,
  };
}
