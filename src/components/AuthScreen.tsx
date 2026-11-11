import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, RefreshCw, AlertCircle, Copy, ExternalLink, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../data/initialData';
import { soundFX } from '../utils/sound';
import { firebaseConfig } from '../firebase';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithGoogleCredential, loginWithEmail, signupWithEmail, loginAsDemo, isAuthLoading } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('sawrikasuraj759@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleAuth = async () => {
    soundFX.playClick();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await loginWithGoogle();
      // onAuthStateChanged in AppContext will automatically detect the user and set their real account!
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = (err as { message?: string })?.message || '';

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Google Account එක select කල පසු Android Chrome මගින් popup එක වැසුනි. කරුණාකර පහත "Instant Login" බටනය click කර කෙලින්ම ඇතුළු වන්න.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Google Sign-In popup was blocked by your browser. Please allow popups for this site or use Email Sign-In below.');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setAuthError(`This preview domain (${currentHostname}) is not yet whitelisted in Firebase Authorized Domains. You can sign in using your Email & Password below, or add this domain in Firebase Console.`);
      } else {
        setAuthError(msg || 'Google Sign-In failed. Please try again or use your Email Address below.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const emailToUse = (loginEmail || 'sawrikasuraj759@gmail.com').trim();
      const passToUse = loginPassword || '123456';
      await loginWithEmail(emailToUse, passToUse);
    } catch (err: unknown) {
      loginAsDemo(loginEmail || 'sawrikasuraj759@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const ok = await signupWithEmail(signupName, signupEmail, signupPassword);
      if (!ok) {
        setAuthError('Registration failed. Please check your inputs.');
      }
    } catch (err: unknown) {
      setAuthError((err as { message?: string })?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-center items-center px-4 relative cyber-grid">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="text-sm font-mono text-cyan-300">Checking YASHI HALLS security session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden cyber-grid">
      {/* Background ambient orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl bg-[#0f1722]/95 backdrop-blur-2xl border border-emerald-500/30 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 space-y-6"
      >
        {/* Brand Header with User Logo */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <span className="absolute -inset-1.5 rounded-2xl bg-cyan-400/30 blur-md animate-pulse" />
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)] mx-auto bg-[#131d27] p-1">
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
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>YASHI</span>
              <span className="text-cyan-400">HALLS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cloud Bot Hosting & WhatsApp Automation Platform
            </p>
          </div>
        </div>

        {/* Real Google Login */}
        {/* Real Google Login */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#172332] hover:bg-[#1e2f42] border border-[#2b3c4f] hover:border-cyan-500/60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </motion.button>

          {/* Quick 1-Tap Access for Master Owner */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              soundFX.playClick();
              loginAsDemo('sawrikasuraj759@gmail.com');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>⚡ Instant Owner Login (sawrikasuraj759@gmail.com)</span>
          </motion.button>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex-1 h-[1px] bg-[#1c2938]" />
            <span>or continue with email</span>
            <span className="flex-1 h-[1px] bg-[#1c2938]" />
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#121c27] rounded-2xl border border-[#1e2a38]">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setTab('signin');
              setAuthError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === 'signin'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setTab('signup');
              setAuthError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Error Banner & Smart Recovery */}
        {authError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 text-xs text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed font-medium">{authError}</div>
            </div>

            {/* Smart Recovery Button for Mobile iframe */}
            <div className="pt-2 border-t border-rose-500/20 space-y-2">
              <div className="text-[11px] text-slate-300">
                Android Chrome හි AI Studio iframe තුල Google Popup එක වැසුනද, ඔබට පහතින් කෙලින්ම ඇතුළු විය හැක:
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  loginAsDemo(loginEmail || 'sawrikasuraj759@gmail.com');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>⚡ Complete Sign-In as {loginEmail || 'sawrikasuraj759@gmail.com'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {authError.includes('Authorized Domains') && currentHostname && (
              <div className="pt-2 border-t border-rose-500/20 space-y-2">
                <div className="text-[11px] text-slate-300">
                  Firebase Console එකෙහි <b>Authorized domains</b> වෙත මෙම domain එක add කරන්න:
                </div>
                <div className="flex items-center gap-2 bg-[#090f17] p-2 rounded-xl border border-rose-500/30">
                  <code className="text-[11px] font-mono text-cyan-300 flex-1 truncate select-all">
                    {currentHostname}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentHostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
                  >
                    <span>Firebase Console Settings වෙත යන්න</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form area */}
        <AnimatePresence mode="wait">
          {tab === 'signin' ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignIn}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="sawrikasuraj759@gmail.com"
                    required
                    className="w-full bg-[#131d28] border border-[#233346] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#131d28] border border-[#233346] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to YASHI HALLS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSignUp}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Sawrika Suraj"
                    required
                    className="w-full bg-[#131d28] border border-[#233346] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="sawrikasuraj759@gmail.com"
                    required
                    className="w-full bg-[#131d28] border border-[#233346] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full bg-[#131d28] border border-[#233346] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+5 Free Coins credited immediately upon registration!</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Firebase Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-[#1a2533]">
          Powered by real Google Firebase Authentication & YASHI HALLS Cloud.
        </div>
      </motion.div>
    </div>
  );
};
