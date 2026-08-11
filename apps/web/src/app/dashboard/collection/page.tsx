'use client';

import React, { useState } from 'react';
import { useCollection, Card } from '../../../hooks/useCollection';
import { Loader2, Sparkles, Layers, Shield, Zap, Award, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CollectionPage() {
  const { data, loading, error, isMerging, mergeFragments } = useCollection();
  const [newCard, setNewCard] = useState<Card | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const handleMerge = async () => {
    try {
      const card = await mergeFragments();
      setNewCard(card);
    } catch (e: any) {
      alert(e.message || 'Failed to merge fragments. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 glass-panel rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-[#00F0FF]" />
          <p className="text-purple-200 font-gilroyMedium text-sm animate-pulse">Loading Rare Collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="p-6 text-red-300 bg-red-950/40 border border-red-500/30 rounded-2xl backdrop-blur-md flex items-center gap-4">
          <Shield className="w-6 h-6 shrink-0 text-red-400" />
          <p className="font-gilroyMedium text-sm">Error loading collection: {error}</p>
        </div>
      </div>
    );
  }

  const fragments = data?.fragments || 0;
  const cards = data?.cards || [];
  const maxFragments = 10;
  const progressPercent = Math.min(100, Math.round((fragments / maxFragments) * 100));

  // Determine Rarity Badge styling helper
  const getRarityBadge = (index: number) => {
    const rarities = [
      { label: 'Starter', bg: 'bg-[#3B82F6]', border: 'border-blue-400/40' },
      { label: 'Leader', bg: 'bg-[#059669]', border: 'border-emerald-400/40' },
      { label: 'Explorer', bg: 'bg-[#7B2CBF]', border: 'border-purple-400/40' },
      { label: 'Legendary', bg: 'bg-gradient-to-r from-[#FFA28D] to-[#FF007F]', border: 'border-amber-400/40' },
    ];
    return rarities[index % rarities.length];
  };

  return (
    <div className="w-full max-w-[1550px] mx-auto space-y-6 sm:space-y-8 select-none">
      {/* Header & Fragment Merge Hub Banner */}
      <div className="daily-card-panel p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none" />

        {/* Left Title & Description */}
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-purple-400/20 w-fit">
            <Sparkles className="w-4 h-4 text-[#00F0FF] animate-sparkle" />
            <span className="text-[#00F0FF] font-gilroyMedium text-xs font-semibold uppercase tracking-wider">
              Rare Creatures Vault
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-gilroyBold text-white tracking-tight drop-shadow-md">
            Rare Collection
          </h1>
          <p className="text-purple-200 font-gilroyRegular text-sm sm:text-base leading-relaxed opacity-90">
            Collect creature fragments through daily check-ins, spins, and quests. Merge 10 fragments to unveil exclusive NFT rare cards.
          </p>
        </div>

        {/* Right Fragment Progress & Merge Action Card */}
        <div className="w-full lg:w-auto z-10 shrink-0">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 min-w-full lg:min-w-[340px] shadow-xl border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">
                Fragments Balance
              </span>
              <span className="text-2xl font-gilroyBold text-white tracking-wide">
                {fragments} <span className="text-purple-400 text-lg font-gilroyRegular">/ {maxFragments}</span>
              </span>
            </div>

            {/* Fragment Progress Bar */}
            <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] to-[#00F0FF] transition-all duration-500 shadow-[0_0_12px_#00F0FF]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Merge Action Button */}
            <button
              onClick={handleMerge}
              disabled={fragments < maxFragments || isMerging}
              className={`w-full py-3.5 rounded-xl font-gilroyBold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                fragments >= maxFragments && !isMerging
                  ? 'glass-btn text-white shadow-[0_0_25px_rgba(123,44,191,0.5)] cursor-pointer'
                  : 'bg-white/5 text-white/40 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Merging Fragments...</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  <span>{fragments >= maxFragments ? 'Merge 10 Fragments' : 'Need 10 Fragments'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collection Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Unique Cards</p>
            <p className="text-2xl font-gilroyBold text-white mt-0.5">{cards.length}</p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-[#00F0FF]" />
          </div>
          <div>
            <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Fragment Progress</p>
            <p className="text-2xl font-gilroyBold text-white mt-0.5">{progressPercent}%</p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-[#FFA28D]" />
          </div>
          <div>
            <p className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Total Quantity</p>
            <p className="text-2xl font-gilroyBold text-white mt-0.5">
              {cards.reduce((sum, c) => sum + (c.quantity || 1), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Deck Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-gilroyBold text-white tracking-tight">Your Cards</h2>
            <span className="glass-pill px-3 py-1 text-xs font-gilroyMedium text-purple-200">
              {cards.length} Collected
            </span>
          </div>
        </div>

        {cards.length === 0 ? (
          /* Empty Collection State */
          <div className="glass-panel p-10 sm:p-16 text-center rounded-3xl flex flex-col items-center justify-center gap-5 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-[#7B2CBF]/15 via-transparent to-transparent pointer-events-none" />

            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center animate-float">
              <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-2xl -z-10" />
              <Image
                src="/optimized/mascot.webp"
                alt="JLT Mascot"
                width={176}
                height={176}
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="max-w-md space-y-2 z-10">
              <h3 className="text-xl sm:text-2xl font-gilroyBold text-white">No Rare Cards Unlocked Yet</h3>
              <p className="text-sm text-purple-200/80 font-gilroyRegular leading-relaxed">
                You haven't merged any rare creature cards yet. Complete quests and daily spins to collect 10 fragments and reveal your first card!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 z-10">
              <Link
                href="/dashboard/quests"
                className="glass-btn px-6 py-3 rounded-xl font-gilroyBold text-sm text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <span>Earn Fragments in Quests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="glass-pill px-6 py-3 rounded-xl font-gilroyMedium text-sm text-purple-200 hover:text-white border border-white/10 hover:border-purple-400/40 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {cards.map((card, idx) => {
              const rarity = getRarityBadge(idx);
              return (
                <div
                  key={card.id || idx}
                  className="group relative glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/50 hover:scale-[1.04] transition-all duration-300 cursor-pointer shadow-xl"
                >
                  {/* Aspect ratio 3:4 card image container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-purple-950/40">
                    <Image
                      src={card.imageUrl || `/optimized/collect-${(idx % 16) + 1}.webp`}
                      alt={card.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080411] via-transparent to-black/30 pointer-events-none" />

                    {/* Rarity Tag floating top-left */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-gilroyBold text-white uppercase tracking-wider ${rarity.bg} shadow-md`}>
                        {rarity.label}
                      </span>
                    </div>

                    {/* Quantity Badge floating top-right */}
                    {card.quantity > 1 && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="glass-pill px-2 py-0.5 rounded-md text-[11px] font-gilroyBold text-white border border-white/20 shadow-md">
                          x{card.quantity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Details */}
                  <div className="p-3.5 bg-gradient-to-b from-[#150A2A] to-[#080411] border-t border-white/5">
                    <h3 className="text-white font-gilroyBold text-sm truncate tracking-wide group-hover:text-[#00F0FF] transition-colors">
                      {card.name}
                    </h3>
                    <p className="text-purple-300/80 font-gilroyRegular text-xs mt-0.5">
                      Collected Rare
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Card Unlocked Modal Popup */}
      {newCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-in">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-sm w-full flex flex-col items-center text-center relative overflow-hidden border border-purple-500/40 shadow-2xl animate-fade-up">
            <div className="absolute inset-0 bg-radial from-[#7B2CBF]/40 via-transparent to-transparent pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill mb-4">
              <Sparkles className="w-4 h-4 text-[#FFA28D] animate-sparkle" />
              <span className="text-[#FFA28D] font-gilroyBold text-xs uppercase tracking-wider">
                New Card Unlocked!
              </span>
            </div>

            {/* Glowing Card Preview */}
            <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-purple-300/50 shadow-[0_0_40px_rgba(123,44,191,0.6)] my-3 group">
              <Image
                src={newCard.imageUrl || '/optimized/collect-1.webp'}
                alt={newCard.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <h2 className="text-2xl font-gilroyBold text-white tracking-tight mt-2 mb-1">
              {newCard.name}
            </h2>
            <p className="text-purple-200 font-gilroyRegular text-xs mb-6">
              Added to your rare collection vault
            </p>

            <button
              onClick={() => setNewCard(null)}
              className="glass-btn w-full py-3.5 rounded-xl font-gilroyBold text-white text-base shadow-xl cursor-pointer hover:scale-105 transition-transform"
            >
              Awesome! Claim Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
