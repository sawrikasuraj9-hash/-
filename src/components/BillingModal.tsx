import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Bot,
  Lock,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { soundFX } from '../utils/sound';

export const BillingModal: React.FC = () => {
  const { openProModal, setOpenProModal, user, changePlan, setPlanToPurchase, syncBotProfilePic } = useApp();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!openProModal) return null;

  const handleSelectPlan = async (plan: 'mini' | 'pro' | 'business') => {
    soundFX.playClick();
    if (plan === 'mini') {
      setIsUpgrading(true);
      await changePlan('mini');
      setIsUpgrading(false);
      setOpenProModal(false);
      return;
    }
    if (user.ownedPlans?.includes(plan)) {
      setIsUpgrading(true);
      await changePlan(plan);
      setIsUpgrading(false);
      setOpenProModal(false);
      return;
    }
    // Unowned -> launch secure Purchase Confirmation dialog
    setOpenProModal(false);
    setPlanToPurchase(plan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-4xl rounded-3xl bg-[#0f1722]/95 backdrop-blur-2xl border border-cyan-500/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2c3d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-cyan-500/40 bg-[#14202e] shrink-0 p-1">
              <img
                src={APP_CONFIG.logoUrl}
                alt="YASHI HALLS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>YASHI HALLS Plan Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  MINI • PRO • BUSINESS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose the exact tier suited for your WhatsApp bot containers and automation workloads
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundFX.playClick();
              setOpenProModal(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182330] transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 3 Tier Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. MINI PLAN CARD */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            user.plan === 'mini' ? 'border-emerald-500/60 bg-[#121c27] shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-[#1e2a38] bg-[#0c131c]'
          } space-y-3 flex flex-col justify-between transition-all`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>YASHI HALLS MINI</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  Free / 0 Coins
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lightweight Baileys bot for single device personal chats and basic utility.
              </p>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-[#1e2a38]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">1 Bot Container Slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Basic Media (50 daily MP3/MP4/Img)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>YASHI HALLS AI Chat (100 daily queries)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Quick Reply Buttons & Text Fallback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Basic Group Tools (.groupinfo, .tagall)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>No Anti-Link Defense</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('mini')}
              disabled={isUpgrading || user.plan === 'mini'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-4 ${
                user.plan === 'mini'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default font-black'
                  : 'bg-[#182635] hover:bg-[#203347] text-white border border-[#2b3e52]'
              }`}
            >
              {user.plan === 'mini' ? 'Current Active Plan ✓' : 'Switch to MINI'}
            </button>
          </div>

          {/* 2. PRO PLAN CARD */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 ${
            user.plan === 'pro' ? 'border-cyan-400 bg-gradient-to-br from-cyan-950/40 to-[#122130] shadow-[0_0_25px_rgba(6,182,212,0.25)]' : 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 to-[#111c27]'
          } space-y-3 flex flex-col justify-between relative`}>
            {user.plan !== 'pro' && (
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                MOST POPULAR
              </span>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  <span>YASHI HALLS PRO</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                  10 Coins / VIP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Powerhouse WhatsApp platform with multi-session containers and full automation.
              </p>

              <div className="space-y-2 text-xs text-slate-200 pt-2 border-t border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">5 Bot Slots & Multi-Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Unlimited Media (.song, .play, .tiktok, .ig, .fb)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Advanced AI (.write, .code, .translate, .imagine)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Anti-Link Defense & Group Auto-Ban (.warn, .kick)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Auto Status Story Viewer & Group Welcome</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>2048 MB RAM Allocations & 24/7 Cluster</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={isUpgrading || user.plan === 'pro'}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-4 ${
                user.plan === 'pro'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default font-black'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950'
              }`}
            >
              {user.plan === 'pro' ? 'Current Active Plan ✓' : 'Upgrade to PRO (10 Coins)'}
            </button>
          </div>

          {/* 3. BUSINESS PLAN CARD */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 ${
            user.plan === 'business' ? 'border-amber-400 bg-gradient-to-br from-amber-950/40 to-[#1e1710] shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-[#181310]'
          } space-y-3 flex flex-col justify-between relative`}>
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
              ENTERPRISE FLEET
            </span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>YASHI HALLS BUSINESS</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                  30 Coins / VIP
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Enterprise Multi-Agent fleet with dedicated cloud nodes, white-label branding, and SLA.
              </p>

              <div className="space-y-2 text-xs text-slate-200 pt-2 border-t border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300">25 Bot Slots & Fleet Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dedicated High-Speed Node & Zero Rate-Limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>White-Label Custom Bot Branding & Profile Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Automated Mass Broadcast & Auto-Responder</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Rest API Webhook Access for External Systems</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>VIP 24/7 SLA Priority Support (+94 74 071 2934)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('business')}
              disabled={isUpgrading || user.plan === 'business'}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-4 ${
                user.plan === 'business'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default font-black'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black'
              }`}
            >
              {user.plan === 'business' ? 'Current Active Plan ✓' : 'Upgrade to BUSINESS (30 Coins)'}
            </button>
          </div>

        </div>

        {/* Bottom Channel Support Banner */}
        <div className="pt-3 border-t border-[#1e2a38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Official WhatsApp Channel:</span>
            <a
              href={APP_CONFIG.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
              whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z
            </a>
          </div>
          <div>
            Helpline: <span className="text-white font-mono font-bold">0740712934</span> · Powered by <span className="text-cyan-400 font-bold">YASHI HALLS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
