import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, MessageSquare, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InviteModal: React.FC = () => {
  const { openInviteModal, setOpenInviteModal, user, addToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!openInviteModal) return null;

  const refUrl = `https://host.stiantech.me/ref/${user.username.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    addToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#111822] border border-[#243547] p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2c3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Invite & Earn Coins
              </h3>
              <p className="text-xs text-slate-400">
                Share your referral link with developers
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenInviteModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182330] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#15202c] border border-emerald-500/30 text-center space-y-1">
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +25 COINS
          </div>
          <p className="text-xs text-slate-300">
            Credited directly to your wallet for each friend who signs up and deploys their first bot!
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Your Personal Referral URL
          </label>
          <div className="flex items-center gap-2 bg-[#15202c] border border-[#243547] rounded-xl p-1.5 pl-3">
            <span className="text-xs font-mono text-slate-300 truncate flex-1">
              {refUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shrink-0"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => {
              const text = `Join YASHI HALLS for 24/7 free bot hosting! Deploy YASHI HALLS PRO WhatsApp bot: ${refUrl}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#1f3024] hover:bg-[#284232] border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
