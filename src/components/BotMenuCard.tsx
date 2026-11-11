import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  Search, 
  ShieldAlert, 
  Zap,
  Terminal
} from 'lucide-react';
import { soundFX } from '../utils/sound';

export interface CommandItem {
  name: string;
  desc: string;
  capsule: string;
  badge?: string;
  category?: string;
  isOwnerOnly?: boolean;
}

export interface QuickButton {
  buttonId: string;
  displayText: string;
  icon?: string;
}

export interface BotMenuCardProps {
  id?: number | string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType | string;
  themeColor?: 'emerald' | 'purple' | 'blue' | 'cyan' | 'gold' | 'pink' | 'red';
  commands: CommandItem[];
  quickButtons?: QuickButton[];
  prefix?: string;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectCommand?: (command: CommandItem) => void;
  onExecuteCapsule?: (capsule: string) => void;
  interactiveCount?: number;
  className?: string;
}

export const BotMenuCard: React.FC<BotMenuCardProps> = ({
  id,
  title,
  subtitle,
  icon: IconComponent,
  themeColor = 'emerald',
  commands,
  quickButtons = [],
  prefix = '.',
  isExpanded: controlledExpanded,
  defaultExpanded = false,
  onToggleExpand,
  onSelectCommand,
  onExecuteCapsule,
  className = ''
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCapsule, setCopiedCapsule] = useState<string | null>(null);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    soundFX.playClick();
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const themeStyles = {
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60 focus-visible:border-emerald-400',
      bgGlow: 'from-emerald-500/10 via-emerald-950/20 to-zinc-950',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      accentText: 'text-emerald-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      buttonBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/60 focus-visible:border-purple-400',
      bgGlow: 'from-purple-500/10 via-purple-950/20 to-zinc-950',
      badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      accentText: 'text-purple-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      buttonBg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60 focus-visible:border-blue-400',
      bgGlow: 'from-blue-500/10 via-blue-950/20 to-zinc-950',
      badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      accentText: 'text-blue-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
      buttonBg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60 focus-visible:border-cyan-400',
      bgGlow: 'from-cyan-500/10 via-cyan-950/20 to-zinc-950',
      badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      accentText: 'text-cyan-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]',
      buttonBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    gold: {
      border: 'border-amber-500/30 hover:border-amber-500/60 focus-visible:border-amber-400',
      bgGlow: 'from-amber-500/10 via-amber-950/20 to-zinc-950',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      accentText: 'text-amber-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      buttonBg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    pink: {
      border: 'border-pink-500/30 hover:border-pink-500/60 focus-visible:border-pink-400',
      bgGlow: 'from-pink-500/10 via-pink-950/20 to-zinc-950',
      badgeBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      iconBg: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
      accentText: 'text-pink-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(236,72,153,0.15)]',
      buttonBg: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    red: {
      border: 'border-rose-500/30 hover:border-rose-500/60 focus-visible:border-rose-400',
      bgGlow: 'from-rose-500/10 via-rose-950/20 to-zinc-950',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      accentText: 'text-rose-400',
      glowShadow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      buttonBg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  }[themeColor];

  const handleCopyCapsule = (e: React.MouseEvent, capsule: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(capsule);
    setCopiedCapsule(capsule);
    soundFX.playSuccess();
    setTimeout(() => setCopiedCapsule(null), 2000);
  };

  const handleExecute = (e: React.MouseEvent, capsule: string) => {
    e.stopPropagation();
    soundFX.playClick();
    if (onExecuteCapsule) {
      onExecuteCapsule(capsule);
    }
  };

  const filteredCommands = commands.filter((cmd) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(q) ||
      cmd.desc.toLowerCase().includes(q) ||
      cmd.capsule.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative group rounded-2xl border bg-gradient-to-br ${themeStyles.bgGlow} ${themeStyles.border} ${themeStyles.glowShadow} transition-all duration-300 backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Header Container (Touch Friendly) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${title} command category menu`}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Category Icon */}
          <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center shrink-0 ${themeStyles.iconBg} shadow-inner`}>
            {typeof IconComponent === 'string' ? (
              <span className="text-xl sm:text-2xl">{IconComponent}</span>
            ) : IconComponent ? (
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-wide font-mono truncate">
                {title}
              </h3>
              {id !== undefined && (
                <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-full border ${themeStyles.badgeBg}`}>
                  {prefix}menu {id}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Badge Count + Chevron */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-mono">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>{commands.length}</span>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`p-1.5 rounded-lg border bg-zinc-900/60 ${themeStyles.accentText} border-zinc-800`}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl"
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Optional Quick Search Bar inside Card */}
              {commands.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${commands.length} commands in ${title}...`}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-700 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>
              )}

              {/* Command Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => {
                    const isCopied = copiedCapsule === cmd.capsule;
                    return (
                      <motion.div
                        key={`${cmd.name}-${idx}`}
                        whileHover={{ scale: 1.015, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          if (onSelectCommand) {
                            soundFX.playClick();
                            onSelectCommand(cmd);
                          } else {
                            handleCopyCapsule(e, cmd.capsule);
                          }
                        }}
                        className="group/item flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all duration-200 touch-manipulation min-h-[52px]"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-mono font-bold text-xs sm:text-sm ${themeStyles.accentText}`}>
                              {cmd.name}
                            </span>
                            {cmd.isOwnerOnly && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                Owner
                              </span>
                            )}
                            {cmd.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-sans">
                            {cmd.desc}
                          </p>
                          <div className="mt-1 font-mono text-[10px] text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                            <span className="text-zinc-600">Capsule:</span> {cmd.capsule}
                          </div>
                        </div>

                        {/* Action Buttons inside Card */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCapsule(e, cmd.capsule)}
                            title="Copy command code"
                            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors touch-manipulation"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {onExecuteCapsule && (
                            <button
                              type="button"
                              onClick={(e) => handleExecute(e, cmd.capsule)}
                              title="Run in simulator"
                              className={`p-2 rounded-lg border transition-colors touch-manipulation ${themeStyles.buttonBg}`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-6 text-center text-xs text-zinc-500 font-mono">
                    No commands matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Quick Interactive WhatsApp Buttons */}
              {quickButtons.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/60">
                  <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>WhatsApp Quick Buttons</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickButtons.map((qb, i) => (
                      <motion.button
                        key={`${qb.buttonId}-${i}`}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onExecuteCapsule) {
                            onExecuteCapsule(qb.buttonId);
                          } else {
                            handleCopyCapsule(e, qb.buttonId);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium border shadow-sm transition-all touch-manipulation min-h-[40px] ${themeStyles.buttonBg}`}
                      >
                        {qb.icon && <span>{qb.icon}</span>}
                        <span>{qb.displayText}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BotMenuCard;
