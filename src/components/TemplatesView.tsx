import React from 'react';
import { 
  Bot, 
  Crown, 
  Building2, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Link as LinkIcon, 
  Check, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BOT_TEMPLATES, PLAN_PRICING } from '../data/initialData';
import { BotTemplate } from '../types';
import { soundFX } from '../utils/sound';

export const TemplatesView: React.FC = () => {
  const { 
    setSelectedTemplateForDeploy, 
    setOpenDeployModal, 
    setActiveTab, 
    user, 
    coins, 
    changePlan, 
    setPlanToPurchase 
  } = useApp();

  const handleDeploy = (tpl: BotTemplate) => {
    soundFX.playClick();
    setSelectedTemplateForDeploy(tpl);
    setOpenDeployModal(true);
  };

  const handlePair = () => {
    soundFX.playClick();
    setActiveTab('deployments');
  };

  const miniTemplate = BOT_TEMPLATES[0];
  const proTemplate = BOT_TEMPLATES[1] || BOT_TEMPLATES[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-md sm:max-w-2xl lg:max-w-5xl mx-auto px-4 py-5 space-y-7 pb-24 relative"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ========================================================
          SECTION 1: THREE-TIER PLAN ARCHITECTURE (MINI, PRO, BUSINESS)
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#101E34]">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-cyan-400" />
              <span>YASHI HALLS Plan Architecture</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              MINI is free forever. PRO and BUSINESS unlock multi-session containers and VIP fleet automation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1 rounded-full bg-[#081220] border border-[#162740] text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold">{coins}</span>
              <span className="text-slate-400">coins in wallet</span>
            </div>
          </div>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. MINI PLAN — FREE */}
          <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
            user.plan === 'mini'
              ? 'border-emerald-500/60 bg-gradient-to-b from-[#061814] to-[#040813] shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              : 'border-[#101E34] bg-[#060C18]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>MINI PLAN</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                  FREE
                </span>
              </div>

              <div className="text-2xl font-black text-white font-mono">
                0 <span className="text-xs font-normal text-slate-400">Coins</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {PLAN_PRICING.mini.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-[#101E34]">
                {PLAN_PRICING.mini.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => changePlan('mini')}
              disabled={user.plan === 'mini'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                user.plan === 'mini'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default font-black'
                  : 'bg-[#0f1d32] hover:bg-[#152844] text-white border border-[#1b3152]'
              }`}
            >
              {user.plan === 'mini' ? 'CURRENT PLAN ✓' : 'SELECT MINI (FREE)'}
            </button>
          </div>

          {/* 2. PRO PLAN — PAID (10 COINS) */}
          <div className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col justify-between space-y-4 relative transition-all ${
            user.plan === 'pro'
              ? 'border-cyan-400 bg-gradient-to-b from-[#06182c] to-[#040813] shadow-[0_0_30px_rgba(0,240,255,0.3)]'
              : 'border-cyan-500/40 bg-gradient-to-b from-[#081524] to-[#060C18]'
          }`}>
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
              POPULAR
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  <span>PRO PLAN</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                  10 COINS
                </span>
              </div>

              <div className="text-2xl font-black text-cyan-400 font-mono flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>10</span>
                <span className="text-xs font-normal text-slate-400">Coins</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {PLAN_PRICING.pro.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-200 pt-2 border-t border-cyan-500/30">
                {PLAN_PRICING.pro.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (user.plan === 'pro') return;
                if (user.ownedPlans?.includes('pro')) {
                  changePlan('pro');
                } else {
                  setPlanToPurchase('pro');
                }
              }}
              disabled={user.plan === 'pro'}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                user.plan === 'pro'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default font-black'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              }`}
            >
              {user.plan === 'pro' 
                ? 'CURRENT PLAN ✓' 
                : user.ownedPlans?.includes('pro') 
                ? 'ACTIVATE PRO' 
                : 'BUY PRO (10 COINS)'}
            </button>
          </div>

          {/* 3. BUSINESS PLAN — PAID (30 COINS) */}
          <div className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col justify-between space-y-4 relative transition-all ${
            user.plan === 'business'
              ? 'border-amber-400 bg-gradient-to-b from-[#241706] to-[#040813] shadow-[0_0_30px_rgba(251,191,36,0.3)]'
              : 'border-amber-500/40 bg-gradient-to-b from-[#181108] to-[#060C18]'
          }`}>
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
              ENTERPRISE
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>BUSINESS PLAN</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                  30 COINS
                </span>
              </div>

              <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>30</span>
                <span className="text-xs font-normal text-slate-400">Coins</span>
              </div>

              <p className="text-xs text-amber-200/80 leading-relaxed">
                {PLAN_PRICING.business.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-200 pt-2 border-t border-amber-500/30">
                {PLAN_PRICING.business.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (user.plan === 'business') return;
                if (user.ownedPlans?.includes('business')) {
                  changePlan('business');
                } else {
                  setPlanToPurchase('business');
                }
              }}
              disabled={user.plan === 'business'}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                user.plan === 'business'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default font-black'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              }`}
            >
              {user.plan === 'business' 
                ? 'CURRENT PLAN ✓' 
                : user.ownedPlans?.includes('business') 
                ? 'ACTIVATE BUSINESS' 
                : 'BUY BUSINESS (30 COINS)'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: WHATSAPP BOT TEMPLATES (PRESERVED)
          ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-[#101E34]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Available Bot Templates</span>
            </h2>
            <p className="text-xs text-slate-400">
              Deploy pre-configured Baileys bot containers to your account with 1-click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Template 1: MINI */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#060C18] border border-[#101E34] hover:border-emerald-500/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{miniTemplate.name}</h3>
                    <div className="text-[11px] text-slate-400">Single Instance · Lightweight</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15">
                  STARTER
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {miniTemplate.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handlePair}
                className="px-3.5 py-2 rounded-xl bg-[#0e1d32] hover:bg-[#142640] border border-[#1a3150] text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pair</span>
              </button>
              <button
                onClick={() => handleDeploy(miniTemplate)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0e1d32] hover:bg-[#142640] border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Deploy MINI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Template 2: PRO */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#060C18] border border-cyan-500/30 hover:border-cyan-400 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{proTemplate.name}</h3>
                    <div className="text-[11px] text-cyan-300/80">Multi-Session · Full Suite</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20">
                  ADVANCED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {proTemplate.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handlePair}
                className="px-3.5 py-2 rounded-xl bg-[#0e1d32] hover:bg-[#142640] border border-[#1a3150] text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pair</span>
              </button>
              <button
                onClick={() => handleDeploy(proTemplate)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <span>Deploy PRO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
