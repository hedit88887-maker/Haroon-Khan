import React from 'react';
import { AlertTriangle, Check, X, Phone, MessageSquare, Trash2, Power } from 'lucide-react';
import { ToolCall } from '../types/assistant';

interface ConfirmationModalProps {
  toolCall: ToolCall | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  toolCall,
  onConfirm,
  onCancel,
}) => {
  if (!toolCall) return null;

  const getActionDetails = () => {
    switch (toolCall.name) {
      case 'call':
        return {
          icon: <Phone className="w-8 h-8 text-emerald-400" />,
          title: 'Confirm Phone Call',
          subtitle: `Do you want NOVA to dial ${toolCall.args.contact || 'contact'} (${toolCall.args.phone || ''})?`,
          actionLabel: 'Call Now',
          color: 'emerald',
        };
      case 'send_sms':
        return {
          icon: <MessageSquare className="w-8 h-8 text-cyan-400" />,
          title: 'Confirm Outbound SMS',
          subtitle: `Send SMS to ${toolCall.args.contact || toolCall.args.phone}:\n"${toolCall.args.text || ''}"`,
          actionLabel: 'Send SMS',
          color: 'cyan',
        };
      case 'send_whatsapp':
        return {
          icon: <MessageSquare className="w-8 h-8 text-emerald-400" />,
          title: 'Confirm WhatsApp Message',
          subtitle: `Send WhatsApp to ${toolCall.args.contact || toolCall.args.phone}:\n"${toolCall.args.text || ''}"`,
          actionLabel: 'Send WhatsApp',
          color: 'emerald',
        };
      case 'delete_file':
        return {
          icon: <Trash2 className="w-8 h-8 text-rose-500" />,
          title: 'Confirm File Deletion',
          subtitle: `Permanently delete file at: ${toolCall.args.path}? This action cannot be reversed.`,
          actionLabel: 'Delete File',
          color: 'rose',
        };
      case 'power':
        return {
          icon: <Power className="w-8 h-8 text-amber-400" />,
          title: `Confirm Device ${toolCall.args.action?.toUpperCase() || 'POWER'}`,
          subtitle: `Are you sure you want to ${toolCall.args.action || 'power off'} the device?`,
          actionLabel: `Proceed (${toolCall.args.action})`,
          color: 'amber',
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          title: 'Security Confirmation',
          subtitle: `Execute sensitive action: ${toolCall.name}?`,
          actionLabel: 'Confirm Action',
          color: 'cyan',
        };
    }
  };

  const details = getActionDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-gray-900/95 p-6 shadow-2xl neon-glow-cyan text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/80 border border-cyan-400/30">
          {details.icon}
        </div>

        <h3 className="text-xl font-bold tracking-wide text-white">
          {details.title}
        </h3>

        <div className="mt-3 rounded-xl bg-gray-950/70 p-3 border border-gray-800 text-left">
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            Safety Protocol Active
          </p>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {details.subtitle}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition active:scale-95"
          >
            <X className="w-4 h-4 text-rose-400" />
            No / Reject
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 ${
              details.color === 'rose'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/50'
            }`}
          >
            <Check className="w-4 h-4" />
            {details.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
