import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CookieConsentLoader } from '@/components/common/CookieConsentLoader';
import { ServiceWorkerRegistration } from '@/components/common/ServiceWorkerRegistration';
// Plus Jakarta Sans standard CSS variable fallback for Turbopack compatibility
const fontVariable = '--font-plus-jakarta-sans';

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
        url: '/dashboard-bg.webp',
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
    images: ['/dashboard-bg.webp'],
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
    <html lang="en" className="dark" style={{ background: '#080411' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Preload critical assets for instant splash rendering */}
        <link rel="preload" href="/icon/mascot.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/jlt.svg" as="image" type="image/svg+xml" />
      </head>
      <body
        className="bg-[#080411] text-white antialiased selection:bg-[#FFA28D]/30 selection:text-white"
        style={{ fontFamily: 'var(--font-plus-jakarta-sans), system-ui, sans-serif' }}
      >
        {children}
        <CookieConsentLoader />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
