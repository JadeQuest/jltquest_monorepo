'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';

const PRIZES = [
  '50 Coins',
  'Rare Pass',
  '2X Boost',
  '100 Coins',
  '500 Coins',
  'Free Spin',
  'Mystery Box',
  'Legendary Shiny',
];

export const SpinToWinCard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);

  const spinTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const handleSpin = React.useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize(null);

    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + 1440 + extraDegrees;
    setRotation(newRotation);

    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      const prizeIndex = Math.floor(((newRotation % 360) / 360) * PRIZES.length);
      setPrize(PRIZES[prizeIndex] || '50 Coins');
    }, 3500);
  }, [isSpinning, rotation]);

  const handleCardClick = React.useCallback(() => {
    if (isConnected && address) {
      setIsModalOpen(true);
    }
  }, [isConnected, address]);

  const closeModal = React.useCallback(() => {
    if (!isSpinning) {
      setIsModalOpen(false);
      // Optional: reset state on close if desired
      // setRotation(0);
      // setPrize(null);
    }
  }, [isSpinning]);

  return (
    <>
      <div
        className={`daily-card-panel p-6 flex flex-col items-start justify-between h-[360px] relative overflow-hidden select-none group ${isConnected && address ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        onClick={handleCardClick}
      >
        <div className="flex flex-col items-start gap-1.5 z-10 group-hover:scale-105 transition-transform duration-300">
          <h2 className="text-white font-gilroyBold text-2xl font-bold tracking-tight">
            Spin to Win
          </h2>
          <div className="glass-pill px-4 py-1 rounded-full border border-purple-400/40 bg-purple-900/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="text-purple-200 font-gilroyMedium text-xs font-semibold tracking-wide">
              1 FREE Spin Per Day
            </span>
          </div>
          <div className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white font-gilroyBold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm border border-white/20">
            Click to Play!
          </div>
        </div>

        {/* Decorative wheel for the card */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[340px] h-[340px] flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <img
            src="/optimized/spin.webp"
            alt="Spin to Win Wheel"
            width={340}
            height={340}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-bottom drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0D0518]/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-[0_0_80px_rgba(123,44,191,0.5)] overflow-hidden">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors z-50 text-lg font-bold"
              onClick={closeModal}
              disabled={isSpinning}
            >
              ✕
            </button>

            <h2 className="text-white font-gilroyBold text-3xl sm:text-4xl font-extrabold mb-1.5 z-10 text-center tracking-tight">
              Spin to Win
            </h2>
            <p className="text-purple-300 font-gilroyMedium text-sm sm:text-base mb-6 z-10 text-center">
              Tap the wheel or click SPIN below to try your luck!
            </p>

            {/* Wheel Container - Big SVG */}
            <div
              className="relative w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] flex items-center justify-center cursor-pointer group z-20 mb-4 sm:mb-6"
              onClick={handleSpin}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD166] via-[#EF476F] to-[#118AB2] rounded-full blur-3xl opacity-25 group-hover:opacity-45 transition-opacity" />

              <div
                className="w-full h-full relative z-20 flex items-center justify-center"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  willChange: isSpinning ? 'transform' : 'auto',
                  transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.15, 1)' : 'none',
                }}
              >
                <img
                  src="/SpinPopUp.svg"
                  alt="Spin to Win Wheel"
                  width={420}
                  height={420}
                  decoding="async"
                  className="w-full h-full object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Static Golden Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5 z-30 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] pointer-events-none">
                <svg width="48" height="70" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 5 20 A 15 15 0 0 1 35 20 L 25 55 A 5 5 0 0 1 15 55 Z" fill="url(#gold-pointer-grad)" stroke="#f1c40f" strokeWidth="1.5" />
                  <circle cx="20" cy="20" r="5" fill="#d35400" />
                  <defs>
                    <linearGradient id="gold-pointer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffdd00" />
                      <stop offset="100%" stopColor="#e67e00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Action Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="glass-btn px-10 py-3.5 rounded-2xl text-white font-gilroyBold text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.5)] cursor-pointer disabled:opacity-50 z-20"
            >
              {isSpinning ? 'Spinning...' : 'SPIN NOW'}
            </button>

            {/* Reward Overlay */}
            {prize && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="text-yellow-400 font-gilroyBold text-4xl sm:text-5xl font-extrabold animate-bounce text-center drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                  🎉 YOU WON! 🎉
                </div>
                <div className="text-white font-gilroyBold text-3xl sm:text-4xl font-bold mt-6 text-center tracking-wide">
                  {prize}
                </div>
                <button
                  onClick={() => {
                    setPrize(null);
                    setIsModalOpen(false);
                  }}
                  className="glass-btn mt-10 px-10 py-3.5 rounded-2xl text-white font-gilroyBold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                >
                  Claim Reward
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

