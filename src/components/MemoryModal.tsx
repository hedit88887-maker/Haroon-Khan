import React, { useState } from 'react';
import { X, Save, Brain, User, Globe, Mic, Volume2, Plus, Trash2, Shield } from 'lucide-react';
import { UserMemory } from '../types/assistant';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: UserMemory;
  onSave: (updated: UserMemory) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserMemory>({ ...memory });
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNick, setNewContactNick] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: newContactName,
          phone: newContactPhone,
          nickname: newContactNick || undefined,
        },
      ],
    }));
    setNewContactName('');
    setNewContactPhone('');
    setNewContactNick('');
  };

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customNotes: [...prev.customNotes, newNote.trim()],
    }));
    setNewNote('');
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customNotes: prev.customNotes.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAll = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-gray-950 p-6 shadow-2xl neon-glow-cyan text-left my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/30 text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">NOVA Memory & Identity</h2>
              <p className="text-xs text-cyan-400 font-mono">Personalized AI Intelligence Core</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* User Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <User className="w-3.5 h-3.5 text-cyan-400" /> User Persona
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Your Name / Title</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="e.g. Haroon Khan"
                className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Language & Voice Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Language & Speech
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Preferred Response Language</label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="auto">Auto-Match (Urdu / Hindi / Hinglish / English)</option>
                <option value="Roman Urdu">Roman Urdu (Hamaray jaisay bolain)</option>
                <option value="Urdu">Urdu (اردو رسم الخط)</option>
                <option value="Hinglish">Hinglish / Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/90 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wakeWordEnabled}
                  onChange={(e) => setFormData({ ...formData, wakeWordEnabled: e.target.checked })}
                  className="rounded border-gray-700 text-cyan-500 focus:ring-cyan-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-cyan-400" /> Wake Word
                  </div>
                  <div className="text-gray-400 text-[10px]">"Hey Jarvis" / "Hey Nova"</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/90 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSpeakResponse}
                  onChange={(e) => setFormData({ ...formData, autoSpeakResponse: e.target.checked })}
                  className="rounded border-gray-700 text-cyan-500 focus:ring-cyan-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Voice Out
                  </div>
                  <div className="text-gray-400 text-[10px]">Speak responses automatically</div>
                </div>
              </label>
            </div>

            {/* Pitch & Rate */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>Voice Speed</span>
                  <span className="text-cyan-400 font-mono">{formData.speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={formData.speechRate}
                  onChange={(e) => setFormData({ ...formData, speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>Voice Pitch</span>
                  <span className="text-cyan-400 font-mono">{formData.speechPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={formData.speechPitch}
                  onChange={(e) => setFormData({ ...formData, speechPitch: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Contacts Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
              <span>Saved Contacts ({formData.contacts.length})</span>
            </div>

            <div className="space-y-2">
              {formData.contacts.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-gray-900/80 px-3 py-2 border border-gray-800"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {c.name}{' '}
                      {c.nickname && (
                        <span className="text-xs text-cyan-400 font-normal">({c.nickname})</span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-gray-400">{c.phone}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(idx)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <input
                type="text"
                placeholder="Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="rounded-lg bg-gray-900 border border-gray-800 px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Phone (e.g. +92300...)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="rounded-lg bg-gray-900 border border-gray-800 px-2.5 py-1.5 text-xs text-white"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Nickname"
                  value={newContactNick}
                  onChange={(e) => setNewContactNick(e.target.value)}
                  className="flex-1 rounded-lg bg-gray-900 border border-gray-800 px-2 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleAddContact}
                  className="p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Memory Notes */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Personal Rules & Routines
            </div>
            <div className="space-y-1.5">
              {formData.customNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-1.5 border border-gray-800 text-xs text-gray-300"
                >
                  <span>{note}</span>
                  <button
                    onClick={() => handleRemoveNote(idx)}
                    className="text-gray-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Always keep replies under 2 sentences in Roman Urdu"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="flex items-center gap-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cyan-400 hover:bg-gray-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-700 text-xs font-semibold text-gray-400 hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/40 hover:opacity-95 transition"
          >
            <Save className="w-4 h-4" /> Save Memory
          </button>
        </div>
      </div>
    </div>
  );
};
