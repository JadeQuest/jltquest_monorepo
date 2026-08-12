import React, { useState, useEffect } from 'react';
import { Quest } from '@/hooks/useQuests';
import { Gift, Star } from 'lucide-react';
import { JLTLoader } from '@/components/common/JLTLoader';

interface QuestCardProps {
  quest: Quest;
  onClaim: (id: string) => void;
  isClaiming: boolean;
}

function QuestCardComponent({ quest, onClaim, isClaiming }: QuestCardProps) {
  const isCompleted = quest.completed;
  const isSocial = quest.category === 'SOCIAL';
  
  const [hasClickedGo, setHasClickedGo] = useState(false);

  useEffect(() => {
    if (isSocial && typeof window !== 'undefined') {
      const clicked = localStorage.getItem(`quest_go_${quest.id}`) === 'true';
      setHasClickedGo(clicked);
    }
  }, [quest.id, isSocial]);

  const handleGo = () => {
    let url = 'https://jadequest.com'; 
    if (quest.code === 'soc_x_connect') url = 'https://twitter.com';
    else if (quest.code === 'soc_discord_connect') url = 'https://discord.com';
    else if (quest.code === 'soc_instagram_connect') url = 'https://instagram.com';
    else if (quest.code === 'soc_facebook_connect') url = 'https://facebook.com';
    
    window.open(url, '_blank');
    localStorage.setItem(`quest_go_${quest.id}`, 'true');
    setHasClickedGo(true);
  };

  const showGoButton = isSocial && !isCompleted && !hasClickedGo && !quest.canClaim;
  
  // A quest is claimable if the backend returns canClaim: true OR if it's a social quest where the user clicked Go
  const isClaimable = quest.canClaim || (isSocial && hasClickedGo);
  
  return (
    <div className="daily-card-panel p-5 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
      {/* Background glow effect on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
      
      <div className="flex-grow flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-gilroyBold text-xl font-bold tracking-tight">{quest.name}</h3>
          <span className={`text-xs px-2.5 py-1 rounded-md ml-2 whitespace-nowrap font-gilroyMedium font-medium border ${isCompleted ? 'bg-black/40 text-gray-500 border-white/5' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'}`}>
            {quest.frequency.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-gray-400 font-gilroyMedium mb-4 leading-relaxed">{quest.description}</p>
        
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
          {quest.gpReward > 0 && (
            <div className="flex items-center text-[#FCD34D] font-gilroyBold text-sm font-semibold tracking-wide">
              <Gift className="w-4 h-4 mr-1 opacity-80" />
              +{quest.gpReward} GP
            </div>
          )}
          {quest.xpReward > 0 && (
            <div className="flex items-center text-[#A78BFA] font-gilroyBold text-sm font-semibold tracking-wide">
              <Star className="w-4 h-4 mr-1 opacity-80" />
              +{quest.xpReward} XP
            </div>
          )}
          {!!quest.rpXpReward && quest.rpXpReward > 0 && (
            <div className="flex items-center text-[#00F0FF] font-gilroyBold text-sm font-semibold tracking-wide">
              <span className="mr-1 opacity-90">⚡</span>
              +{quest.rpXpReward} RP XP
            </div>
          )}
          {!!quest.fragmentReward && quest.fragmentReward > 0 && (
            <div className="flex items-center text-emerald-400 font-gilroyBold text-sm font-semibold tracking-wide">
              <span className="mr-1 opacity-90">🎴</span>
              +{quest.fragmentReward} Frag
            </div>
          )}
        </div>
        {quest.completedCount > 0 && quest.frequency === 'REPEATABLE' && (
          <p className="text-xs text-gray-500 font-gilroyMedium mt-3">
            Completed {quest.completedCount} time{quest.completedCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="mt-5 relative z-10">
        {showGoButton ? (
          <button 
            className="w-full font-gilroyBold text-sm sm:text-base py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 glass-btn text-white hover:shadow-[0_0_15px_#7B2CBF]"
            onClick={handleGo}
          >
            Go
          </button>
        ) : (
          <button 
            className={`w-full font-gilroyBold text-sm sm:text-base py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isCompleted 
                ? 'bg-black/40 text-gray-500 border border-white/5 cursor-not-allowed' 
                : !isClaimable
                ? 'bg-purple-900/20 text-purple-400/50 border border-purple-500/10 cursor-not-allowed'
                : 'glass-btn text-white hover:shadow-[0_0_15px_#7B2CBF]'
            }`}
            disabled={isCompleted || isClaiming || !isClaimable}
            onClick={() => onClaim(quest.id)}
          >
            {isClaiming ? (
              <JLTLoader variant="inline" size="sm" text="Claiming..." />
            ) : isCompleted ? (
              'Claimed'
            ) : !isClaimable ? (
              'Incomplete'
            ) : (
              'Claim Reward'
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export const QuestCard = React.memo(QuestCardComponent);

