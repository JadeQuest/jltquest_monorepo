import { Button } from '@jlt/ui';
import { APP_NAME } from '@jlt/constants';

export default function HomePage() {
  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Welcome to {APP_NAME} Web Frontend</h1>
      <p>Built with Next.js App Router and Shared Monorepo Packages.</p>
      <Button>Shared UI Button</Button>
    </main>
  );
}
