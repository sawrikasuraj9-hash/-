import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  Settings, 
  Wallet, 
  CreditCard, 
  LogOut,
  Moon,
  Sun,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { soundFX } from '../utils/sound';

export const Header: React.FC = () => {
  const { 
    user, 
    coins, 
    theme, 
    setTheme, 
    setActiveTab, 
    setIsSidebarOpen, 
    notifications, 
    markAllNotificationsRead,
    setOpenProModal,
    logout,
    isAdmin
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    soundFX.playClick();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040814]/90 backdrop-blur-2xl border-b border-[#0f1d32] px-3 sm:px-5 py-2.5 transition-colors duration-200">
      {/* Top Cyber Laser Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/30 via-cyan-400 to-blue-500/30 shadow-[0_0_12px_rgba(0,240,255,0.8)] opacity-90" />

      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 relative">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              soundFX.playClick();
              setIsSidebarOpen(true);
            }}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#0c1626] border border-transparent hover:border-[#1a2c46] transition-colors"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          {/* Logo Badge & Brand Name */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.4)] bg-[#071120] shrink-0 group-hover:border-cyan-300 transition-all p-0.5 relative">
              <img
                src={APP_CONFIG.logoUrl}
                alt="YASHI HALLS Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-full border border-purple-500/30 pointer-events-none" />
            </div>
            <div className="flex items-center font-black text-base sm:text-lg tracking-tight">
              <span className="text-white">YASHI</span>
              <span className="text-cyan-400 ml-1.5 group-hover:text-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-colors">
                HALLS
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Animated Coin Pill (Matching Screenshot: Gold $ icon + 1630) */}
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundFX.playCoin();
              setActiveTab('wallet');
            }}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081222] border border-[#162740] hover:border-cyan-500/50 text-slate-200 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
            title="View Coin Wallet"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-[0_0_8px_rgba(245,158,11,0.6)]">
              $
            </div>
            <motion.span 
              key={coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xs sm:text-sm font-bold text-white tabular-nums tracking-wide"
            >
              {coins}
            </motion.span>
          </motion.button>

          {/* Notifications Bell with Red Indicator Dot */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                soundFX.playClick();
                setIsNotifOpen(!isNotifOpen);
              }}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#0c1626] border border-transparent hover:border-[#1a2c46] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </span>
              )}
            </motion.button>

            {/* Notification Popover */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#081222]/95 backdrop-blur-2xl border border-[#162740] shadow-[0_15px_40px_rgba(0,0,0,0.7)] p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#122238]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-mono">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs transition-colors ${
                            n.read 
                              ? 'bg-[#0a1526]/40 text-slate-400 border border-transparent' 
                              : 'bg-[#0e1d32] text-slate-200 border border-cyan-500/20'
                          }`}
                        >
                          <div className="font-bold text-white mb-0.5">{n.title}</div>
                          <div className="text-slate-400 leading-relaxed">{n.message}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                            {n.time}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar with Online Badge */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundFX.playClick();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              aria-label="User account menu"
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-cyan-500/40 transition-all"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-cyan-400/40">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'L'}
                </div>
                {/* Green Online Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#040814] shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-60 rounded-3xl bg-[#081222]/95 backdrop-blur-2xl border border-[#162740] shadow-[0_15px_40px_rgba(0,0,0,0.7)] py-2.5 z-50 divide-y divide-[#122238]"
                >
                  <div className="px-4 py-2.5">
                    <div className="font-bold text-sm text-white truncate">
                      {user.username}
                    </div>
                    <div className="text-xs text-cyan-400 font-mono uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
                      <span>{user.plan} plan</span>
                    </div>
                  </div>

                  <div className="py-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          soundFX.playSuccess();
                          setActiveTab('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs sm:text-sm text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 transition-colors text-left font-bold border-b border-[#162740] mb-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>ADMIN PANEL</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                          ROOT
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setActiveTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-[#0e1d32] transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playCoin();
                        setActiveTab('wallet');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-[#0e1d32] transition-colors text-left"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Wallet</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setOpenProModal(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-[#0e1d32] transition-colors text-left"
                    >
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span>Upgrade Plan</span>
                    </button>

                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-[#0e1d32] transition-colors text-left"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>Light Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-cyan-400" />
                          <span>Dark Theme</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
