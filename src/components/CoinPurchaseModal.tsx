import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Crown, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { soundFX } from '../utils/sound';
import { PurchaseRequest } from '../types';

export const CoinPurchaseModal: React.FC = () => {
  const { 
    openCoinModal, 
    setOpenCoinModal, 
    selectedCoinPack, 
    submitPurchaseRequest,
    user,
    adminWhatsappNumber
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<PurchaseRequest | null>(null);
  const [whatsappChatUrl, setWhatsappChatUrl] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!openCoinModal || !selectedCoinPack) return null;

  const handleContactAdminPurchase = async () => {
    setIsSubmitting(true);
    const res = await submitPurchaseRequest({
      itemType: 'coin_pack',
      itemName: `${selectedCoinPack.coins} Coins Pack`,
      coinAmount: selectedCoinPack.coins,
      priceLkr: selectedCoinPack.priceLkr,
      priceFormatted: `Rs ${selectedCoinPack.priceLkr.toLocaleString()}`,
    });
    setIsSubmitting(false);

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
    setOpenCoinModal(false);
    setCreatedRequest(null);
    setWhatsappChatUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg rounded-3xl bg-[#060C18]/95 backdrop-blur-2xl border border-cyan-500/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#122238]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Purchase Coin Pack</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  MANUAL PAYMENT
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct Admin Verification & Manual Settlement
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#0E1A2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* If Request Created -> Show Pending Approval Screen */}
        {createdRequest ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#0e1c2d] border-2 border-cyan-400 text-center space-y-2.5 shadow-[0_0_30px_rgba(0,240,255,0.25)]">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>

              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                ● STATUS: PENDING ADMIN APPROVAL
              </div>

              <h4 className="text-lg font-black text-white">
                Purchase Request Registered!
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
                ඔබගේ Purchase Request එක සාර්ථකව පද්ධතියේ ලියාපදිංචි කරන ලදී. Admin විසින් ඔබගේ Payment එක පරීක්ෂා කර තහවුරු කළ වහාම Wallet එකට Coins එකතු කරනු ලැබේ.
              </p>
            </div>

            {/* Next Steps Guide */}
            <div className="p-4 rounded-2xl bg-[#0b1626] border border-[#162740] space-y-2 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Next Steps (ඊළඟ පියවර):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                <li>පහත <strong className="text-cyan-400">Open Admin WhatsApp Chat</strong> බොත්තම ඔබන්න.</li>
                <li>Admin Hotline (<strong className="text-white font-mono">{adminWhatsappNumber || '0740712934'}</strong>) වෙත Reference ID එක සමඟ පණිවිඩය යවන්න.</li>
                <li>Bank Transfer / FriMi / Genie රිසිට්පත යවා Admin හට තහවුරු කරන්න.</li>
                <li>Admin විසින් Request එක Approve කළ විගස <strong className="text-emerald-400">+{selectedCoinPack.coins} Coins</strong> ඔබගේ Wallet එකට එකතු වේ!</li>
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
                Close & View Wallet
              </button>
            </div>
          </div>
        ) : (
          /* Initial Purchase Summary & Contact Admin View */
          <div className="space-y-4">
            {/* Selected Pack Summary */}
            <div className="p-4 rounded-2xl bg-[#081220] border border-cyan-500/40 flex items-center justify-between shadow-inner">
              <div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{selectedCoinPack.coins}</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">Coins</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Around {selectedCoinPack.daysEstimate} days · up to {selectedCoinPack.maxBots} bots
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400 font-mono">
                  Rs {selectedCoinPack.priceLkr.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  LKR Settlement
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="p-3.5 rounded-2xl bg-[#091424] border border-[#14263e] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Customer Email:</span>
                <span className="font-mono text-white font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer Name:</span>
                <span className="text-slate-200">{user.username}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="text-cyan-300 font-medium">Bank Transfer / FriMi / Genie / Card</span>
              </div>
            </div>

            {/* Security Notice: No Fake Card Numbers */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>100% Secure Manual Verification:</strong> YASHI HALLS does not ask for fake card numbers or CVV. Your request is reviewed directly by the Master Admin.
              </span>
            </div>

            {/* Contact Admin to Purchase CTA */}
            <div className="pt-2 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContactAdminPurchase}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering Purchase Request...</span>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 fill-slate-950" />
                    <span>CONTACT ADMIN TO PURCHASE</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
