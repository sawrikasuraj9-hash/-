import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  Upload, 
  Music, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Globe, 
  User, 
  Edit2,
  FileAudio,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceReply, AdminCustomer } from '../types';
import { soundFX } from '../utils/sound';

interface Props {
  userEmail: string;
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  customers: AdminCustomer[];
}

const COMMON_TRIGGER_PRESETS = [
  { name: 'Greetings / හායි', triggers: 'hi, hello, හායි, hey, hello yashi' },
  { name: 'Morning / උදෑසන', triggers: 'good morning, සුබ උදෑසනක්, morning, gm' },
  { name: 'Night / රාත්‍රිය', triggers: 'good night, සුබ රාත්‍රියක්, gn, sweet dreams' },
  { name: 'How are you / කොහොමද', triggers: 'how are you, කොහොමද, how r u, සැප සනීප කොහොමද' },
  { name: 'Help & Services / උදව්', triggers: 'help, උදව්, services, විස්තර' },
  { name: 'Thank You / ස්තූතියි', triggers: 'thank you, thanks, බොහොම ස්තූතියි, tq' },
];

export const VoiceAutoRepliesAdmin: React.FC<Props> = ({ userEmail, addToast, customers }) => {
  const [voiceReplies, setVoiceReplies] = useState<VoiceReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<'ALL' | 'Sinhala' | 'English' | 'Both'>('ALL');

  // Audio Playback State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New Voice Upload Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [replyName, setReplyName] = useState('');
  const [triggersText, setTriggersText] = useState('');
  const [language, setLanguage] = useState<'Sinhala' | 'English' | 'Both'>('Both');
  const [scope, setScope] = useState<'GLOBAL' | 'CUSTOMER'>('GLOBAL');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  // Selected Upload File & In-Form Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formPlayState, setFormPlayState] = useState(false);
  const formAudioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Trigger Simulator State
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Edit Triggers Modal State
  const [editTarget, setEditTarget] = useState<VoiceReply | null>(null);
  const [editName, setEditName] = useState('');
  const [editTriggers, setEditTriggers] = useState('');
  const [editLanguage, setEditLanguage] = useState<'Sinhala' | 'English' | 'Both'>('Both');
  const [isUpdating, setIsUpdating] = useState(false);

  // Replace Audio Modal State
  const [replaceTarget, setReplaceTarget] = useState<VoiceReply | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceBase64, setReplaceBase64] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<VoiceReply | null>(null);

  const fetchVoiceReplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/voice-replies', {
        headers: { 'x-admin-email': userEmail },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && Array.isArray(d.data)) {
          setVoiceReplies(d.data);
        }
      }
    } catch {
      addToast('Failed to load voice replies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, addToast]);

  useEffect(() => {
    fetchVoiceReplies();
  }, [fetchVoiceReplies]);

  // Audio Playback Controller
  const togglePlayAudio = (id: string, audioUrl: string) => {
    soundFX.playClick();
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingId(id);

    audio.play().catch(() => {
      addToast('Audio playback error', 'error');
      setPlayingId(null);
    });

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      setPlayingId(null);
      addToast('Cannot stream audio file', 'error');
    };
  };

  // Form File Change Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const validExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.opus', '.aac'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      addToast(`Invalid file format '${ext}'. Please choose an MP3, M4A, WAV, or OGG file.`, 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast('Audio file exceeds 25 MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewAudioUrl(blobUrl);

    // Read Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Replace File Change Handler
  const handleReplaceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplaceFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setReplaceBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // In-form Audio Preview Toggle
  const toggleFormPreview = () => {
    if (!previewAudioUrl) return;
    soundFX.playClick();

    if (formPlayState && formAudioRef.current) {
      formAudioRef.current.pause();
      setFormPlayState(false);
      return;
    }

    if (!formAudioRef.current) {
      formAudioRef.current = new Audio(previewAudioUrl);
      formAudioRef.current.onended = () => setFormPlayState(false);
    } else {
      formAudioRef.current.src = previewAudioUrl;
    }

    formAudioRef.current.play().then(() => setFormPlayState(true)).catch(() => setFormPlayState(false));
  };

  // Create Voice Reply Submission
  const handleSaveVoiceReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyName.trim()) {
      addToast('Please enter a name for the voice reply.', 'error');
      return;
    }
    if (!triggersText.trim()) {
      addToast('Please enter at least one trigger message.', 'error');
      return;
    }
    if (!selectedFile || !fileBase64) {
      addToast('Please select an MP3 audio file to upload.', 'error');
      return;
    }

    setIsUploading(true);
    soundFX.playClick();

    try {
      const res = await fetch('/api/admin/voice-replies/create', {
        method: 'POST',
        headers: {
          'x-admin-email': userEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: replyName.trim(),
          triggers: triggersText,
          audioBase64: fileBase64,
          audioFileName: selectedFile.name,
          language,
          scope,
          customerId: scope === 'CUSTOMER' ? selectedCustomerId : undefined,
          enabled: isEnabled,
        }),
      });

      const d = await res.json();
      if (d.success) {
        soundFX.playSuccess();
        addToast(d.message || 'Voice reply saved and connected successfully!', 'success');
        // Reset form
        setReplyName('');
        setTriggersText('');
        setSelectedFile(null);
        setFileBase64(null);
        setPreviewAudioUrl(null);
        setIsFormOpen(false);
        fetchVoiceReplies();
      } else {
        addToast(d.message || 'Failed to save voice reply', 'error');
      }
    } catch {
      addToast('Network error while uploading audio', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle Voice Reply Enabled Status
  const handleToggle = async (reply: VoiceReply) => {
    soundFX.playClick();
    const targetState = !reply.enabled;
    try {
      const res = await fetch(`/api/admin/voice-replies/${reply.id}/toggle`, {
        method: 'POST',
        headers: {
          'x-admin-email': userEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: targetState }),
      });
      const d = await res.json();
      if (d.success) {
        addToast(d.message || 'Status updated', 'success');
        setVoiceReplies((prev) =>
          prev.map((v) => (v.id === reply.id ? { ...v, enabled: targetState } : v))
        );
      }
    } catch {
      addToast('Failed to toggle status', 'error');
    }
  };

  // Test Trigger Simulator
  const handleTestTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    setIsTesting(true);
    soundFX.playClick();
    try {
      const res = await fetch('/api/admin/voice-replies/test-trigger', {
        method: 'POST',
        headers: {
          'x-admin-email': userEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: testInput.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        setTestResult(d);
        if (d.matched) {
          soundFX.playCoin();
        }
      }
    } catch {
      addToast('Failed to test trigger', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Edited Triggers
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsUpdating(true);
    soundFX.playClick();
    try {
      const res = await fetch(`/api/admin/voice-replies/${editTarget.id}`, {
        method: 'PUT',
        headers: {
          'x-admin-email': userEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          triggers: editTriggers,
          language: editLanguage,
        }),
      });
      const d = await res.json();
      if (d.success) {
        soundFX.playSuccess();
        addToast('Voice reply updated!', 'success');
        setEditTarget(null);
        fetchVoiceReplies();
      } else {
        addToast(d.message || 'Update failed', 'error');
      }
    } catch {
      addToast('Failed to update voice reply', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Save Replaced Audio File
  const handleSaveReplaceAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget || !replaceFile || !replaceBase64) return;
    setIsReplacing(true);
    soundFX.playClick();
    try {
      const res = await fetch(`/api/admin/voice-replies/${replaceTarget.id}/replace-audio`, {
        method: 'POST',
        headers: {
          'x-admin-email': userEmail,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: replaceBase64,
          audioFileName: replaceFile.name,
        }),
      });
      const d = await res.json();
      if (d.success) {
        soundFX.playSuccess();
        addToast('Audio file successfully replaced!', 'success');
        setReplaceTarget(null);
        setReplaceFile(null);
        setReplaceBase64(null);
        fetchVoiceReplies();
      } else {
        addToast(d.message || 'Replace failed', 'error');
      }
    } catch {
      addToast('Failed to replace audio file', 'error');
    } finally {
      setIsReplacing(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    soundFX.playClick();
    try {
      const res = await fetch(`/api/admin/voice-replies/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-email': userEmail },
      });
      const d = await res.json();
      if (d.success) {
        soundFX.playSuccess();
        addToast(d.message || 'Voice reply deleted.', 'info');
        setVoiceReplies((prev) => prev.filter((v) => v.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        addToast(d.message || 'Delete failed', 'error');
      }
    } catch {
      addToast('Failed to delete voice reply', 'error');
    }
  };

  const filteredReplies = voiceReplies.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(q) ||
      v.triggers.some((t) => t.toLowerCase().includes(q)) ||
      v.audioFileName.toLowerCase().includes(q);

    const matchesLanguage = filterLanguage === 'ALL' || v.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const totalPlays = voiceReplies.reduce((sum, v) => sum + (v.playCount || 0), 0);
  const activeCount = voiceReplies.filter((v) => v.enabled).length;

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & STATS BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0e1929] to-[#071322] border-2 border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.35)]">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                VOICE AUTO-REPLY MANAGER
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 font-mono text-[10px] font-bold">
                WHATSAPP PTT AUDIO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              WhatsApp Bot එකට ලැබෙන පණිවිඩ වලට ගැලපෙන MP3 Voice Notes ස්වයංක්‍රීයව Push-to-Talk ලෙස යවන්න.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              fetchVoiceReplies();
            }}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#122238] hover:bg-[#1a3050] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsFormOpen(!isFormOpen);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'Close Uploader' : '+ Upload Voice Reply'}</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#081220] border border-[#162740] space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Replies</span>
          <div className="text-2xl font-black text-white">{voiceReplies.length}</div>
          <span className="text-[11px] text-cyan-400 font-mono">Configured</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081220] border border-[#162740] space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Active Replies</span>
          <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
          <span className="text-[11px] text-emerald-400 font-mono">Listening 24/7</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081220] border border-[#162740] space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Voice Notes Delivered</span>
          <div className="text-2xl font-black text-purple-400">{totalPlays}</div>
          <span className="text-[11px] text-purple-300 font-mono">Total Plays</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081220] border border-[#162740] space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Audio Format</span>
          <div className="text-lg font-black text-amber-300 truncate">MP3 / Opus PTT</div>
          <span className="text-[11px] text-slate-400 font-mono">WhatsApp Compliant</span>
        </div>
      </div>

      {/* UPLOAD & CREATION FORM MODAL / DRAWER */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 rounded-3xl bg-[#081324] border-2 border-purple-500/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#15273f]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Upload New MP3 Voice Auto-Reply</h3>
                    <p className="text-xs text-slate-400">Add voice notes that trigger upon incoming keywords</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#122238]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVoiceReply} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reply Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>Reply Name (හඳුනාගැනීමේ නම)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      placeholder="e.g. Friendly Welcome Greeting / හායි පිළිතුර"
                      className="w-full bg-[#050b14] border border-[#162740] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Language (භාෂාව)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Sinhala', 'English', 'Both'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguage(lang)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            language === lang
                              ? 'bg-purple-600 text-white shadow-md border border-purple-400'
                              : 'bg-[#050b14] text-slate-400 border border-[#162740] hover:text-white'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trigger Messages */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>Trigger Messages (හේතු වන වචන / කොමාවෙන් වෙන්කරන්න)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Case-Insensitive & Unicode</span>
                  </div>
                  <input
                    type="text"
                    value={triggersText}
                    onChange={(e) => setTriggersText(e.target.value)}
                    placeholder="hi, hello, හායි, hey, good morning, සුබ උදෑසනක්"
                    className="w-full bg-[#050b14] border border-[#162740] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-purple-400 focus:outline-none"
                    required
                  />

                  {/* Preset chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Quick Suggestions:</span>
                    {COMMON_TRIGGER_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setTriggersText((prev) => (prev ? `${prev}, ${preset.triggers}` : preset.triggers));
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 transition-colors"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>Voice Audio File (MP3 / M4A / WAV)</span>
                    <span className="text-rose-400">*</span>
                  </label>

                  <div className="border-2 border-dashed border-[#1e3452] hover:border-purple-400/70 rounded-2xl p-5 bg-[#050b14] text-center transition-colors relative">
                    <input
                      type="file"
                      accept=".mp3,.m4a,.wav,.ogg,.opus,.aac,audio/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-white">{selectedFile.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Upload
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300">
                          <Music className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          Click to select MP3 Audio or Drag & Drop here
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Supports MP3, M4A, OGG, WAV (Max 25 MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Pre-Upload Audio Test Player */}
                {previewAudioUrl && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#0e1d32] border border-purple-400/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={toggleFormPreview}
                        className="w-9 h-9 rounded-xl bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-md transition-colors"
                      >
                        {formPlayState ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Preview Audio Before Save</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 uppercase font-mono">
                            TEST
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{selectedFile?.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold">
                      <Volume2 className="w-4 h-4" />
                      <span>{formPlayState ? 'Playing...' : 'Click to Listen'}</span>
                    </div>
                  </div>
                )}

                {/* Scope Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Scope (පරාසය)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setScope('GLOBAL')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          scope === 'GLOBAL'
                            ? 'bg-purple-600 text-white shadow-md border border-purple-400'
                            : 'bg-[#050b14] text-slate-400 border border-[#162740]'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Global (All Bots)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScope('CUSTOMER')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          scope === 'CUSTOMER'
                            ? 'bg-purple-600 text-white shadow-md border border-purple-400'
                            : 'bg-[#050b14] text-slate-400 border border-[#162740]'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Specific Customer</span>
                      </button>
                    </div>
                  </div>

                  {scope === 'CUSTOMER' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Select Customer</label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full bg-[#050b14] border border-[#162740] rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="">Choose a customer...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.username} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Status</label>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-[#050b14] border-[#162740]"
                      />
                      <span className="text-xs text-slate-300 font-medium">
                        Enable Voice Reply Immediately (සක්‍රීය කරන්න)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving & Encoding Audio...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>SAVE VOICE REPLY</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-3 rounded-xl bg-[#0f1d32] hover:bg-[#152740] text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE TRIGGER SIMULATOR & TESTER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#081220] border border-[#162740] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Live Trigger Simulator & Test Console</h3>
          </div>
          <span className="text-[11px] text-slate-400">Test incoming text against all saved voice replies</span>
        </div>

        <form onSubmit={handleTestTrigger} className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type any test message: e.g. 'හායි කොහොමද', 'Good morning!', 'hello yashi'"
            className="flex-1 bg-[#050b14] border border-[#162740] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTesting || !testInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#14263f] hover:bg-[#1a3457] border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Test Trigger</span>
          </button>
        </form>

        {testResult && (
          <div className={`p-3 rounded-2xl text-xs transition-all ${
            testResult.matched 
              ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/20 border border-rose-500/30 text-rose-300'
          }`}>
            {testResult.matched ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MATCHED VOICE REPLY: {testResult.match.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Matched Trigger: <strong className="text-white">"{testResult.matchedTrigger}"</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePlayAudio(testResult.match.id, testResult.match.audioUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  {playingId === testResult.match.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{playingId === testResult.match.id ? 'Stop Audio' : 'Listen Voice Output'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>No active voice reply matched the phrase "{testResult.inputMessage}". The bot would proceed to standard command handlers.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voice replies by name, trigger or file..."
            className="w-full bg-[#081220] border border-[#162740] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'Sinhala', 'English', 'Both'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLanguage === lang
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#081220] text-slate-400 border border-[#162740] hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* VOICE REPLIES LIST / TABLE */}
      {filteredReplies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#081220] border border-[#15273f] space-y-3">
          <FileAudio className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No Voice Replies Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No voice replies match your search filter.'
              : 'Click "+ Upload Voice Reply" above to upload your first MP3 file and register trigger phrases.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredReplies.map((reply) => {
            const isPlaying = playingId === reply.id;

            return (
              <motion.div
                key={reply.id}
                layout
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  reply.enabled
                    ? 'bg-[#081220] border-[#162740] hover:border-purple-500/40'
                    : 'bg-[#060c16] border-[#101c2e] opacity-70'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Play Button & Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => togglePlayAudio(reply.id, reply.audioUrl)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        isPlaying
                          ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse'
                          : 'bg-[#122238] hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30'
                      }`}
                      title={isPlaying ? 'Pause Audio' : 'Play Voice Reply Audio'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{reply.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          reply.language === 'Sinhala'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : reply.language === 'English'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {reply.language}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#122238] text-slate-300 border border-[#1b304c]">
                          {reply.scope}
                        </span>

                        <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>{reply.playCount || 0} plays</span>
                        </span>
                      </div>

                      {/* Triggers Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono">Triggers:</span>
                        {reply.triggers.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#0e1a2b] border border-[#1b3150] text-cyan-300 font-semibold"
                          >
                            "{t}"
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="truncate">File: {reply.audioFileName}</span>
                        <span>•</span>
                        <span>{reply.fileSizeFormatted}</span>
                        <span>•</span>
                        <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Enable / Disable Toggle Switch */}
                    <button
                      onClick={() => handleToggle(reply)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reply.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {reply.enabled ? '● Enabled' : '○ Disabled'}
                    </button>

                    {/* Replace Audio */}
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setReplaceTarget(reply);
                        setReplaceFile(null);
                        setReplaceBase64(null);
                      }}
                      className="p-2 rounded-xl bg-[#122238] hover:bg-[#1a3252] text-slate-300 hover:text-white border border-[#1d3556] transition-colors"
                      title="Replace Audio File"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Triggers */}
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setEditTarget(reply);
                        setEditName(reply.name);
                        setEditTriggers(reply.triggers.join(', '));
                        setEditLanguage(reply.language);
                      }}
                      className="p-2 rounded-xl bg-[#122238] hover:bg-[#1a3252] text-slate-300 hover:text-white border border-[#1d3556] transition-colors"
                      title="Edit Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setDeleteTarget(reply);
                      }}
                      className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete Voice Reply"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-lg rounded-3xl bg-[#081324] border-2 border-purple-500/50 p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#14263e]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-purple-400" />
                  <span>Edit Voice Reply Details</span>
                </h3>
                <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Reply Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#050b14] border border-[#162740] rounded-xl px-3.5 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Triggers (comma separated)</label>
                  <input
                    type="text"
                    value={editTriggers}
                    onChange={(e) => setEditTriggers(e.target.value)}
                    className="w-full bg-[#050b14] border border-[#162740] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Language</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Sinhala', 'English', 'Both'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setEditLanguage(lang)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          editLanguage === lang
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#050b14] text-slate-400 border border-[#162740]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    {isUpdating ? 'Saving Changes...' : 'SAVE CHANGES'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-3 rounded-xl bg-[#0f1d32] text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPLACE AUDIO MODAL */}
      <AnimatePresence>
        {replaceTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-[#081324] border-2 border-purple-500/50 p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#14263e]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Replace Audio File</span>
                </h3>
                <button onClick={() => setReplaceTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Replace existing audio file for <strong className="text-white">{replaceTarget.name}</strong>.
              </div>

              <form onSubmit={handleSaveReplaceAudio} className="space-y-4">
                <div className="border-2 border-dashed border-[#1e3452] hover:border-purple-400/70 rounded-2xl p-5 bg-[#050b14] text-center transition-colors relative">
                  <input
                    type="file"
                    accept=".mp3,.m4a,.wav,.ogg,.opus,audio/*"
                    onChange={handleReplaceFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {replaceFile ? (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-400">✓ {replaceFile.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {(replaceFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">Click to select new MP3 audio file</div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isReplacing || !replaceFile}
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {isReplacing ? 'Uploading & Replacing...' : 'REPLACE FILE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceTarget(null)}
                    className="px-4 py-3 rounded-xl bg-[#0f1d32] text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm rounded-3xl bg-[#081324] border-2 border-rose-500/50 p-5 sm:p-6 shadow-[0_0_40px_rgba(244,63,94,0.3)] space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Voice Reply?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.name}"</strong> and its audio files?
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  DELETE PERMANENTLY
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="py-2.5 px-4 rounded-xl bg-[#0f1d32] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
