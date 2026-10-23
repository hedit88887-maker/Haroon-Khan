import React, { useState, useEffect } from 'react';
import {
  Clock,
  Timer,
  Bell,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Smartphone,
  Check,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { InAppAlarm, InAppTimer } from '../types/assistant';
import { sounds } from '../utils/audioAlarm';
import { triggerAndroidAlarmIntent, triggerAndroidTimerIntent } from '../utils/phoneIntents';

interface AlarmsTabProps {
  alarms: InAppAlarm[];
  setAlarms: React.Dispatch<React.SetStateAction<InAppAlarm[]>>;
  reminders: { id: string; time: string; text: string }[];
  setReminders: React.Dispatch<React.SetStateAction<{ id: string; time: string; text: string }[]>>;
}

export const AlarmsTab: React.FC<AlarmsTabProps> = ({
  alarms,
  setAlarms,
  reminders,
  setReminders,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alarms' | 'timer' | 'reminders'>('alarms');

  // Alarm form state
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Morning Routine');

  // Countdown Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLabel, setTimerLabel] = useState('Focus Sprint');

  // Reminders state
  const [newReminderTime, setNewReminderTime] = useState('17:00');
  const [newReminderText, setNewReminderText] = useState('Finish video edit');

  // Active alarm firing modal state
  const [ringingItem, setRingingItem] = useState<{ title: string; subtitle: string } | null>(null);

  // Timer Tick Hook
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            sounds.playAlarmRing(6);
            setRingingItem({
              title: '⏰ Timer Finished!',
              subtitle: timerLabel,
            });
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('NOVA Timer Complete', { body: timerLabel });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerLabel]);

  // Alarms Checker Hook
  useEffect(() => {
    const alarmChecker = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentSeconds = now.getSeconds();

      if (currentSeconds === 0) {
        alarms.forEach((alarm) => {
          if (alarm.enabled && alarm.time === currentTimeString) {
            sounds.playAlarmRing(6);
            setRingingItem({
              title: '🔔 Alarm Alert!',
              subtitle: `${alarm.label} (${alarm.time})`,
            });
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`NOVA Alarm: ${alarm.time}`, { body: alarm.label });
            }
          }
        });

        reminders.forEach((rem) => {
          if (rem.time === currentTimeString) {
            sounds.playAlarmRing(4);
            setRingingItem({
              title: '📌 Scheduled Reminder',
              subtitle: rem.text,
            });
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('NOVA Reminder', { body: rem.text });
            }
          }
        });
      }
    }, 1000);

    return () => clearInterval(alarmChecker);
  }, [alarms, reminders]);

  const handleAddAlarm = () => {
    if (!newAlarmTime) return;
    const newAlarm: InAppAlarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel || 'NOVA Alarm',
      enabled: true,
    };
    setAlarms((prev) => [...prev, newAlarm]);
    sounds.playSuccess();
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendAndroidIntentAlarm = (time: string, label: string) => {
    const [h, m] = time.split(':').map(Number);
    triggerAndroidAlarmIntent(h, m, label);
  };

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAddReminder = () => {
    if (!newReminderText.trim()) return;
    setReminders((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: newReminderTime,
        text: newReminderText,
      },
    ]);
    sounds.playSuccess();
    setNewReminderText('');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-24 text-gray-100 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Alarms & Timers
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            In-App Sound Chimes & Android Clock Intents
          </p>
        </div>
      </div>

      {/* Sub-Tabs (Alarms | Countdown Timer | Reminders) */}
      <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-800 mb-5">
        <button
          onClick={() => setActiveSubTab('alarms')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'alarms'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Alarms ({alarms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('timer')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'timer'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" /> Stopwatch Timer
        </button>
        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'reminders'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Reminders ({reminders.length})
        </button>
      </div>

      {/* SUB-TAB: ALARMS */}
      {activeSubTab === 'alarms' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Alarm Form */}
          <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-3">
              Set New Alarm
            </span>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Time (24h)</label>
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-lg font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Label</label>
                <input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  placeholder="e.g. Gym, Prayer, Work"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddAlarm}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/40 transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> Save In-App Alarm
              </button>
              <button
                onClick={() => handleSendAndroidIntentAlarm(newAlarmTime, newAlarmLabel)}
                title="Send intent to Android system clock app"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-cyan-300 text-xs font-semibold transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" /> Android Clock
              </button>
            </div>
          </div>

          {/* Existing Alarms List */}
          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between rounded-2xl bg-gray-900/90 border border-gray-800 px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => handleToggleAlarm(alarm.id)}
                    className={`cursor-pointer w-10 h-6 rounded-full flex items-center p-1 transition ${
                      alarm.enabled ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                  <div>
                    <div
                      className={`text-xl font-bold font-mono tracking-wider ${
                        alarm.enabled ? 'text-white' : 'text-gray-500 line-through'
                      }`}
                    >
                      {alarm.time}
                    </div>
                    <div className="text-xs text-cyan-400">{alarm.label}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendAndroidIntentAlarm(alarm.time, alarm.label)}
                    title="Sync to Android Clock"
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-cyan-300"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: COUNTDOWN TIMER */}
      {activeSubTab === 'timer' && (
        <div className="flex flex-col items-center justify-center py-6 rounded-2xl bg-gray-900/90 border border-gray-800 p-6 shadow-xl animate-fade-in">
          <input
            type="text"
            value={timerLabel}
            onChange={(e) => setTimerLabel(e.target.value)}
            className="text-center text-sm font-semibold text-cyan-400 bg-transparent border-b border-gray-800 focus:outline-none mb-6 px-4 py-1"
          />

          {/* Huge Countdown Display */}
          <div className="relative flex items-center justify-center w-60 h-60 rounded-full border-4 border-cyan-500/30 neon-glow-cyan mb-6">
            <span className="text-5xl font-mono font-black text-white tracking-widest">
              {formatTimerDisplay(timerSeconds)}
            </span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(300);
              }}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex items-center justify-center h-16 w-16 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/50 active:scale-95 transition"
            >
              {timerRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <button
              onClick={() => triggerAndroidTimerIntent(timerSeconds, timerLabel)}
              title="Sync to Android native timer"
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-cyan-400"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2">
            {[60, 180, 300, 600, 900, 1800].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setTimerSeconds(sec);
                  setTimerRunning(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-cyan-300 hover:border-cyan-500"
              >
                {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: REMINDERS */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Reminder Card */}
          <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-3">
              Add Routine Reminder
            </span>
            <div className="flex gap-2 mb-3">
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-28 rounded-xl bg-gray-950 border border-gray-800 px-2 py-2 text-sm font-mono font-bold text-cyan-300 text-center"
              />
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="e.g. Finish client edit by 5 PM"
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddReminder()}
              />
            </div>
            <button
              onClick={handleAddReminder}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Schedule Reminder
            </button>
          </div>

          {/* Reminders List */}
          <div className="space-y-2">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center justify-between rounded-xl bg-gray-900/80 border border-gray-800 px-3.5 py-2.5"
              >
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold mr-2">
                    {rem.time}
                  </span>
                  <span className="text-xs text-gray-200">{rem.text}</span>
                </div>
                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-1 text-gray-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ringing Modal when Alarm or Timer completes */}
      {ringingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-gray-950 border border-cyan-400 p-6 text-center neon-glow-cyan">
            <Bell className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-1">{ringingItem.title}</h3>
            <p className="text-sm text-cyan-300 font-mono mb-6">{ringingItem.subtitle}</p>
            <button
              onClick={() => {
                sounds.playStop();
                setRingingItem(null);
              }}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-bold text-white shadow-lg shadow-cyan-900/50"
            >
              Dismiss / Stop Alarm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
