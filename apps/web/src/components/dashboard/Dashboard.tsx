'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { HeaderStatus } from './HeaderStatus';
import { LevelCard } from './LevelCard';
import { StreakCard } from './StreakCard';
import { DailyCheckInCard } from './DailyCheckInCard';
import { SpinToWinCard } from './SpinToWinCard';
import { CollectRaresCard } from './CollectRaresCard';
import { RarePassCard } from './RarePassCard';
import { QuestBanner } from './QuestBanner';

export const Dashboard: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-[#080411] text-white flex overflow-hidden relative font-gilroyRegular select-none">
      {/* Background Ambient Radial Blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[650px] h-[650px] rounded-full bg-radial from-[#360C9F]/50 via-[#340073]/30 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[800px] h-[800px] rounded-full bg-radial from-[#7B2CBF]/40 via-[#340073]/25 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[100px] pointer-events-none" />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Dashboard Layout */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 pl-2 z-10 gap-6">
        {/* Top Header Status Bar */}
        <HeaderStatus />

        {/* Dashboard Cards Grid Container */}
        <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto">
          {/* Top Row Cards */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <LevelCard />
            </div>

            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <StreakCard />
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-6">
              <DailyCheckInCard />
            </div>
          </div>

          {/* Middle Row Cards */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <SpinToWinCard />
            </div>

            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <CollectRaresCard />
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-6">
              <RarePassCard />
            </div>
          </div>

          {/* Bottom Row Banner: Quests Unlock Banner */}
          <div className="w-full mt-1 mb-4">
            <QuestBanner />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
