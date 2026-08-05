import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JLTQuest Web App',
  description: 'Complete quests, earn JLT coins, and climb the leaderboard — all within the JaxMart ecosystem.',
  icons: {
    icon: [
      { url: '/jlt.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/jlt.svg',
    apple: '/jlt.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-gilroyRegular" style={{ margin: 0, padding: 0, background: '#080411', width: '100%' }}>
      <head>
        {/* Explicit favicon link — resolves the /favicon.ico 404 */}
        <link rel="icon" type="image/svg+xml" href="/jlt.svg" />
        <link rel="shortcut icon" href="/jlt.svg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Black+Ops+One&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-gilroyRegular"
        style={{ margin: 0, padding: 0, background: '#080411', width: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
