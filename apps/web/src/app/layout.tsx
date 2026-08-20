import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CookieConsentLoader } from '@/components/common/CookieConsentLoader';
import { ServiceWorkerRegistration } from '@/components/common/ServiceWorkerRegistration';
import { WalletExtensionErrorHandler } from '@/components/common/WalletExtensionErrorHandler';
import { AlertModalProvider } from '@/components/common/AlertModal';

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
    icon: [{ url: '/jltcolor.svg', type: 'image/svg+xml' }],
    shortcut: '/jltcolor.svg',
    apple: '/jltcolor.svg',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var IGNORED_PATTERNS = [
                  'Failed to connect to MetaMask',
                  'nkbihfbeogaeaoehlefnkodbefgpgknn',
                  'chrome-extension://',
                  'moz-extension://',
                  'UserRejectedRequestError',
                  'User rejected',
                  'user denied',
                  '-32002',
                  '4001',
                  'Failed to execute inlined telemetry script',
                  'telemetry script',
                  'initCCA',
                  'ObjectMultiplex',
                  'MaxListenersExceededWarning',
                  'app-init-liveness',
                  'background-liveness',
                  'Lit is in dev mode',
                  'Download the React DevTools',
                  'preloaded using link preload but not used'
                ];

                function shouldIgnore(args) {
                  try {
                    var str = '';
                    for (var i = 0; i < args.length; i++) {
                      var a = args[i];
                      if (typeof a === 'string') {
                        str += a + ' ';
                      } else if (a && (a.message || a.stack)) {
                        str += (a.message || '') + ' ' + (a.stack || '') + ' ';
                      }
                    }
                    for (var j = 0; j < IGNORED_PATTERNS.length; j++) {
                      if (str.indexOf(IGNORED_PATTERNS[j]) !== -1) {
                        return true;
                      }
                    }
                  } catch (e) {}
                  return false;
                }

                var origConsoleWarn = console.warn;
                console.warn = function() {
                  if (shouldIgnore(arguments)) return;
                  return origConsoleWarn.apply(console, arguments);
                };

                var origConsoleError = console.error;
                console.error = function() {
                  if (shouldIgnore(arguments)) return;
                  return origConsoleError.apply(console, arguments);
                };

                var origConsoleInfo = console.info;
                console.info = function() {
                  if (shouldIgnore(arguments)) return;
                  return origConsoleInfo.apply(console, arguments);
                };

                var origOnError = window.onerror;
                window.onerror = function(msg, url, line, col, error) {
                  if (shouldIgnore([msg, url, error])) return true;
                  if (origOnError) return origOnError.apply(this, arguments);
                };

                window.addEventListener('error', function(e) {
                  if (shouldIgnore([e.message, e.filename, e.error])) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var r = e.reason;
                  var m = r && (r.message || r.stack || String(r)) || '';
                  if (shouldIgnore([m, r])) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="preload" href="/icon/mascot.webp" as="image" type="image/webp" fetchPriority="high" />
      </head>
      <body
        className="bg-[#080411] text-white antialiased selection:bg-[#FFA28D]/30 selection:text-white"
        suppressHydrationWarning
      >
        <WalletExtensionErrorHandler />
        <AlertModalProvider>
          {children}
        </AlertModalProvider>
        <CookieConsentLoader />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
