import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, Plus, CheckCircle2, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  votes: number;
  hasVoted: boolean;
  status: 'In Review' | 'Planned' | 'Completed';
  category: string;
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    title: 'Support WhatsApp QR Pairing alongside Pairing Code',
    description: 'Allow scanning QR directly in the Web UI for instances without interactive terminal.',
    votes: 42,
    hasVoted: false,
    status: 'Planned',
    category: 'WhatsApp',
  },
  {
    id: 'sug-2',
    title: 'Custom Subdomain & Webhook forwarding',
    description: 'Provide *.yashihalls.me subdomains for WhatsApp bot webhooks and group status dashboards.',
    votes: 38,
    hasVoted: false,
    status: 'In Review',
    category: 'Networking',
  },
  {
    id: 'sug-3',
    title: 'Daily Coin Auto-Claim via WhatsApp bot command',
    description: 'Allow sending .claim to the bot to automatically claim coins without opening the browser.',
    votes: 76,
    hasVoted: true,
    status: 'Completed',
    category: 'Coins & Wallet',
  },
];

export const SuggestView: React.FC = () => {
  const { addToast } = useApp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const hasVoted = !s.hasVoted;
          return {
            ...s,
            votes: hasVoted ? s.votes + 1 : s.votes - 1,
            hasVoted,
          };
        }
        return s;
      })
    );
    addToast('Vote recorded! Thank you for helping prioritize features.', 'info');
  };

  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newSug: Suggestion = {
        id: `sug-${Date.now()}`,
        title: newTitle.trim(),
        description: newDesc.trim() || 'Community requested feature.',
        votes: 1,
        hasVoted: true,
        status: 'In Review',
        category: 'Feature Request',
      };
      setSuggestions((prev) => [newSug, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setIsSubmitting(false);
      addToast('Suggestion submitted! It will appear on the roadmap once reviewed.', 'success');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Suggest Features
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Help us build the most reliable cloud bot hosting platform
        </p>
      </div>

      {/* Submit Box */}
      <div className="rounded-2xl bg-[#111822] border border-[#1e2a38] p-5 shadow-lg">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <span>Have an idea for StianHost?</span>
        </h2>
        <form onSubmit={handleCreateSuggestion} className="space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Feature or template idea title..."
            className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
          <textarea
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Details or repository links (optional)..."
            className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              Post Suggestion
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Community Ideas ({suggestions.length})
        </h2>

        {suggestions.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#111822] border border-[#1e2a38] flex items-start gap-3.5 hover:border-[#2b3c4f] transition-all"
          >
            <button
              onClick={() => handleVote(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[50px] transition-all active:scale-95 ${
                item.hasVoted
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#15202c] border-[#223345] text-slate-400 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mb-0.5" />
              <span className="text-xs font-mono font-bold">{item.votes}</span>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    item.status === 'Completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'Planned'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
