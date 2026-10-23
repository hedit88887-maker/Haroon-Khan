import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  Image,
  Upload,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Share2,
  FileText,
  Scan,
  X,
  Play,
} from 'lucide-react';
import { sounds } from '../utils/audioAlarm';

interface VisionTabProps {
  onAnalyzeVision: (imageBase64: string, prompt: string) => Promise<string>;
  onSpeak: (text: string) => void;
  isLoading: boolean;
}

export const VisionTab: React.FC<VisionTabProps> = ({
  onAnalyzeVision,
  onSpeak,
  isLoading,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable. Please grant permission or use "Gallery se lein".');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Switch front/back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  useEffect(() => {
    // Start camera by default on Vision tab
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Snapshot Capture from Video Stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    sounds.playActivate();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle File Upload ("Gallery se lein")
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Run Vision Analysis
  const handleRunAnalysis = async (presetPrompt?: string) => {
    if (!selectedImage) return;

    const promptToSend =
      presetPrompt ||
      customPrompt ||
      'Identify objects in this image, read any visible text (OCR), summarize what is happening, and explain in Urdu/English.';

    const result = await onAnalyzeVision(selectedImage, promptToSend);
    setAnalysisResult(result);
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!analysisResult) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NOVA Vision AI Analysis',
          text: analysisResult,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const PRESETS = [
    { label: '🔍 What is this?', prompt: 'Identify this object or scene in detail with key facts in Urdu and English.' },
    { label: '📝 Read Text (OCR)', prompt: 'Extract and transcribe all written/printed text from this image with high accuracy.' },
    { label: '🧮 Solve Problem', prompt: 'Solve the math, science, or code problem shown in this image step-by-step.' },
    { label: '🌐 Translate', prompt: 'Translate all text in this image into Urdu (اردو) and Roman Urdu.' },
    { label: '📄 Summarize Doc', prompt: 'Summarize the document, receipt, or paper in bullet points with key dates & amounts.' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            NOVA Vision AI
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            Live Camera Visual Intelligence, OCR & Document Scanner
          </p>
        </div>

        {cameraActive && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFacingMode}
              title="Switch Front/Back Camera"
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 hover:text-white transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Viewfinder / Image Preview Area */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-950 border border-cyan-500/30 shadow-2xl mb-4 flex items-center justify-center">
        {selectedImage ? (
          <div className="relative w-full h-full">
            <img
              src={selectedImage}
              alt="Captured frame"
              className="w-full h-full object-contain"
            />
            {/* Retake button */}
            <button
              onClick={() => {
                setSelectedImage(null);
                setAnalysisResult('');
                startCamera();
              }}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950/80 backdrop-blur-md border border-gray-700 text-xs text-white hover:bg-gray-800"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Retake Photo
            </button>
          </div>
        ) : cameraActive ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Cyber HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Center reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border border-cyan-400/40 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                </div>
              </div>

              {/* Status overlay */}
              <div className="absolute bottom-3 left-4 text-[10px] font-mono text-cyan-300 bg-gray-950/70 px-2 py-0.5 rounded border border-cyan-500/30">
                LIVE {facingMode.toUpperCase()} FEED
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-xs text-gray-400 mb-3">
              {cameraError || 'Camera feed paused'}
            </p>
            <button
              onClick={() => startCamera()}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-bold text-white shadow-lg"
            >
              Restart Camera
            </button>
          </div>
        )}
      </div>

      {/* Camera Capture & File Upload Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cameraActive && !selectedImage ? (
          <button
            onClick={captureSnapshot}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-900/40 active:scale-95 transition"
          >
            <Camera className="w-4 h-4" /> Snapshot & Analyze
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedImage(null);
              startCamera();
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 hover:text-white text-xs font-bold active:scale-95 transition"
          >
            <Camera className="w-4 h-4" /> Open Camera Feed
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white text-xs font-bold active:scale-95 transition"
        >
          <Upload className="w-4 h-4 text-emerald-400" /> Gallery Se Lein
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Preset Analysis Chips */}
      {selectedImage && (
        <div className="space-y-3 mb-4 animate-fade-in">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleRunAnalysis(p.prompt)}
                className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-cyan-950/70 border border-gray-800 hover:border-cyan-500/40 text-xs text-gray-300 hover:text-cyan-300 whitespace-nowrap transition active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Vision Query Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask anything about this image (e.g. Yeh kya hai?)..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
            />
            <button
              onClick={() => handleRunAnalysis()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white disabled:opacity-40 shadow-md shadow-cyan-900/40 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLoading ? 'Scanning...' : 'Analyze'}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Output Result Box */}
      {analysisResult && (
        <div className="rounded-2xl bg-gray-900/90 border border-cyan-500/40 p-4 shadow-xl animate-fade-in flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5" /> Visual Intelligence Report
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSpeak(analysisResult)}
                title="Speak text"
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-cyan-400 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                title="Copy text"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleShare}
                title="Share"
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-cyan-400 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed max-h-72 overflow-y-auto pr-1">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};
