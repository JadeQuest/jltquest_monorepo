import { Web3Provider } from '@/providers/Web3Provider';
import { Layout } from '@/components/dashboard/Layout';

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <Layout>
        {children}
      </Layout>
    </Web3Provider>
  );
}
