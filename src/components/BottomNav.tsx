import React from 'react';
import { 
  Home, 
  Bot, 
  Layers, 
  Wallet, 
  Settings 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';
import { soundFX } from '../utils/sound';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: AppTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'deployments', label: 'Bots', icon: Bot },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (id: AppTab) => {
    soundFX.playClick();
    setActiveTab(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#040814]/95 backdrop-blur-2xl border-t border-[#101E34] px-2 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all select-none ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Cyan Neon Glow Line on top */}
              {isActive && (
                <motion.div
                  layoutId="active-tab-glow"
                  className="absolute -top-2 w-8 h-[3px] rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              <Icon className={`w-5 h-5 mb-1 transition-all duration-200 ${isActive ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]' : ''}`} />
              <span className={`text-[11px] tracking-tight transition-colors ${isActive ? 'text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
