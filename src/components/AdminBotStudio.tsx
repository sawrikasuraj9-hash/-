import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Terminal, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  ListFilter, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Copy,
  Radio,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { soundFX } from '../utils/sound';

interface MenuCategoryRow {
  id: string;
  title: string;
  command: string;
  description: string;
}

interface CustomBotCommand {
  id: string;
  trigger: string;
  replyText: string;
  enabled: boolean;
}

interface BotStudioConfig {
  botName: string;
  botLogoUrl: string;
  prefix: string;
  ownerNumber: string;
  ownerName: string;
  baileysVersion: string;
  browserName: string;
  channelUrl: string;
  menuHeader: string;
  menuFooter: string;
  buttonText: string;
  categories: MenuCategoryRow[];
  customCommands: CustomBotCommand[];
  featureFlags: {
    antiLink: boolean;
    antiSpam: boolean;
    autoReadStatus: boolean;
    callDetectorEnabled: boolean;
    channelAutoReact: boolean;
    smartAutoReply: boolean;
  };
}

interface Props {
  adminEmail: string;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const DEFAULT_CATEGORIES: MenuCategoryRow[] = [
  { id: "download", title: "📥 Download Menu", command: ".download", description: "Download videos, audio & files" },
  { id: "ai", title: "🧠 AI Commands", command: ".ai", description: "Chat & AI features" },
  { id: "group", title: "👥 Group Manage", command: ".group", description: "Manage group settings" },
  { id: "admin", title: "⚙️ Admin Menu", command: ".admin", description: "Admin tools and controls" },
  { id: "tools", title: "🛠️ Tools & Edits", command: ".tools", description: "Editing and utility tools" },
  { id: "owner", title: "👑 Owner Area", command: ".owner", description: "Owner-only commands" },
  { id: "other", title: "📂 Other Cmds", command: ".other", description: "Other bot commands" },
  { id: "music", title: "🎵 Song & Music", command: ".music", description: "Search and play songs" },
  { id: "aiimage", title: "🖼️ AI Image Menu", command: ".aiimage", description: "Generate AI images" },
  { id: "movies", title: "🎬 Movies & TV", command: ".movies", description: "Download TV series & movies" },
  { id: "premium", title: "💎 Premium Menu", command: ".premium", description: "Special VIP features" },
  { id: "texttools", title: "✍️ Text Tools", command: ".texttools", description: "Text formatting & fonts" },
  { id: "utility", title: "🧩 Utility Menu", command: ".utility", description: "Daily utility features" },
  { id: "games", title: "🎮 Fun & Games", command: ".games", description: "Mini games & fun" },
  { id: "math", title: "📊 Math & Dev", command: ".math", description: "Calculations and dev tools" }
];

export const AdminBotStudio: React.FC<Props> = ({ adminEmail, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studio, setStudio] = useState<BotStudioConfig>({
    botName: "YASHI MALLS BOT",
    botLogoUrl: "https://i.ibb.co/n2fYpDV/file-000000007c3c8210ae1b96d28b22c655.png",
    prefix: ".",
    ownerNumber: "94740712934",
    ownerName: "Sawrika Suraj",
    baileysVersion: "2.3000.1017531287",
    browserName: "Chrome (Ubuntu)",
    channelUrl: "https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z",
    menuHeader: "🌟 *WELCOME TO YASHI MALLS BOT!* 🌟\n\nHi there! I am here to make your WhatsApp experience easier, faster, and more fun.\n\nChoose an option from the menu list below to get started!",
    menuFooter: "POWERED BY YASHI MALLS",
    buttonText: "📋 CLICK TO OPEN MENU",
    categories: DEFAULT_CATEGORIES,
    customCommands: [
      {
        id: "cmd-rules",
        trigger: "rules",
        replyText: "📜 *YASHI MALLS RULES:*\n1. No spamming in groups\n2. Respect admins\n3. Enjoy high-speed downloads!",
        enabled: true
      }
    ],
    featureFlags: {
      antiLink: true,
      antiSpam: true,
      autoReadStatus: true,
      callDetectorEnabled: true,
      channelAutoReact: false,
      smartAutoReply: false
    }
  });

  // New Command Form State
  const [newCmdTrigger, setNewCmdTrigger] = useState('');
  const [newCmdReply, setNewCmdReply] = useState('');
  const [showAddCmd, setShowAddCmd] = useState(false);

  // New Category Row State
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatCommand, setNewCatCommand] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    const fetchStudio = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/bot-studio', {
          headers: { 'x-admin-email': adminEmail }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStudio(json.data);
          }
        }
      } catch {
        addToast('Failed to load Bot Studio data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudio();
  }, [adminEmail, addToast]);

  const handleSave = async () => {
    setSaving(true);
    soundFX.playClick();
    try {
      const res = await fetch('/api/admin/bot-studio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(studio)
      });
      const json = await res.json();
      if (json.success) {
        soundFX.playSuccess();
        addToast('Bot Engine, Baileys & Command Studio saved and hot-reloaded!', 'success');
      } else {
        addToast(json.message || 'Failed to save bot studio settings', 'error');
      }
    } catch {
      addToast('Network error while saving bot studio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmdTrigger.trim() || !newCmdReply.trim()) return;
    const cleanTrigger = newCmdTrigger.trim().replace(/^\./, '').toLowerCase();
    const newCmd: CustomBotCommand = {
      id: `cmd-${Date.now()}`,
      trigger: cleanTrigger,
      replyText: newCmdReply.trim(),
      enabled: true
    };
    setStudio(prev => ({
      ...prev,
      customCommands: [...prev.customCommands, newCmd]
    }));
    setNewCmdTrigger('');
    setNewCmdReply('');
    setShowAddCmd(false);
    soundFX.playSuccess();
    addToast(`Added command .${cleanTrigger}! Click Save to activate.`, 'info');
  };

  const handleDeleteCommand = (id: string) => {
    soundFX.playClick();
    setStudio(prev => ({
      ...prev,
      customCommands: prev.customCommands.filter(c => c.id !== id)
    }));
  };

  const handleToggleCommand = (id: string) => {
    soundFX.playClick();
    setStudio(prev => ({
      ...prev,
      customCommands: prev.customCommands.map(c => 
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    }));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim() || !newCatCommand.trim()) return;
    const newRow: MenuCategoryRow = {
      id: `cat-${Date.now()}`,
      title: newCatTitle.trim(),
      command: newCatCommand.startsWith('.') ? newCatCommand.trim() : `.${newCatCommand.trim()}`,
      description: newCatDesc.trim() || 'Menu option'
    };
    setStudio(prev => ({
      ...prev,
      categories: [...prev.categories, newRow]
    }));
    setNewCatTitle('');
    setNewCatCommand('');
    setNewCatDesc('');
    setShowAddCat(false);
    soundFX.playSuccess();
    addToast(`Added category row ${newRow.title}! Click Save to activate.`, 'info');
  };

  const handleDeleteCategory = (id: string) => {
    soundFX.playClick();
    setStudio(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  const handleResetCategories = () => {
    soundFX.playClick();
    setStudio(prev => ({ ...prev, categories: DEFAULT_CATEGORIES }));
    addToast('Restored 15 default menu sections!', 'info');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Bot Engine Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0e1c22] to-[#0a141b] border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>BOT ENGINE, BAILEYS & COMMAND STUDIO</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-[10px] font-bold">
                CORE CONTROLLER
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Baileys Version, Bot Profile, 15 List Menu Categories, Custom Commands සහ Feature Flags සජීවීව වෙනස් කරන්න.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Hot Reloading...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Hot-Reload Engine</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Baileys Engine & Bot Identity */}
        <div className="lg:col-span-5 space-y-5">
          {/* Baileys Protocol & Version */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Baileys Protocol & Socket Engine</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Baileys Version (e.g. 2.3000.1017531287)
                </label>
                <input
                  type="text"
                  value={studio.baileysVersion}
                  onChange={e => setStudio({ ...studio, baileysVersion: e.target.value })}
                  placeholder="2.3000.1017531287"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Browser Signature / Identity
                </label>
                <input
                  type="text"
                  value={studio.browserName}
                  onChange={e => setStudio({ ...studio, browserName: e.target.value })}
                  placeholder="Chrome (Ubuntu)"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Bot Profile & Identity */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Bot Identity & Profiles</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={studio.botName}
                  onChange={e => setStudio({ ...studio, botName: e.target.value })}
                  placeholder="YASHI MALLS BOT"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bot Logo Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={studio.botLogoUrl}
                    onChange={e => setStudio({ ...studio, botLogoUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                  {studio.botLogoUrl && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/50 shrink-0 bg-slate-900 flex items-center justify-center">
                      <img 
                        src={studio.botLogoUrl} 
                        alt="Bot Logo" 
                        className="w-full h-full object-cover" 
                        onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Command Prefix
                  </label>
                  <input
                    type="text"
                    value={studio.prefix}
                    onChange={e => setStudio({ ...studio, prefix: e.target.value })}
                    placeholder="."
                    className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-center font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Owner Phone
                  </label>
                  <input
                    type="text"
                    value={studio.ownerNumber}
                    onChange={e => setStudio({ ...studio, ownerNumber: e.target.value })}
                    placeholder="94740712934"
                    className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={studio.ownerName}
                  onChange={e => setStudio({ ...studio, ownerName: e.target.value })}
                  placeholder="Sawrika Suraj"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official WhatsApp Channel URL
                </label>
                <input
                  type="url"
                  value={studio.channelUrl}
                  onChange={e => setStudio({ ...studio, channelUrl: e.target.value })}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags & Shields */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-3.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bot Protection & Automation Flags</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { key: 'antiLink', label: 'Anti-Link Protection', desc: 'Auto delete group links' },
                { key: 'antiSpam', label: 'Anti-Spam Rate Limiter', desc: 'Prevent spam flooding' },
                { key: 'autoReadStatus', label: 'Auto-Read WhatsApp Statuses', desc: 'Mark statuses as viewed' },
                { key: 'callDetectorEnabled', label: 'Call Reject & Notify', desc: 'Reject incoming calls with warning' },
                { key: 'channelAutoReact', label: 'Channel Auto-React', desc: 'React to channel posts with emojis' },
                { key: 'smartAutoReply', label: 'Smart AI Auto-Reply', desc: 'Fallback AI conversational replies' }
              ].map(flag => {
                const isEnabled = (studio.featureFlags as any)[flag.key];
                return (
                  <div key={flag.key} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a1626] border border-[#162a42]">
                    <div>
                      <div className="text-xs font-bold text-white">{flag.label}</div>
                      <div className="text-[11px] text-slate-400">{flag.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudio(prev => ({
                          ...prev,
                          featureFlags: {
                            ...prev.featureFlags,
                            [flag.key]: !isEnabled
                          }
                        }));
                      }}
                      className={`text-2xl transition-all ${isEnabled ? 'text-emerald-400' : 'text-slate-600'}`}
                    >
                      {isEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Menu System & Custom Commands Studio */}
        <div className="lg:col-span-7 space-y-5">
          {/* Menu Drawer & Header Settings */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-amber-400" />
              <span>Interactive Menu System (List & Button Drawer)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Drawer Button Text (Open Menu Button)
                </label>
                <input
                  type="text"
                  value={studio.buttonText}
                  onChange={e => setStudio({ ...studio, buttonText: e.target.value })}
                  placeholder="📋 CLICK TO OPEN MENU"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Welcome Message / Header Text
                </label>
                <textarea
                  rows={4}
                  value={studio.menuHeader}
                  onChange={e => setStudio({ ...studio, menuHeader: e.target.value })}
                  placeholder="🌟 *WELCOME TO YASHI MALLS BOT!* 🌟..."
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Footer Caption
                </label>
                <input
                  type="text"
                  value={studio.menuFooter}
                  onChange={e => setStudio({ ...studio, menuFooter: e.target.value })}
                  placeholder="POWERED BY YASHI MALLS"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Menu Categories List */}
            <div className="pt-2 border-t border-[#14263e] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Menu Rows / Categories ({studio.categories.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCategories}
                    className="px-2.5 py-1 rounded-lg bg-[#0a1626] border border-slate-700 text-slate-400 hover:text-white text-[11px] font-mono"
                  >
                    Restore 15 Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>

              {showAddCat && (
                <form onSubmit={handleAddCategory} className="p-3.5 rounded-2xl bg-[#091524] border border-amber-500/40 space-y-2.5">
                  <div className="text-xs font-bold text-amber-400">Add New Category Row:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title: 🎮 Games & Fun"
                      value={newCatTitle}
                      onChange={e => setNewCatTitle(e.target.value)}
                      className="bg-[#0a1626] border border-[#1a2f4a] rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Command: .games"
                      value={newCatCommand}
                      onChange={e => setNewCatCommand(e.target.value)}
                      className="bg-[#0a1626] border border-[#1a2f4a] rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description: Mini games and fun features"
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    className="w-full bg-[#0a1626] border border-[#1a2f4a] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCat(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Add Row
                    </button>
                  </div>
                </form>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {studio.categories.map(cat => (
                  <div key={cat.id} className="p-2.5 rounded-xl bg-[#0a1626] border border-[#162a42] flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{cat.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{cat.description}</div>
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] shrink-0 font-bold">
                      {cat.command}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Bot Commands Studio */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Custom Bot Commands Studio (Dynamic Handlers)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCmd(!showAddCmd)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Command</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              මෙහි ඕනෑම command එකක් (උදා: <code className="text-cyan-400">.rules</code>, <code className="text-cyan-400">.vip</code>, <code className="text-cyan-400">.price</code>) සාදා auto reply text එක සකස් කළ හැක.
            </p>

            {showAddCmd && (
              <form onSubmit={handleAddCommand} className="p-4 rounded-2xl bg-[#091524] border-2 border-cyan-500/40 space-y-3">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create New Custom Bot Command:</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Command Trigger (without prefix)
                  </label>
                  <div className="flex items-center gap-2 bg-[#0a1626] border border-[#1b3150] rounded-xl px-3 py-1.5">
                    <span className="text-cyan-400 font-mono font-bold">.{studio.prefix}</span>
                    <input
                      type="text"
                      placeholder="e.g. donate or rules"
                      value={newCmdTrigger}
                      onChange={e => setNewCmdTrigger(e.target.value)}
                      className="bg-transparent text-xs text-white font-mono w-full focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Bot Response Text / Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type the message bot will reply with..."
                    value={newCmdReply}
                    onChange={e => setNewCmdReply(e.target.value)}
                    className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCmd(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs uppercase"
                  >
                    Add Command
                  </button>
                </div>
              </form>
            )}

            {/* Custom Commands List */}
            <div className="space-y-2.5">
              {studio.customCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-2xl">
                  No custom commands added yet. Click "+ New Command" to create one!
                </div>
              ) : (
                studio.customCommands.map(cmd => (
                  <div key={cmd.id} className="p-3 rounded-2xl bg-[#0a1626] border border-[#162a42] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
                          .{cmd.trigger}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          cmd.enabled 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {cmd.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCommand(cmd.id)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#07101c]"
                        >
                          {cmd.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCommand(cmd.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#060e1a] border border-[#132338] text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                      {cmd.replyText}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
