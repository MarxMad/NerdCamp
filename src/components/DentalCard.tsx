'use client';

import React from 'react';

interface DentalCardProps {
  mode: 'paciente' | 'dentista';
  patientName?: string;
  patientAddress?: string;
  lastCheckup?: string;
  activeTreatments?: number;
  isVerified?: boolean;
  // Props para dentista
  dentistName?: string;
  dentistAddress?: string;
  specialty?: string;
  rating?: number;
  patientsCount?: number;
  isDentistVerified?: boolean;
}

export const DentalCard: React.FC<DentalCardProps> = ({
  mode,
  patientName,
  patientAddress,
  lastCheckup,
  activeTreatments,
  isVerified,
  dentistName,
  dentistAddress,
  specialty,
  rating,
  patientsCount,
  isDentistVerified,
}) => {
  if (mode === 'dentista') {
    return (
      <div className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-green-200 via-green-400 to-green-600 w-full max-w-md mx-auto mt-4 sm:mt-0 sm:ml-4 break-words">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Carnet Dentista</h2>
          {isDentistVerified && (
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold text-gray-900">Dentista Verificado</span>
          )}
        </div>
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-lg mb-1 text-gray-900">Información del Dentista</h3>
          <p className="text-sm text-gray-800">{dentistName}</p>
          <p className="text-xs break-all text-gray-700">{dentistAddress}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-lg mb-1 text-gray-900">Especialidad</h3>
          <p className="text-sm text-gray-800">{specialty}</p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-4 flex-1">
            <h4 className="font-semibold text-sm mb-1 text-gray-900">Rating</h4>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${rating && i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-800">{rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 flex-1">
            <h4 className="font-semibold text-sm mb-1 text-gray-900">Pacientes Atendidos</h4>
            <p className="text-lg font-bold text-gray-900">{patientsCount ?? 0}</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-700">Verificado en la Blockchain de Polkadot</div>
      </div>
    );
  }

  // Modo paciente (por defecto)
  return (
    <div className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-blue-200 via-purple-300 to-purple-600 w-full max-w-md mx-auto mt-4 sm:mt-0 sm:ml-4 break-words">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Carnet Dental Digital</h2>
        {isVerified && (
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold text-gray-900">NFT Verificado</span>
        )}
      </div>
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-lg mb-1 text-gray-900">Información del Paciente</h3>
        <p className="text-sm text-gray-800">{patientName}</p>
        <p className="text-xs break-all text-gray-700">{patientAddress}</p>
      </div>
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-lg mb-1 text-gray-900">Estado Actual</h3>
        <p className="text-sm text-gray-800">Última Revisión: {lastCheckup}</p>
        <p className="text-sm text-gray-800">Tratamientos Activos: {activeTreatments}</p>
      </div>
      <div className="mt-4 text-xs text-gray-700">Verificado en la Blockchain de Polkadot</div>
    </div>
  );
}; 