import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';
const isBrowser = typeof window !== 'undefined';

const mainnet = defineChain({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ethereum-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
});

const polygon = defineChain({
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://polygon-bor-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
});

const optimism = defineChain({
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://optimism-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
  },
});

const arbitrum = defineChain({
  id: 42161,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://arbitrum-one-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
});

const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://base-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
});

const sepolia = defineChain({
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
});

export const config = createConfig({
  ssr: true,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  connectors: isBrowser
    ? [
        injected({ shimDisconnect: true }),
        coinbaseWallet({ appName: 'JLTQuest' }),
        walletConnect({
          projectId,
          metadata: {
            name: 'JLTQuest',
            description: 'Complete daily quests, earn JLT coins, and collect rare passes.',
            url: 'https://jltquest.io',
            icons: ['https://jltquest.io/jlt.svg'],
          },
          showQrModal: true,
        }),
      ]
    : [],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});
