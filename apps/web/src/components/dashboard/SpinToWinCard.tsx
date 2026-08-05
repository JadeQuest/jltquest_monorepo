'use client';

import React, { useState } from 'react';

export const SpinToWinCard: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);

  const prizes = [
    '50 Coins',
    'Rare Pass',
    '2X Multiplier',
    '500 Coins',
    'Free Spin',
    'Legendary Shiny',
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize(null);

    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + 1440 + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const prizeIndex = Math.floor(((newRotation % 360) / 360) * prizes.length);
      setPrize(prizes[prizeIndex] || '50 Coins');
    }, 3500);
  };

  return (
    <div className="daily-card-panel p-6 flex flex-col items-center justify-between h-[360px] relative overflow-hidden select-none">
      <div className="flex flex-col items-center gap-1.5 z-10">
        <h2 className="text-white font-gilroyBold text-3xl font-extrabold tracking-tight">
          Spin to Win
        </h2>
        <div className="glass-pill px-4 py-1 rounded-full border border-purple-400/40 bg-purple-900/30">
          <span className="text-purple-200 font-gilroyMedium text-xs font-semibold tracking-wide">
            1 FREE Spin/Day
          </span>
        </div>
      </div>

      {/* South Side Spin Wheel Graphic - Large, attached to bottom, spanning edge-to-edge covering both bottom corners */}
      <div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[340px] h-[340px] flex items-center justify-center cursor-pointer group z-20"
        onClick={handleSpin}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD166] via-[#EF476F] to-[#118AB2] rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" />

        <div
          className="w-full h-full relative z-20 flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.15, 1)' : 'none',
          }}
        >
          <img
            src="/Spin.svg"
            alt="Spin to Win Wheel"
            className="w-full h-full object-cover object-bottom drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>

      {prize && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="text-yellow-400 font-gilroyBold text-3xl font-extrabold animate-bounce">
            🎉 YOU WON! 🎉
          </div>
          <div className="text-white font-gilroyBold text-xl font-bold mt-2">
            {prize}
          </div>
          <button
            onClick={() => setPrize(null)}
            className="glass-btn mt-4 px-6 py-2 rounded-xl text-white font-bold"
          >
            Claim Reward
          </button>
        </div>
      )}
    </div>
  );
};
