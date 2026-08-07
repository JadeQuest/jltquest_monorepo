'use client';

import React from 'react';

export const CollectRaresCard: React.FC = () => {
  return (
    <div className="daily-card-panel p-6 flex flex-col justify-between h-[360px] relative overflow-hidden group select-none">
      <div className="absolute inset-0 bg-gradient-to-t from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col gap-2 z-10">
        <h2 className="text-white font-gilroyBold text-2xl font-bold tracking-tight">
          Rare Collection
        </h2>
        <p className="text-purple-200 font-gilroyRegular text-sm font-normal opacity-90">
          Build your collection and discover rare creatures by spins and quests.
        </p>
      </div>

      {/* Fan of Official Collect Rare Cards */}
      <div className="relative w-full h-36 sm:h-44 mt-2 flex items-center justify-center">
        {/* Collect3 Card - Explorer */}
        <div
          className="absolute right-2 sm:right-6 bottom-2 w-[95px] sm:w-[121px] h-[130px] sm:h-[166px] rounded-[10px] overflow-hidden transform rotate-[15deg] group-hover:rotate-[22deg] transition-transform duration-500 z-0 flex flex-col"
          style={{ boxShadow: '2px 6px 4.5px 0px rgba(0, 0, 0, 0.7)' }}
        >
          <img
            src="/optimized/collect-3.webp"
            alt="Collect Rare 3"
            width={121}
            height={166}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div className="w-full bg-[#7B2CBF] rounded-b-[40%] py-0.5 sm:py-1 px-1 text-center shadow-sm border-b border-purple-300/30 z-10">
            <span className="text-white font-gilroyBold text-[9px] sm:text-[10px] font-bold tracking-wider uppercase drop-shadow-sm">
              Explorer
            </span>
          </div>
        </div>

        {/* Collect2 Card - Leader */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[95px] sm:w-[121px] h-[130px] sm:h-[166px] rounded-[10px] overflow-hidden transform rotate-[4deg] group-hover:rotate-[8deg] transition-transform duration-500 z-10 flex flex-col"
          style={{ boxShadow: '2px 6px 4.5px 0px rgba(0, 0, 0, 0.7)' }}
        >
          <img
            src="/optimized/collect-2.webp"
            alt="Collect Rare 2"
            width={121}
            height={166}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div className="w-full bg-[#059669] rounded-b-[40%] py-0.5 sm:py-1 px-1 text-center shadow-sm border-b border-emerald-300/30 z-10">
            <span className="text-white font-gilroyBold text-[9px] sm:text-[10px] font-bold tracking-wider uppercase drop-shadow-sm">
              Leader
            </span>
          </div>
        </div>

        {/* Collect1 Card - Starter */}
        <div
          className="absolute left-2 sm:left-6 bottom-1 w-[95px] sm:w-[121px] h-[130px] sm:h-[166px] rounded-[10px] overflow-hidden transform -rotate-[10deg] group-hover:-rotate-[14deg] transition-transform duration-500 z-20 flex flex-col"
          style={{ boxShadow: '2px 6px 4.5px 0px rgba(0, 0, 0, 0.7)' }}
        >
          <img
            src="/optimized/collect-1.webp"
            alt="Collect Rare 1"
            width={121}
            height={166}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div className="w-full bg-[#3B82F6] rounded-b-[40%] py-0.5 sm:py-1 px-1 text-center shadow-sm border-b border-blue-200/40 z-10">
            <span className="text-white font-gilroyBold text-[9px] sm:text-[10px] font-bold tracking-wider uppercase drop-shadow-sm">
              Starter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
