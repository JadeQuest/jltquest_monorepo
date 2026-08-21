import React, { useState } from 'react';
import { Quest } from '@/hooks/useQuests';
import { Gift, Star, ExternalLink } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';
import { useSocial } from '@/hooks/useSocial';
import { useQueryClient } from '@tanstack/react-query';

interface QuestCardProps {
  quest: Quest;
  onClaim: (id: string) => void;
  isClaiming: boolean;
}

function QuestCardComponent({ quest, onClaim, isClaiming }: QuestCardProps) {
  const isCompleted = quest.completed;
  const isSocial = quest.category === 'SOCIAL';
  const canClaim = quest.canClaim;
  const queryClient = useQueryClient();
  const { connect } = useSocial();
  const [isConnectingSocial, setIsConnectingSocial] = useState(false);

  const getPlatformInfo = (code: string) => {
    const c = code.toLowerCase();
    if (c.includes('x') || c.includes('twitter')) return { platform: 'x', label: 'Connect X', url: 'https://twitter.com' };
    if (c.includes('discord')) return { platform: 'discord', label: 'Connect Discord', url: 'https://discord.com' };
    if (c.includes('telegram')) return { platform: 'telegram', label: 'Connect Telegram', url: 'https://t.me' };
    if (c.includes('instagram')) return { platform: 'instagram', label: 'Connect Instagram', url: 'https://instagram.com' };
    if (c.includes('facebook')) return { platform: 'facebook', label: 'Connect Facebook', url: 'https://facebook.com' };
    return { platform: 'x', label: 'Connect Account', url: 'https://twitter.com' };
  };

  const socialInfo = isSocial ? getPlatformInfo(quest.code) : null;

  const handleConnectSocial = async () => {
    if (!socialInfo) return;
    try {
      setIsConnectingSocial(true);
      // Open external social page in new tab
      if (typeof window !== 'undefined') {
        window.open(socialInfo.url, '_blank');
      }
      // Link/Verify connection in database
      await connect({ platform: socialInfo.platform });
      // Refresh quests & dashboard state
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      console.error('Social connection error:', err);
    } finally {
      setIsConnectingSocial(false);
    }
  };

  return (
    <div className="daily-card-panel p-3.5 sm:p-5 flex flex-col justify-between h-full min-h-[190px] sm:min-h-[220px] relative overflow-hidden group">
      {/* Background glow effect on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
      
      <div className="flex-grow flex flex-col relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 sm:mb-3 gap-1.5 sm:gap-0">
          <h3 className="text-white font-gilroyBold text-base sm:text-xl font-bold tracking-tight">{quest.name}</h3>
          <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md whitespace-nowrap font-gilroyMedium font-medium border w-fit ${isCompleted ? 'bg-black/40 text-gray-500 border-white/5' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'}`}>
            {quest.frequency.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 font-gilroyMedium mb-3 sm:mb-4 leading-relaxed line-clamp-3 sm:line-clamp-none">{quest.description}</p>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-auto pt-2">
          {quest.gpReward > 0 && (
            <div className="flex items-center text-[#FCD34D] font-gilroyBold text-[11px] sm:text-sm font-semibold tracking-wide">
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 opacity-80" />
              +{quest.gpReward} GP
            </div>
          )}
          {quest.xpReward > 0 && (
            <div className="flex items-center text-[#A78BFA] font-gilroyBold text-[11px] sm:text-sm font-semibold tracking-wide">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 opacity-80" />
              +{quest.xpReward} XP
            </div>
          )}
          {!!quest.rpXpReward && quest.rpXpReward > 0 && (quest.frequency === 'DAILY' || quest.frequency === 'WEEKLY') && (
            <div className="flex items-center text-[#00F0FF] font-gilroyBold text-[11px] sm:text-sm font-semibold tracking-wide">
              <span className="mr-1 opacity-90 text-[10px] sm:text-sm">⚡</span>
              +{quest.rpXpReward} RP XP
            </div>
          )}
          {!!quest.fragmentReward && quest.fragmentReward > 0 && (
            <div className="flex items-center text-emerald-400 font-gilroyBold text-[11px] sm:text-sm font-semibold tracking-wide">
              <span className="mr-1 opacity-90 text-[10px] sm:text-sm">🎴</span>
              +{quest.fragmentReward} Frag
            </div>
          )}
        </div>
        {(quest.completedCount ?? 0) > 0 && quest.frequency === 'REPEATABLE' && (
          <p className="text-xs text-gray-500 font-gilroyMedium mt-3">
            Completed {quest.completedCount} time{quest.completedCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="mt-4 sm:mt-5 relative z-10">
        {isCompleted ? (
          <button 
            className="w-full font-gilroyBold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center bg-black/40 text-gray-500 border border-white/5 cursor-not-allowed"
            disabled
          >
            Claimed
          </button>
        ) : canClaim ? (
          <button 
            className="w-full font-gilroyBold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 glass-btn text-white hover:shadow-[0_0_15px_#7B2CBF] cursor-pointer"
            disabled={isClaiming}
            onClick={() => onClaim(quest.id)}
          >
            {isClaiming ? (
              <JLTLoader variant="inline" size="sm" text="Wait..." />
            ) : (
              'Claim Reward'
            )}
          </button>
        ) : isSocial ? (
          <button 
            className="w-full font-gilroyBold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 glass-btn text-white hover:shadow-[0_0_15px_#7B2CBF] cursor-pointer"
            disabled={isConnectingSocial}
            onClick={handleConnectSocial}
          >
            {isConnectingSocial ? (
              <JLTLoader variant="inline" size="sm" text="Wait..." />
            ) : (
              <>
                <span className="truncate">{socialInfo?.label || 'Connect Account'}</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 shrink-0" />
              </>
            )}
          </button>
        ) : (
          <button 
            className="w-full font-gilroyBold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center bg-purple-900/20 text-purple-400/50 border border-purple-500/10 cursor-not-allowed"
            disabled
          >
            Incomplete
          </button>
        )}
      </div>
    </div>
  );
}

export const QuestCard = React.memo(QuestCardComponent);
