'use client';

import React, { useState } from 'react';
import { X, User, Trophy, Star, Target } from 'lucide-react';
import { DashboardData } from '@/hooks/useDashboard';
import { useAvatar } from '@/hooks/useAvatar';
import { useRarePass } from '@/hooks/useRarePass';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData?: DashboardData | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, dashboardData }) => {
  const { status } = useRarePass();
  const { avatars, selectAvatar, isSelecting, unlockAvatar, isUnlocking } = useAvatar();

  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  if (!isOpen) return null;

  const levelTier = dashboardData?.user?.levelTier || 'Bronze';
  const level = dashboardData?.user?.level || 1;
  const gp = dashboardData?.user?.gp || 0;
  const jlt = dashboardData?.user?.jlt || 0;
  const seasonalPassLevel = status?.progression?.currentLevel || 1;

  const currentAvatarUrl = dashboardData?.user?.activeAvatar?.imageUrl || "/avatar.webp";
  const allVariants = avatars?.flatMap(a => a.variants) || [];

  const handleSaveAvatar = async () => {
    if (selectedVariantId) {
      try {
        await selectAvatar(selectedVariantId);
        setIsChoosingAvatar(false);
      } catch (err) {
        console.error("Failed to save avatar", err);
      }
    }
  };

  const handleUnlockAvatar = async () => {
    if (selectedVariantId) {
      setUnlockError(null);
      try {
        await unlockAvatar(selectedVariantId);
      } catch (err: any) {
        setUnlockError(err.message || "Failed to unlock avatar");
      }
    }
  };

  const selectedVariant = allVariants.find(v => v.id === selectedVariantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border border-white/10 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
        }}
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-gilroyBold text-white mb-6 flex items-center gap-2">
          Profile
        </h2>

        <div className="space-y-6 relative z-10">

          {/* Avatar Section */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <img src={currentAvatarUrl} alt="Current Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-gilroyMedium text-white/60">Current Avatar</p>
                <p className="text-base font-gilroyBold text-white">{dashboardData?.user?.activeAvatar?.name || 'Default'}</p>
              </div>
            </div>
            {!isChoosingAvatar && (
              <button
                onClick={() => setIsChoosingAvatar(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-gilroyMedium text-sm transition-colors shadow-lg"
              >
                Choose Avatar
              </button>
            )}
          </div>

          {isChoosingAvatar ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-gilroyMedium text-white/70">Select New Avatar</h3>
                <button
                  onClick={() => setIsChoosingAvatar(false)}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {allVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      if (variant.isUnlocked) {
                        setSelectedVariantId(variant.id);
                      }
                    }}
                    className={`relative shrink-0 aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedVariantId === variant.id
                      ? 'border-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                      : variant.unlocked
                        ? 'border-transparent opacity-80 hover:opacity-100 hover:scale-105 hover:border-white/20'
                        : 'border-transparent opacity-40 hover:opacity-80 hover:border-white/10'
                      }`}
                  >
                    <img src={variant.imageUrl} alt="Variant" className="w-full h-full object-cover" />
                    {!variant.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                        <span className="text-[10px] font-gilroyBold">Locked</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedVariant && !selectedVariant.unlocked && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-sm font-gilroyBold text-white">How to Unlock</h4>
                  {selectedVariant.unlockDescription && (
                    <p className="text-xs text-white/60">{selectedVariant.unlockDescription}</p>
                  )}
                  {selectedVariant.isPurchasable && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4 text-sm font-gilroyMedium">
                        {selectedVariant.costGp > 0 && (
                          <div className="flex items-center gap-1.5 text-white/80">
                            <img src="/icon/coin.webp" alt="GP" className="w-4 h-4" />
                            {selectedVariant.costGp} GP
                          </div>
                        )}
                        {selectedVariant.costJlt > 0 && (
                          <div className="flex items-center gap-1.5 text-white/80">
                            <img src="/jltcolor.svg" alt="JLT" className="w-4 h-4" />
                            {selectedVariant.costJlt} JLT
                          </div>
                        )}
                      </div>
                      {unlockError && <p className="text-xs text-red-400">{unlockError}</p>}
                      <button
                        onClick={handleUnlockAvatar}
                        disabled={isUnlocking}
                        className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 text-white rounded-lg font-gilroyBold text-sm transition-all"
                      >
                        {isUnlocking ? 'Unlocking...' : 'Unlock Now'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedVariant && selectedVariant.unlocked && (
                <button
                  onClick={handleSaveAvatar}
                  disabled={isSelecting}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-gilroyBold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSelecting ? 'Saving...' : 'Save Avatar'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center gap-2 relative">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <span className="text-[10px] sm:text-xs font-gilroyMedium text-white/60 uppercase">Level</span>
                  <span className="text-base sm:text-lg font-gilroyBold text-white">Lvl {level}</span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                    <img src="/icon/coin.webp" alt="GP" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-gilroyMedium text-white/60 uppercase">GP Balance</span>
                  <span className="text-base sm:text-lg font-gilroyBold text-white">{gp}</span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                    <img src="/jltcolor.svg" alt="JLT" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-gilroyMedium text-white/60 uppercase">JLT Tokens</span>
                  <span className="text-base sm:text-lg font-gilroyBold text-white">{jlt}</span>
                </div>
              </div>

              {/* Seasonal Pass */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-pink-400" />
                  <div>
                    <p className="text-sm font-gilroyBold text-white">Seasonal Pass</p>
                    <p className="text-xs font-gilroyMedium text-white/60">Current Season Progress</p>
                  </div>
                </div>
                <div className="text-xl font-gilroyBold text-white">
                  Lvl {seasonalPassLevel}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
