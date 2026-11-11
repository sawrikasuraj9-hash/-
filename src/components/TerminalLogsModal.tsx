import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Terminal, 
  RefreshCw, 
  Copy, 
  Send, 
  Check,
  Zap,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { soundFX } from '../utils/sound';

export const TerminalLogsModal: React.FC = () => {
  const { openTerminalBot, setOpenTerminalBot, restartBot, serverLogs, serverBotState, addToast } = useApp();
  const [commandInput, setCommandInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [localInteractiveLogs, setLocalInteractiveLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Combine server logs with any interactive CLI inputs in modal
  const combinedLogs = React.useMemo(() => {
    const formattedServerLogs = serverLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`);
    return [...formattedServerLogs, ...localInteractiveLogs];
  }, [serverLogs, localInteractiveLogs]);

  useEffect(() => {
    if (openTerminalBot) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedLogs.length, openTerminalBot]);

  if (!openTerminalBot) return null;

  const handleCopyLogs = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(combinedLogs.join('\n'));
    setCopied(true);
    addToast('Logs copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    soundFX.playClick();
    const time = new Date().toLocaleTimeString();
    setLocalInteractiveLogs((prev) => [...prev, `[${time}] [CLI_INPUT] > ${cmd}`]);
    setCommandInput('');

    // Handle commands interactively
    if (cmd.startsWith('.ai ') || cmd.startsWith('.ask ')) {
      const prompt = cmd.replace(/^(\.ai|\.ask)\s+/, '');
      setLocalInteractiveLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [YASHI_AI] Processing query with YASHI HALLS AI...`]);
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        soundFX.playSuccess();
        setLocalInteractiveLogs((prev) => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] [YASHI_AI] Output:\n${data.text || data.message || 'No response'}`
        ]);
      } catch (err: any) {
        setLocalInteractiveLogs((prev) => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] [ERROR] YASHI HALLS AI call failed: ${err?.message || err}`
        ]);
      }
    } else if (cmd.toLowerCase() === '.ping') {
      soundFX.playSuccess();
      setLocalInteractiveLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [PONG] 🏓 Latency: ${serverBotState?.lastPingMs || 18}ms | Cluster: Colombo/Asia (Active)`
      ]);
    } else if (cmd.toLowerCase() === '.help' || cmd.toLowerCase() === '.menu') {
      soundFX.playSuccess();
      setLocalInteractiveLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] ╔═════════════════════════════════════════════╗`,
        `[${new Date().toLocaleTimeString()}]    ⚡ YASHI HALLS INTERACTIVE BUTTON MENU ⚡`,
        `[${new Date().toLocaleTimeString()}] ╚═════════════════════════════════════════════╝`,
        `[${new Date().toLocaleTimeString()}] 🔘 [ 🎵 SONG & AUDIO ]   🔘 [ 🎬 VIDEO DOWNLOAD ]`,
        `[${new Date().toLocaleTimeString()}] 🔘 [ 🖼️ IMAGE/STICKER ]  🔘 [ 🤖 AI CHAT ASSIST ]`,
        `[${new Date().toLocaleTimeString()}] 🔘 [ 🎮 MINI GAMES ]     🔘 [ 👥 GROUP TOOLS ]`,
        `[${new Date().toLocaleTimeString()}] 🔘 [ ⚙️ BOT SETTINGS ]   🔘 [ 💎 UPGRADE TO PRO ]`,
        `[${new Date().toLocaleTimeString()}] 📢 [ WHATSAPP CHANNEL ]     📞 [ SUPPORT HOTLINE ]`,
        `[${new Date().toLocaleTimeString()}] [INFO] WhatsApp Baileys engine is configured with Native Flow buttons and interactive quick replies.`
      ]);
    } else if (cmd.toLowerCase() === 'clear') {
      setLocalInteractiveLogs([`[${new Date().toLocaleTimeString()}] Interactive CLI buffer cleared.`]);
    } else if (cmd.toLowerCase() === 'status') {
      soundFX.playSuccess();
      setLocalInteractiveLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [STATUS] State: ${serverBotState?.connectionStatus || 'ONLINE'} | Paired: +${serverBotState?.pairedNumber || 'N/A'} | Uptime: ${serverBotState?.uptimeSeconds || 0}s`
      ]);
    } else {
      setLocalInteractiveLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [STDOUT] Command accepted: "${cmd}". Type .help or .ai for AI assistance.`
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-3xl rounded-3xl bg-[#090d12] border border-[#1e2a38] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col h-[85vh] overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d131a] border-b border-[#1b2633] shrink-0">
          <div className="flex items-center gap-3">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer" onClick={() => setOpenTerminalBot(null)} />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white font-bold">{openTerminalBot.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                worker://yashi-halls-pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16212d] transition-colors"
              title="Copy all logs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFX.playClick();
                restartBot();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16212d] transition-colors"
              title="Restart Baileys Socket"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFX.playClick();
                setOpenTerminalBot(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16212d] transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Live Terminal Log Viewer */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 select-text bg-[#070a0f] text-slate-300">
          <div className="text-slate-500 pb-2 border-b border-[#151f2b] mb-2 leading-relaxed">
            === YASHI HALLS Cloud Worker Terminal v3.0 [YASHI HALLS PRO Engine] ===<br />
            Baileys Multi-Device / Node {process.version} / YASHI HALLS AI Engine<br />
            Type .ping, .menu or .ai &lt;question&gt; into the input bar below to interact live!
          </div>

          {combinedLogs.length === 0 ? (
            <div className="text-slate-500 italic py-4">
              [SYSTEM] Bot worker idle. Click 'Start' or 'Pair Device' to spawn Baileys instance...
            </div>
          ) : (
            combinedLogs.map((log, index) => {
              let color = 'text-slate-300';
              if (log.includes('[ERROR]')) color = 'text-rose-400 font-semibold';
              else if (log.includes('[ONLINE]') || log.includes('[CONNECT]') || log.includes('[PONG]')) color = 'text-emerald-400 font-semibold';
              else if (log.includes('[CMD]') || log.includes('[CLI_INPUT]')) color = 'text-cyan-400 font-semibold';
              else if (log.includes('[YASHI_AI]')) color = 'text-purple-300 font-semibold';
              else if (log.includes('[WARN]')) color = 'text-amber-400';

              return (
                <div key={index} className={`leading-relaxed whitespace-pre-wrap ${color}`}>
                  {log}
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Interactive Command Input Box */}
        <form 
          onSubmit={handleSendCommand}
          className="p-3 bg-[#0d131a] border-t border-[#1b2633] flex items-center gap-2 shrink-0"
        >
          <span className="text-cyan-400 font-mono text-xs font-bold pl-2 select-none flex items-center gap-1">
            <span>yashi@halls:~$</span>
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type command e.g. .ping, .ai write code, status..."
            className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="submit"
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            title="Send command"
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
