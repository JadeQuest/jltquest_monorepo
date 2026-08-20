'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { Sidebar } from './Sidebar';
import { HeaderStatus } from './HeaderStatus';

const ConnectWalletModal = dynamic(
  () => import('@/components/common/ConnectWalletModal').then((mod) => mod.ConnectWalletModal),
  {
    ssr: false,
    loading: () => null,
  },
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open modal automatically only if explicitly disconnected
  useEffect(() => {
    if (mounted && status === 'disconnected') {
      setIsConnectModalOpen(true);
    }
  }, [mounted, status]);

  const openMobileMenu = React.useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = React.useCallback(() => setMobileMenuOpen(false), []);
  const openConnectModal = React.useCallback(() => setIsConnectModalOpen(true), []);
  const closeConnectModal = React.useCallback(() => setIsConnectModalOpen(false), []);

  return (
    <div className="w-full min-h-screen lg:h-screen bg-[#080411] text-white flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden relative font-gilroyRegular">
      {/* Main Dashboard Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/Dashboard.png')",
        }}
      />

      {/* Background Ambient Radial Blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[650px] h-[650px] rounded-full bg-radial from-[#360C9F]/40 via-[#340073]/20 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[800px] h-[800px] rounded-full bg-radial from-[#7B2CBF]/30 via-[#340073]/15 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-radial from-[#FFA28D]/10 via-transparent to-transparent blur-[100px] pointer-events-none z-0" />

      {/* Left Sidebar */}
      <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={closeMobileMenu} />

      {/* Right Panel: Fixed Header + Scrollable Dashboard Body */}
      <div className="flex-1 flex flex-col h-full min-w-0 z-10 overflow-hidden relative">
        {/* Top Header Status Bar */}
        <HeaderStatus
          onToggleMobileMenu={openMobileMenu}
          onConnectClick={openConnectModal}
        />

        {/* Scrollable Dashboard Content Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Centered Glassmorphic Connect Wallet Modal Popup covering entire viewport including Sidebar */}
      {mounted && isConnectModalOpen && <ConnectWalletModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />}
    </div>
  );
};
