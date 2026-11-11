import React, { useState } from 'react';
import { 
  Zap, 
  ChevronRight, 
  Check, 
  Coins, 
  HelpCircle, 
  Crown, 
  ExternalLink, 
  History, 
  MessageSquare, 
  Sparkles, 
  Link as LinkIcon, 
  Flame, 
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { COIN_PACKS, APP_CONFIG, PLAN_PRICING } from '../data/initialData';
import { CoinPack } from '../types';
import { soundFX } from '../utils/sound';

export const WalletView: React.FC = () => {
  const { 
    user,
    coins, 
    transactions, 
    cooldownSeconds, 
    claimDailyCoins, 
    redeemPromoCode, 
    botUnlockClaim, 
    unlockBotClaim,
    setOpenCoinModal, 
    setSelectedCoinPack, 
    setOpenProModal, 
    setOpenSupportModal, 
    addToast 
  } = useApp();

  const [promoInput, setPromoInput] = useState('YASHI-LAUNCH');
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);

  // Format cooldown seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    soundFX.playClick();
    setIsSubmittingPromo(true);
    setTimeout(() => {
      const res = redeemPromoCode(promoInput);
      if (res.success) soundFX.playSuccess();
      setIsSubmittingPromo(false);
    }, 400);
  };

  const handleClaim = () => {
    if (cooldownSeconds > 0) {
      soundFX.playClick();
      addToast(`Daily claim cooldown active. Please wait ${formatTime(cooldownSeconds)} for the 24-hour cycle to finish.`, 'info');
      return;
    }
    claimDailyCoins();
  };

  const handleBuyPack = (pack: CoinPack) => {
    soundFX.playClick();
    setSelectedCoinPack(pack);
    setOpenCoinModal(true);
  };

  const currentPlanInfo = PLAN_PRICING[user.plan || 'mini'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 pb-28 relative"
    >
      {/* Decorative ambient glowing orbs in the background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Cyber Wallet</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage coins, unlock plans, and power your WhatsApp bots
          </p>
        </div>

        {/* Live Daily Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Active Streak</span>
        </div>
      </div>

      {/* Card 1: Balance & Cooldown with Cyber Neon Cyan Glow */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-cyan-500/40 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all duration-500 pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">//</span> COIN BALANCE
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0E1A2C] border border-[#1B2F4A] text-xs text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${cooldownSeconds > 0 ? 'bg-amber-400' : 'bg-cyan-400 animate-ping'}`} />
            <span className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${cooldownSeconds > 0 ? 'text-amber-300' : 'text-cyan-400'}`}>
              {cooldownSeconds > 0 ? 'COOLDOWN' : 'READY TO CLAIM'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <motion.span 
            key={coins}
            initial={{ scale: 1.2, color: '#00F0FF' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            {coins}
          </motion.span>
          <span className="text-sm font-bold tracking-wider text-cyan-400 uppercase font-mono">
            COINS
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          +1 free coin every 24 hours · Never expire · Used to upgrade plans & deploy extra bot slots
        </p>

        {/* Claim / Countdown button */}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: cooldownSeconds > 0 ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClaim}
            className={`w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl transition-all text-sm shadow-lg ${
              cooldownSeconds > 0
                ? 'bg-[#0a1422] border border-[#1a2d44] text-slate-300 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cooldownSeconds > 0 ? 'bg-slate-800 text-slate-400' : 'bg-slate-950/20 text-slate-950'}`}>
              <Coins className="w-3.5 h-3.5" />
            </div>

            {cooldownSeconds > 0 ? (
              <span className="tabular-nums font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <span>24h Cooldown: Next coin in</span>
                <span className="text-cyan-400 font-bold bg-[#0f1d30] px-2 py-0.5 rounded-lg border border-cyan-500/30">
                  {formatTime(cooldownSeconds)}
                </span>
              </span>
            ) : (
              <span className="font-extrabold text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Claim +1 Free Daily Coin Now!</span>
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Card 2: Active Plan Status & Upgrade */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-purple-500/40 p-5 shadow-lg relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
              user.plan === 'business'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : user.plan === 'pro'
                ? 'bg-purple-500/15 border border-purple-500/40 text-purple-400'
                : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
            }`}>
              {user.plan === 'business' ? <Building2 className="w-4 h-4" /> : user.plan === 'pro' ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              // ACTIVE TIER
            </span>
          </div>

          <motion.button 
            whileHover={{ x: 3 }}
            onClick={() => {
              soundFX.playClick();
              setOpenProModal(true);
            }}
            aria-label="View Pro plans"
            className="text-slate-400 hover:text-white p-1"
          >
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <h3 className="text-lg font-bold text-white">
            {currentPlanInfo.name}
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
            user.plan === 'business'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : user.plan === 'pro'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {currentPlanInfo.badge}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {currentPlanInfo.description}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundFX.playClick();
              setOpenProModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-500/20 hover:from-purple-600/40 hover:to-cyan-500/30 border border-purple-500/50 text-purple-200 text-xs font-bold tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>SWITCH OR UPGRADE PLAN</span>
          </motion.button>

          <span className="text-xs text-slate-400 font-mono">
            {user.botSlotsTotal} Bot Slot{user.botSlotsTotal > 1 ? 's' : ''} Active
          </span>
        </div>
      </motion.div>

      {/* Card 3: Why upgrade with coins? */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg space-y-3"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Why Upgrade with Coins?
          </h3>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Unlimited real audio & video downloads (.song, .play, .tiktok)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Unlock up to 5 bot slots (PRO) or 25 bot slots (BUSINESS)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Automatic call rejection & WhatsApp chat guidance</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Anti-Link shield, group auto-moderation & 24/7 cluster uptime</span>
          </div>
        </div>
      </motion.div>

      {/* Card 4: Promo Code Redemption */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg"
      >
        <h3 className="text-sm font-semibold text-white">
          Have a promo or launch code?
        </h3>

        <form onSubmit={handleRedeem} className="mt-3 flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="YASHI-LAUNCH"
            className="flex-1 bg-[#0A1322] border border-[#162740] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isSubmittingPromo}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            Redeem
          </motion.button>
        </form>

        <p className="text-[11px] text-slate-400 mt-2">
          Each code can only be redeemed once per account. Try <span className="font-mono text-cyan-400 font-bold">YASHI-LAUNCH</span> (+20) or <span className="font-mono text-purple-400 font-bold">YASHI-PRO</span> (+25).
        </p>
      </motion.div>

      {/* Card 5: Official WhatsApp Channel */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
            // OFFICIAL CHANNEL
          </span>
        </div>

        <h3 className="text-base font-bold text-white">
          YASHI HALLS Official Community
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          We release free redeem codes, bot update guides, and cluster alerts on our official WhatsApp channel. Direct hotline: <span className="text-cyan-400 font-mono font-bold">0740712934</span> (+94 74 071 2934).
        </p>

        <div className="mt-3.5 space-y-2">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={APP_CONFIG.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              soundFX.playClick();
              addToast('Opening official YASHI HALLS WhatsApp Channel...', 'info');
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0E1B2D] hover:bg-[#14263F] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all shadow-sm"
          >
            <span>Open WhatsApp Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://wa.me/${APP_CONFIG.ownerNumberFull}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              soundFX.playClick();
              addToast(`Opening WhatsApp chat (+${APP_CONFIG.ownerNumberFull})...`, 'info');
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#09121E] hover:bg-[#0E1A2C] border border-[#172A44] text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <span>Direct WhatsApp: {APP_CONFIG.ownerNumber}</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </motion.a>
        </div>
      </motion.div>

      {/* Card 6: Bot Claim Feature */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg"
      >
        <h3 className="text-base font-bold text-white">
          Claim from your WhatsApp Bot
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Collect your daily coins by sending <code className="bg-[#0A1322] px-1.5 py-0.5 rounded text-cyan-400 font-mono">.claim</code> to your paired WhatsApp bot. A one-time activation, kept forever. Included free with PRO & BUSINESS.
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold text-white font-mono">
            FREE REWARD
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Instant +10 Coins
          </span>
        </div>

        <div className="mt-3.5">
          <motion.button
            whileHover={!botUnlockClaim ? { scale: 1.02 } : {}}
            whileTap={!botUnlockClaim ? { scale: 0.98 } : {}}
            onClick={() => {
              soundFX.playSuccess();
              unlockBotClaim();
            }}
            disabled={botUnlockClaim}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              botUnlockClaim
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-[0.99] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
          >
            {botUnlockClaim ? 'Feature Unlocked ✓' : 'Unlock Bot .claim Command'}
          </motion.button>
        </div>
      </motion.div>

      {/* Card 7: Choose a coin pack */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg space-y-3"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Choose a Coin Pack
            </h3>
            <p className="text-xs text-slate-400">
              Instant reload with Card / Bank. Coins never expire.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-[#0A1322]/80 border border-[#142337] p-3 rounded-xl leading-relaxed">
          Prices displayed in <span className="font-semibold text-cyan-300">LKR (Rs)</span>. Instant delivery directly into your YASHI HALLS wallet balance.
        </div>

        {/* Packs list */}
        <div className="space-y-3 pt-2">
          {COIN_PACKS.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ y: -3, borderColor: 'rgba(0, 240, 255, 0.5)' }}
              transition={{ duration: 0.15 }}
              className="p-3.5 rounded-2xl bg-[#0A1322] border border-[#162740] hover:border-cyan-500/50 transition-all flex items-center justify-between gap-3 relative overflow-hidden group shadow-md"
            >
              <div>
                {pack.isBestValue && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>★ BEST VALUE</span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white tabular-nums">
                    {pack.coins}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    coins
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                  ≈ Rs {pack.priceLkr.toLocaleString()}
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  Around <span className="text-slate-300 font-medium">{pack.daysEstimate} days</span> per bot · up to <span className="text-slate-300 font-medium">{pack.maxBots} bots</span> at once
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleBuyPack(pack)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shrink-0 active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.35)]"
              >
                Buy
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Card 8: Transaction History */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Transaction History
            </h3>
            <p className="text-xs text-slate-400">
              Recent coin activity & plan purchase records
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#122238] mt-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                  {tx.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {tx.date}
                </div>
              </div>

              <div
                className={`font-mono text-xs sm:text-sm font-bold tabular-nums shrink-0 ${
                  tx.amount > 0 ? 'text-cyan-400' : 'text-rose-400'
                }`}
              >
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Card 9: Need Help */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#060C18]/90 backdrop-blur-xl border border-[#122238] p-5 shadow-lg"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Need Help with Wallet?
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          If you have questions about coins, plan activation, or multi-device bot pairing, contact our support desk directly.
        </p>

        <div className="mt-3.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundFX.playClick();
              setOpenSupportModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0E1B2D] hover:bg-[#14263F] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all shadow-sm"
          >
            <span>Contact Support Desk</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-500 space-y-2">
        <div>YASHI HALLS · Cloud WhatsApp Bot Platform (MINI • PRO • BUSINESS)</div>
        <div>
          <button 
            onClick={() => {
              soundFX.playClick();
              addToast('Privacy & Security: WhatsApp session credentials are encrypted in isolated Baileys containers.', 'info');
            }}
            className="hover:text-slate-300 uppercase tracking-widest text-[10px] transition-colors"
          >
            PRIVACY & ENCRYPTION POLICY
          </button>
        </div>
      </footer>
    </motion.div>
  );
};
