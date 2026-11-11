import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Layers, 
  LayoutGrid, 
  Wallet, 
  CreditCard, 
  Tag, 
  Lightbulb, 
  UserPlus, 
  Settings,
  Link as LinkIcon,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { AppTab } from '../types';
import { soundFX } from '../utils/sound';

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'deployments', label: 'Pairing & Deploy', icon: LinkIcon },
  { id: 'templates', label: 'YASHI PRO Template', icon: LayoutGrid },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'pricing', label: 'Pricing', icon: Tag },
  { id: 'suggest', label: 'Suggest', icon: Lightbulb },
  { id: 'invite', label: 'Invite', icon: UserPlus },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const SidebarDrawer: React.FC = () => {
  const { 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeTab, 
    setActiveTab, 
    setOpenProModal, 
    setOpenInviteModal,
    isAdmin 
  } = useApp();

  const handleNavClick = (id: AppTab) => {
    soundFX.playClick();
    if (id === 'billing' || id === 'pricing') {
      setOpenProModal(true);
      setIsSidebarOpen(false);
      return;
    }
    if (id === 'invite') {
      setOpenInviteModal(true);
      setIsSidebarOpen(false);
      return;
    }
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop with Blur Fade */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              soundFX.playClick();
              setIsSidebarOpen(false);
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md" 
          />

          {/* Drawer with Spring Slide */}
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-72 max-w-[80vw] h-full bg-[#060C18]/98 backdrop-blur-2xl border-r border-[#101E34] p-4 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10"
          >
            <div>
              {/* Header with User's Logo */}
              <div className="flex items-center justify-between pb-6 pt-1 px-2 border-b border-[#1b2633] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] bg-[#131d27] p-0.5">
                    <img 
                      src={APP_CONFIG.logoUrl} 
                      alt="YASHI HALLS"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex items-center font-black text-lg tracking-tight">
                    <span className="text-white">YASHI</span>
                    <span className="text-cyan-400 ml-1">HALLS</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    soundFX.playClick();
                    setIsSidebarOpen(false);
                  }}
                  aria-label="Close sidebar"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#192432] transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1.5 px-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'border border-cyan-500/70 bg-cyan-950/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] font-bold'
                          : 'border border-transparent text-slate-300 hover:text-white hover:bg-[#151f2b]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}

                {/* VERIFIED MASTER ADMIN PANEL BUTTON */}
                {isAdmin && (
                  <div className="pt-2 mt-2 border-t border-[#162740]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-3 py-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>SUPER ADMIN ACCESS</span>
                    </div>
                    <motion.button
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        soundFX.playSuccess();
                        setActiveTab('admin');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-black transition-all text-left ${
                        activeTab === 'admin'
                          ? 'border-2 border-amber-400 bg-amber-950/40 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                          : 'border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 text-amber-300 hover:border-amber-400 hover:bg-amber-950/30'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>ADMIN PANEL</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                            ROOT
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Customer, Coin & Approval Hub
                        </div>
                      </div>
                    </motion.button>
                  </div>
                )}
              </nav>
            </div>

            {/* Footer info in drawer */}
            <div className="pt-4 border-t border-[#1b2633] px-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>YASHI HALLS Cloud</span>
                <span className="text-cyan-400 font-mono font-bold">MINI • PRO • BIZ</span>
              </div>
              <div className="text-[11px] text-slate-400">
                <a
                  href={APP_CONFIG.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-semibold block"
                >
                  💬 Join WhatsApp Channel
                </a>
                <span className="text-slate-500 block mt-0.5">Hotline: 0740712934</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
