'use client';

import React, { useState, useEffect } from 'react';
import { type Connector, useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, X, Check, Copy, ExternalLink, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { isUserRejectedError } from '@/lib/web3Error';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping & fallback icons for popular Web3 wallets
const WALLET_ICONS: Record<string, string> = {
  metamask: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
  coinbasewalletsdk: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.svg',
  walletconnect: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.svg',
  rainbow: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/rainbowWallet/rainbowWallet.svg',
  injected: '/Rectangle 11989.svg',
};

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connectAsync, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const [copied, setCopied] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = async (connector: Connector) => {
    try {
      setConnectingId(connector.id);
      await connectAsync({ connector });
      onClose();
    } catch (err: unknown) {
      if (isUserRejectedError(err)) {
        console.log('User cancelled wallet connection prompt.');
      } else if (process.env.NODE_ENV !== 'production') {
        console.error('Wallet connection error:', err);
      }
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in font-gilroyRegular select-none">
      {/* Centered Glassmorphic Card */}
      <div className="relative w-full max-w-md glass-panel bg-[#0E061F]/95 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 flex flex-col gap-5 text-white backdrop-blur-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,162,141,0.4)]">
              <Wallet className="w-4 h-4 text-[#FFA28D]" />
            </div>
            <h3 className="font-gilroyBold text-base sm:text-lg text-white tracking-tight">
              {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </h3>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isConnected && address ? (
          /* Connected State Details */
          <div className="flex flex-col gap-4">
            <div className="glass-pill p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-gilroyMedium">Connected Account</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-gilroyBold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-gilroyBold text-sm sm:text-base text-white tracking-wide">
                  {formatAddress(address)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAddress}
                    type="button"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {chain && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                  <span>Network</span>
                  <span className="font-gilroyBold text-purple-200">{chain.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                disconnect();
                onClose();
              }}
              type="button"
              className="glass-pill w-full py-3 rounded-xl font-gilroyBold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        ) : (
          /* Disconnected State: Wallet Connectors List */
          <div className="flex flex-col gap-3">
            <p className="text-gray-300 text-xs sm:text-sm font-gilroyRegular leading-relaxed">
              Choose your Web3 wallet provider to log in and unlock daily quests:
            </p>

            {connectError && !isUserRejectedError(connectError) && (
              <div className="glass-pill p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{connectError.message || 'Failed to connect. Please try again.'}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {connectors.map((connector) => {
                const iconUrl = WALLET_ICONS[connector.id.toLowerCase()] || WALLET_ICONS.injected;
                const isConnecting = connectingId === connector.id;

                return (
                  <button
                    key={connector.uid || connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isConnecting}
                    type="button"
                    className="glass-pill p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-purple-400/50 flex items-center justify-between transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 p-1.5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                        <img
                          src={iconUrl}
                          alt={connector.name}
                          width={32}
                          height={32}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Rectangle 11989.svg';
                          }}
                        />
                      </div>
                      <span className="font-gilroyBold text-sm text-white tracking-wide group-hover:text-[#FFA28D] transition-colors">
                        {connector.name}
                      </span>
                    </div>

                    {isConnecting ? (
                      <span className="text-xs text-purple-300 font-gilroyMedium animate-pulse">Connecting...</span>
                    ) : (
                      <span className="text-xs text-gray-400 group-hover:text-white font-gilroyMedium transition-colors">
                        Connect →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-gilroyRegular pt-2 border-t border-white/10">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> Encrypted Connection
          </span>
          <span>EVM Compatible</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
