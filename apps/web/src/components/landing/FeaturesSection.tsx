'use client';

import React from 'react';

interface FeatureCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ icon, iconAlt, title, description, delay }) => (
  <div
    className="glass-panel p-7 flex flex-col gap-5 group cursor-default animate-fade-up hover:-translate-y-1 transition-transform duration-300"
    style={{ animationDelay: delay, opacity: 0 }}
  >
    {/* Icon */}
    <div className="w-16 h-16 rounded-2xl glass-btn flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
      <img src={icon} alt={iconAlt} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 object-contain" />
    </div>

    {/* Text */}
    <div className="flex flex-col gap-2">
      <h3 className="font-gilroyBold text-white text-xl tracking-wide">{title}</h3>
      <p className="font-gilroyRegular text-gray-400 text-base leading-relaxed">{description}</p>
    </div>

    {/* Bottom accent line */}
    <div className="mt-auto h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#360C9F] to-[#FFA28D] rounded-full transition-all duration-500" />
  </div>
));

const features: FeatureCardProps[] = [
  {
    icon: '/Discover.svg',
    iconAlt: 'Discover Quests',
    title: 'Discover Quests',
    description: 'Explore daily and weekly quests tailored to your level. Complete missions to earn coins and rare rewards.',
    delay: '0.1s',
  },
  {
    icon: '/optimized/spin.webp',
    iconAlt: 'Spin to Win',
    title: 'Spin to Win',
    description: 'Try your luck with the daily spin wheel. Land on rare passes, coin multipliers, and exclusive loot.',
    delay: '0.2s',
  },
  {
    icon: '/Push Pass.svg',
    iconAlt: 'Push Pass',
    title: 'Push Pass',
    description: 'Unlock the premium Push Pass for exclusive quests, boosted coin earnings, and rare collectible drops.',
    delay: '0.3s',
  },
  {
    icon: '/InviteSqaud.svg',
    iconAlt: 'Invite Squad',
    title: 'Invite Squad',
    description: 'Bring your crew into JLTQuest. Earn bonus coins for every friend you invite to the ecosystem.',
    delay: '0.4s',
  },
  {
    icon: '/LeaderBoard.svg',
    iconAlt: 'Leaderboard',
    title: 'Leaderboards',
    description: 'Compete globally and rise to the top. Top players earn exclusive rewards and recognition each season.',
    delay: '0.5s',
  },
  {
    icon: '/optimized/flame.webp',
    iconAlt: 'Daily Streak',
    title: 'Daily Streaks',
    description: 'Log in every day to build your streak. The longer the streak, the bigger the rewards — stay consistent.',
    delay: '0.6s',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative w-full py-24 px-6 bg-[#080411] overflow-hidden">
      {/* Section Separator Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#360C9F] via-[#FFA28D] to-transparent bg-[size:200%_100%] animate-[borderGradientRotate_4s_ease_infinite] pointer-events-none" />

      {/* Background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-radial from-[#360C9F]/20 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="glass-pill px-5 py-2 inline-flex items-center gap-2">
            <img src="/jlt.svg" alt="JLT" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">Everything You Need</span>
          </div>
          <h2 className="font-gilroyBold text-5xl text-white tracking-tight leading-tight">
            Built for Quest Champions
          </h2>
          <p className="font-gilroyRegular text-gray-400 text-lg max-w-[560px] leading-relaxed">
            JLTQuest packs a full suite of earning tools, collectibles, and social mechanics — all free to play.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
