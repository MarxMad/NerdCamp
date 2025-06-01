'use client';
import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { DentalCard } from '../../components/DentalCard';
import { PatientMode } from '../../components/PatientMode';
import { ethers } from 'ethers';
import { DentalRecord } from '../../types/dental';
import { DentistMode } from '../../components/DentistMode';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

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

export default function Dashboard() {
  const router = useRouter();
  const [isDentist, setIsDentist] = useState(false);
  const { address, isConnected } = useAccount();
  const provider = typeof window !== 'undefined' && (window as any).ethereum
    ? new ethers.providers.Web3Provider((window as any).ethereum)
    : undefined;

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.tipo) {
      router.push('/login');
      return;
    }
    setIsDentist(user.tipo === 'dentista');
  }, [router, isConnected]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-20">
      <Navbar onConnect={() => {}} isDentist={isDentist} onToggleMode={() => {}} />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              {!isDentist ? (
                <PatientMode
                  record={mockRecord}
                  provider={provider}
                  patientAddress={address}
                />
              ) : (
                <DentistMode provider={provider} />
              )}
            </div>
            <div className="mt-4 lg:mt-0">
              {isDentist ? (
                <DentalCard
                  mode="dentista"
                  dentistName="Dr. García"
                  dentistAddress="0x456..."
                  specialty="Ortodoncista"
                  rating={4.8}
                  patientsCount={12}
                  isDentistVerified={true}
                />
              ) : (
                <DentalCard
                  mode="paciente"
                  patientName="Juan Pérez"
                  patientAddress={address || '0x123...'}
                  lastCheckup="15/03/2024"
                  activeTreatments={2}
                  isVerified={true}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 