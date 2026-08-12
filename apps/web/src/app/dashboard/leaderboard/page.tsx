'use client';

import React from 'react';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';

export default function SingularLeaderboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto animate-fade-in select-none">
      <LeaderboardCard />
    </div>
  );
}
