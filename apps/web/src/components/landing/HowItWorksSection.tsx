'use client';

import React from 'react';

interface StepProps {
  step: number;
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
}

const Step: React.FC<StepProps> = React.memo(({ step, title, description, icon, iconAlt }) => (
  <div className="flex flex-col items-center gap-5 text-center group">
    {/* Step circle */}
    <div className="relative flex items-center justify-center">
      <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <img src={icon} alt={iconAlt} width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 object-contain" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#360C9F] to-[#FFA28D] flex items-center justify-center shadow-[0_0_12px_rgba(255,162,141,0.5)]">
        <span className="font-gilroyBold text-white text-xs">{step}</span>
      </div>
    </div>

    {/* Text */}
    <div className="flex flex-col gap-2 max-w-[220px]">
      <h4 className="font-gilroyBold text-white text-lg tracking-wide">{title}</h4>
      <p className="font-gilroyRegular text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
));

const steps: StepProps[] = [
  {
    step: 1,
    title: 'Connect Wallet',
    description: 'Link your wallet to start your JLTQuest journey and secure your rewards.',
    icon: '/Rectangle 11989.svg',
    iconAlt: 'Connect Wallet',
  },
  {
    step: 2,
    title: 'Complete Quests',
    description: 'Discover and finish daily quests inside JaxMart to earn JLT coins.',
    icon: '/Discover.svg',
    iconAlt: 'Discover Quests',
  },
  {
    step: 3,
    title: 'Collect Rares',
    description: 'Use your coins to spin, collect, and upgrade rare passes and NFTs.',
    icon: '/optimized/spin.webp',
    iconAlt: 'Collect Rares',
  },
  {
    step: 4,
    title: 'Climb & Win',
    description: 'Hit the leaderboard, rack up multipliers, and claim seasonal prizes.',
    icon: '/LeaderBoard.svg',
    iconAlt: 'Leaderboard',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative w-full py-24 px-6 overflow-hidden">
      {/* Section Separator Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] max-w-5xl h-[1.5px] bg-gradient-to-r from-transparent via-[#FFA28D] via-[#00F0FF] to-transparent bg-[size:200%_100%] animate-[borderGradientRotate_4s_ease_infinite] pointer-events-none" />

      {/* Background blur */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-radial from-[#FFA28D]/15 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="glass-pill px-5 py-2 inline-flex items-center gap-2">
            <img src="/optimized/coin.webp" alt="JLT Coin" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain animate-sparkle" />
            <span className="font-gilroyMedium text-sm text-white/90 tracking-wider uppercase">Simple Steps</span>
          </div>
          <h2 className="font-gilroyBold text-5xl text-white tracking-tight leading-tight">
            How It Works
          </h2>
          <p className="font-gilroyRegular text-gray-400 text-lg max-w-[480px] leading-relaxed">
            Get started in minutes. JLTQuest is designed to be fun and intuitive from day one.
          </p>
        </div>

        {/* Steps with connector */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#FFA28D] via-[#7B2CBF] via-[#00F0FF] to-[#FF007F] bg-[length:300%_100%] animate-[borderGradientRotate_5s_ease_infinite]" />

          {steps.map((step) => (
            <Step key={step.step} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};
