'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/Navbar';
import { DentalCard } from '../components/DentalCard';
import { PatientMode } from '../components/PatientMode';
import { ethers } from 'ethers';
import { DentalRecord } from '../types/dental';
import { DentistMode } from '../components/DentistMode';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserCheck, FaLock } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import contractABI from '../abi/MyDentalVault.json';

const contractAddress = "0xe3B1B985422E56Da480af78238C3bc4B82f1965B";

// Datos de ejemplo
const mockRecord: DentalRecord = {
  patientInfo: {
    nombre: "Juan Pérez",
    fechaNacimiento: "1990-05-12",
    edad: 34,
    genero: "Masculino",
    direccion: "Calle Falsa 123, Ciudad",
    contacto: "juan.perez@email.com",
    numeroSeguro: "123456789"
  },
  healthInfo: {
    alergias: ["Penicilina"],
    enfermedadesCronicas: ["Diabetes"],
    medicamentos: ["Metformina"],
    antecedentes: "Ninguno"
  },
  lastCheckup: "2024-04-01",
  generalObservation: [
    {
      fecha: "2024-04-01",
      observaciones: "Encías saludables. Sin caries.",
      doctor: "Dra. Martínez"
    }
  ],
  treatments: [
    {
      id: "1",
      type: "Limpieza",
      date: "2024-03-01",
      description: "Limpieza dental profesional.",
      dentist: "Dr. García",
      status: "completado"
    }
  ],
  xRays: [
    {
      id: "1",
      date: "2024-03-01",
      type: "Panorámica",
      ipfsHash: "Qm...",
      description: "Radiografía panorámica."
    }
  ],
  currentTreatmentPlan: "Revisión en 6 meses.",
  notes: [
    {
      id: "1",
      date: "2024-04-01",
      content: "Mantener buena higiene.",
      dentist: "Dra. Martínez"
    }
  ],
  accessGrants: [],
  attachedDocuments: [
    {
      id: "1",
      name: "Consentimiento informado",
      url: "https://ipfs.io/ipfs/Qm...",
      type: "PDF",
      uploadedAt: "2024-04-01"
    }
  ],
  nftStatus: "verificado"
};

const WESTEND_CHAIN_ID = 420420421;
const WESTEND_CHAIN_ID_HEX = '0x191d4555';

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

export default function Landing() {
  const router = useRouter();
  const [hasUser, setHasUser] = useState(false);
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
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
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetworkOk(chainId === WESTEND_CHAIN_ID_HEX);
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
    setLoading(true);
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-white flex flex-col items-center justify-between px-2 sm:px-4 pt-24 sm:pt-20">
      <Navbar showLoginButton />
      {!networkOk && (
        <div className="w-full max-w-xl mx-auto bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-center">
          <b>Debes conectarte a la red Westend Asset Hub (ChainID 420420421) para usar la aplicación.</b><br />
          Puedes agregarla manualmente en tu wallet con estos datos:<br />
          <span className="font-mono text-xs">https://testnet-passet-hub-eth-rpc.polkadot.io/</span><br />
          ChainID: <b>420420421</b> &nbsp; Símbolo: <b>PAS</b><br />
          Luego selecciona la red en el modal de conexión de wallet.<br />
          Si el problema persiste, revisa que el nodo RPC esté activo y que el ChainID coincida exactamente.
        </div>
      )}
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl text-center mt-8 sm:mt-16">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex flex-col items-center justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-2 sm:mb-0 sm:mr-3 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Image src="/Dental.png" alt="Logo" width={96} height={96} className="object-contain" />
            </div>
            <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mt-4">MyDentalVault</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Tu expediente dental, seguro y en tus manos</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="text-base sm:text-lg text-gray-700 mb-8 px-2 sm:px-0">Gestiona tu historial dental, comparte información con tu dentista y mantén tus documentos siempre accesibles y protegidos en la blockchain de Polkadot.</motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-4 w-full">
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
              className="mt-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg shadow-lg hover:scale-105 hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
            >
              Ir al dashboard
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-2 text-sm text-gray-500">
              Conecta tu wallet y regístrate para acceder a tu dashboard personalizado.
            </motion.div>
          )}
        </motion.div>
        {/* Beneficios */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="w-full max-w-3xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <FaLock className="text-3xl text-blue-500 mb-2" />
            <h3 className="font-bold text-lg mb-1">Privacidad Total</h3>
            <p className="text-gray-600 text-sm">Tus datos solo los controlas tú. Nadie accede sin tu permiso.</p>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <FaShieldAlt className="text-3xl text-purple-500 mb-2" />
            <h3 className="font-bold text-lg mb-1">Seguridad Blockchain</h3>
            <p className="text-gray-600 text-sm">Expedientes y documentos protegidos y validados en Polkadot.</p>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <FaUserCheck className="text-3xl text-green-600 mb-2" />
            <h3 className="font-bold text-lg mb-1">Acceso Universal</h3>
            <p className="text-gray-600 text-sm">Accede a tu información desde cualquier lugar y dispositivo.</p>
          </div>
        </motion.div>
      </main>
      {/* Footer */}
      <footer className="w-full py-6 flex flex-col items-center justify-center text-xs text-gray-500 mt-12">
        <span>Powered by <span className="font-bold text-purple-600">Polkadot</span> &amp; Web3</span>
        <span className="mt-1">© {new Date().getFullYear()} MyDentalVault</span>
      </footer>
    </div>
  );
}
