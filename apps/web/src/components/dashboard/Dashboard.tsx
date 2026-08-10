'use client';

import React from 'react';
import { LevelCard } from './LevelCard';
import { StreakCard } from './StreakCard';
import { DailyCheckInCard } from './DailyCheckInCard';
import { SpinToWinCard } from './SpinToWinCard';
import { CollectRaresCard } from './CollectRaresCard';
import { RarePassCard } from './RarePassCard';
import { QuestBanner } from './QuestBanner';
import { SocialConnectionsCard } from './SocialConnectionsCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto">
      {/* Top Row Cards */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <LevelCard />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StreakCard />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <DailyCheckInCard />
        </div>
      </div>

      {/* Middle Row Cards */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <SpinToWinCard />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <CollectRaresCard />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <RarePassCard />
        </div>
      </div>

      {/* Social Connections Section */}
      <div className="w-full">
        <SocialConnectionsCard />
      </div>

      {/* Bottom Row Banner: Quests Unlock Banner */}
      <div className="w-full mt-1 mb-4">
        <QuestBanner />
      </div>
    </div>
  );
};

export default Dashboard;
