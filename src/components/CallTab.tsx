import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  MessageCircle,
  Delete,
  User,
  Plus,
  Shield,
  Search,
} from 'lucide-react';
import { ToolCall } from '../types/assistant';

interface CallTabProps {
  contacts: { name: string; phone: string; nickname?: string }[];
  onRequestCall: (contact: string, phone: string) => void;
  onRequestSMS: (contact: string, phone: string, text: string) => void;
  onRequestWhatsApp: (contact: string, phone: string, text: string) => void;
}

export const CallTab: React.FC<CallTabProps> = ({
  contacts,
  onRequestCall,
  onRequestSMS,
  onRequestWhatsApp,
}) => {
  const [dialNumber, setDialNumber] = useState('');
  const [smsText, setSmsText] = useState('Salam! Kahan ho?');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommMode, setActiveCommMode] = useState<'call' | 'sms' | 'whatsapp'>('call');

  const DIAL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  const handleKeyPress = (char: string) => {
    setDialNumber((prev) => prev + char);
  };

  const handleBackspace = () => {
    setDialNumber((prev) => prev.slice(0, -1));
  };

  const handleAction = () => {
    if (!dialNumber) return;

    if (activeCommMode === 'call') {
      onRequestCall(dialNumber, dialNumber);
    } else if (activeCommMode === 'sms') {
      onRequestSMS(dialNumber, dialNumber, smsText);
    } else {
      onRequestWhatsApp(dialNumber, dialNumber, smsText);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.nickname && c.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            Communication & Dialer
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            Direct Calls, SMS & WhatsApp with Safety Confirmation
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-800 mb-4">
        <button
          onClick={() => setActiveCommMode('call')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeCommMode === 'call'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" /> Phone Call
        </button>
        <button
          onClick={() => setActiveCommMode('sms')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeCommMode === 'sms'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> SMS Message
        </button>
        <button
          onClick={() => setActiveCommMode('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeCommMode === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </button>
      </div>

      {/* Number Display & Input */}
      <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 mb-4 text-center shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase text-gray-500">Number / Recipient</span>
          {dialNumber && (
            <button
              onClick={handleBackspace}
              className="text-gray-400 hover:text-rose-400 p-1"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>

        <input
          type="tel"
          value={dialNumber}
          onChange={(e) => setDialNumber(e.target.value)}
          placeholder="Enter phone number..."
          className="w-full text-center text-2xl font-mono font-bold tracking-wider text-white bg-transparent focus:outline-none mb-2"
        />

        {activeCommMode !== 'call' && (
          <div className="mt-2 pt-2 border-t border-gray-800 text-left">
            <label className="text-[11px] text-gray-400 block mb-1">Message Text</label>
            <input
              type="text"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Type message text..."
              className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={!dialNumber}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition active:scale-95 disabled:opacity-40 ${
            activeCommMode === 'call'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
              : activeCommMode === 'sms'
              ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/50'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
          }`}
        >
          {activeCommMode === 'call' && <Phone className="w-4 h-4" />}
          {activeCommMode === 'sms' && <MessageSquare className="w-4 h-4" />}
          {activeCommMode === 'whatsapp' && <MessageCircle className="w-4 h-4" />}
          {activeCommMode === 'call'
            ? 'Dial with Confirmation'
            : activeCommMode === 'sms'
            ? 'Send SMS'
            : 'Open WhatsApp'}
        </button>
      </div>

      {/* Tactical Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-6 w-full">
        {DIAL_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className="flex items-center justify-center h-14 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-lg font-mono font-bold text-gray-200 hover:text-cyan-300 transition active:scale-90"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Saved Contacts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Contacts Directory ({filteredContacts.length})
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="rounded-lg bg-gray-900 border border-gray-800 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 w-28"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredContacts.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl bg-gray-900/90 border border-gray-800 p-3"
            >
              <div
                className="cursor-pointer"
                onClick={() => setDialNumber(c.phone)}
              >
                <div className="text-sm font-semibold text-white">
                  {c.name}{' '}
                  {c.nickname && (
                    <span className="text-xs text-cyan-400 font-normal">({c.nickname})</span>
                  )}
                </div>
                <div className="text-xs font-mono text-gray-400">{c.phone}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRequestCall(c.name, c.phone)}
                  title="Call"
                  className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRequestSMS(c.name, c.phone, smsText)}
                  title="SMS"
                  className="p-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRequestWhatsApp(c.name, c.phone, smsText)}
                  title="WhatsApp"
                  className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
