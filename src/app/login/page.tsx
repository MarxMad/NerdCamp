'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '../../components/WalletConnect';
import { useAccount } from 'wagmi';

export default function Login() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.wallet && user.wallet.toLowerCase() === address.toLowerCase()) {
        if (user.tipo === 'paciente' || user.tipo === 'dentista') {
          setError('');
          router.push('/dashboard');
          return;
        }
      }
      setError('Wallet no registrada. Por favor regístrate primero.');
    }
  }, [isConnected, address, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white px-2 sm:px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">Iniciar Sesión</h2>
        <div className="space-y-3 sm:space-y-4">
          <WalletConnect />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
} 