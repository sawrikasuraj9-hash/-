import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DeleteAccountModal: React.FC = () => {
  const { openDeleteAccountModal, setOpenDeleteAccountModal, resetAccountData, addToast } = useApp();
  const [confirmInput, setConfirmInput] = useState('');

  if (!openDeleteAccountModal) return null;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.toUpperCase() !== 'DELETE') return;

    resetAccountData();
    setOpenDeleteAccountModal(false);
    setConfirmInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1116] border border-rose-500/40 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-400">
                Delete Account Confirmation
              </h3>
              <p className="text-xs text-rose-200/70">
                Irreversible destructive action
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenDeleteAccountModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          This will permanently destroy all active container instances, wipe your coin balance, and delete your transaction ledger.
        </p>

        <form onSubmit={handleDelete} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Type <strong className="text-rose-400">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-[#20141a] border border-rose-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpenDeleteAccountModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#20141a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmInput.toUpperCase() !== 'DELETE'}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Account Deletion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
