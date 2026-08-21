'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';
import { useCheckIn } from '@/hooks/useCheckIn';

const DailyCheckInCardComponent: React.FC = () => {
  const { status, claimAsync, isClaiming } = useCheckIn();
  const { isConnected, address } = useAccount();
  const isLoggedOut = !isConnected || !address;
  
  const [showPopup, setShowPopup] = useState(false);
  const [rewardData, setRewardData] = useState<{gpAwarded: number, xpAwarded: number} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const streak = isLoggedOut ? 0 : (status?.streak ?? 0);

  const daysData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    coins: i + 1,
    active: i < streak,
  }));

  const handleClaim = async () => {
    if (!status?.canClaim || !claimAsync) return;
    try {
      const res = await claimAsync();
      if (res) {
        setRewardData(res);
        setShowPopup(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="daily-card-panel p-4 sm:p-6 flex flex-col justify-between min-h-[160px] sm:min-h-[260px] relative overflow-hidden">
      <div className="flex flex-row items-start justify-between gap-2 sm:gap-4 w-full">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-white font-gilroyBold text-2xl font-bold tracking-tight">
            Daily Check In
          </h2>
          <div className="glass-pill px-3 py-1 inline-flex items-center w-fit border border-purple-400/30">
            <span className="text-purple-200 font-gilroyMedium text-xs font-medium tracking-wide">
              Stack your streak bonus daily
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <button 
            onClick={handleClaim}
            disabled={isLoggedOut || !status?.canClaim || isClaiming}
            className={`glass-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white font-gilroyMedium text-xs sm:text-sm font-semibold tracking-wide ${(status?.canClaim && !isLoggedOut) ? 'hover:shadow-[0_0_15px_#7B2CBF] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            {isLoggedOut ? 'Check In' : (isClaiming ? 'Checking In...' : (status?.canClaim ? 'Check In' : 'Checked In'))}
          </button>
        </div>
      </div>

      <div className="flex justify-between sm:grid sm:grid-cols-7 mt-4 items-end w-full">
        {daysData.map((item, idx) => (
          <div key={idx} className={`flex flex-col items-center gap-1.5 sm:gap-2 ${item.active ? '' : 'opacity-30'}`}>
            <span className={`${item.active ? 'text-purple-200' : 'text-gray-400'} font-gilroyBold text-[10px] sm:text-sm font-bold tracking-wide`}>
              {item.day}
            </span>

            <div className="relative w-full h-12 sm:h-16 flex items-end justify-center">
              <svg className="w-[30px] sm:w-[42px] h-[36px] sm:h-[50px]" viewBox="0 0 42 50" preserveAspectRatio="xMidYMax meet" fill="none">
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

      {showPopup && rewardData && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
            <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Check In Successful!</h3>
            <p className="text-purple-200 font-gilroyMedium text-base mb-6">
              You stacked your daily streak and earned rewards!
            </p>
            <div className="flex gap-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-[#FCD34D] drop-shadow-[0_0_15px_#F59E0B]">
                  +{rewardData.gpAwarded}
                </span>
                <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">GP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-[#A78BFA] drop-shadow-[0_0_15px_#7C3AED]">
                  +{rewardData.xpAwarded}
                </span>
                <span className="text-sm text-gray-400 font-gilroyMedium uppercase tracking-wider mt-1">XP</span>
              </div>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full"
            >
              Awesome
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const DailyCheckInCard = React.memo(DailyCheckInCardComponent);

