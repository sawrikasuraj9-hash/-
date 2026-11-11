import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  RefreshCw, 
  Play, 
  Square, 
  Trash2, 
  Cpu, 
  HardDrive, 
  Plus, 
  Layers,
  Key,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BotDeployment } from '../types';
import { soundFX } from '../utils/sound';
import { PairingView } from './PairingView';

export const DeploymentsView: React.FC = () => {
  const { 
    bots, 
    user, 
    startBot,
    stopBot,
    restartBot, 
    toggleBotState, 
    deleteBot, 
    setOpenTerminalBot, 
    setOpenDeployModal,
    updateBotEnv,
    setOpenEditBotModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pairing' | 'instances'>('pairing');
  const [editingEnvBot, setEditingEnvBot] = useState<BotDeployment | null>(null);
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleOpenEnvModal = (bot: BotDeployment) => {
    soundFX.playClick();
    setEditingEnvBot(bot);
    setEnvInputs({ ...bot.env });
  };

  const handleSaveEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnvBot) return;
    soundFX.playSuccess();
    updateBotEnv(editingEnvBot.id, envInputs);
    setEditingEnvBot(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Toggle between WhatsApp Pairing (as in screenshot) & Live Instances */}
      <div className="max-w-xl mx-auto px-4 pt-2">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#111822] rounded-2xl border border-[#1e2a38]">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveSubTab('pairing');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pairing'
                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>WhatsApp Pairing</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveSubTab('instances');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'instances'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Bots ({bots.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'pairing' ? (
        <PairingView />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-28 relative"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Active Deployments</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage your YASHI HALLS (MINI & PRO) 24/7 container instances
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundFX.playSuccess();
                setOpenDeployModal(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all self-start sm:self-auto active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Deploy Bot</span>
            </motion.button>
          </div>

          {/* Deployments List */}
          <div className="space-y-4">
            {bots.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#111822] border border-[#1e2a38] space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                  <Bot className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Bots Deployed Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your account is completely clean. Generate a WhatsApp pairing code to connect your YASHI HALLS PRO bot!
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setActiveSubTab('pairing')}
                    className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md"
                  >
                    Open WhatsApp Pairing
                  </button>
                </div>
              </div>
            ) : (
              bots.map((bot) => (
                <motion.div
                  key={bot.id}
                  whileHover={{ y: -3, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                            {bot.name}
                          </h2>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            bot.status === 'running'
                              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-700/40 text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                            {bot.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {bot.templateName} · <span className="font-mono text-slate-300">Port {bot.port}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          soundFX.playClick();
                          setOpenTerminalBot(bot);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172330] hover:bg-[#1e2f42] border border-[#243547] text-slate-200 hover:text-emerald-400 text-xs font-mono transition-colors shadow-sm"
                      >
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Logs</span>
                      </motion.button>

                      {bot.status === 'running' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            soundFX.playClick();
                            setOpenEditBotModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                        >
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit Bot</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenEnvModal(bot)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172330] hover:bg-[#1e2f42] border border-[#243547] text-slate-200 hover:text-white text-xs transition-colors shadow-sm"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Variables</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          soundFX.playClick();
                          restartBot(bot.id);
                        }}
                        className="p-2.5 rounded-xl bg-[#172330] hover:bg-[#1e2f42] border border-[#243547] text-slate-200 hover:text-white transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${bot.status === 'rebuilding' ? 'animate-spin' : ''}`} />
                      </motion.button>

                      {bot.status === 'running' || bot.status === 'deploying' || bot.status === 'rebuilding' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            soundFX.playClick();
                            stopBot();
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs transition-colors shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                          title="Stop WhatsApp Bot Engine"
                        >
                          <Square className="w-3.5 h-3.5 fill-rose-400" />
                          <span>Stop Bot (නවත්වන්න)</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            soundFX.playClick();
                            startBot();
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-colors shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          title="Start WhatsApp Bot Engine"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Start Bot (ක්‍රියාත්මක)</span>
                        </motion.button>
                      )}

                      {confirmDeleteId === bot.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/80 p-1 rounded-xl shadow-lg animate-in fade-in">
                          <button
                            onClick={async () => {
                              soundFX.playClick();
                              await deleteBot(bot.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow"
                          >
                            Delete Now (මකන්න)
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-slate-300 hover:text-white text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            soundFX.playClick();
                            setConfirmDeleteId(bot.id);
                            setTimeout(() => {
                              setConfirmDeleteId((prev) => (prev === bot.id ? null : prev));
                            }, 8000);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-rose-200 text-xs transition-colors"
                          title="Delete Container & Clear WhatsApp Session"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Delete (මකන්න)</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1e2a38] text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">RAM</span>
                      <div className="font-mono text-white font-semibold">{bot.ramUsedMb} / {bot.ramMaxMb} MB</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">CPU</span>
                      <div className="font-mono text-white font-semibold">{bot.cpu}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Uptime</span>
                      <div className="font-mono text-white font-semibold">{bot.uptime}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Port</span>
                      <div className="font-mono text-emerald-400 font-semibold">:{bot.port}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Edit Variables Modal */}
          <AnimatePresence>
            {editingEnvBot && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  className="w-full max-w-lg rounded-3xl bg-[#111822] border border-[#243345] p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#1f2c3d]">
                    <h3 className="text-base font-bold text-white">
                      Variables: {editingEnvBot.name}
                    </h3>
                    <button
                      onClick={() => setEditingEnvBot(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEnv} className="space-y-3.5">
                    {Object.entries(envInputs).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-mono font-semibold text-slate-300">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            setEnvInputs((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full bg-[#15202c] border border-[#243345] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                        />
                      </div>
                    ))}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2c3d]">
                      <button
                        type="button"
                        onClick={() => setEditingEnvBot(null)}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#182330]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                      >
                        Save & Restart
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
