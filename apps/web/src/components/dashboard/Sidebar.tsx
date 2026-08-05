'use client';

import React, { useState } from 'react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'Discover',
  onSelectTab,
}) => {
  const [selected, setSelected] = useState(activeTab);

  const navItems = [
    { id: 'Discover', label: 'Discover', iconSrc: '/Discover.svg' },
    { id: 'Push Pass', label: 'Push Pass', iconSrc: '/Push Pass.svg' },
    { id: 'Invites/Squads', label: 'Invites/Squads', iconSrc: '/InviteSqaud.svg' },
    { id: 'Leaderboards', label: 'Leaderboards', iconSrc: '/LeaderBoard.svg' },
  ];

  const handleTabClick = (id: string) => {
    setSelected(id);
    if (onSelectTab) onSelectTab(id);
  };

  return (
    <aside className="w-[320px] shrink-0 flex flex-col justify-start h-full p-6 z-20 relative select-none">
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-col gap-6">
        {/* JLT Official Vector SVG Logo - Margin left and top added */}
        <div className="flex items-center gap-2 pl-3 pt-2 h-[60px] mb-2">
          <img src="/jlt.svg" alt="JLT Logo" className="w-[65px] h-[61px] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left transition-all duration-300 relative group ${
                  isActive
                    ? 'glass-pill text-white shadow-[0_0_20px_rgba(82,10,165,0.4)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Icon Image without background box */}
                <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={item.iconSrc}
                    alt={item.label}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <span className="font-gilroyMedium text-lg font-medium tracking-wide">
                  {item.label}
                </span>

                {isActive && (
                  <div className="absolute right-3 w-1.5 h-6 bg-gradient-to-b from-[#FFA28D] to-[#360C9F] rounded-full shadow-[0_0_8px_#FFA28D]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mascot Section: Slightly below (mt-10) and larger mascot (290px x 290px) */}
      <div className="relative mt-10 group cursor-pointer">
        {/* Glow behind mascot */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#340073]/40 via-[#7B2CBF]/30 to-transparent blur-2xl rounded-full scale-125 -z-10 group-hover:scale-150 transition-transform duration-500" />

        <div className="relative w-full h-[290px] flex items-center justify-center animate-float">
          <img
            src="/Mascot.svg"
            alt="JLT Mascot"
            className="w-[290px] h-[290px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
    </aside>
  );
};
