'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useSpin, SpinResult } from '@/hooks/useSpin';
import { showError } from '@/components/common/AlertModal';
import { JLTLoader } from '@/components/common/JLTLoader';
import { gsap, prefersReducedMotion, MotionEases } from '@/lib/animations';
import { Sparkles, X, Gift, RotateCw } from 'lucide-react';

const PRIZE_DETAILS: Record<string, { label: string; icon: string; desc: string }> = {
  GP_50: { label: '50 GP', icon: '/icon/coin.webp', desc: '50 Gold Points added to your balance!' },
  GP_20: { label: '20 GP', icon: '/icon/coin.webp', desc: '20 Gold Points added to your balance!' },
  XP_20: { label: '20 XP', icon: '/icon/xp.webp', desc: '20 Player XP added to your leveling!' },
  GP_100: { label: '100 GP', icon: '/icon/coin.webp', desc: 'Jackpot! 100 Gold Points awarded!' },
  NOTHING: { label: 'Nothing', icon: '', desc: 'Better luck next time!' },
  FREE_SPIN_1: { label: '1 Free Spin', icon: '/icon/spin.webp', desc: 'Extra Free Spin awarded! Roll again!' },
  FRAGMENT_1: { label: '1 Fragment', icon: '/icon/Fragment.webp', desc: '1 Creature Fragment added to your collection!' },
  RP_XP_20: { label: '20 RP XP', icon: '/icon/xp.webp', desc: '20 Rare Pass XP added to Season 01!' },
};

const OUTCOME_TO_INDEX: Record<string, number> = {
  GP_50: 0,
  GP_20: 1,
  XP_20: 2,
  GP_100: 3,
  NOTHING: 4,
  FREE_SPIN_1: 5,
  FRAGMENT_1: 6,
  RP_XP_20: 7,
};

