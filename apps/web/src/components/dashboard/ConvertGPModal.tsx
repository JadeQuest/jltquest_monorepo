import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useConvertGp } from '@/hooks/useConvertGp';
import { useDashboard } from '@/hooks/useDashboard';
import { JLTLoader } from '@/components/common/JLTLoader';
import { RefreshCw, X, Coins, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConvertGPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConvertGPModal: React.FC<ConvertGPModalProps> = ({ isOpen, onClose }) => {
  const { data: dashboardData } = useDashboard();
  const { convertGp, isConverting } = useConvertGp();

  const userGp = dashboardData?.user?.gp ?? 0;
  const userJlt = dashboardData?.user?.jlt ?? 0;

  const [gpInput, setGpInput] = useState<number>(Math.min(userGp, 500));
  const [successResult, setSuccessResult] = useState<{
    convertedGp: number;
    jltReceived: number;
  } | null>(null);

  if (!isOpen) return null;

  const jltPreview = Math.floor(gpInput / 100);

  const handleConvert = async () => {
    if (gpInput < 100) {
      alert('Minimum conversion amount is 100 GP.');
      return;
    }
    if (gpInput > userGp) {
      alert('Insufficient GP balance.');
      return;
    }
    try {
      const res = await convertGp(gpInput);
      setSuccessResult({
        convertedGp: res.convertedGp,
        jltReceived: res.jltReceived,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to convert GP');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-8 flex flex-col relative shadow-[0_0_50px_rgba(123,44,191,0.35)] border border-white/10 rounded-3xl overflow-hidden">


        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {successResult ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full glass-panel border border-emerald-400/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-white font-gilroyBold text-2xl mb-2">Conversion Successful!</h3>
            <p className="text-purple-200 font-gilroyMedium text-sm mb-6">
              You swapped <span className="text-amber-400 font-bold">{successResult.convertedGp} GP</span> for <span className="text-[#00F0FF] font-bold">{successResult.jltReceived} JLT</span> tokens!
            </p>

            <button
              onClick={() => {
                setSuccessResult(null);
                onClose();
              }}
              className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-base shadow-[0_0_20px_#7B2CBF] w-full cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-white font-gilroyBold text-2xl">Convert GP to JLT</h3>
                  <p className="text-purple-300 font-gilroyRegular text-xs sm:text-sm">
                    100 GP = 1 JLT token (Tokenomics rate)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balances Bar */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex flex-col">
                <span className="text-xs text-purple-300 font-gilroyMedium">GP Balance</span>
                <span className="text-xl font-gilroyBold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <img src="/icon/coin.webp" alt="GP" className="w-4 h-4 object-contain" />
                  {userGp}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-4">
                <span className="text-xs text-purple-300 font-gilroyMedium">JLT Tokens</span>
                <span className="text-xl font-gilroyBold text-[#00F0FF] flex items-center gap-1.5 mt-0.5">
                  <img src="/jltcolor.svg" alt="JLT" className="w-4 h-4 object-contain" />
                  {userJlt}
                </span>
              </div>
            </div>

            {/* Amount Selection Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-gilroyMedium text-purple-200">
                <span>Amount to convert:</span>
                <span className="text-amber-400 font-gilroyBold text-base">{gpInput} GP</span>
              </div>

              <input
                type="range"
                min={100}
                max={Math.max(100, Math.floor(userGp / 100) * 100)}
                step={100}
                value={gpInput}
                onChange={(e) => setGpInput(Number(e.target.value))}
                className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-purple-500/30"
              />

              {/* Quick Select Preset Buttons */}
              <div className="flex gap-2">
                {[100, 500, 1000, userGp].map((amt, idx) => {
                  const roundedAmt = idx === 3 ? Math.floor(amt / 100) * 100 : amt;
                  if (roundedAmt < 100) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGpInput(roundedAmt)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-gilroyBold border transition-all ${gpInput === roundedAmt
                        ? 'bg-purple-500/30 text-white border-purple-400 shadow-[0_0_10px_#7B2CBF]'
                        : 'bg-black/30 text-gray-400 border-white/10 hover:text-white'
                        }`}
                    >
                      {idx === 3 ? 'MAX' : `${roundedAmt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Swap Preview Box */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between shadow-inner">
              <div className="flex flex-col">
                <span className="text-xs text-purple-300 font-gilroyMedium">You Swap</span>
                <span className="text-lg font-gilroyBold text-white">{gpInput} GP</span>
              </div>

              <ArrowRight className="w-5 h-5 text-[#00F0FF] animate-pulse" />

              <div className="flex flex-col text-right">
                <span className="text-xs text-purple-300 font-gilroyMedium">You Receive</span>
                <span className="text-xl font-gilroyBold text-[#00F0FF] drop-shadow-[0_0_10px_#00F0FF]">
                  +{jltPreview} JLT
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isConverting || userGp < 100 || gpInput < 100}
              onClick={handleConvert}
              className={`w-full py-3.5 px-6 rounded-xl font-gilroyBold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${userGp < 100
                ? 'bg-black/40 text-gray-500 border border-white/10 cursor-not-allowed'
                : 'glass-btn text-white shadow-[0_0_20px_#7B2CBF] hover:shadow-[0_0_30px_#7B2CBF]'
                }`}
            >
              {isConverting ? (
                <JLTLoader variant="inline" size="sm" text="Exchanging..." />
              ) : userGp < 100 ? (
                'Requires Minimum 100 GP'
              ) : (
                <>
                  <span>Exchange</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
