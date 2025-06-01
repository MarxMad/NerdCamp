'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

interface WalletConnectProps {
  onConnect?: (provider: any, address: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = () => {
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    localStorage.removeItem('user');
    disconnect();
  };

  return (
    <div>
      <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
      {/* Botón de desconexión manual (opcional, si quieres mostrarlo aparte):
      <button onClick={handleDisconnect}>Desconectar</button>
      */}
    </div>
  );
}; 