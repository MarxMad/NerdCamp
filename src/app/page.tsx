/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/Navbar';
// import { DentalCard } from '../components/DentalCard';
// import { PatientMode } from '../components/PatientMode';
import { ethers } from 'ethers';
// import { DentalRecord } from '../types/dental';
// import { DentistMode } from '../components/DentistMode';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserCheck, FaLock } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import contractABI from '../abi/MyDentalVault.json';

const contractAddress = "0xe3B1B985422E56Da480af78238C3bc4B82f1965B";

// Datos de ejemplo
// const mockRecord: DentalRecord = {
// ... existing code ...
// };

// const WESTEND_CHAIN_ID = 420420421;
const WESTEND_CHAIN_ID_HEX = '0x191d4555';

// declare global {
//   interface Window {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     ethereum?: unknown;
//   }
// }

export default function Landing() {
  const router = useRouter();
  const [hasUser, setHasUser] = useState(false);
  const { address, isConnected } = useAccount();
  // const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [rol, setRol] = useState<number | null>(null);
  const [networkOk, setNetworkOk] = useState(true);

  useEffect(() => {
    const fetchRol = async () => {
      if (isConnected && address && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          const rolOnChain = await contract.miRol();
          setRol(Number(rolOnChain));
          let tipo = "";
          if (Number(rolOnChain) === 1) tipo = "paciente";
          if (Number(rolOnChain) === 2) tipo = "dentista";
          localStorage.setItem('user', JSON.stringify({ wallet: address, tipo }));
          setHasUser(tipo === 'paciente' || tipo === 'dentista');
        } catch (error) {
          console.error('Error al obtener rol:', error);
          setRol(0);
          setHasUser(false);
        }
      } else {
        setRol(null);
        setHasUser(false);
      }
    };
    fetchRol();
  }, [isConnected, address]);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetworkOk(chainId === WESTEND_CHAIN_ID_HEX);
        } catch (err) {
          // Si el método no es soportado, asume que la red es correcta para la demo
          setNetworkOk(true);
          // Opcional: console.warn('eth_chainId no soportado por el provider', err);
        }
      }
    };
    checkNetwork();
  }, [isConnected]);

  useEffect(() => {
    const handleChainChanged = () => {
      window.location.reload();
    };
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const registrar = async (tipo: "paciente" | "dentista") => {
    // setLoading(true);
    setMensaje("");
    try {
      if (!window.ethereum) throw new Error("Conecta tu wallet");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      console.log("Red actual:", network);
      console.log("Dirección del contrato:", contractAddress);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      let tx;
      if (tipo === "paciente") {
        console.log("Llamando a registrarPaciente...");
        tx = await contract.registrarPaciente();
      } else {
        console.log("Llamando a registrarDentista...");
        tx = await contract.registrarDentista();
      }
      await tx.wait();
      setMensaje(`¡${tipo === "paciente" ? "Paciente" : "Dentista"} registrado correctamente!`);
    } catch (err: unknown) {
      let mensajeError = 'Error desconocido';
      if (err && typeof err === 'object') {
        const errorObj = err as { reason?: string; message?: string };
        if (errorObj.reason) {
          mensajeError = errorObj.reason;
        } else if (errorObj.message) {
          mensajeError = errorObj.message;
        }
      }
      setMensaje('Error: ' + mensajeError);
      console.error(err);
    }
    // setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-white flex flex-col items-center justify-between px-2 sm:px-6 pt-28 sm:pt-24">
      <Navbar showLoginButton />
      {!networkOk && (
        <div className="w-full max-w-2xl mx-auto bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded mb-8 text-center mt-8 shadow-lg z-20 relative" style={{marginTop: '5.5rem'}}>
          <b>Debes conectarte a la red Westend Asset Hub (ChainID 420420421) para usar la aplicación.</b><br />
          Puedes agregarla manualmente en tu wallet con estos datos:<br />
          <span className="font-mono text-xs">https://testnet-passet-hub-eth-rpc.polkadot.io/</span><br />
          ChainID: <b>420420421</b> &nbsp; Símbolo: <b>PAS</b><br />
          Luego selecciona la red en el modal de conexión de wallet.<br />
          Si el problema persiste, revisa que el nodo RPC esté activo y que el ChainID coincida exactamente.
        </div>
      )}
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl text-center mt-10 sm:mt-20 px-2">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex flex-col items-center justify-center mb-8">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-3xl flex items-center justify-center mb-4 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl border-4 border-white">
              <Image src="/Dental.png" alt="Logo" width={200} height={200} className="object-contain" />
            </div>
            <span className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mt-4 drop-shadow-lg">MyDentalVault</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Tu expediente dental, seguro y en tus manos</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="text-base sm:text-lg text-gray-700 mb-10 px-2 sm:px-0">Gestiona tu historial dental, comparte información con tu dentista y mantén tus documentos siempre accesibles y protegidos en la blockchain de Polkadot.</motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 w-full">
            <button
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg shadow-lg hover:scale-105 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                if (!isConnected) {
                  alert('Por favor conecta tu wallet antes de continuar.');
                  return;
                }
                registrar("paciente");
              }}
            >
              <FaUserCheck className="text-xl" /> Registrarme como Paciente
            </button>
            <button
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-green-400 to-green-700 text-white text-lg shadow-lg hover:scale-105 hover:from-green-500 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                if (!isConnected) {
                  alert('Por favor conecta tu wallet antes de continuar.');
                  return;
                }
                registrar("dentista");
              }}
            >
              <FaShieldAlt className="text-xl" /> Registrarme como Dentista
            </button>
          </motion.div>
          {mensaje && (
            <div className="mt-2 text-sm" style={{ color: mensaje.startsWith("Error") ? "red" : "green" }}>
              {mensaje}
            </div>
          )}
          {/* Mostrar el rol actual */}
          {isConnected && (
            <div className="mt-2 text-sm text-gray-700">
              <b>Tu rol actual:</b> {rol === 1 ? "Paciente" : rol === 2 ? "Dentista" : "No registrado"}
            </div>
          )}
          {hasUser ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              onClick={() => router.push('/dashboard')}
              className="mt-4 w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg shadow-lg hover:scale-105 hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
            >
              Ir al dashboard
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-4 text-sm text-gray-500">
              Conecta tu wallet y regístrate para acceder a tu dashboard personalizado.
            </motion.div>
          )}
        </motion.div>
        {/* Beneficios */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="w-full max-w-3xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 px-2">
          <div className="bg-white/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-200 transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
            <FaLock className="text-5xl text-blue-500 mb-4" />
            <h3 className="font-extrabold text-2xl mb-3 text-gray-900">Privacidad Total</h3>
            <p className="text-gray-900 text-lg font-medium text-center">Tus datos solo los controlas tú. Nadie accede sin tu permiso.</p>
          </div>
          <div className="bg-white/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-200 transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
            <FaShieldAlt className="text-5xl text-purple-500 mb-4" />
            <h3 className="font-extrabold text-2xl mb-3 text-gray-900">Seguridad Blockchain</h3>
            <p className="text-gray-900 text-lg font-medium text-center">Expedientes y documentos protegidos y validados en Polkadot.</p>
          </div>
          <div className="bg-white/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-200 transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
            <FaUserCheck className="text-5xl text-green-600 mb-4" />
            <h3 className="font-extrabold text-2xl mb-3 text-gray-900">Acceso Universal</h3>
            <p className="text-gray-900 text-lg font-medium text-center">Accede a tu información desde cualquier lugar y dispositivo.</p>
          </div>
        </motion.div>
      </main>
      {/* Footer */}
      <footer className="w-full py-8 flex flex-col items-center justify-center text-sm text-gray-500 mt-16 bg-transparent">
        <span>Powered by <span className="font-bold text-purple-600">Polkadot</span> &amp; Web3</span>
        <span className="mt-1">© {new Date().getFullYear()} MyDentalVault</span>
      </footer>
    </div>
  );
}
