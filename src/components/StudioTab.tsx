import React, { useState } from 'react';
import {
  Video,
  Scissors,
  Hash,
  Code,
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { openAppOrLink, triggerDownload } from '../utils/phoneIntents';

interface StudioTabProps {
  onGenerate: (prompt: string) => Promise<string>;
  onSpeak: (text: string) => void;
  isLoading: boolean;
}

type StudioCategory = 'video_script' | 'editing_guide' | 'captions' | 'code' | 'writing';

export const StudioTab: React.FC<StudioTabProps> = ({ onGenerate, onSpeak, isLoading }) => {
  const [activeCategory, setActiveCategory] = useState<StudioCategory>('video_script');
  const [inputTopic, setInputTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'Roman Urdu' | 'Urdu' | 'English' | 'Hinglish'>('Roman Urdu');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const CATEGORIES = [
    {
      id: 'video_script' as StudioCategory,
      name: 'Viral Shorts & Reels',
      icon: <Video className="w-4 h-4" />,
      desc: '3-second hook, B-Roll, voiceover, and call-to-action',
      placeholder: 'e.g. AI tools that make money in 2026, or Gym fitness workout',
    },
    {
      id: 'editing_guide' as StudioCategory,
      name: 'CapCut & InShot Guide',
      icon: <Scissors className="w-4 h-4" />,
      desc: 'Step-by-step cuts, velocity sync, auto-captions, and 4K export',
      placeholder: 'e.g. How to do smooth velocity zoom transitions and bass sync',
    },
    {
      id: 'captions' as StudioCategory,
      name: 'Viral Captions & Tags',
      icon: <Hash className="w-4 h-4" />,
      desc: 'Engaging captions, trending hashtags (#fyp, #explore) & emojis',
      placeholder: 'e.g. New vlog in Lahore, or Motivational mindset quote',
    },
    {
      id: 'code' as StudioCategory,
      name: 'Code & Debugging',
      icon: <Code className="w-4 h-4" />,
      desc: 'Production-ready scripts in Python, JS, Kotlin, Bash, etc.',
      placeholder: 'e.g. Python script to download YouTube video or build Android app',
    },
    {
      id: 'writing' as StudioCategory,
      name: 'Emails, Letters & CV',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Professional formal emails, job applications, and translations',
      placeholder: 'e.g. Sick leave email to manager, or Freelance client proposal',
    },
  ];

  const handleCreate = async () => {
    if (!inputTopic.trim()) return;

    let fullPrompt = '';
    switch (activeCategory) {
      case 'video_script':
        fullPrompt = `Write a viral 30-45 second TikTok/Reels/Shorts video script about "${inputTopic}". Language: ${selectedLanguage}. Include:
1. Killer 3-second visual + verbal Hook.
2. Step-by-step scene breakdown with B-roll visual cues.
3. Voiceover script.
4. Call-to-action (Save & Follow).
5. 5 top trending hashtags.`;
        break;
      case 'editing_guide':
        fullPrompt = `Provide a step-by-step mobile video editing workflow in CapCut or InShot for "${inputTopic}". Language: ${selectedLanguage}. Explain:
1. Clip trimming & pacing.
2. Keyframes, velocity ramps, and zooms.
3. Sound effect placement (whoosh, hit, riser).
4. Auto-captions style & glowing text animations.
5. Best export settings for crisp 4K 60FPS on Instagram/TikTok.`;
        break;
      case 'captions':
        fullPrompt = `Generate 3 distinct viral caption variations (Humorous, Inspiring, Short & Punchy) for a post about "${inputTopic}". Language: ${selectedLanguage}. Include 15 high-reach hashtags and relevant emojis.`;
        break;
      case 'code':
        fullPrompt = `Write complete, production-ready, clean, working code for "${inputTopic}". Include comments, step-by-step setup and execution instructions. Explain how to test it.`;
        break;
      case 'writing':
        fullPrompt = `Write a polished, professional document for "${inputTopic}". Language: ${selectedLanguage}. Ensure polite, compelling, and persuasive phrasing.`;
        break;
    }

    const res = await onGenerate(fullPrompt);
    setGeneratedOutput(res);
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!generatedOutput) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NOVA Studio Creation',
          text: generatedOutput,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            NOVA Creative Studio
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            Viral Content, Editing Tutorials, Coding & Writing Engine
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Topic or Request
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="rounded-lg bg-gray-950 border border-gray-800 px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="Roman Urdu">Roman Urdu</option>
              <option value="Urdu">اردو (Urdu)</option>
              <option value="Hinglish">Hinglish</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputTopic}
          onChange={(e) => setInputTopic(e.target.value)}
          placeholder={CATEGORIES.find((c) => c.id === activeCategory)?.placeholder}
          className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            {CATEGORIES.find((c) => c.id === activeCategory)?.desc}
          </p>

          <button
            onClick={handleCreate}
            disabled={!inputTopic.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-cyan-900/40 disabled:opacity-40 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Generating...' : 'Generate with NOVA'}
          </button>
        </div>
      </div>

      {/* Output Viewer */}
      {generatedOutput && (
        <div className="rounded-2xl bg-gray-900/90 border border-cyan-500/30 p-4 shadow-xl animate-fade-in flex flex-col flex-1">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              Generated Result
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSpeak(generatedOutput)}
                title="Speak text"
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-cyan-400 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
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
              <button
                onClick={() => triggerDownload(generatedOutput, `nova_${activeCategory}.txt`)}
                title="Download text file"
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-cyan-400 transition"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-sans max-h-96 overflow-y-auto pr-1">
            {generatedOutput}
          </div>

          {/* Quick App Launchers for creation */}
          <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center">Open directly in:</span>
            <button
              onClick={() => openAppOrLink('capcut')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white"
            >
              <Scissors className="w-3 h-3 text-cyan-400" /> CapCut
            </button>
            <button
              onClick={() => openAppOrLink('inshot')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white"
            >
              <Video className="w-3 h-3 text-pink-400" /> InShot
            </button>
            <button
              onClick={() => openAppOrLink('tiktok')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white"
            >
              <ExternalLink className="w-3 h-3 text-cyan-300" /> TikTok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
