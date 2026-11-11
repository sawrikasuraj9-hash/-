import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Building2, 
  Coins, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Zap,
  MessageSquare,
  Clock,
  ExternalLink,
  Copy,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { PLAN_PRICING } from '../data/initialData';
import { soundFX } from '../utils/sound';
import { PurchaseRequest } from '../types';

export const PlanPurchaseModal: React.FC = () => {
  const { 
    planToPurchase, 
    setPlanToPurchase, 
    coins, 
    purchasePlan, 
    submitPurchaseRequest,
    user,
    adminWhatsappNumber
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<PurchaseRequest | null>(null);
  const [whatsappChatUrl, setWhatsappChatUrl] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!planToPurchase) return null;

  const planInfo = PLAN_PRICING[planToPurchase];
  if (!planInfo) return null;

  const cost = planInfo.priceCoins;
  const hasEnoughCoins = coins >= cost;
  const deficit = Math.max(0, cost - coins);
  const remainingAfter = Math.max(0, coins - cost);

  // Approximate LKR Price for Manual Purchase if user wants to buy directly via Admin
  const planLkrPrice = planToPurchase === 'business' ? 2400 : 900;

  const handleConfirmWithCoins = async () => {
    soundFX.playClick();
    setIsProcessing(true);
    await purchasePlan(planToPurchase);
    setIsProcessing(false);
  };

  const handleContactAdminDirectPurchase = async () => {
    setIsProcessing(true);
    const res = await submitPurchaseRequest({
      itemType: 'plan',
      itemName: `YASHI HALLS ${planInfo.name}`,
      planId: planToPurchase === 'mini' ? undefined : planToPurchase,
      priceLkr: planLkrPrice,
      priceFormatted: `Rs ${planLkrPrice.toLocaleString()}`,
    });
    setIsProcessing(false);

    if (res.success && res.request) {
      setCreatedRequest(res.request);
      setWhatsappChatUrl(res.whatsappUrl || null);
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleCopyRef = () => {
    if (!createdRequest) return;
    soundFX.playClick();
    navigator.clipboard.writeText(createdRequest.referenceId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleClose = () => {
    soundFX.playClick();
    setPlanToPurchase(null);
    setCreatedRequest(null);
    setWhatsappChatUrl(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="w-full max-w-lg rounded-3xl bg-[#060C18]/95 backdrop-blur-2xl border border-cyan-500/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-4 max-h-[92vh] overflow-y-auto relative"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#122238]">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                planToPurchase === 'business'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                  : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
              }`}>
                {planToPurchase === 'business' ? <Building2 className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Activate {planInfo.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    planToPurchase === 'business'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {planInfo.badge}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Upgrade your 24/7 WhatsApp bot cluster
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#0e1b2e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If Request Created -> Show Pending Approval Screen */}
          {createdRequest ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#0e1c2d] border-2 border-cyan-400 text-center space-y-2.5 shadow-[0_0_30px_rgba(0,240,255,0.25)]">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>

                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  ● PENDING ADMIN APPROVAL
                </div>

                <h4 className="text-lg font-black text-white">
                  {planInfo.name} Request Registered!
                </h4>

                <div className="p-3 rounded-xl bg-[#07111e] border border-cyan-500/30 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">Reference ID:</div>
                  <div className="text-xl font-mono font-black text-cyan-300 tracking-wider flex items-center justify-center gap-2">
                    <span>{createdRequest.referenceId}</span>
                    <button 
                      onClick={handleCopyRef} 
                      className="p-1 hover:text-white text-slate-400"
                      title="Copy Reference ID"
                    >
                      {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  ඔබගේ Plan Purchase Request එක සාර්ථකව පද්ධතියට ලැබුණි. Admin විසින් Payment එක තහවුරු කළ පසු ඔබගේ Plan එක සක්‍රීය (Activate) කරනු ලැබේ.
                </p>
              </div>

              {/* Next Steps Guide */}
              <div className="p-4 rounded-2xl bg-[#0b1626] border border-[#162740] space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Next Steps (ඊළඟ පියවර):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                  <li>පහත <strong className="text-cyan-400">Open Admin WhatsApp Chat</strong> ඔබන්න.</li>
                  <li>Admin Hotline (<strong className="text-white font-mono">{adminWhatsappNumber || '0740712934'}</strong>) වෙත Reference ID එක සමඟ Chat එක අරඹන්න.</li>
                  <li>Bank / FriMi / Genie හරහා මුදල් ගෙවා තහවුරු කරන්න.</li>
                  <li>Admin Approval එක සමඟ {planInfo.name} ස්වයංක්‍රීයව Unlock වේ!</li>
                </ol>
              </div>

              <div className="space-y-2 pt-1">
                {whatsappChatUrl && (
                  <a
                    href={whatsappChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    <MessageSquare className="w-4 h-4 fill-slate-950" />
                    <span>Open Admin WhatsApp Chat ({adminWhatsappNumber || '0740712934'})</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </a>
                )}

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl bg-[#0e1b2d] hover:bg-[#14263f] border border-[#1c3250] text-slate-300 font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Price & Balance Comparison Box */}
              <div className="p-4 rounded-2xl bg-[#030712] border border-[#101E34] space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Plan Coin Price:</span>
                  <div className="flex items-center gap-1.5 font-black text-white font-mono">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-lg text-cyan-400">{cost}</span>
                    <span className="text-xs font-normal text-slate-400">coins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Your Current Balance:</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className={`text-base ${hasEnoughCoins ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {coins}
                    </span>
                    <span className="text-xs font-normal text-slate-400">coins</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#0e1826] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Or Manual Purchase Price:</span>
                  <span className="font-mono font-bold text-amber-300">
                    Rs {planLkrPrice.toLocaleString()} (Direct Admin Activation)
                  </span>
                </div>
              </div>

              {/* Insufficient Coins Warning with Manual Contact CTA */}
              {!hasEnoughCoins && (
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-slate-200">
                      Coins මදිද? ඔබට කෙළින්ම Admin අමතා <strong>Manual Payment (Rs {planLkrPrice.toLocaleString()})</strong> මඟින් {planInfo.name} Plan එක සක්‍රීය කරගත හැක.
                    </div>
                  </div>
                </div>
              )}

              {/* Features Unlocked List */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Features Unlocked with {planInfo.name}:</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {planInfo.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded-xl bg-[#081220]/70 border border-[#101E34]">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                {hasEnoughCoins && (
                  <button
                    onClick={handleConfirmWithCoins}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#00E1FF] to-[#00C8FF] hover:from-[#38BDF8] hover:to-[#00F0FF] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all cursor-pointer"
                  >
                    <Coins className="w-4 h-4 fill-slate-950 stroke-none" />
                    <span>{isProcessing ? 'PROCESSING...' : `PAY WITH COINS (${cost} COINS)`}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}

                {/* Direct Manual Purchase via Admin WhatsApp */}
                <button
                  onClick={handleContactAdminDirectPurchase}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  <span>CONTACT ADMIN TO PURCHASE (RS {planLkrPrice.toLocaleString()})</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
