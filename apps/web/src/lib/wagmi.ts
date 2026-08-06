import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'JLTQuest',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '044651f65486b196f163bea378575ecf',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
});
