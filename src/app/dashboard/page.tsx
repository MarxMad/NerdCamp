/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

// 1. Agrega la declaración global si no existe:
// declare global {
//   interface Window {
//     ethereum?: unknown;
//   }
// }

export default function Dashboard() {
  const router = useRouter();
  const [isDentist, setIsDentist] = useState(false);
  const { address, isConnected } = useAccount();
  const provider = typeof window !== 'undefined' && window.ethereum
    ? new ethers.providers.Web3Provider(window.ethereum)
    : undefined;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    walletPaciente: '',
    nombre: '',
    fechaNacimiento: '',
    edad: '',
    genero: '',
    direccion: '',
    contacto: '',
    numeroSeguro: '',
    alergias: '',
    enfermedadesCronicas: '',
    medicamentos: '',
    antecedentes: ''
  });
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [errorExpediente, setErrorExpediente] = useState('');
  const [successExpediente, setSuccessExpediente] = useState('');

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

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingExpediente(true);
    setErrorExpediente('');
    setSuccessExpediente('');

    try {
      // 1. Leer expedientes existentes
      const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
      // 2. Agregar el nuevo expediente con campos requeridos
      expedientes.push({
        ...newRecord,
        dentista: address,
        paciente: newRecord.walletPaciente,
        tipo: 'expediente',
        fecha: new Date().toISOString(),
        datos: {
          nombre: newRecord.nombre,
          fechaNacimiento: newRecord.fechaNacimiento,
          edad: Number(newRecord.edad),
          genero: newRecord.genero,
          direccion: newRecord.direccion,
          contacto: newRecord.contacto,
          numeroSeguro: newRecord.numeroSeguro,
          alergias: newRecord.alergias.split(',').map(a => a.trim()).filter(Boolean),
          enfermedadesCronicas: newRecord.enfermedadesCronicas.split(',').map(e => e.trim()).filter(Boolean),
          medicamentos: newRecord.medicamentos.split(',').map(m => m.trim()).filter(Boolean),
          antecedentes: newRecord.antecedentes,
        }
      });
      // 3. Guardar de nuevo en localStorage
      localStorage.setItem('expedientes', JSON.stringify(expedientes));
      // Disparar evento 'storage' manualmente para actualizar PatientMode
      window.dispatchEvent(new StorageEvent('storage', { key: 'expedientes' }));
      setSuccessExpediente('Expediente creado exitosamente');
      setShowCreateForm(false);
      // 4. Limpiar el formulario
      setNewRecord({
        walletPaciente: '',
        nombre: '',
        fechaNacimiento: '',
        edad: '',
        genero: '',
        direccion: '',
        contacto: '',
        numeroSeguro: '',
        alergias: '',
        enfermedadesCronicas: '',
        medicamentos: '',
        antecedentes: ''
      });
    } catch (error) {
      console.error('Error al crear expediente:', error);
      setErrorExpediente('Hubo un error al crear el expediente');
    } finally {
      setLoadingExpediente(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-20">
      <Navbar onConnect={() => {}} isDentist={isDentist} onToggleMode={() => {}} />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              {!isDentist ? (
                <PatientMode
                  provider={provider}
                  patientAddress={address}
                />
              ) : (
                <DentistMode />
              )}
            </div>
            <div className="mt-4 lg:mt-0">
              {isDentist ? (
                <>
                  <DentalCard
                    mode="dentista"
                    dentistName="Dr. García"
                    dentistAddress="0x456..."
                    specialty="Ortodoncista"
                    rating={4.8}
                    patientsCount={12}
                    isDentistVerified={true}
                  />
                  <div className="flex flex-col items-center mt-8">
                    <button
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-green-600 hover:to-blue-600 transition mb-4"
                      onClick={() => setShowCreateForm((prev) => !prev)}
                    >
                      {showCreateForm ? 'Cerrar formulario' : 'Crear nuevo expediente'}
                    </button>
                    {showCreateForm && (
                      <form onSubmit={handleCreateRecord} className="w-full max-w-lg bg-white rounded-lg shadow p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Nuevo Expediente de Paciente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Wallet del Paciente</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.walletPaciente} onChange={e => setNewRecord({ ...newRecord, walletPaciente: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nombre</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.nombre} onChange={e => setNewRecord({ ...newRecord, nombre: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Fecha de nacimiento</label>
                            <input type="date" className="w-full p-2 border rounded text-black" value={newRecord.fechaNacimiento} onChange={e => setNewRecord({ ...newRecord, fechaNacimiento: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Edad</label>
                            <input type="number" className="w-full p-2 border rounded text-black" value={newRecord.edad} onChange={e => setNewRecord({ ...newRecord, edad: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Género</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.genero} onChange={e => setNewRecord({ ...newRecord, genero: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Dirección</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.direccion} onChange={e => setNewRecord({ ...newRecord, direccion: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Contacto</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.contacto} onChange={e => setNewRecord({ ...newRecord, contacto: e.target.value })} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Número de Seguro</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.numeroSeguro} onChange={e => setNewRecord({ ...newRecord, numeroSeguro: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Alergias (separadas por coma)</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.alergias} onChange={e => setNewRecord({ ...newRecord, alergias: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Enfermedades Crónicas (separadas por coma)</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.enfermedadesCronicas} onChange={e => setNewRecord({ ...newRecord, enfermedadesCronicas: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Medicamentos (separados por coma)</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.medicamentos} onChange={e => setNewRecord({ ...newRecord, medicamentos: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Antecedentes</label>
                            <input type="text" className="w-full p-2 border rounded text-black" value={newRecord.antecedentes} onChange={e => setNewRecord({ ...newRecord, antecedentes: e.target.value })} />
                          </div>
                        </div>
                        <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold mt-4">Guardar Expediente</button>
                        {loadingExpediente && <p className="text-blue-600 text-sm mt-2">Guardando expediente...</p>}
                        {errorExpediente && <p className="text-red-500 text-sm mt-2">{errorExpediente}</p>}
                        {successExpediente && <p className="text-green-600 text-sm mt-2">{successExpediente}</p>}
                      </form>
                    )}
                  </div>
                </>
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