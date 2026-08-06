import Dashboard from '@/components/dashboard/Dashboard';
import { Web3Provider } from '@/providers/Web3Provider';

export default function DashboardPage() {
  return (
    <Web3Provider>
      <Dashboard />
    </Web3Provider>
  );
}
