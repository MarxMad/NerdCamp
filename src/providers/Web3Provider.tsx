'use client';

import React from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { moonbaseAlpha } from 'wagmi/chains';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [moonbaseAlpha],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new MetaMaskConnector({ chains })
  ],
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
} 