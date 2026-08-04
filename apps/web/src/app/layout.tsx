export const metadata = {
  title: 'JLTQuest Web App',
  description: 'Next.js Frontend for JLTQuest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, background: '#000000', width: '100%', height: '100%', overflow: 'hidden' }}>
      <body style={{ margin: 0, padding: 0, background: '#000000', width: '100%', height: '100%', overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
