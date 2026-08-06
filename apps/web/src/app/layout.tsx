import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CookieConsentLoader } from '@/components/common/CookieConsentLoader';
import { ServiceWorkerRegistration } from '@/components/common/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'JLTQuest — Play Daily, Earn Real Perks & Collect Rares',
  description: 'Complete quests, earn JLT coins, spin for rare passes, and climb the leaderboard in the JaxMart ecosystem.',
  keywords: ['JLTQuest', 'JaxMart', 'Daily Quests', 'Spin to Win', 'Reward Pass', 'JLT Coin'],
  authors: [{ name: 'JLTQuest Team' }],
  metadataBase: new URL('https://jltquest.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JLTQuest — Play Daily & Earn Real Perks',
    description: 'Complete quick daily missions, spin for rare passes, and build your reward streak.',
    url: 'https://jltquest.io',
    siteName: 'JLTQuest',
    type: 'website',
    images: [
      {
        url: '/optimized/dashboard-bg.webp',
        width: 1200,
        height: 630,
        alt: 'JLTQuest rewards dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JLTQuest — Play Daily & Earn Real Perks',
    description: 'Complete quick daily missions, spin for rare passes, and build your reward streak.',
    images: ['/optimized/dashboard-bg.webp'],
  },
  icons: {
    icon: [{ url: '/jlt.svg', type: 'image/svg+xml' }],
    shortcut: '/jlt.svg',
    apple: '/jlt.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#080411',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-gilroyRegular dark" style={{ margin: 0, padding: 0, background: '#080411', width: '100%' }}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/jlt.svg" />
        <link rel="shortcut icon" href="/jlt.svg" />

        {/* Preconnect to Font domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Font Loading with font-display: swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Black+Ops+One&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />

        {/* Preload critical assets for instant splash rendering */}
        <link rel="preload" href="/optimized/mascot.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/jlt.svg" as="image" type="image/svg+xml" />
      </head>
      <body
        className="font-gilroyRegular bg-[#080411] text-white antialiased selection:bg-[#FFA28D]/30 selection:text-white"
        style={{ margin: 0, padding: 0, background: '#080411', width: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {children}
        <CookieConsentLoader />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
