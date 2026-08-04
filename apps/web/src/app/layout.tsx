export const metadata = {
  title: 'JLTQuest Web App',
  description: 'Next.js Frontend for JLTQuest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
