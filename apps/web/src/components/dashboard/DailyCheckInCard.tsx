'use client';

import React from 'react';

export const DailyCheckInCard: React.FC = () => {
  const daysData = [
    { day: 'Day 1', coins: 1, active: true },
    { day: 'Day 2', coins: 2, active: true },
    { day: 'Day 3', coins: 3, active: true },
    { day: 'Day 4', coins: 4, active: true },
    { day: 'Day 5', coins: 5, active: true },
    { day: 'Day 6', coins: 6, active: true },
    { day: 'Day 7', coins: 7, active: true },
  ];

  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between h-[260px] relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-white font-gilroyBold text-2xl font-bold tracking-tight">
            Daily Check-In
          </h2>
          <div className="glass-pill px-3 py-1 inline-flex items-center w-fit border border-purple-400/30">
            <span className="text-purple-200 font-gilroyMedium text-xs font-medium tracking-wide">
              Stack your streak bonus daily
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 relative flex items-center justify-center">
              <img
                src="/Coin.svg"
                alt="500 Gold Coins Badge"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-gilroyBold text-base font-bold">500</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 relative flex items-center justify-center shrink-0">
              <img
                src="/jltcolor.svg"
                alt="50 JLT Badge"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-gilroyBold text-base font-bold">50</span>
          </div>

          <button className="glass-btn px-4 py-2 rounded-xl text-white font-gilroyMedium text-sm font-semibold tracking-wide hover:shadow-[0_0_15px_#7B2CBF]">
            View Coin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mt-4 items-end">
        {daysData.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
            <span className="text-purple-200 font-gilroyBold text-sm font-bold tracking-wide group-hover:text-white transition-colors">
              {item.day}
            </span>

            <div className="relative w-full h-16 flex items-end justify-center transition-transform duration-300 group-hover:scale-110">
              <svg width="42" height="50" viewBox="0 0 42 50" fill="none">
                <defs>
                  <linearGradient id={`coinTopGrad_${idx}`} x1="0" y1="0" x2="42" y2="0">
                    <stop stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id={`coinSideGrad_${idx}`} x1="0" y1="0" x2="0" y2="10">
                    <stop stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>

                {Array.from({ length: item.coins }).map((_, cIdx) => {
                  const yPos = 36 - cIdx * 5;
                  return (
                    <g key={cIdx}>
                      <path
                        d={`M 6 ${yPos + 4} C 6 ${yPos + 10}, 36 ${yPos + 10}, 36 ${yPos + 4} L 36 ${yPos + 8} C 36 ${yPos + 14}, 6 ${yPos + 14}, 6 ${yPos + 8} Z`}
                        fill={`url(#coinSideGrad_${idx})`}
                      />
                      <ellipse
                        cx="21"
                        cy={yPos + 4}
                        rx="15"
                        ry="5.5"
                        fill={`url(#coinTopGrad_${idx})`}
                        stroke="#FFE4E6"
                        strokeWidth="0.75"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
