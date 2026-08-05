'use client';

import React from 'react';

export const LevelCard: React.FC = () => {
  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between h-[260px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />

      <div className="flex items-center gap-6">
        <div className="w-32 h-32 relative flex items-center justify-center shrink-0 animate-float">
          <img
            src="/ContainerLevel.svg"
            alt="Lv. 1 Medal"
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-white font-gilroyBold text-4xl font-extrabold tracking-tight">
            Lv. 1
          </div>
          <div className="text-purple-300 font-gilroyMedium text-lg font-medium tracking-wide">
            Starter
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-auto">
        <div className="w-full h-3.5 bg-black/40 rounded-full p-0.5 relative overflow-visible border border-white/10">
          <div className="h-full w-1/4 bg-gradient-to-r from-[#360C9F] via-[#7B2CBF] to-[#FFA28D] rounded-full shadow-[0_0_10px_#FFA28D]" />
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-transform hover:scale-110">
            <img
              src="/SlideCoin.svg"
              alt="Slide Coin Indicator"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
