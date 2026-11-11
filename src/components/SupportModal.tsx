import React, { useState } from 'react';
import { X, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupportModal: React.FC = () => {
  const { openSupportModal, setOpenSupportModal, user, addToast } = useApp();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payment / Coins');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!openSupportModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOpenSupportModal(false);
      addToast('Support ticket #STN-8942 created. Our team will review your account.', 'success');
      setMessage('');
      setSubject('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#111822] border border-[#243547] p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2c3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Contact Support
              </h3>
              <p className="text-xs text-slate-400">
                Ticket response time &lt; 2 hours
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenSupportModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182330] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Payment / Coins">Payment / Coins</option>
              <option value="Bot Container Crash">Bot Container Crash</option>
              <option value="WhatsApp Session Pairing">WhatsApp Session Pairing</option>
              <option value="Billing / Pro Plan">Billing / Pro Plan</option>
              <option value="Other">Other Query</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Describe what went wrong
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about the transaction, bot error logs, or unexpected charges..."
              className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting Ticket...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
