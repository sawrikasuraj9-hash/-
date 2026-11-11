import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BOT_TEMPLATES } from '../data/initialData';
import { BotTemplate } from '../types';
import { soundFX } from '../utils/sound';

export const DeployBotModal: React.FC = () => {
  const { 
    openDeployModal, 
    setOpenDeployModal, 
    selectedTemplateForDeploy, 
    coins, 
    user, 
    deployBot,
    setActiveTab
  } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate>(
    selectedTemplateForDeploy || BOT_TEMPLATES[0]
  );
  const [botName, setBotName] = useState('');
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (selectedTemplateForDeploy) {
      setSelectedTemplate(selectedTemplateForDeploy);
    }
  }, [selectedTemplateForDeploy]);

  useEffect(() => {
    if (selectedTemplate) {
      setBotName(`${selectedTemplate.name}-${Math.floor(100 + Math.random() * 900)}`);
      const initialEnv: Record<string, string> = {};
      selectedTemplate.defaultEnv.forEach((item) => {
        initialEnv[item.key] = item.defaultValue;
      });
      setEnvValues(initialEnv);
    }
  }, [selectedTemplate]);

  if (!openDeployModal) return null;

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!botName.trim()) {
      setErrorMsg('Please enter a bot name');
      return;
    }

    soundFX.playClick();
    setIsDeploying(true);
    try {
      const res = await deployBot(selectedTemplate, botName.trim(), envValues);
      setIsDeploying(false);

      if (res.success) {
        soundFX.playSuccess();
        setOpenDeployModal(false);
        setActiveTab('deployments');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setIsDeploying(false);
      setErrorMsg(err?.message || 'Deployment failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg rounded-3xl bg-[#111822]/95 backdrop-blur-xl border border-[#243547] p-5 sm:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2c3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Deploy New Bot
              </h3>
              <p className="text-xs text-slate-400">
                Launch 24/7 container on YASHI HALLS
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundFX.playClick();
              setOpenDeployModal(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182330] transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleDeploy} className="space-y-4">
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Bot Template
            </label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => {
                const found = BOT_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) setSelectedTemplate(found);
              }}
              className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {BOT_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.platform} - {tpl.costCoins} Coins)
                </option>
              ))}
            </select>
          </div>

          {/* Bot Container Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Container / Instance Name
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="e.g. REAPER-BOT-1"
              className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500 shadow-inner"
              required
            />
          </div>

          {/* Environment Variables */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-semibold text-slate-300">
              Template Configuration / Secrets
            </div>
            {selectedTemplate.defaultEnv.map((field) => (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300">
                    {field.key} {field.required && <span className="text-rose-400">*</span>}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {field.description}
                  </span>
                </div>
                <input
                  type="text"
                  value={envValues[field.key] || ''}
                  onChange={(e) =>
                    setEnvValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={`Enter ${field.key}`}
                  className="w-full bg-[#15202c] border border-[#243547] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            ))}
          </div>

          {/* Cost and Balance Summary */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#243547] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Deployment Cost:</span>
              <span className="font-mono font-bold text-white">
                {user.plan === 'pro' ? 'FREE (Pro Plan)' : `${selectedTemplate.costCoins} Coins`}
              </span>
            </div>

            <div className="text-slate-400">
              Balance: <span className="font-mono font-bold text-emerald-400">{coins} Coins</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f2c3d]">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setOpenDeployModal(false);
              }}
              className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#182330] transition-colors"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={isDeploying}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              {isDeploying ? (
                <span>Deploying Container...</span>
              ) : (
                <>
                  <span>Confirm & Deploy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
