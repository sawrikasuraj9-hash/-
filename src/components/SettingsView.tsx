import React, { useState } from 'react';
import { 
  User, 
  ChevronRight, 
  Check, 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  Mail, 
  Key, 
  Lock, 
  Trash2,
  Edit2,
  Sparkles,
  Mic,
  Music,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';
import { soundFX } from '../utils/sound';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    updateUser, 
    theme, 
    setTheme, 
    setOpenDeleteAccountModal,
    changePlan,
    addToast,
    effectiveUserId,
  } = useApp();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [voiceAutoReplyEnabled, setVoiceAutoReplyEnabled] = useState(true);

  // Business Bot Token State
  const [businessBotToken, setBusinessBotToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  React.useEffect(() => {
    fetch('/api/voice-replies/customer')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.voiceAutoReplyEnabled === 'boolean') {
          setVoiceAutoReplyEnabled(data.voiceAutoReplyEnabled);
        }
      })
      .catch(() => {});

    fetch('/api/bot/config', {
      headers: { 'x-user-id': effectiveUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.businessBotToken) {
          setBusinessBotToken(data.data.businessBotToken);
        }
      })
      .catch(() => {});
  }, [effectiveUserId]);

  const handleToggleVoiceAutoReply = async () => {
    const nextState = !voiceAutoReplyEnabled;
    soundFX.playClick();
    setVoiceAutoReplyEnabled(nextState);
    try {
      await fetch('/api/voice-replies/customer/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
      addToast(
        nextState
          ? 'WhatsApp Voice Auto-Replies enabled'
          : 'WhatsApp Voice Auto-Replies disabled',
        nextState ? 'success' : 'info'
      );
    } catch {
      setVoiceAutoReplyEnabled(!nextState);
      addToast('Failed to update voice setting', 'error');
    }
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    soundFX.playSuccess();
    updateUser({ username: newUsername.trim() });
    setIsEditingUsername(false);
  };

  const handleThemeChange = (t: ThemeMode) => {
    soundFX.playClick();
    setTheme(t);
  };

  const handleSaveBusinessToken = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setIsSavingToken(true);
    try {
      const res = await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': effectiveUserId,
        },
        body: JSON.stringify({ 
          businessBotToken: businessBotToken.trim(),
          userId: effectiveUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setTokenSaved(true);
        setTimeout(() => setTokenSaved(false), 3000);
        addToast('Business Bot Token saved successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to save token', 'error');
      }
    } catch {
      addToast('Error saving business bot token', 'error');
    } finally {
      setIsSavingToken(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-28 relative"
    >
      {/* Background ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Settings</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* User Profile Banner Card (matches Screenshot 4) */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#111822] to-[#111822] border border-emerald-500/30 p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar with animated glow */}
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-sm animate-pulse" />
            <div className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
              {user.avatarLetter}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {user.username}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 truncate max-w-[170px] sm:max-w-none">
                {user.email}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {user.plan}
              </span>
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundFX.playClick();
            setIsEditingUsername(true);
          }}
          aria-label="Edit Profile"
          className="w-9 h-9 rounded-full bg-[#182330] hover:bg-[#202e40] border border-[#253547] text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-md"
        >
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </motion.button>
      </motion.div>

      {/* Edit Username Modal */}
      <AnimatePresence>
        {isEditingUsername && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[#111822] border border-[#243345] p-5 shadow-2xl space-y-4"
            >
              <div>
                <h3 className="text-base font-bold text-white">
                  Update Username
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose how you appear across YASHI HALLS services.
                </p>
              </div>

              <form onSubmit={handleSaveUsername} className="space-y-4">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#15202c] border border-[#243345] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
                  placeholder="Username"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#182330]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section 01: Account */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              // 01 · ACCOUNT
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Account
          </h3>
          <p className="text-xs text-slate-400">
            Manage your account details and connected providers.
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Username */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Username</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                How you appear across YASHI HALLS and how you sign in.
              </div>
              <div className="text-sm font-semibold text-white mt-1.5 font-mono">
                {user.username}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFX.playClick();
                setIsEditingUsername(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#1a2838] transition-colors"
              title="Edit username"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Email address */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] space-y-2">
            <div className="text-xs font-semibold text-slate-200">Email address</div>
            <div className="text-sm text-slate-300 font-mono">
              {user.email}
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED
              </span>
            </div>
          </div>

          {/* Sign-in method */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Sign-in method</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                You sign in through a connected social provider.
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e2a38] border border-[#2b3a4d] text-[10px] font-mono text-slate-300 uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              SOCIAL
            </span>
          </div>

          {/* Plan & Tier Management */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Active Tier & Container Quota</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Your WhatsApp bot engine runs on this plan level.
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                user.plan === 'pro'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                {user.plan}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => changePlan('mini')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  user.plan === 'mini'
                    ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-300'
                    : 'bg-[#182635] text-slate-400 hover:text-white'
                }`}
              >
                MINI (1 Slot)
              </button>
              <button
                onClick={() => changePlan('pro')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  user.plan === 'pro'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#182635] text-slate-400 hover:text-white'
                }`}
              >
                PRO (5 Slots)
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 02: Appearance */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              // 02 · APPEARANCE
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Appearance
          </h3>
          <p className="text-xs text-slate-400">
            Customize how YASHI HALLS looks and feels.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-200">Theme</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Saved to your account and synced across every device you sign in on.
            </div>
          </div>

          {/* Segmented Theme Picker with Spring Animation */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#101720] rounded-2xl border border-[#1c2736] relative">
            {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => {
              const isSelected = theme === mode;
              const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;

              return (
                <button
                  key={mode}
                  onClick={() => handleThemeChange(mode)}
                  className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors z-10 capitalize ${
                    isSelected ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="theme-active-pill"
                      className="absolute inset-0 bg-[#182330] rounded-xl border border-emerald-500/40 shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            {theme === 'dark' && 'The original terminal-dark look.'}
            {theme === 'light' && 'Clean daylight look with sharp contrast.'}
            {theme === 'system' && 'Synchronized automatically with your OS preference.'}
          </p>
        </div>
      </motion.div>

      {/* Section 03: Notifications */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
                // 03 · NOTIFICATIONS
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              SOON
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Notifications
          </h3>
          <p className="text-xs text-slate-400">
            Control what you get notified about.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Email notifications */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Email notifications</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Receive important updates about your deployments.
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFX.playClick();
                updateUser({ emailNotifications: !user.emailNotifications });
                addToast(
                  !user.emailNotifications
                    ? 'Deployment email notifications enabled'
                    : 'Deployment email notifications muted',
                  'info'
                );
              }}
              className={`w-12 h-6.5 rounded-full transition-colors p-1 relative shrink-0 ${
                user.emailNotifications ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <motion.div
                animate={{ x: user.emailNotifications ? 22 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>

          {/* Product updates */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Product updates</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Get notified about new features and improvements.
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFX.playClick();
                updateUser({ productUpdates: !user.productUpdates });
                addToast(
                  !user.productUpdates
                    ? 'Product update alerts enabled'
                    : 'Product update alerts disabled',
                  'info'
                );
              }}
              className={`w-12 h-6.5 rounded-full transition-colors p-1 relative shrink-0 ${
                user.productUpdates ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <motion.div
                animate={{ x: user.productUpdates ? 22 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Section 04: Voice Auto-Replies */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono tracking-wider text-purple-300 uppercase">
                // 04 · VOICE AUTO-REPLIES
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
              {user.plan === 'business' ? 'UNLIMITED' : user.plan === 'pro' ? '15 SLOTS' : '3 SLOTS'}
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Voice Auto-Replies (හඬ පිළිතුරු)
          </h3>
          <p className="text-xs text-slate-400">
            Automatically reply with recorded MP3 voice messages on WhatsApp for common questions.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Master Voice Reply Switch */}
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Enable Voice Auto-Reply</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Send authentic Push-To-Talk voice notes when trigger keywords match.
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleVoiceAutoReply}
              className={`w-12 h-6.5 rounded-full transition-colors p-1 relative shrink-0 ${
                voiceAutoReplyEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <motion.div
                animate={{ x: voiceAutoReplyEnabled ? 22 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>

          {/* Plan Quota info */}
          <div className="p-3 rounded-2xl bg-[#0c141e] border border-[#172535] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Plan Storage Limit:</span>
            <span className="text-emerald-400 font-bold">
              {user.plan === 'business'
                ? 'Unlimited / 25 MB per file'
                : user.plan === 'pro'
                ? '15 Voice Notes / 8 MB per file'
                : '3 Voice Notes / 2 MB per file'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Section 05: Business Bot Token & API Credentials */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-cyan-500/30 p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Key className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono tracking-wider text-cyan-300 uppercase">
                // 05 · BUSINESS BOT TOKEN
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              {user.plan === 'business' ? 'BUSINESS VIP' : 'ACTIVE'}
            </span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Business Bot Token</span>
            <span className="text-xs font-normal text-slate-400">(බිස්නස් බොට්ගේ ටොකන් එක)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure your enterprise Business Bot API Token, Webhook Secret, or Authentication Key.
          </p>
        </div>

        <form onSubmit={handleSaveBusinessToken} className="space-y-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Bot Token / Secret Key
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={businessBotToken}
                onChange={(e) => setBusinessBotToken(e.target.value)}
                placeholder="YASHI_BIZ_TOKEN_xxxxxxxxxxxxxxxx"
                className="w-full bg-[#0d141e] border border-[#253648] rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Saved securely in your bot cloud engine. Used for Business API webhooks & external integrations.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSavingToken}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
            >
              {tokenSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950 font-black" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingToken ? 'Saving...' : 'Save Token'}</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Section 06: Security */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#111822]/90 backdrop-blur-md border border-[#1e2a38] p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              // 06 · SECURITY
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Security
          </h3>
          <p className="text-xs text-slate-400">
            Keep your account safe and secure.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#15202c] border border-[#223345] space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-200">Change password</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Your account signs in via a social provider, so there is no password to change.
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-[#192433] border border-[#253648] text-slate-500 text-xs font-semibold cursor-not-allowed uppercase tracking-wider"
          >
            Unavailable
          </button>
        </div>
      </motion.div>

      {/* Section 05: Danger zone */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl bg-[#181116]/90 backdrop-blur-md border border-rose-500/30 p-5 shadow-lg space-y-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono tracking-wider text-rose-400 uppercase">
              // 05 · DANGER_ZONE
            </span>
          </div>
          <h3 className="text-base font-bold text-rose-400">
            Danger zone
          </h3>
          <p className="text-xs text-rose-300/70">
            These actions are permanent and cannot be undone.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#20141a] border border-rose-500/20 space-y-3">
          <div>
            <div className="text-xs font-semibold text-rose-300">Delete account</div>
            <div className="text-[11px] text-rose-200/60 mt-0.5 leading-relaxed">
              Permanently remove your account, every bot you've deployed, your coin balance, and your transaction history.
            </div>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundFX.playClick();
                setOpenDeleteAccountModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Delete account
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-400 space-y-2">
        <div>YASHI HALLS · Free 24/7 Bot Hosting</div>
        <div>
          <button 
            onClick={() => {
              soundFX.playClick();
              addToast('Privacy Policy: All bot data and credentials are kept securely encrypted in isolated containers.', 'info');
            }}
            className="hover:text-slate-300 uppercase tracking-widest text-[10px] transition-colors"
          >
            PRIVACY POLICY
          </button>
        </div>
      </footer>
    </motion.div>
  );
};
