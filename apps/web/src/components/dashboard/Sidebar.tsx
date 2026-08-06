'use client';

import React, { useState } from 'react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'Discover', label: 'Discover', iconSrc: '/Discover.svg' },
  { id: 'Push Pass', label: 'Push Pass', iconSrc: '/Push Pass.svg' },
  { id: 'Invites/Squads', label: 'Invites/Squads', iconSrc: '/InviteSqaud.svg' },
  { id: 'Leaderboards', label: 'Leaderboards', iconSrc: '/LeaderBoard.svg' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'Discover',
  onSelectTab,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [selected, setSelected] = useState(activeTab);

  const handleTabClick = React.useCallback((id: string) => {
    setSelected(id);
    if (onSelectTab) onSelectTab(id);
    if (onMobileClose) onMobileClose();
  }, [onMobileClose, onSelectTab]);

  const navContent = (
    <>
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-col gap-6">
        {/* JLT Official Vector SVG Logo */}
        <div className="flex items-center justify-between pl-3 pt-2 h-[60px] mb-2">
          <img src="/jlt.svg" alt="JLT Logo" width={65} height={61} className="w-[65px] h-[61px] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              type="button"
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white font-bold"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.map((item) => {
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
                <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={item.iconSrc}
                    alt={item.label}
                    width={28}
                    height={28}
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

      {/* Mascot Section */}
      <div className="relative mt-6 sm:mt-8 group cursor-pointer flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#340073]/40 via-[#7B2CBF]/30 to-transparent blur-2xl rounded-full scale-125 -z-10 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative w-full h-[180px] sm:h-[240px] xl:h-[280px] flex items-center justify-center animate-float">
          <img
            src="/optimized/mascot.webp"
            alt="JLT Mascot"
            width={280}
            height={280}
            loading="lazy"
            decoding="async"
            className="w-[180px] sm:w-[240px] xl:w-[280px] h-[180px] sm:h-[240px] xl:h-[280px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] xl:w-[320px] shrink-0 flex-col justify-start h-full p-6 z-20 relative select-none">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onMobileClose}
          />
          <div className="relative w-[300px] max-w-[85vw] h-full bg-[#080411] p-6 flex flex-col justify-start z-50 border-r border-white/10 overflow-y-auto shadow-2xl animate-fade-in">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
