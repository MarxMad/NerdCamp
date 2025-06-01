'use client';

import React, { useState, useEffect } from 'react';
import { WalletConnect } from './WalletConnect';
// import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from 'ethers';

interface NavbarProps {
  onConnect?: (provider: ethers.providers.Web3Provider | undefined, address: string) => void;
  isDentist?: boolean;
  onToggleMode?: () => void;
  showLoginButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onConnect,
  isDentist,
  onToggleMode,
  showLoginButton,
}) => {
  // const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // const [error, setError] = useState('');
  // const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /* Comentado por no uso
  const handleWalletConnect = (_provider: ethers.providers.Web3Provider | undefined, address: string) => {
    // Buscar usuario en localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.wallet && user.wallet.toLowerCase() === address.toLowerCase()) {
      if (user.tipo === 'paciente' || user.tipo === 'dentista') {
        setWalletConnected(true);
        setError('');
        router.push('/dashboard');
        return;
      }
    }
    setError('Wallet no registrada. Por favor regístrate primero.');
  };
  */

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center min-h-[110px] sm:h-16 py-2 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center justify-center mb-1 sm:mb-0 w-full sm:w-auto">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  <Image src="/Dental.png" alt="Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  MyDentalVault
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto justify-center sm:justify-end gap-2 sm:gap-4">
            {showLoginButton && isClient ? (
              <>
                <div className="flex flex-col w-full sm:w-auto gap-2">
                  <div className="flex w-full sm:w-auto">
                    <WalletConnect />
                  </div>
                  
                </div>
                {/* error && <span className="ml-2 text-red-500 text-sm">{error}</span> */}
              </>
            ) : showLoginButton ? null : (
              <>
                <button
                  onClick={onToggleMode}
                  className="w-full sm:w-auto mb-2 sm:mb-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {isDentist ? 'Modo Dentista' : 'Modo Paciente'}
                </button>
                <div className="w-full sm:w-auto">
                  {onConnect && <WalletConnect onConnect={onConnect} />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 