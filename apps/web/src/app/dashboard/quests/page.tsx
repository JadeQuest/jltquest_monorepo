"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuests, Quest } from '@/hooks/useQuests';
import { QuestCard } from '@/components/quests/QuestCard';
import { Loader2 } from 'lucide-react';

export default function QuestsPage() {
  const { quests, isLoading, claim, isClaiming } = useQuests();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('DAILY');
  const [showPopup, setShowPopup] = useState(false);
  const [rewardData, setRewardData] = useState<{ gpAwarded: number, xpAwarded: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClaim = async (id: string) => {
    try {
      setClaimingId(id);
      const res = await claim(id);
      setRewardData({ gpAwarded: res.gpAwarded, xpAwarded: res.xpAwarded });
      setShowPopup(true);
    } catch (err: any) {
      alert(err.message || 'Failed to claim quest');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading || !quests) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A78BFA]" />
      </div>
    );
  }

  // Filter out hidden achievements that haven't been completed yet
  const visibleQuests = quests.filter(q => !q.isHidden || q.completed);

  // Group quests by category
  const groupedQuests = visibleQuests.reduce((acc, quest) => {
    const cat = quest.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(quest);
    return acc;
  }, {} as Record<string, Quest[]>);

  const categories = ['DAILY', 'WEEKLY', 'EARNING', 'SOCIAL', 'REFERRAL', 'MILESTONE', 'ACHIEVEMENT'];

  return (
    <div className="flex flex-col gap-6 max-w-[1550px] w-full mx-auto">
      <div>
        <h1 className="text-white font-gilroyBold text-3xl sm:text-4xl font-bold tracking-tight mb-2">Quests</h1>
      </div>

      <div className="w-full">
        <div className="overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1.5 w-max gap-1 backdrop-blur-md">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-lg font-gilroyMedium text-sm font-semibold tracking-wide transition-all ${activeTab === cat
                    ? 'glass-btn text-white shadow-[0_0_15px_#7B2CBF]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedQuests[activeTab]?.length > 0 ? (
              groupedQuests[activeTab].map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={handleClaim}
                  isClaiming={claimingId === quest.id}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-gray-500 font-gilroyMedium daily-card-panel border-dashed border-white/10">
                No quests available in this category.
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && rewardData && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center relative animate-fade-in shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl">
            <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide">Quest Claimed!</h3>
            <p className="text-purple-200 font-gilroyMedium text-base mb-6">
              You completed a quest and earned rewards!
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
}
