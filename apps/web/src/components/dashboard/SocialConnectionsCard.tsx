'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocial } from '@/hooks/useSocial';
import { JLTLoader } from '@/components/common/JLTLoader';

// Custom SVG Icons for exact visual matching & reliability
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.8 14.16c-.24.68-1.2 1.3-1.66 1.34-.44.04-1.01.18-3.32-.73-2.96-1.16-4.86-4.14-5.01-4.34-.14-.19-1.2-1.59-1.2-3.04 0-1.45.76-2.16 1.03-2.45.24-.26.52-.33.7-.33.18 0 .36.01.52.01.17 0 .4-.06.63.48.24.57.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.3-.29.47-.14.17-.3.38-.43.51-.14.14-.29.3-.13.57.17.28.75 1.23 1.6 1.99 1.1.98 2.03 1.29 2.32 1.43.29.14.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.38-.24.64-.14.26.09 1.66.78 1.95.92.29.14.48.22.55.34.07.13.07.75-.17 1.43z"/>
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

interface SocialPlatformConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: 'text-[#0A66C2]',
    bgColor: 'bg-[#0A66C2]/20',
    borderColor: 'border-[#0A66C2]/40',
  },
  {
    id: 'x',
    name: 'X',
    icon: XIcon,
    color: 'text-white',
    bgColor: 'bg-white/20',
    borderColor: 'border-white/40',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: TelegramIcon,
    color: 'text-[#229ED9]',
    bgColor: 'bg-[#229ED9]/20',
    borderColor: 'border-[#229ED9]/40',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/20',
    borderColor: 'border-[#25D366]/40',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: DiscordIcon,
    color: 'text-[#5865F2]',
    bgColor: 'bg-[#5865F2]/20',
    borderColor: 'border-[#5865F2]/40',
  },
  {
    id: 'email',
    name: 'Email',
    icon: EmailIcon,
    color: 'text-[#EA4335]',
    bgColor: 'bg-[#EA4335]/20',
    borderColor: 'border-[#EA4335]/40',
  },
];

const SocialConnectionsCardComponent: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { data: dashboardData } = useDashboard();
  const { connect, disconnect, getOAuthUrl } = useSocial();
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  const isLoggedOut = !isConnected || !address;
  const connections = dashboardData?.socialConnections || {};

  const handlePlatformClick = async (platformId: string) => {
    if (isLoggedOut) return;

    const isConnectedPlatform = connections[platformId]?.connected;

    try {
      setLoadingPlatform(platformId);
      if (isConnectedPlatform) {
        await disconnect(platformId);
      } else {
        const linkData = await getOAuthUrl(platformId);
        if (linkData?.oauthUrl) {
          if (linkData.type === 'deeplink') {
            window.location.href = linkData.oauthUrl;
          } else {
            window.open(linkData.oauthUrl, '_blank');
          }
        }
        await connect({ platform: platformId });
      }
    } catch (err: any) {
      console.error(`Failed to toggle ${platformId}`, err);
    } finally {
      setLoadingPlatform(null);
    }
  };

  return (
    <div className="daily-card-panel p-5 sm:p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden select-none">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-white font-gilroyBold text-xl sm:text-2xl font-bold tracking-tight">
            Social Connections
          </h2>
          <p className="text-purple-200 font-gilroyRegular text-xs sm:text-sm opacity-85">
            Link your social profiles to verify identity, earn GP &amp; unlock exclusive quests
          </p>
        </div>
      </div>

      {/* 6 Social Media Platform Icons Bar */}
      <div className="grid grid-cols-6 gap-2 sm:gap-4 my-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isConn = !isLoggedOut && !!connections[platform.id]?.connected;
          const isLoading = loadingPlatform === platform.id;

          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformClick(platform.id)}
              disabled={isLoggedOut || isLoading}
              type="button"
              className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                isConn
                  ? `${platform.bgColor} ${platform.borderColor} shadow-[0_0_15px_rgba(255,255,255,0.15)]`
                  : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-purple-400/50'
              } ${isLoggedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`${platform.name} ${isConn ? '(Connected)' : '(Click to Connect)'}`}
            >
              {/* Connected Indicator Dot */}
              {isConn && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              )}

              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                {isLoading ? (
                  <JLTLoader variant="inline" size="sm" />
                ) : (
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isConn ? platform.color : 'text-gray-300 group-hover:text-white'}`} />
                )}
              </div>

              <span className="font-gilroyMedium text-[10px] sm:text-xs text-gray-300 group-hover:text-white mt-1.5 truncate max-w-full">
                {platform.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const SocialConnectionsCard = React.memo(SocialConnectionsCardComponent);
