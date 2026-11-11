import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  Link as LinkIcon, 
  QrCode, 
  Phone, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2,
  Trash2,
  Zap,
  Radio,
  Palette,
  Sliders,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { soundFX } from '../utils/sound';
import { normalizeWhatsAppNumber } from '../utils/phone';
import { WhatsAppMenuInteractivePreview } from './WhatsAppMenuInteractivePreview';

export const PairingView: React.FC = () => {
  const { 
    pairingSession, 
    generatePairCode, 
    generateQrCode,
    linkAndDeployPairedBot, 
    serverBotState,
    clearSession,
    restartBot,
    setActiveTab, 
    addToast,
    setOpenEditBotModal
  } = useApp();

  const [mode, setMode] = useState<'pairCode' | 'qrCode'>('pairCode');
  const [countryCode, setCountryCode] = useState('94');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const isQrRequestedRef = useRef(false);
  const codeResultRef = useRef<HTMLDivElement | null>(null);

  // Trigger QR generation when switching to qrCode mode if not yet online
  useEffect(() => {
    if (mode === "qrCode" && !serverBotState?.isOnline && !isQrRequestedRef.current) {
      isQrRequestedRef.current = true;
      generateQrCode(false).finally(() => {
        isQrRequestedRef.current = false;
      });
    }
  }, [mode, serverBotState?.isOnline, generateQrCode]);

  const activePairCode = serverBotState?.pairingCode || pairingSession?.pairCode;

  // Auto-scroll to code result as soon as it is generated
  useEffect(() => {
    if (activePairCode && codeResultRef.current) {
      codeResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activePairCode]);

  // Countdown timer for pairing code validity
  useEffect(() => {
    if (activePairCode) {
      setSecondsRemaining(120);
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activePairCode]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCC = countryCode.replace(/\D/g, "") || "94";
    if (!phoneNumber.trim()) {
      addToast("Please enter your WhatsApp phone number", "error");
      return;
    }
    const fullPhone = normalizeWhatsAppNumber(phoneNumber, cleanCC);
    if (!fullPhone || fullPhone.length < 9) {
      addToast("Please enter a valid phone number (e.g. 0740712934 or 740712934)", "error");
      return;
    }

    soundFX.playClick();
    setIsGenerating(true);
    await generatePairCode(fullPhone);
    setIsGenerating(false);
  };

  const handleCopyCode = () => {
    const code = serverBotState?.pairingCode || pairingSession?.pairCode;
    if (!code) return;
    const cleanCode = code.replace(/[^A-Za-z0-9]/g, '');
    soundFX.playClick();
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    addToast(`Pairing code (${cleanCode}) copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeployBot = async () => {
    soundFX.playClick();
    setIsDeploying(true);
    const res = await linkAndDeployPairedBot();
    setIsDeploying(false);
    if (!res.success) {
      addToast(res.message, 'error');
    }
  };

  const handleClearSession = async () => {
    soundFX.playClick();
    addToast('Disconnecting WhatsApp & wiping session...', 'info');
    await clearSession();
  };

  const isOnline = serverBotState?.isOnline;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-5 pb-28">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundFX.playClick();
            setActiveTab('dashboard');
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border ${
          isOnline
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-cyan-400'} animate-ping`} />
          <span>{isOnline ? 'WHATSAPP ONLINE' : 'MINI-PAIR GATEWAY'}</span>
        </div>
      </div>

      {/* Hero Header Icon & Title */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-block relative">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-500/50 flex items-center justify-center bg-[#131d27] shadow-[0_0_25px_rgba(6,182,212,0.4)] mx-auto p-1">
            <img
              src={APP_CONFIG.logoUrl}
              alt="YASHI HALLS"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          <span className="text-white">YASHI</span>
          <span className="text-cyan-400"> HALLS Cloud</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Pair your WhatsApp device with YASHI HALLS MINI, PRO, or BUSINESS Engine
        </p>
      </div>

      {/* If Already Connected: Show Live Connected State Card */}
      {isOnline ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#111822] to-[#121c27] border-2 border-emerald-500/50 p-6 shadow-[0_0_35px_rgba(16,185,129,0.25)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>WhatsApp Connected!</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">24/7 ACTIVE</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Linked number: +{serverBotState?.pairedNumber || 'Active'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#141e2a] border border-[#223345] text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Engine Latency</span>
              <span className="font-mono text-emerald-400 font-bold">{serverBotState?.lastPingMs !== undefined ? `${serverBotState.lastPingMs}ms` : '0ms'} (Turbo ⚡)</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Uptime</span>
              <span className="font-mono text-white font-bold">{Math.floor((serverBotState?.uptimeSeconds || 0) / 60)}m {(serverBotState?.uptimeSeconds || 0) % 60}s</span>
            </div>
          </div>

          {/* EDIT BOT & LOGO PRIMARY ACTION BUTTON (Highlighted for Customer) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess();
                setOpenEditBotModal(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] active:scale-95 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-slate-950" />
              <span>Edit Bot & Logo (බොට් හා ලෝගෝ වෙනස් කරන්න)</span>
              <Sparkles className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          {/* BOT CUSTOMIZATION DETAILS & LIVE STATUS CARD */}
          <div className="p-3.5 rounded-2xl bg-[#0e1724] border border-[#1b2b3d] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Bot Name:</span>
              </span>
              <span className="font-bold text-cyan-300 font-mono text-xs">
                {serverBotState?.config?.botName || "YASHI HALLS"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Command Prefix:</span>
              <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                {serverBotState?.config?.prefix || "."}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Operating Mode:</span>
              <span className="font-mono font-bold text-slate-200 uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800">
                {serverBotState?.config?.mode || "public"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1a2839]">
              <span className="text-slate-400 font-medium">Bot Profile Picture:</span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setOpenEditBotModal(true);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change Logo & Sync DP</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                soundFX.playClick();
                restartBot();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#182635] hover:bg-[#203448] border border-cyan-500/30 text-cyan-300 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart Socket</span>
            </button>

            <button
              onClick={async () => {
                soundFX.playClick();
                addToast('Unlinking session to pair new WhatsApp device...', 'info');
                await handleClearSession();
                setMode('pairCode');
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pair New Number</span>
            </button>

            <button
              onClick={handleClearSession}
              className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-bold text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>

          {/* Interactive Menu & 2-Column Buttons Preview */}
          <div className="pt-4 border-t border-[#1b2b3d]">
            <WhatsAppMenuInteractivePreview />
          </div>
        </motion.div>
      ) : (
        <>
          {/* Selector Tabs matching Screenshot */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pair Code Tab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setMode('pairCode');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'pairCode'
                  ? 'bg-[#101b26] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-[#111822] border-[#223345] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <LinkIcon className={`w-4 h-4 ${mode === 'pairCode' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${mode === 'pairCode' ? 'text-white' : 'text-slate-300'}`}>
                  Pair Code
                </span>
              </div>
              <div className="text-xs text-slate-400">
                8-Digit mini session
              </div>
            </motion.button>

            {/* QR Code Tab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setMode('qrCode');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'qrCode'
                  ? 'bg-[#101b26] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-[#111822] border-[#223345] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <QrCode className={`w-4 h-4 ${mode === 'qrCode' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${mode === 'qrCode' ? 'text-white' : 'text-slate-300'}`}>
                  QR Code
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Direct camera scan
              </div>
            </motion.button>
          </div>

          {/* Main Content Area */}
          {mode === 'pairCode' ? (
            <div className="rounded-3xl bg-[#111822]/95 backdrop-blur-md border border-[#223345] p-5 sm:p-6 shadow-xl space-y-4">
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Input Label */}
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Number</span>
                </div>

                {/* Country code and Phone number inputs matching Screenshot */}
                <div className="flex gap-2.5">
                  <div className="flex items-center gap-1.5 bg-[#15202c] border border-[#25374b] rounded-2xl px-3.5 py-3 text-sm text-white font-mono shrink-0">
                    <span className="text-slate-400">+</span>
                    <input
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ''))}
                      className="w-10 bg-transparent text-white font-mono focus:outline-none"
                      placeholder="94"
                    />
                  </div>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (e.g. 0740712934 or 740712934)"
                    className="flex-1 bg-[#15202c] border border-[#25374b] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
                    required
                  />
                </div>

                {/* Info notice banner */}
                <div className="p-3.5 rounded-2xl bg-[#152332]/80 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    ඔබගේ WhatsApp අංකය ඇතුළත් කර පහත බටනය මඟින් නිල WhatsApp 8-Digit Pairing Code එකක් ලබාගන්න.
                  </span>
                </div>

                {/* Generate Pairing Code Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Requesting WhatsApp Pairing Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Generate Pairing Code (කෝඩ් එක ලබාගන්න)</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Generated Code Result Display */}
              <AnimatePresence>
                {activePairCode && (
                  <motion.div
                    ref={codeResultRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="pt-4 border-t border-[#1f2e40] space-y-4"
                  >
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-[#111c27] to-[#121c27] border-2 border-cyan-400 text-center space-y-3.5 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official WhatsApp Pairing Code</span>
                      </div>

                      {/* Prominent Formatted Pairing Code */}
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-widest text-cyan-300 selection:bg-cyan-500/30 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] py-1">
                        {activePairCode}
                      </div>

                      {/* Clean 8-digit Code Row & Copy Action */}
                      <div className="p-3.5 rounded-2xl bg-[#0c141d] border border-cyan-500/30 text-xs text-slate-300 font-mono space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">WhatsApp Code:</span>
                          <span className="text-emerald-400 font-bold tracking-widest text-lg">
                            {activePairCode.replace(/[^A-Za-z0-9]/g, '')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 text-left font-sans leading-relaxed">
                          මෙම කෝඩ් එක WhatsApp &gt; Linked Devices &gt; Link with phone number instead තුළ ඇතුළත් කරන්න.
                        </p>
                      </div>

                      {/* Expiration Countdown */}
                      <div className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                        <span>Expires in:</span>
                        <span className={`font-bold ${secondsRemaining <= 20 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                          {secondsRemaining}s
                        </span>
                      </div>

                      {secondsRemaining === 0 && (
                        <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                          ⚠️ කෝඩ් එකේ කාලය ඉකුත් විය. කරුණාකර පහත &quot;Reset &amp; Get New Code&quot; ඔබා අලුත් කෝඩ් එකක් ලබාගන්න.
                        </div>
                      )}

                      {/* Primary Prominent 1-Tap Copy Button */}
                      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleCopyCode}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                            copied
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300'
                              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                          }`}
                        >
                          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                          <span>
                            {copied
                              ? 'Copied to Clipboard! (කොපි විය!)'
                              : `Copy Code (${activePairCode.replace(/[^A-Za-z0-9]/g, '')})`}
                          </span>
                        </motion.button>

                        <button
                          type="button"
                          onClick={handleClearSession}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset &amp; New Code</span>
                        </button>
                      </div>
                    </div>

                    {/* Linking Instructions in Sinhala & English */}
                    <div className="p-4 rounded-2xl bg-[#141e2a] border border-[#243649] text-xs text-slate-300 space-y-2.5">
                      <div className="font-bold text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span>How to link WhatsApp (WhatsApp සම්බන්ධ කරන ආකාරය):</span>
                        </div>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                        <li>Open WhatsApp &gt; Settings (හෝ තිත් තුන) &gt; <strong className="text-white">Linked Devices (සම්බන්ධිත උපාංග)</strong></li>
                        <li>Tap <strong className="text-white">Link a Device (උපාංගයක් සම්බන්ධ කරන්න)</strong></li>
                        <li>තිරයේ පහළින් ඇති <strong className="text-cyan-400">Link with phone number instead (දුරකථන අංකය භාවිතයෙන් සම්බන්ධ කරන්න)</strong> තෝරන්න</li>
                        <li>ඉහත කොපි කරගත් 8-digit Code එක (<strong className="text-cyan-300 font-mono">{activePairCode.replace(/[^A-Za-z0-9]/g, '')}</strong>) ලබා දෙන්න! (මෙහි මැදට dash (-) ඇතුළත් කිරීම අවශ්‍ය නොවේ)</li>
                        <li>⚠️ කෝඩ් එක වැරදි නම් හෝ කාලය ඉකුත් වූයේ නම්, ඉහත <span className="text-rose-400 font-bold">Reset &amp; New Code</span> ඔබා අලුත් කෝඩ් එකක් ලබාගන්න.</li>
                      </ol>
                    </div>

                    {/* Real-Time Live Waiting Status Indicator */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#111e1f] to-[#142323] border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">
                            Awaiting verification on your phone...
                          </div>
                          <div className="text-[11px] text-emerald-300/80">
                            දුරකථනයට කෝඩ් එක ලබාදුන් සැනින් මෙම Dashboard එක ස්වයංක්‍රීයව Live සම්බන්ධ වේ.
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                        <span>24/7 READY</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Real Dynamic QR Code Mode */
            <div className="rounded-3xl bg-[#111822]/95 backdrop-blur-md border border-[#223345] p-6 text-center space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white">
                Scan QR Code with WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Open WhatsApp &gt; Linked Devices &gt; Link a Device and point camera at the QR code below:
              </p>

              {/* QR Code Container */}
              <div className="relative inline-block p-4 rounded-3xl bg-white shadow-2xl mx-auto border-4 border-cyan-400/30">
                {serverBotState?.qrCodeDataUrl ? (
                  <div className="relative">
                    <img 
                      src={serverBotState.qrCodeDataUrl} 
                      alt="WhatsApp QR Code" 
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                    <motion.div
                      animate={{ y: [-90, 90] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,1)]"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-slate-950 p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden text-center space-y-2">
                    <QrCode className="w-12 h-12 text-cyan-400/40" />
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-mono font-bold">
                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>Generating QR...</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Connecting to WhatsApp Gateway
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        generateQrCode();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Refresh QR Now
                    </button>
                  </div>
                )}
              </div>

              {serverBotState?.qrCodeDataUrl && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#111e1f] to-[#142323] border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-xs">Waiting for camera scan... (ස්කෑන් වන තෙක් රැඳී සිටින්න)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>READY</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    generateQrCode(true);
                    addToast('Generating fresh WhatsApp QR code...', 'info');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh QR Code (නැවුම් QR කෝඩ් එකක් ගන්න)</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Featured Bot Showcase Image Card */}
      <div className="rounded-3xl bg-[#111822]/95 border border-[#223345] p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 px-1 font-bold">
          <span>SPONSORED SHOWCASE</span>
          <span className="text-cyan-400">YASHI HALLS PRO</span>
        </div>

        <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#243649] relative group shadow-lg bg-[#0e141c]">
          <img
            src={APP_CONFIG.showcaseImageUrl}
            alt="YASHI HALLS PRO Bot Showcase"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <div className="font-bold text-white text-sm">
              Official YASHI HALLS PRO Multi-Device Engine
            </div>
            <div className="text-xs text-slate-300">
              Fastest 24/7 uptime bot with YASHI HALLS AI intelligence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
