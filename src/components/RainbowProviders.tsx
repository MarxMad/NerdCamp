'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'wagmi/chains';
import React from 'react';
// import { createConfig, http } from 'wagmi';

// Definición de la red personalizada
const westendAssetHub = {
  id: 420420421,
  name: 'Westend Asset Hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    name: 'Polkadot Asset Hub Testnet',
    symbol: 'PAS', // Símbolo personalizado
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io/'] },
    public: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io/'] },
  },
  blockExplorers: {
    default: { name: 'Subscan', url: 'https://westend.subscan.io/' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'MyDentalVault',
  projectId: 'cef4d9c48d2814a64d4b2be85ad665b',
  chains: [mainnet, sepolia, westendAssetHub],
  ssr: true,
});

const queryClient = new QueryClient();

export default function RainbowProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 