import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Radio, 
  PhoneCall, 
  MessageSquare, 
  Save, 
  RefreshCw,
  Zap,
  Globe,
  Lock,
  Eye,
  Smile,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { soundFX } from '../utils/sound';

const LOGO_PRESETS = [
  {
    id: 'cyber-yashi',
    name: 'YASHI Cyber Matrix',
    url: 'https://i.ibb.co/cXC7c42J/file-000000007c3c8210ae1b96d28b22c655.png',
    tag: 'Official',
  },
  {
    id: 'red-queen',
    name: 'Neon Red Queen',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    tag: 'Hot',
  },
  {
    id: 'cyber-dragon',
    name: 'Cyber Dragon VIP',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
    tag: 'VIP',
  },
  {
    id: 'golden-king',
    name: 'Golden Lion King',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80',
    tag: 'Luxury',
  },
  {
    id: 'neon-android',
    name: 'Neon Cyber Android',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    tag: 'Future',
  },
  {
    id: 'anime-hacker',
    name: 'Anime Cyberpunk',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    tag: 'Anime',
  },
];

export const EditBotModal: React.FC = () => {
  const { 
    openEditBotModal, 
    setOpenEditBotModal, 
    serverBotState, 
    updateBotConfig, 
    syncBotProfilePic,
    addToast,
    refreshBotStatus
  } = useApp();

  const cfg = serverBotState?.config;

  const [botName, setBotName] = useState(cfg?.botName || 'YASHI HALLS');
  const [prefix, setPrefix] = useState(cfg?.prefix || '.');
  const [ownerNumber, setOwnerNumber] = useState(cfg?.ownerNumber || '94740712934');
  const [botLogoUrl, setBotLogoUrl] = useState(cfg?.botLogoUrl || LOGO_PRESETS[0].url);
  const [mode, setMode] = useState<'public' | 'private'>(cfg?.mode || 'public');
  const [autoReadStatus, setAutoReadStatus] = useState<boolean>(cfg?.autoReadStatus ?? true);
  const [smartAutoReply, setSmartAutoReply] = useState<boolean>(cfg?.smartAutoReply ?? true);
  const [channelAutoReact, setChannelAutoReact] = useState<boolean>(cfg?.channelAutoReact ?? true);
  const [channelReactEmojis, setChannelReactEmojis] = useState(cfg?.channelReactEmojis || '❤️,🔥,⚡,👍,🌟,🎉,🚀,😍,👏,💯,🤩');
  const [callDetectorEnabled, setCallDetectorEnabled] = useState<boolean>(cfg?.callDetectorEnabled ?? true);
  const [antiLink, setAntiLink] = useState<boolean>(cfg?.antiLink ?? false);
  const [antiSpam, setAntiSpam] = useState<boolean>(cfg?.antiSpam ?? false);
  const [welcomeMessage, setWelcomeMessage] = useState<boolean>(cfg?.welcomeMessage ?? true);
  const [customGreetingSinhala, setCustomGreetingSinhala] = useState(cfg?.customGreetingSinhala || '');
  const [customGreetingEnglish, setCustomGreetingEnglish] = useState(cfg?.customGreetingEnglish || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingPic, setIsSyncingPic] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'identity' | 'automations' | 'greetings'>('branding');

  // Sync state ONLY when the modal is opened (prevents background polling from wiping unsaved toggles)
  useEffect(() => {
    if (openEditBotModal && serverBotState?.config) {
      const c = serverBotState.config;
      setBotName(c.botName || 'YASHI HALLS');
      setPrefix(c.prefix || '.');
      setOwnerNumber(c.ownerNumber || '94740712934');
      setBotLogoUrl(c.botLogoUrl || LOGO_PRESETS[0].url);
      setMode(c.mode || 'public');
      setAutoReadStatus(c.autoReadStatus ?? true);
      setSmartAutoReply(c.smartAutoReply ?? true);
      setChannelAutoReact(c.channelAutoReact ?? true);
      setChannelReactEmojis(c.channelReactEmojis || '❤️,🔥,⚡,👍,🌟,🎉,🚀,😍,👏,💯,🤩');
      setCallDetectorEnabled(c.callDetectorEnabled ?? true);
      setAntiLink(c.antiLink ?? false);
      setAntiSpam(c.antiSpam ?? false);
      setWelcomeMessage(c.welcomeMessage ?? true);
      setCustomGreetingSinhala(c.customGreetingSinhala || '');
      setCustomGreetingEnglish(c.customGreetingEnglish || '');
    }
  }, [openEditBotModal]);

  if (!openEditBotModal) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setIsSaving(true);
    try {
      await updateBotConfig({
        botName: botName.trim(),
        prefix: prefix.trim() || '.',
        ownerNumber: ownerNumber.trim(),
        botLogoUrl: botLogoUrl.trim(),
        mode,
        autoReadStatus,
        smartAutoReply,
        channelAutoReact,
        channelReactEmojis: channelReactEmojis.trim(),
        callDetectorEnabled,
        antiLink,
        antiSpam,
        welcomeMessage,
        customGreetingSinhala: customGreetingSinhala.trim(),
        customGreetingEnglish: customGreetingEnglish.trim(),
      });
      soundFX.playSuccess();
      addToast('🎉 Bot settings & custom logo updated live!', 'success');
      await refreshBotStatus();
      setOpenEditBotModal(false);
    } catch {
      addToast('Failed to save bot settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncProfilePic = async () => {
    soundFX.playClick();
    setIsSyncingPic(true);
    try {
      await syncBotProfilePic(botLogoUrl.trim());
      soundFX.playSuccess();
      addToast('✅ WhatsApp Bot profile image updated successfully!', 'success');
    } catch {
      addToast('Failed to sync profile picture to WhatsApp', 'error');
    } finally {
      setIsSyncingPic(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#070D1A] border border-[#162740] rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden my-6"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#132238] flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-[#070D1A] to-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Customize Bot</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 uppercase">
                    Connected
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change your logo, prefix, name, and 24/7 automation rules
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setOpenEditBotModal(false);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#101F35] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtabs for Easy Navigation */}
          <div className="flex items-center gap-1.5 p-2 bg-[#0A1324] border-b border-[#132238] overflow-x-auto text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'branding'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Logo & Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('identity')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'identity'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Identity & Prefix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('automations')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'automations'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>24/7 Automations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('greetings')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'greetings'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Custom Greetings</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 max-h-[68vh] overflow-y-auto">
            {/* TAB 1: LOGO & BRANDING */}
            {activeTab === 'branding' && (
              <div className="space-y-5">
                {/* Current Active Preview */}
                <div className="p-4 rounded-2xl bg-[#0B1528] border border-[#182C4A] flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={botLogoUrl || LOGO_PRESETS[0].url} 
                      alt="Bot Logo Preview" 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = LOGO_PRESETS[0].url;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-[9px] font-mono font-black text-slate-950">
                      LIVE
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <span>{botName}</span>
                      <Crown className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs text-slate-400">
                      This avatar will represent your bot in menus, command cards, and WhatsApp profile image.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSyncProfilePic}
                        disabled={isSyncingPic}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 text-xs font-bold font-mono transition-all flex items-center justify-center sm:justify-start gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPic ? 'animate-spin' : ''}`} />
                        <span>{isSyncingPic ? 'Updating WhatsApp...' : 'Sync to WhatsApp Profile Picture'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Logo Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Choose from Visual Presets</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Instant 1-Click Select</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {LOGO_PRESETS.map((p) => {
                      const isSelected = botLogoUrl === p.url;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            soundFX.playClick();
                            setBotLogoUrl(p.url);
                          }}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                              : 'bg-[#0A1324] border-[#15253D] hover:border-cyan-500/40'
                          }`}
                        >
                          <img 
                            src={p.url} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-[#1b2f48]" 
                          />
                          <div className="overflow-hidden flex-1">
                            <div className="text-xs font-bold text-white truncate">{p.name}</div>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#132238] text-cyan-300 font-mono">
                              {p.tag}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Logo URL Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Or Enter Custom Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={botLogoUrl}
                    onChange={(e) => setBotLogoUrl(e.target.value)}
                    placeholder="https://i.ibb.co/... or your image link"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste any direct image URL (PNG, JPG, or WEBP). It will be cached for ultra-fast replies.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: IDENTITY & PREFIX */}
            {activeTab === 'identity' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Bot Display Name
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="e.g. YASHI HALLS PRO"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-sm font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Displayed in menu cards, greetings, notifications, and WhatsApp command headers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Command Prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      maxLength={2}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="e.g. ."
                      className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-sm font-mono font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <p className="text-[11px] text-slate-400">
                      Single character trigger (e.g. <span className="font-mono text-cyan-400">{prefix}menu</span>, <span className="font-mono text-cyan-400">{prefix}ping</span>).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Owner Number
                    </label>
                    <input
                      type="text"
                      value={ownerNumber}
                      onChange={(e) => setOwnerNumber(e.target.value)}
                      placeholder="e.g. 94740712934"
                      className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-sm font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <p className="text-[11px] text-slate-400">
                      Whitelisted phone number with full admin execution powers.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Operating Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMode('public')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        mode === 'public'
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-[#0A1324] border-[#15253D] text-slate-400'
                      }`}
                    >
                      <Globe className={`w-5 h-5 shrink-0 ${mode === 'public' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <div className={`text-xs font-bold ${mode === 'public' ? 'text-white' : 'text-slate-300'}`}>
                          Public Mode (Default)
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Anyone in WhatsApp groups & DMs can use bot commands.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('private')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        mode === 'private'
                          ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-[#0A1324] border-[#15253D] text-slate-400'
                      }`}
                    >
                      <Lock className={`w-5 h-5 shrink-0 ${mode === 'private' ? 'text-purple-400' : 'text-slate-500'}`} />
                      <div>
                        <div className={`text-xs font-bold ${mode === 'private' ? 'text-white' : 'text-slate-300'}`}>
                          Private Mode
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Only the owner (+{ownerNumber}) can execute commands.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 24/7 AUTOMATIONS */}
            {activeTab === 'automations' && (
              <div className="space-y-3">
                {/* Auto Read Status */}
                <div className="p-3.5 rounded-2xl bg-[#0A1324] border border-[#15253D] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Auto-Read WhatsApp Statuses</div>
                      <div className="text-[11px] text-slate-400">Automatically view contact status updates 24/7</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReadStatus}
                    onChange={(e) => setAutoReadStatus(e.target.checked)}
                    className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* AI Smart Auto-Chat */}
                <div className="p-3.5 rounded-2xl bg-[#0A1324] border border-[#15253D] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">AI Smart Auto-Chat</div>
                      <div className="text-[11px] text-slate-400">Conversational Sinhala/English AI responses to messages</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smartAutoReply}
                    onChange={(e) => setSmartAutoReply(e.target.checked)}
                    className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* Channel Auto-React */}
                <div className="p-3.5 rounded-2xl bg-[#0A1324] border border-[#15253D] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                        <Smile className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Channel Post Auto-React</div>
                        <div className="text-[11px] text-slate-400">Automatically react to channel posts with emojis</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channelAutoReact}
                      onChange={(e) => setChannelAutoReact(e.target.checked)}
                      className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>

                  {channelAutoReact && (
                    <div className="pt-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">React Emojis (comma separated)</label>
                      <input
                        type="text"
                        value={channelReactEmojis}
                        onChange={(e) => setChannelReactEmojis(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#070D1A] border border-[#162740] text-xs text-white"
                        placeholder="❤️,🔥,⚡,👍,🌟,🎉,🚀"
                      />
                    </div>
                  )}
                </div>

                {/* Call Detector & Reject */}
                <div className="p-3.5 rounded-2xl bg-[#0A1324] border border-[#15253D] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Call Auto-Reject & Notice</div>
                      <div className="text-[11px] text-slate-400">Decline incoming WhatsApp calls and send polite notice</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={callDetectorEnabled}
                    onChange={(e) => setCallDetectorEnabled(e.target.checked)}
                    className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {/* Group Anti-Link */}
                <div className="p-3.5 rounded-2xl bg-[#0A1324] border border-[#15253D] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Group Anti-Link Shield</div>
                      <div className="text-[11px] text-slate-400">Warn and remove unauthorized group invite links</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiLink}
                    onChange={(e) => setAntiLink(e.target.checked)}
                    className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOM GREETINGS */}
            {activeTab === 'greetings' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sinhala Greeting Message (සිංහල සුබපැතුම)
                  </label>
                  <textarea
                    rows={3}
                    value={customGreetingSinhala}
                    onChange={(e) => setCustomGreetingSinhala(e.target.value)}
                    placeholder="හායි @user! මම @bot. ඔබට උදව් කිරීමට මම සූදානම්..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Use <span className="text-cyan-400 font-mono">@user</span> for sender name, <span className="text-cyan-400 font-mono">@bot</span> for bot name, <span className="text-cyan-400 font-mono">@prefix</span> for prefix.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    English Greeting Message
                  </label>
                  <textarea
                    rows={3}
                    value={customGreetingEnglish}
                    onChange={(e) => setCustomGreetingEnglish(e.target.value)}
                    placeholder="Hello @user! I am @bot WhatsApp Bot. Type @prefixmenu for all commands."
                    className="w-full px-4 py-3 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#132238] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setOpenEditBotModal(false);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#0B1528] border border-[#182C4A] text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Applying Live...' : 'Save & Apply Live'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