const SpinToWinCardComponent: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { spinStatus, spin, isSpinning: isSpinMutating } = useSpin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<{ outcome: string; label: string; desc: string; icon: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const currentRotationRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (spinTweenRef.current) spinTweenRef.current.kill();
    };
  }, []);

  const handleSpin = useCallback(async () => {
    if (isSpinning || isSpinMutating) return;
    if (!spinStatus || spinStatus.availableFreeSpins <= 0) return;
    if (!wheelRef.current) return;

    setIsSpinning(true);
    setWonPrize(null);

    // 1. Start continuous high-speed spinning with GSAP
    if (spinTweenRef.current) spinTweenRef.current.kill();
    spinTweenRef.current = gsap.to(wheelRef.current, {
      rotation: '+=360',
      duration: 0.35,
      repeat: -1,
      ease: 'none',
      force3D: true,
      overwrite: 'auto',
    });

    try {
      const result: SpinResult = await spin(true);
      const prizeIndex = OUTCOME_TO_INDEX[result.outcome] ?? 4;
      const targetSliceDegree = ((8 - prizeIndex) % 8) * 45;

      // Current wheel rotation from GSAP
      const currentRot = gsap.getProperty(wheelRef.current, 'rotation') as number;
      const fullLaps = 360 * 4; // 4 full revolutions for dramatic deceleration
      const finalDegree = Math.ceil(currentRot / 360) * 360 + fullLaps + targetSliceDegree;
      currentRotationRef.current = finalDegree;

      // 2. Kill infinite spin and smoothly decelerate to the target angle
      if (spinTweenRef.current) spinTweenRef.current.kill();
      spinTweenRef.current = gsap.to(wheelRef.current, {
        rotation: finalDegree,
        duration: 3.6,
        ease: 'power4.out',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => {
          setIsSpinning(false);
          const detail = PRIZE_DETAILS[result.outcome] || {
            label: result.outcome,
            icon: '',
            desc: 'Reward credited to your account!',
          };
          setWonPrize({
            outcome: result.outcome,
            label: detail.label,
            desc: detail.desc,
            icon: detail.icon,
          });
        },
      });
    } catch (error: any) {
      if (spinTweenRef.current) spinTweenRef.current.kill();
      const currentRot = gsap.getProperty(wheelRef.current, 'rotation') as number;
      gsap.to(wheelRef.current, {
        rotation: Math.round(currentRot / 45) * 45,
        duration: 0.6,
        ease: 'power2.out',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => {
          setIsSpinning(false);
        },
      });
      console.error('Spin execution failed:', error);
      showError(error?.message || 'Failed to spin. Please try again.', 'Spin Failed');
    }
  }, [isSpinning, isSpinMutating, spinStatus, spin]);

  const handleCardClick = useCallback(() => {
    setIsModalOpen(true);
    setWonPrize(null);
  }, []);

  const closeModal = useCallback(() => {
    if (!isSpinning) {
      setIsModalOpen(false);
      setWonPrize(null);
    }
  }, [isSpinning]);

  const canSpin = isConnected && !!address && !!spinStatus && spinStatus.availableFreeSpins > 0;
  const spinsRemaining = spinStatus?.availableFreeSpins ?? 0;

  return (
    <>
      {/* Dashboard Card Trigger */}
      <div
        className={`daily-card-panel p-3 sm:p-6 flex flex-col items-start justify-between h-[180px] sm:h-[280px] relative overflow-hidden select-none group cursor-pointer transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(123,44,191,0.3)]`}
        onClick={handleCardClick}
      >
        <div className="flex flex-col items-start gap-1.5 z-10 group-hover:scale-105 transition-transform duration-300">
          <h2 className="text-white font-gilroyBold text-lg sm:text-2xl font-bold tracking-tight">
            Spin to Win
          </h2>
          <div className="glass-pill px-2 py-0.5 sm:px-3.5 sm:py-1 inline-flex items-center gap-1 sm:gap-2 rounded-full shadow-[0_0_15px_rgba(123,44,191,0.3)]">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${canSpin ? 'bg-[#FFA28D] animate-pulse' : 'bg-purple-300/40'}`} />
            <span className="text-purple-200 font-gilroyMedium text-[9px] sm:text-xs font-semibold tracking-wide">
              {!isConnected
                ? '1 Free Spin Daily'
                : !spinStatus
                ? '1 Free Spin Available'
                : spinsRemaining > 0
                ? `${spinsRemaining} Free Spin${spinsRemaining !== 1 ? 's' : ''} Available`
                : '0 Free Spins Today'}
            </span>
          </div>

        </div>

        {/* Decorative wheel image on the card */}
        <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 w-[90%] sm:w-[260px] aspect-square flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <img
            src="/icon/spin.webp"
            alt="Spin to Win Wheel"
            width={340}
            height={340}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>

      {/* Portaled Modal Popup rendered directly into document.body */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="relative w-full max-w-lg bg-[#0D0518]/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-[0_0_80px_rgba(123,44,191,0.6)] overflow-hidden">
            
            {/* Background ambient lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors z-50 text-base font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={closeModal}
              disabled={isSpinning}
              aria-label="Close spin modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-1 z-10">
              <Sparkles className="w-5 h-5 text-[#FFA28D] animate-sparkle" />
              <h2 className="text-white font-gilroyBold text-2xl sm:text-3xl font-extrabold tracking-tight">
                Spin to Win
              </h2>
            </div>
            
            <p className="text-purple-200/90 font-gilroyMedium text-xs sm:text-sm mb-5 z-10 text-center max-w-sm">
              {!isConnected
                ? 'Connect your wallet to roll daily rewards, GP, XP, and rare fragments!'
                : canSpin
                ? `You have ${spinsRemaining} free spin${spinsRemaining !== 1 ? 's' : ''} available today!`
                : 'You have used all free spins for today. Check back tomorrow!'}
            </p>

            {/* Wheel Container */}
            <div className="relative w-[270px] h-[270px] sm:w-[360px] sm:h-[360px] flex items-center justify-center z-20 my-2">
              {/* Glowing Aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD166]/20 via-[#EF476F]/20 to-[#118AB2]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Rotatable Wheel SVG */}
              <div
                ref={wheelRef}
                className="w-full h-full relative z-20 flex items-center justify-center will-change-transform"
                style={{ transform: `rotate(${currentRotationRef.current}deg)` }}
              >
                <img
                  src="/SpinPopUp.svg"
                  alt="Spin to Win Wheel"
                  width={360}
                  height={360}
                  decoding="async"
                  className="w-full h-full object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Static Golden Top Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] pointer-events-none">
                <svg width="44" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 5 18 A 15 15 0 0 1 35 18 L 24 52 A 5 5 0 0 1 16 52 Z" fill="url(#gold-pointer-grad-modal)" stroke="#f1c40f" strokeWidth="1.5" />
                  <circle cx="20" cy="18" r="5" fill="#d35400" />
                  <defs>
                    <linearGradient id="gold-pointer-grad-modal" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffdd00" />
                      <stop offset="100%" stopColor="#e67e00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Action Spin Button */}
            <div className="mt-5 w-full flex flex-col items-center gap-3 z-20">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || !canSpin || isSpinMutating}
                className="w-full sm:w-3/4 py-3.5 rounded-2xl text-white font-gilroyBold text-base sm:text-lg font-bold bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSpinning || isSpinMutating ? (
                  <JLTLoader variant="inline" size="sm" text="Spinning..." />
                ) : canSpin ? (
                  <>
                    <RotateCw className="w-5 h-5" />
                    <span>SPIN FOR FREE ({spinsRemaining})</span>
                  </>
                ) : (
                  <span>NO FREE SPINS LEFT</span>
                )}
              </button>
            </div>

            {/* Reward Winning Overlay Popup */}
            {wonPrize && (
              <div className="absolute inset-0 bg-black/92 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="text-yellow-400 font-gilroyBold text-3xl sm:text-4xl font-extrabold animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                  {wonPrize.outcome === 'NOTHING' ? '💨 No Luck!' : '🎉 WINNER! 🎉'}
                </div>

                {wonPrize.icon && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 my-4 flex items-center justify-center relative animate-pulse">
                    <img
                      src={wonPrize.icon}
                      alt={wonPrize.label}
                      className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]"
                    />
                  </div>
                )}

                <div className="text-white font-gilroyBold text-2xl sm:text-3xl font-bold mt-2 tracking-wide">
                  {wonPrize.label}
                </div>

                <p className="text-purple-200 font-gilroyMedium text-sm mt-1 max-w-xs leading-relaxed">
                  {wonPrize.desc}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setWonPrize(null);
                    if (spinStatus?.availableFreeSpins === 0) {
                      setIsModalOpen(false);
                    }
                  }}
                  className="glass-btn mt-6 px-8 py-3 rounded-2xl text-white font-gilroyBold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_25px_rgba(124,58,237,0.5)] cursor-pointer"
                >
                  {wonPrize.outcome === 'NOTHING' ? 'Close' : 'Claim Reward'}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export const SpinToWinCard = React.memo(SpinToWinCardComponent);

