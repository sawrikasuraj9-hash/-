import React, { useState } from 'react';
import { 
  User, 
  Download, 
  Film, 
  Brain, 
  Users, 
  Gamepad2, 
  Settings, 
  Coins, 
  Zap, 
  Crown, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles,
  Phone,
  Send,
  MessageSquare,
  Image as ImageIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFX } from '../utils/sound';
import { useApp } from '../context/AppContext';

export const WhatsAppMenuInteractivePreview: React.FC = () => {
  const { serverBotState, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'menu' | 'whatsapp' | 'poster'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [copiedMenu, setCopiedMenu] = useState(false);
  const [copiedPing, setCopiedPing] = useState(false);

  const botName = serverBotState?.config?.botName || "YASHI HALLS MINI";
  const ownerName = serverBotState?.pairedNumber
    ? `+${serverBotState.pairedNumber}`
    : (serverBotState?.config?.ownerName && serverBotState.config.ownerName !== 'Akash Kavindu'
        ? serverBotState.config.ownerName
        : 'Bot User');
  const prefix = serverBotState?.config?.prefix || ".";
  const isOnline = serverBotState?.isOnline ?? false;
  const uptimeMinutes = Math.floor((serverBotState?.uptimeSeconds || 0) / 60);

  // 8 Categories arranged in 2 columns ("දෙපැත්තට") exactly matching Photo 2:
  const categories = [
    {
      id: 1,
      title: "PROFILE & STATUS",
      subtitle: "Status • DP • Name • Bio • ...",
      icon: User,
      commands: [
        { name: "STATUS", desc: "LIVE CONNECTION & STATS", capsule: `${prefix}status` },
        { name: "SETSTATUS", desc: "UPDATE STATUS TEXT", capsule: `${prefix}setstatus <text>` },
        { name: "STATUSVIEW", desc: "AUTO STATUS VIEWER", capsule: `${prefix}statusview` },
        { name: "STATUSSAVE", desc: "SAVE VIEWED STATUS", capsule: `${prefix}statussave` },
        { name: "STATUSREACT", desc: "AUTO EMOJI REACTIONS", capsule: `${prefix}statusreact` },
        { name: "SETDP", desc: "CHANGE BOT PROFILE PICTURE", capsule: `${prefix}setdp` },
        { name: "GETDP", desc: "DOWNLOAD USER PROFILE DP", capsule: `${prefix}getdp @user` },
        { name: "SETNAME", desc: "CHANGE BOT DISPLAY NAME", capsule: `${prefix}setname <name>` },
        { name: "SETBIO", desc: "UPDATE ABOUT / BIO DESCRIPTION", capsule: `${prefix}setbio <text>` },
      ]
    },
    {
      id: 2,
      title: "DOWNLOAD",
      subtitle: "Song • Video • Audio • Mediafire • ...",
      icon: Download,
      commands: [
        { name: "SONG", desc: "HIGH QUALITY MP3 TRACK", capsule: `${prefix}song <title>` },
        { name: "VIDEO", desc: "1080P HD MP4 VIDEO", capsule: `${prefix}video <title>` },
        { name: "PLAY", desc: "FAST YOUTUBE MUSIC PLAYER", capsule: `${prefix}play <title>` },
        { name: "AUDIO", desc: "WHATSAPP VOICE NOTE AUDIO", capsule: `${prefix}audio <title>` },
        { name: "YTSEARCH", desc: "SEARCH YOUTUBE VIDEOS", capsule: `${prefix}ytsearch <query>` },
        { name: "MF / MEDIAFIRE", desc: "DIRECT MEDIAFIRE (UP TO 2GB)", capsule: `${prefix}mf <url>` },
        { name: "TT / TIKTOK", desc: "TIKTOK NO WATERMARK", capsule: `${prefix}tt <url>` },
        { name: "FB", desc: "FACEBOOK HD / SD VIDEO", capsule: `${prefix}fb <url>` },
        { name: "IG", desc: "INSTAGRAM REELS & POSTS", capsule: `${prefix}ig <url>` },
        { name: "TWITTER", desc: "TWITTER / X HD VIDEO", capsule: `${prefix}twitter <url>` },
        { name: "APK", desc: "DIRECT ANDROID APK FILE", capsule: `${prefix}apk <app>` },
        { name: "LYRICS", desc: "SONG LYRICS & CHORDS", capsule: `${prefix}lyrics <song>` },
      ]
    },
    {
      id: 3,
      title: "MOVIES & SUBTITLES",
      subtitle: "Cineru • Film • Dub • Sub • ...",
      icon: Film,
      commands: [
        { name: "CINERU", desc: "CINERU.LK MOVIES & MIRRORS", capsule: `${prefix}cineru <name>` },
        { name: "CINERU SET", desc: "COMPLETE FRANCHISE SETS", capsule: `${prefix}cineru <name> set` },
        { name: "FILM", desc: "IMDB INFO & CLOUD MOVIES", capsule: `${prefix}film <name>` },
        { name: "FILMDUB", desc: "SINHALA DUBBED MOVIES", capsule: `${prefix}filmdub <name>` },
        { name: "CINESUBZ", desc: "CINESUBZ DIRECT DOWNLOADS", capsule: `${prefix}cinesubz <name>` },
        { name: "SINHALASUB", desc: "BAISCOPE SINHALA SUBS", capsule: `${prefix}sinhalasub <name>` },
      ]
    },
    {
      id: 4,
      title: "AI & SMART TOOLS",
      subtitle: "Gemini • Translate • Write • ...",
      icon: Brain,
      commands: [
        { name: "AI / GEMINI", desc: "GEMINI 2.5 FLASH ULTRA ASSISTANT", capsule: `${prefix}ai <prompt>` },
        { name: "TRANSLATE", desc: "SINHALA & MULTILINGUAL AI", capsule: `${prefix}translate <lang> <text>` },
        { name: "SUMMARIZE", desc: "DOCUMENT & ARTICLE SUMMARIZER", capsule: `${prefix}summarize <text>` },
        { name: "WRITE", desc: "ESSAYS, EMAILS & SCRIPTS", capsule: `${prefix}write <prompt>` },
        { name: "CODE", desc: "CODE GENERATOR & BUG FIXER", capsule: `${prefix}code <prompt>` },
        { name: "IMAGINE", desc: "PHOTOREALISTIC AI ART", capsule: `${prefix}imagine <prompt>` },
        { name: "OCR", desc: "IMAGE TEXT EXTRACTOR", capsule: `${prefix}ocr` },
        { name: "STICKER", desc: "CONVERT IMAGE TO STICKER", capsule: `${prefix}sticker` },
        { name: "VOICETRANS", desc: "VOICE NOTE TO SINHALA", capsule: `${prefix}voicetrans <lang>` },
        { name: "SHAZAM", desc: "AUDIO SONG IDENTIFIER", capsule: `${prefix}shazam` },
      ]
    },
    {
      id: 5,
      title: "GROUP MANAGEMENT",
      subtitle: "Kick • Promote • Link • Warn • ...",
      icon: Users,
      commands: [
        { name: "GROUPINFO", desc: "SECURITY & GROUP STATS", capsule: `${prefix}groupinfo` },
        { name: "ADMINS", desc: "LIST GROUP ADMINISTRATORS", capsule: `${prefix}admins` },
        { name: "TAGALL", desc: "MENTION ALL MEMBERS", capsule: `${prefix}tagall <message>` },
        { name: "HIDETAG", desc: "GHOST MENTION WITHOUT TEXT", capsule: `${prefix}hidetag <message>` },
        { name: "KICK", desc: "REMOVE GROUP PARTICIPANT", capsule: `${prefix}kick @user` },
        { name: "ADD", desc: "ADD NUMBER TO GROUP", capsule: `${prefix}add <number>` },
        { name: "PROMOTE", desc: "PROMOTE MEMBER TO ADMIN", capsule: `${prefix}promote @user` },
        { name: "MUTE", desc: "LOCK CHAT FOR ADMINS ONLY", capsule: `${prefix}mute` },
        { name: "ANTILINK", desc: "AUTO-KICK LINK SPAMMERS", capsule: `${prefix}antilink on/off` },
        { name: "POLL", desc: "INTERACTIVE WHATSAPP POLL", capsule: `${prefix}poll Q | Opt1 | Opt2` },
      ]
    },
    {
      id: 6,
      title: "GAMES & FUN",
      subtitle: "Quiz • Guess • Slot • Meme • ...",
      icon: Gamepad2,
      commands: [
        { name: "QUIZ", desc: "TRIVIA WITH XP & REWARDS", capsule: `${prefix}quiz` },
        { name: "GUESS", desc: "GUESS THE NUMBER 1-100", capsule: `${prefix}guess` },
        { name: "ROLL", desc: "ROLL A 6-SIDED DICE", capsule: `${prefix}roll` },
        { name: "FLIP", desc: "FLIP A LUCKY COIN", capsule: `${prefix}flip` },
        { name: "SLOT", desc: "TRIPLE 777 CASINO SLOTS", capsule: `${prefix}slot` },
        { name: "LEADERBOARD", desc: "TOP MEMBER RANKINGS", capsule: `${prefix}leaderboard` },
        { name: "MEME", desc: "GENERATE CUSTOM MEMES", capsule: `${prefix}meme <top> | <bottom>` },
      ]
    },
    {
      id: 7,
      title: "BOT SETTINGS",
      subtitle: "Ping • Alive • Autochat • ...",
      icon: Settings,
      commands: [
        { name: "PING", desc: "RESPONSE LATENCY TEST", capsule: `${prefix}ping` },
        { name: "ALIVE", desc: "24/7 SYSTEM HEALTH & PLAN", capsule: `${prefix}alive` },
        { name: "MENU", desc: "OPEN INTERACTIVE DASHBOARD", capsule: `${prefix}menu` },
        { name: "AUTOCHAT", desc: "SMART AI AUTO REPLY", capsule: `${prefix}autochat on/off` },
        { name: "CHANNELREACT", desc: "AUTO REACT TO POSTS", capsule: `${prefix}channelreact on/off` },
        { name: "SETPREFIX", desc: "CHANGE BOT PREFIX", capsule: `${prefix}setprefix <prefix>` },
        { name: "RESTART", desc: "RECONNECT BAILEYS ENGINE", capsule: `${prefix}restart` },
      ]
    },
    {
      id: 8,
      title: "DAILY & UTILITIES",
      subtitle: "Gold • Crypto • Weather • Time • ...",
      icon: Coins,
      commands: [
        { name: "GOLD", desc: "LIVE 24K GOLD & USD RATES", capsule: `${prefix}gold` },
        { name: "CRYPTO", desc: "BITCOIN & SOLANA PRICES", capsule: `${prefix}crypto` },
        { name: "BILL", desc: "CEB BILL CALCULATOR IN LKR", capsule: `${prefix}bill <units>` },
        { name: "REMIND", desc: "SET AUTOMATED ALARM", capsule: `${prefix}remind <time> <task>` },
        { name: "WEATHER", desc: "LIVE WEATHER REPORT", capsule: `${prefix}weather <city>` },
        { name: "TIME", desc: "SRI LANKA COLOMBO TIME", capsule: `${prefix}time` },
      ]
    }
  ];

  const handleCategoryClick = (cat: typeof categories[0]) => {
    soundFX.playClick();
    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
  };

  const handleCopy = (text: string, type: 'menu' | 'ping') => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    if (type === 'menu') {
      setCopiedMenu(true);
      setTimeout(() => setCopiedMenu(false), 2000);
    } else {
      setCopiedPing(true);
      setTimeout(() => setCopiedPing(false), 2000);
    }
    addToast(`Copied "${text}" to clipboard!`, 'success');
  };

  const activeCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="w-full space-y-4">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#0e041d] border border-purple-500/30">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2-Column Menu (දෙපැත්තට)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Original Poster Art</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-purple-400 hidden sm:inline-block pr-2">
          {isOnline ? '🟢 24/7 ONLINE' : 'READY TO PAIR'}
        </span>
      </div>

      {/* ========================================================
          TAB 1: UNIFIED 2-COLUMN CYBERPUNK MENU (Photo 2 Replica)
          ======================================================== */}
      {activeTab === 'menu' && (
        <div className="w-full rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.3)] bg-[#090214] space-y-0">
          
          {/* 1. Header Banner: Girl + Robot + Logo without cut-off buttons */}
          <div className="relative w-full overflow-hidden bg-black">
            <img
              src="/assets/bot_header_banner.png"
              alt="YASHI HALLS WhatsApp Bot Logo Banner"
              className="w-full h-auto object-cover"
              onError={(e) => {
                // Fallback to logo
                (e.target as HTMLImageElement).src = '/data/bot_logo.png';
              }}
            />
            
            {/* Top Glowing Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-950/85 text-purple-200 border border-purple-400/60 backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                👑 MINI BOT 👑
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-950/85 text-emerald-300 border border-emerald-500/60 backdrop-blur-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{isOnline ? 'ONLINE 24/7' : 'READY'}</span>
              </span>
            </div>

            <div className="absolute top-2.5 right-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/80 text-purple-200 border border-purple-500/40 backdrop-blur-md">
                ⚡ 0ms Fast-Path
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#090214] to-transparent pointer-events-none" />
          </div>

          {/* 2. Subheader Bar */}
          <div className="px-3 py-2 text-center bg-gradient-to-r from-purple-950/80 via-[#180730] to-purple-950/80 border-t border-b border-purple-500/40 space-y-0.5">
            <div className="text-[10px] sm:text-xs font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>👑</span>
              <span>MINI BOT</span>
              <span>👑</span>
              <span className="text-purple-400/60">•</span>
              <span>YASHI HALLS MINI • WA ASSISTANT</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-pink-200 to-purple-300 tracking-tight">
              ✨✨ ALL COMMANDS MENU ✨✨
            </h2>
            <p className="text-[10px] sm:text-xs text-purple-200/80">
              Choose a category below to see all commands.
            </p>
          </div>

          {/* 3. The 8 Interactive Buttons: STRICTLY 2 COLUMNS ON ALL SCREENS */}
          <div className="p-2.5 sm:p-4 space-y-3 bg-[#0a0218]">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick(cat)}
                    className={`p-2 sm:p-3 rounded-2xl sm:rounded-3xl border transition-all text-left flex items-center justify-between gap-2 shadow-lg relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900 via-[#310f5e] to-purple-950 border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-1 ring-purple-400'
                        : 'bg-gradient-to-r from-[#14052a] via-[#1d083b] to-[#14052a] border-purple-500/50 hover:border-purple-300 shadow-[0_0_12px_rgba(147,51,234,0.2)]'
                    }`}
                  >
                    {/* Left Icon Badge with Glow */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/25 border border-purple-400/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-black text-[10px] sm:text-xs text-white tracking-wide truncate uppercase group-hover:text-purple-200 transition-colors">
                          {cat.title}
                        </div>
                        <div className="text-[8px] sm:text-[9.5px] text-purple-300/80 truncate font-sans">
                          {cat.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Right Chevron */}
                    <div className="shrink-0 flex items-center">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-purple-400 text-slate-950 border-purple-300 rotate-90 shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                          : 'bg-purple-950/60 text-purple-400 border-purple-500/40 group-hover:border-purple-300'
                      }`}>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* 4. EXPANDED CATEGORY DRAWER (Screenshot 3 Style) */}
            <AnimatePresence>
              {activeCategoryData && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl bg-[#0f0422] border-2 border-purple-400/60 p-3 sm:p-4 space-y-3 shadow-[0_0_35px_rgba(168,85,247,0.35)]"
                >
                  {/* Category Header matching Screenshot 3 */}
                  <div className="text-center py-1 space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-full bg-purple-900/60 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                      <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                    </div>
                    <div className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 uppercase tracking-wider">
                      {activeCategoryData.title} MENU
                    </div>
                    <div className="text-[11px] font-mono text-purple-300">
                      Tap to copy! (ක්ලික් කර Copy කරගන්න)
                    </div>
                  </div>

                  {/* 2-Column Command Cards (Screenshot 3 Exact Recreation) */}
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                    {activeCategoryData.commands.map((cmd, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          soundFX.playClick();
                          const copyCmd = cmd.capsule.split(' ')[0];
                          navigator.clipboard.writeText(copyCmd);
                          addToast(`Copied ${copyCmd}!`, 'success');
                        }}
                        className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-[#1b0a38] to-[#13052a] hover:from-[#2a1055] hover:to-[#1a083a] border border-purple-500/40 hover:border-purple-300 flex flex-col items-center justify-between text-center cursor-pointer transition-all shadow-md group relative min-h-[92px]"
                      >
                        <div className="w-full space-y-0.5">
                          <div className="font-black text-white text-[11px] sm:text-xs tracking-wide group-hover:text-purple-200 transition-colors uppercase">
                            {cmd.name}
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-purple-300/70 uppercase tracking-tight line-clamp-1 font-sans">
                            {cmd.desc}
                          </div>
                        </div>

                        {/* Capsule Pill (Screenshot 3) */}
                        <div className="mt-2 w-full max-w-[125px] py-1 px-1.5 rounded-xl bg-[#090216] border border-purple-500/60 group-hover:border-purple-300 group-hover:bg-purple-950/80 text-purple-200 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-tight truncate shadow-inner flex items-center justify-center gap-1">
                          <span>{cmd.capsule.split(' ')[0]}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Close Category Button */}
                  <div className="pt-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="px-4 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      ▲ Close {activeCategoryData.title} Drawer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 5. ⚡ QUICK ACTIONS ⚡ (Matching Photo 2) */}
            <div className="pt-1 space-y-2">
              <div className="text-center">
                <div className="text-[10px] sm:text-xs font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                  <span>QUICK ACTIONS</span>
                  <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {/* Quick 1: PING */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(`${prefix}ping`, 'ping')}
                  className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/90 border border-purple-500/50 hover:border-purple-300 text-center transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-1 text-purple-200 font-black text-xs sm:text-sm">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>PING</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-purple-300/70 mt-0.5">
                    {prefix}ping
                  </div>
                </motion.button>

                {/* Quick 2: ALIVE */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(`${prefix}alive`, 'menu')}
                  className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/90 border border-purple-500/50 hover:border-purple-300 text-center transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-1 text-emerald-300 font-black text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ALIVE</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-purple-300/70 mt-0.5">
                    {prefix}alive
                  </div>
                </motion.button>

                {/* Quick 3: OWNER */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(`${prefix}owner`, 'menu')}
                  className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/90 border border-purple-500/50 hover:border-purple-300 text-center transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-xs sm:text-sm">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>OWNER</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-purple-300/70 mt-0.5">
                    {prefix}owner
                  </div>
                </motion.button>
              </div>
            </div>

            {/* 6. Official Channel & Support Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <a
                href="https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[#090216] border border-purple-500/40 hover:border-purple-300 flex items-center justify-between text-purple-200 transition-all hover:bg-purple-950/40"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold text-white text-xs">OFFICIAL CHANNEL</div>
                    <div className="text-[9.5px] text-purple-300/70">Join WhatsApp Channel</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </a>

              <a
                href="https://wa.me/94740712934"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[#090216] border border-purple-500/40 hover:border-purple-300 flex items-center justify-between text-purple-200 transition-all hover:bg-purple-950/40"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold text-white text-xs">SUPPORT HOTLINE</div>
                    <div className="text-[9.5px] text-purple-300/70 font-mono">0740712934</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </a>
            </div>

            {/* 7. Quick Copy Pills Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(`${prefix}menu`, 'menu')}
                className="px-3 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 font-mono text-[10px] transition-all cursor-pointer"
              >
                {copiedMenu ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400" />}
                <span>Copy: <strong className="text-white">{prefix}menu</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(`${prefix}ping`, 'ping')}
                className="px-3 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 font-mono text-[10px] transition-all cursor-pointer"
              >
                {copiedPing ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400" />}
                <span>Copy: <strong className="text-white">{prefix}ping</strong></span>
              </button>
            </div>

            {/* 8. Sub-Footer Bar */}
            <div className="text-center py-2 border-t border-purple-900/30 text-[9.5px] font-mono text-purple-300/70">
              ⚡ YASHI HALLS MINI • [MINI PLAN] • POWERED BY YASHI HALLS ⚡
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: WHATSAPP NATIVE VIEW (Screenshot 1 Exact Chat View)
          ======================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b141a] border border-[#202c33] shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#202c33]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">
                WhatsApp Recipient View (සැබෑ WhatsApp පණිවිඩය)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              NATIVE FLOW MD
            </span>
          </div>

          {/* WhatsApp Chat Bubble */}
          <div className="max-w-md mx-auto bg-[#1f2c34] rounded-2xl overflow-hidden shadow-lg border border-[#2a3942]">
            {/* Header Image */}
            <div className="w-full aspect-[16/9] overflow-hidden bg-black relative">
              <img
                src="/assets/bot_header_banner.png"
                alt="Message Header Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/data/bot_logo.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f2c34] via-transparent to-transparent" />
            </div>

            {/* Unicode Box Styling from Screenshot 1 */}
            <div className="p-4 space-y-2 text-[11px] sm:text-xs font-mono text-slate-200">
              <div className="text-purple-300 font-bold">
                ╭───〔 {botName.toUpperCase().replace(/\s+/g, '-')} 〕───➤
              </div>
              <div className="pl-2 space-y-0.5 text-slate-300">
                <div>│ 👑 Owner : {ownerName}</div>
                <div>│ ⚙️ Mode : PUBLIC</div>
                <div>│ 🔣 Prefix : {prefix}</div>
                <div>│ 📚 Commands : 143</div>
              </div>
              <div className="text-purple-300 font-bold">
                ╰────────────────────➤
              </div>

              <div className="text-purple-300 font-bold pt-1">
                ╭───〔 SYSTEM STATS 〕───➤
              </div>
              <div className="pl-2 space-y-0.5 text-slate-300">
                <div>│ ⏱️ Uptime : {uptimeMinutes} minutes,</div>
                <div>│ 🚀 Latency : {serverBotState?.lastPingMs || 15}ms</div>
                <div>│ 💻 Platform : Linux (Cloud 24/7)</div>
                <div>│ 🤖 Version : 1.0.2</div>
              </div>
              <div className="text-purple-300 font-bold">
                ╰────────────────────➤
              </div>

              <div className="text-pink-400 font-bold pt-1">
                🔻 SELECT CATEGORY BELLOW
              </div>
            </div>

            {/* Interactive Native Flow Buttons (8 Categories + Channel Link) */}
            <div className="p-2.5 bg-[#18232a] border-t border-[#26353d] space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(1);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 👤 PROFILE</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(2);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 📥 DOWNLOAD</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(3);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 🎬 MOVIES</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(4);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 🧠 AI TOOLS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(5);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 👥 GROUPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setSelectedCategory(6);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#222e35] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>💜 🎮 GAMES</span>
                </button>
              </div>

              <div className="pt-1">
                <a
                  href="https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-purple-400" />
                  <span>📢 FOLLOW OFFICIAL CHANNEL</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: FULL POSTER ARTWORK VIEW (Complete 1024x1536 Art)
          ======================================================== */}
      {activeTab === 'poster' && (
        <div className="p-4 rounded-3xl bg-[#090214] border-2 border-purple-500/40 shadow-2xl space-y-3 text-center">
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Original Poster Artwork (1024 × 1536)</span>
              </h3>
              <p className="text-[11px] text-purple-300/70">
                Complete graphics poster with all neon UI buttons
              </p>
            </div>

            <a
              href="/assets/aistudio/file_00000000a5988208ba0d8759a81525b4_ee7e1d49.png"
              download="yashi_halls_bot_menu_poster.png"
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Poster</span>
            </a>
          </div>

          <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <img
              src="/assets/aistudio/file_00000000a5988208ba0d8759a81525b4_ee7e1d49.png"
              alt="Full Yashi Halls Bot Poster"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
