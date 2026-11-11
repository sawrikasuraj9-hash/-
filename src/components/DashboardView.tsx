import React from 'react';
import { 
  Bot,
  ShieldCheck,
  Activity,
  Copy,
  Check, 
  Terminal, 
  RefreshCw, 
  Clock, 
  Coins, 
  Sparkles, 
  Play, 
  Square,
  Link as LinkIcon,
  ArrowRight,
  MessageSquare,
  Crown,
  Sliders,
  PhoneCall,
  Rocket,
  LayoutGrid,
  Music,
  Brain,
  Gauge,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { soundFX } from '../utils/sound';
import { CyberBotHologram } from './CyberBotHologram';
import { WhatsAppMenuInteractivePreview } from './WhatsAppMenuInteractivePreview';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    coins, 
    bots, 
    serverBotState,
    restartBot, 
    toggleBotState, 
    stopBot,
    clearSession,
    setOpenTerminalBot, 
    setActiveTab,
    changePlan,
    updateBotConfig,
    resetQuotas,
    setOpenProModal,
    setOpenDeployModal,
    setOpenCoinModal,
    syncBotProfilePic,
    setOpenEditBotModal,
  } = useApp();

  const isOnline = serverBotState?.isOnline ?? false;
  const currentPlan = serverBotState?.config?.plan || user.plan;
  const isBusiness = currentPlan === 'business';
  const isPro = currentPlan === 'pro';
  const isProOrBusiness = isPro || isBusiness;
  const runningCount = isOnline ? 1 : 0;
  const maxSlots = isBusiness ? 25 : isPro ? 5 : 1;
  const latencyDisplay = isOnline ? `${serverBotState?.lastPingMs ?? 0} ms (Turbo ⚡)` : '—';
  const uptimeMinutes = Math.floor((serverBotState?.uptimeSeconds || 0) / 60);
  const [copiedKeepAlive, setCopiedKeepAlive] = React.useState(false);
  const [showKeepAliveGuide, setShowKeepAliveGuide] = React.useState(false);
  const keepAliveUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/keepalive`
    : 'https://ais-dev-hz54u4ecb2jgnndx3vltqa-722539631465.asia-southeast1.run.app/api/keepalive';

  const handleCopyKeepAlive = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(keepAliveUrl);
    setCopiedKeepAlive(true);
    setTimeout(() => setCopiedKeepAlive(false), 2500);
  };
  const uptimeSeconds = (serverBotState?.uptimeSeconds || 0) % 60;
  const uptimeDisplay = isOnline ? `${uptimeMinutes}m ${uptimeSeconds}s` : 'Offline';

  const mediaUsed = serverBotState?.quotas?.mediaRequestsUsed || 0;
  const mediaMax = serverBotState?.quotas?.mediaQuotaMax || (isBusiness ? 999999 : isPro ? 1000 : 5);
  const aiUsed = serverBotState?.quotas?.aiRequestsUsed || 0;
  const aiMax = serverBotState?.quotas?.aiQuotaMax || (isBusiness ? 999999 : isPro ? 5000 : 10);

  const mediaPercent = Math.min(100, Math.round((mediaUsed / mediaMax) * 100));
  const aiPercent = Math.min(100, Math.round((aiUsed / aiMax) * 100));

  const handleToggleAntiLink = () => {
    soundFX.playClick();
    if (!isProOrBusiness) {
      setOpenProModal(true);
      return;
    }
    updateBotConfig({ antiLink: !serverBotState?.config.antiLink });
  };

  const handleToggleAntiSpam = () => {
    soundFX.playClick();
    if (!isProOrBusiness) {
      setOpenProModal(true);
      return;
    }
    updateBotConfig({ antiSpam: !serverBotState?.config.antiSpam });
  };

  const handleToggleMode = () => {
    soundFX.playClick();
    const newMode = serverBotState?.config.mode === 'public' ? 'private' : 'public';
    updateBotConfig({ mode: newMode });
  };

  const handleToggleAutoStatus = () => {
    soundFX.playClick();
    updateBotConfig({ autoReadStatus: !serverBotState?.config.autoReadStatus });
  };

  const handleToggleCallDetector = () => {
    soundFX.playClick();
    const currentVal = serverBotState?.config?.callDetectorEnabled ?? true;
    updateBotConfig({ callDetectorEnabled: !currentVal });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-5xl lg:max-w-6xl mx-auto px-2.5 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-5 pb-28 relative"
    >
      {/* 1. HERO COMMAND CENTER PANEL (Full-Screen & Mobile Optimized) */}
      <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-purple-500/50 via-cyan-400/60 to-blue-500/50 shadow-[0_0_35px_rgba(0,240,255,0.2)]">
        <div className="rounded-[23px] bg-gradient-to-br from-[#060c18] via-[#040813] to-[#081224] p-4 sm:p-6 lg:p-7 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content */}
          <div className="space-y-2 z-10 max-w-lg">
            {/* Plan Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              {isBusiness ? <Crown className="w-3 h-3 text-amber-400" /> : isPro ? <Crown className="w-3 h-3 text-cyan-400" /> : <Crown className="w-3 h-3 text-cyan-400" />}
              <span>{isBusiness ? 'BUSINESS FLEET' : isPro ? 'PRO PLAN' : 'MINI PLAN (FREE)'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              Your <span className="text-[#00F0FF] drop-shadow-[0_0_15px_rgba(0,240,255,0.7)]">Bot</span> <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]">Command Center</span>
            </h1>

            {/* Subtitles */}
            <div className="space-y-0.5 pt-0.5">
              <p className="text-xs sm:text-sm font-semibold text-white/95">
                Ready to connect your WhatsApp?
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Pair your WhatsApp number and start using your bot with powerful features and tools.
              </p>
            </div>

            {/* Big Call-to-Action Pair Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundFX.playSuccess();
                  setActiveTab('deployments');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00F0FF] via-[#00E1FF] to-[#00C8FF] hover:from-[#38BDF8] hover:to-[#00F0FF] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all cursor-pointer select-none"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950 stroke-none" />
                <span>PAIR WHATSAPP</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </motion.button>
            </div>
          </div>

          {/* Right Robot Hologram Illustration (Matching User's Photo) */}
          <div className="flex items-center justify-center sm:justify-end shrink-0 z-10 self-center sm:self-auto py-1 sm:py-0">
            <CyberBotHologram size="md" isOnline={isOnline} />
          </div>
        </div>
      </div>

      {/* 2. THREE-TIER PLAN SELECTOR TABS WITH LOCKS (MINI FREE, PRO 10c, BUSINESS 30c) */}
      <div className="p-1 rounded-2xl bg-[#060C18] border border-[#101E34] grid grid-cols-3 gap-1">
        <button
          onClick={() => changePlan('mini')}
          className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
            currentPlan === 'mini'
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#00D2FF] text-slate-950 font-black shadow-[0_0_18px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-white hover:bg-[#0c1626]'
          }`}
        >
          <Crown className={`w-3.5 h-3.5 ${currentPlan === 'mini' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
          <span>MINI</span>
          <span className="text-[10px] font-mono opacity-80">(FREE)</span>
        </button>

        <button
          onClick={() => changePlan('pro')}
          className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
            currentPlan === 'pro'
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#00D2FF] text-slate-950 font-black shadow-[0_0_18px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-white hover:bg-[#0c1626]'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${currentPlan === 'pro' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
          <span>PRO</span>
          {!user.ownedPlans?.includes('pro') && currentPlan !== 'pro' && (
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1 rounded border border-cyan-500/30">10🪙</span>
          )}
        </button>

        <button
          onClick={() => changePlan('business')}
          className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
            currentPlan === 'business'
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#00D2FF] text-slate-950 font-black shadow-[0_0_18px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-white hover:bg-[#0c1626]'
          }`}
        >
          <Crown className={`w-3.5 h-3.5 ${currentPlan === 'business' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">BUSINESS</span>
          <span className="sm:hidden">BIZ</span>
          {!user.ownedPlans?.includes('business') && currentPlan !== 'business' && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-500/30">30🪙</span>
          )}
        </button>
      </div>

      {/* 3. BOT STATUS CARD (Matching Screenshot Mockup) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#060C18] via-[#050A16] to-[#091528] border border-cyan-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Left Status Info */}
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-emerald-500'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
            </span>
            <span className={`font-black text-sm sm:text-base tracking-wider ${isOnline ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]'}`}>
              {isOnline ? 'BOT ONLINE' : 'BOT OFFLINE'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {isOnline 
              ? `${serverBotState?.config.botName} · Connected to +${serverBotState?.pairedNumber}`
              : 'Connect a device to go live'}
          </p>

          {/* Quick Action Button for Status */}
          <div className="pt-2 flex items-center gap-2">
            {!serverBotState || serverBotState.connectionStatus === 'disconnected' ? (
              <button
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('deployments');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Pair device now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setOpenEditBotModal(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/60 text-[11px] text-cyan-300 font-bold hover:bg-cyan-500/35 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                  title="Customize Bot Logo, Prefix & Automations"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Bot & Logo</span>
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    restartBot();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0e1d32] border border-[#1b2f48] text-[11px] text-cyan-400 font-mono hover:bg-[#132742]"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    stopBot();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 font-mono hover:bg-rose-500/25 font-bold"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Mini Robot Hologram Graphic */}
        <div className="shrink-0 z-10 pr-1">
          <CyberBotHologram size="sm" isOnline={isOnline} />
        </div>
      </div>

      {/* 4. STATISTICS CARDS (2x2 Grid Matching Screenshot Mockup) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* 1. Active Bots */}
        <div className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-cyan-500/30 transition-all space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#091526] border border-[#132640] text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Active Bots</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {runningCount} <span className="text-xs font-normal text-slate-400">/ {maxSlots}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isOnline ? 'Online (24/7)' : 'Offline / Standby'}
            </div>
          </div>
        </div>

        {/* 2. Wallet Balance */}
        <div 
          onClick={() => {
            soundFX.playCoin();
            setActiveTab('wallet');
          }}
          className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-purple-500/30 transition-all space-y-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#120D24] border border-[#231742] text-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.25)] group-hover:scale-105 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Wallet</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">{coins}</span>{' '}
              <span className="text-xs font-normal text-slate-300">coins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Free credit included
            </div>
          </div>
        </div>

        {/* 3. Uptime */}
        <div className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-blue-500/30 transition-all space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#091526] border border-[#132640] text-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Uptime</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {uptimeDisplay}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isOnline ? 'Live Worker Active' : 'Not running'}
            </div>
          </div>
        </div>

        {/* 4. Socket Latency */}
        <div className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-cyan-500/30 transition-all space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#091526] border border-[#132640] text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Latency</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {latencyDisplay}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isOnline ? 'Colombo / Asia cluster' : 'Not available'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. USAGE PROGRESS BARS (Vertical items with chevron '>' matching screenshot) */}
      <div className="space-y-3">
        {/* Media Downloads Bar */}
        <div className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] space-y-3 hover:border-[#192f4c] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#130E26] border border-[#261845] text-purple-400 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Media Downloads</div>
                <div className="text-[11px] text-slate-400">Today's usage</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-white font-mono">
                  {mediaUsed} / {isBusiness ? '∞' : mediaMax}
                </div>
                <div className="text-[10px] text-slate-400">Today</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#0C1524] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${mediaPercent}%` }}
            />
          </div>
        </div>

        {/* AI Chat Bar */}
        <div className="p-4 rounded-2xl bg-[#060C18] border border-[#101E34] space-y-3 hover:border-[#192f4c] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#140D24] border border-[#281648] text-pink-400 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">AI Chat</div>
                <div className="text-[11px] text-slate-400">Today's usage</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-white font-mono">
                  {aiUsed} / {isBusiness ? '∞' : aiMax}
                </div>
                <div className="text-[10px] text-slate-400">Today</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#0C1524] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${aiPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. QUICK ACTIONS (Matching Screenshot Mockup) */}
      <div className="space-y-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 tracking-wide">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span>Quick Actions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Action 0: Edit Bot (Only appears when connected!) */}
          {isOnline && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFX.playClick();
                setOpenEditBotModal(true);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-[#0A162B] to-[#060C18] border border-cyan-400/60 hover:border-cyan-300 text-left transition-all group shadow-[0_0_20px_rgba(0,240,255,0.2)]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-cyan-400 text-slate-950 uppercase font-mono tracking-wider">
                  ONLINE
                </span>
              </div>
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>Edit Bot & Logo</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[10px] text-cyan-300/80 mt-0.5">Customize your bot</div>
            </motion.button>
          )}

          {/* Action 1: Pair Device */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('deployments');
            }}
            className="p-3.5 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LinkIcon className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="text-xs font-bold text-white">Pair Device</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Connect WhatsApp</div>
          </motion.button>

          {/* Action 2: Deploy Bot */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundFX.playClick();
              setOpenDeployModal(true);
            }}
            className="p-3.5 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-purple-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="text-xs font-bold text-white">Deploy Bot</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Start your bot</div>
          </motion.button>

          {/* Action 3: Explore Templates */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('templates');
            }}
            className="p-3.5 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-blue-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-xs font-bold text-white">Explore Templates</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Use ready-made</div>
          </motion.button>

          {/* Action 4: Add Coins */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundFX.playCoin();
              setOpenCoinModal(true);
            }}
            className="p-3.5 rounded-2xl bg-[#060C18] border border-[#101E34] hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-xs font-bold text-white">Add Coins</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Top up wallet</div>
          </motion.button>
        </div>
      </div>

      {/* 7. CALL DETECTOR & AUTO-REPLY MONITOR SECTION (Cyber Neon Style) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#060C18] via-[#040813] to-[#081224] border border-cyan-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Call Detector & Auto-Reply
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rejects incoming WhatsApp calls & sends official .menu reply automatically.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleCallDetector}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto ${
              serverBotState?.config?.callDetectorEnabled ?? true
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-[#0e1724] text-slate-400 hover:text-white border border-[#192b42]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${serverBotState?.config?.callDetectorEnabled ?? true ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
            <span>{serverBotState?.config?.callDetectorEnabled ?? true ? 'Detector ON' : 'Detector OFF'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-[#030712] border border-[#101E34]">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Incoming</div>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {serverBotState?.incomingCallsCount ?? 0}
            </div>
            <div className="text-[10px] text-cyan-400">Events</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#030712] border border-[#101E34]">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Rejected</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              {serverBotState?.callsRejectedCount ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400/80">Confirmed</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#030712] border border-[#101E34]">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Auto-Replied</div>
            <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-0.5">
              {serverBotState?.autoRepliesSentCount ?? (serverBotState?.incomingCallsCount ?? 0)}
            </div>
            <div className="text-[10px] text-cyan-400/80">Sent</div>
          </div>
        </div>

        {/* Call Logs */}
        {serverBotState?.recentCalls && serverBotState.recentCalls.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-300">Recent Call Events:</div>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {serverBotState.recentCalls.map((call, idx) => (
                <div key={call.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#030712] border border-[#101E34] text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-white font-bold">+{call.from.split('@')[0]}</span>
                    <span className="text-slate-400 text-[10px]">{call.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {call.rejected && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">
                        Rejected
                      </span>
                    )}
                    {call.replied && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px]">
                        Replied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7.5. INTERACTIVE MENU & 2-COLUMN BUTTONS SHOWCASE */}
      <WhatsAppMenuInteractivePreview />

      {/* 8. ACTIVE BOT CONTROLS & ENGINE SETTINGS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#060C18] border border-[#101E34] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Engine Controls</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Prefix: '{serverBotState?.config.prefix || '.'}'
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Operating Mode */}
          <button
            onClick={handleToggleMode}
            className={`p-3 rounded-xl border text-left transition-all ${
              serverBotState?.config.mode === 'public'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                : 'bg-[#081220] border-[#162740] text-slate-300'
            }`}
          >
            <div className="text-[10px] text-slate-400">Operating Mode</div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverBotState?.config.mode === 'public' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
              <span className="capitalize">{serverBotState?.config.mode || 'Public'}</span>
            </div>
          </button>

          {/* Anti-Link */}
          <button
            onClick={handleToggleAntiLink}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              serverBotState?.config.antiLink && isProOrBusiness
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                : 'bg-[#081220] border-[#162740] text-slate-300'
            }`}
          >
            {!isProOrBusiness && (
              <span className="absolute top-1.5 right-1.5 px-1 rounded bg-purple-500/20 text-[9px] font-mono text-purple-300">
                PRO
              </span>
            )}
            <div className="text-[10px] text-slate-400">Anti-Link Defense</div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverBotState?.config.antiLink && isProOrBusiness ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{serverBotState?.config.antiLink && isProOrBusiness ? 'Enabled' : 'Disabled'}</span>
            </div>
          </button>

          {/* Anti-Spam */}
          <button
            onClick={handleToggleAntiSpam}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              serverBotState?.config.antiSpam && isProOrBusiness
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                : 'bg-[#081220] border-[#162740] text-slate-300'
            }`}
          >
            {!isProOrBusiness && (
              <span className="absolute top-1.5 right-1.5 px-1 rounded bg-purple-500/20 text-[9px] font-mono text-purple-300">
                PRO
              </span>
            )}
            <div className="text-[10px] text-slate-400">Anti-Spam Rate</div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverBotState?.config.antiSpam && isProOrBusiness ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{serverBotState?.config.antiSpam && isProOrBusiness ? 'Enabled' : 'Disabled'}</span>
            </div>
          </button>

          {/* Auto Read Status */}
          <button
            onClick={handleToggleAutoStatus}
            className={`p-3 rounded-xl border text-left transition-all ${
              serverBotState?.config.autoReadStatus
                ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                : 'bg-[#081220] border-[#162740] text-slate-300'
            }`}
          >
            <div className="text-[10px] text-slate-400">Auto Story Viewer</div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverBotState?.config.autoReadStatus ? 'bg-cyan-400' : 'bg-slate-500'}`} />
              <span>{serverBotState?.config.autoReadStatus ? 'Active' : 'Off'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* 9. BOT INSTANCES LIST (CONTAINERS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Your Bot Containers</span>
              {isOnline && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </h2>
            <p className="text-[11px] text-slate-400">
              Active instances running under your account ({runningCount}/{maxSlots} slots used)
            </p>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('deployments');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
          >
            Manage details
          </button>
        </div>

        {bots.length === 0 ? (
          <div className="p-6 text-center rounded-3xl bg-[#060C18] border border-[#101E34] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Running Bots Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Connect your WhatsApp number with an 8-digit pairing code to launch <span className="text-cyan-400 font-bold">{isPro ? 'YASHI HALLS PRO' : isBusiness ? 'YASHI HALLS BUSINESS' : 'YASHI HALLS MINI'}</span> 24/7!
              </p>
            </div>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('deployments');
              }}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              Pair WhatsApp Device
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="p-4 rounded-3xl bg-[#060C18] border border-[#101E34] hover:border-cyan-500/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white font-mono">{bot.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          bot.status === 'running' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {bot.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[9px] font-mono text-cyan-300 font-bold">
                          {isBusiness ? 'BUSINESS' : isPro ? 'PRO TIER' : 'MINI TIER'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {bot.templateName} · <span className="font-mono text-slate-300">Prefix: '{serverBotState?.config.prefix || '.'}'</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setOpenTerminalBot(bot);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d32] hover:bg-[#132742] border border-[#192b42] text-slate-200 text-xs font-mono"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Logs</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        restartBot();
                      }}
                      className="p-2 rounded-xl bg-[#0e1d32] hover:bg-[#132742] border border-[#192b42] text-slate-300 hover:text-white"
                      title="Restart"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        toggleBotState();
                      }}
                      className={`p-2 rounded-xl border ${
                        bot.status === 'running'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                      title={bot.status === 'running' ? 'Stop' : 'Start'}
                    >
                      {bot.status === 'running' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#0e1826] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">RAM</span>
                    <span className="font-mono text-white text-[11px]">{bot.ramUsedMb} / {bot.ramMaxMb} MB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tier Features</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{isBusiness ? 'All Fleet Access' : isPro ? 'All 20+ PRO Commands' : 'Basic Suite (MINI)'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Uptime</span>
                    <span className="font-mono text-emerald-400 text-[11px]">{bot.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10. OFFICIAL SHOWCASE CARD (Branded YASHI HALLS) */}
      <div className="rounded-3xl bg-[#060C18] border border-cyan-500/30 p-5 space-y-3.5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <h3 className="font-bold text-sm text-white">
              Official YASHI HALLS Platform
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold uppercase">
            FEATURED
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          High-performance multi-device userbot architecture with high uptime, lightning fast command dispatch, and smart YASHI AI across MINI, PRO, and BUSINESS plans.
        </p>

        <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-[#162740] relative bg-[#040814]">
          <img
            src={APP_CONFIG.showcaseImageUrl}
            alt="YASHI HALLS Bot Showcase"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
              {isOnline ? '24/7 Engine Active' : 'Ready to Connect'}
            </div>
            <h4 className="text-base font-black text-white mt-0.5">
              YASHI HALLS WhatsApp Cloud
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Channel: <a href="https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">Join Official Channel</a> · Support: 0740712934.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="text-[11px] font-mono text-slate-400">
            Powered by <span className="text-cyan-400 font-bold">YASHI HALLS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncBotProfilePic}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
            >
              Sync Bot Logo
            </button>
            <a
              href="https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
            >
              WhatsApp Channel
            </a>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('deployments');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider"
            >
              Pairing
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
