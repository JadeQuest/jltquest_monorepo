'use client';

import React, { useState } from 'react';
import { useCollection } from '../../../hooks/useCollection';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CollectionPage() {
  const { data, loading, error, isMerging, mergeFragments } = useCollection();
  const [newCard, setNewCard] = useState<any>(null);

  const handleMerge = async () => {
    try {
      const card = await mergeFragments();
      setNewCard(card);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-500/10 rounded-lg">
        Error loading collection: {error}
      </div>
    );
  }

  const fragments = data?.fragments || 0;
  const cards = data?.cards || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4">
      {/* Header & Fragment Balance */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#151025] p-6 rounded-2xl border border-purple-900/30">
        <div>
          <h1 className="text-3xl font-gilroyBold text-white tracking-tight">Rare Collection</h1>
          <p className="text-purple-200/70 mt-1">Collect fragments from quests and spins to unlock rare cards.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#7B2CBF]/10 px-6 py-4 rounded-xl border border-[#7B2CBF]/30">
          <div className="flex flex-col">
            <span className="text-xs text-purple-300 font-gilroyMedium uppercase tracking-wider">Fragments Balance</span>
            <span className="text-2xl font-gilroyBold text-white">{fragments} / 10</span>
          </div>
          
          <button 
            onClick={handleMerge}
            disabled={fragments < 10 || isMerging}
            className={`px-6 py-3 rounded-xl font-gilroyBold transition-all ${
              fragments >= 10 && !isMerging
                ? 'bg-gradient-to-r from-[#7B2CBF] to-[#511889] hover:opacity-90 text-white shadow-lg shadow-purple-900/50' 
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }`}
          >
            {isMerging ? 'Merging...' : 'Merge 10 Fragments'}
          </button>
        </div>
      </div>

      {/* New Card Reveal Modal (Basic implementation) */}
      {newCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151025] border border-purple-500/30 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-gilroyBold text-white mb-6">New Card Unlocked!</h2>
            <div className="relative w-48 h-64 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 mb-6">
              <Image src={newCard.imageUrl} alt={newCard.name} fill className="object-cover" />
            </div>
            <p className="text-lg font-gilroyMedium text-purple-200 mb-8">{newCard.name}</p>
            <button 
              onClick={() => setNewCard(null)}
              className="w-full py-3 bg-[#7B2CBF] hover:bg-[#511889] text-white rounded-xl font-gilroyBold transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Collection Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-gilroyBold text-white">Your Cards</h2>
          <span className="text-purple-300/60 font-gilroyMedium">{cards.length} Unique Cards</span>
        </div>
        
        {cards.length === 0 ? (
          <div className="text-center py-24 bg-[#151025]/50 border border-white/5 rounded-2xl">
            <p className="text-white/40 font-gilroyMedium">You haven't collected any rare cards yet.</p>
            <p className="text-white/30 text-sm mt-2">Earn fragments to unlock your first card!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="group relative bg-[#151025] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-colors">
                <div className="relative aspect-[3/4] w-full">
                  <Image src={card.imageUrl} alt={card.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-gilroyBold text-sm truncate">{card.name}</h3>
                  <p className="text-purple-300 text-xs mt-0.5">Quantity: {card.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
