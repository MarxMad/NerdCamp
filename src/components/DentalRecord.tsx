'use client';

import React, { useState } from 'react';
import { DentalRecord as DentalRecordType } from '../types/dental';
import { signAccessGrant } from '../services/access';
import { ethers } from 'ethers';

interface DentalRecordProps {
  record: DentalRecordType;
  isDentist?: boolean;
  onGrantAccess?: (dentistAddress: string, days: number) => void;
  onAddNote?: (content: string) => void;
  provider?: ethers.providers.Web3Provider;
  patientAddress?: string;
}

export const DentalRecord: React.FC<DentalRecordProps> = ({
  record,
  isDentist = false,
  onGrantAccess,
  onAddNote,
  provider,
  patientAddress,
}) => {
  const [newNote, setNewNote] = useState('');
  const [dentistAddress, setDentistAddress] = useState('');
  const [accessDays, setAccessDays] = useState(7);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrantAccess = async () => {
    if (!provider || !patientAddress) {
      setError('No hay wallet conectada');
      return;
    }

    try {
      setIsGrantingAccess(true);
      setError(null);

      const signature = await signAccessGrant(
        provider,
        patientAddress,
        dentistAddress,
        accessDays
      );

      if (onGrantAccess) {
        onGrantAccess(dentistAddress, accessDays);
      }

      console.log('Firma generada:', signature);
    } catch (err) {
      setError('Error al firmar el acceso');
      console.error(err);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Expediente Dental</h2>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Última Revisión</h3>
          <p className="text-blue-800">{record.lastCheckup}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tratamientos Anteriores</h3>
          <div className="space-y-4">
            {record.treatments.map((treatment) => (
              <div key={treatment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{treatment.type}</p>
                    <p className="text-sm text-gray-500">{treatment.date}</p>
                  </div>
                  <span className="text-sm text-gray-500">Dr. {treatment.dentist}</span>
                </div>
                <p className="mt-2 text-gray-700">{treatment.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Radiografías</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.xRays.map((xray) => (
              <div key={xray.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="font-medium text-gray-900">{xray.type}</p>
                <p className="text-sm text-gray-500">{xray.date}</p>
                <p className="mt-2 text-gray-700">{xray.description}</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium">
                  Ver Radiografía →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Tratamiento Actual</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700">{record.currentTreatmentPlan}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
          <div className="space-y-4">
            {record.notes.map((note) => (
              <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{note.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {note.date} - Dr. {note.dentist}
                </p>
              </div>
            ))}
          </div>
        </div>

        {!isDentist && onGrantAccess && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Otorgar Acceso a Dentista</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Dirección del dentista"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dentistAddress}
                    onChange={(e) => setDentistAddress(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Días"
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={accessDays}
                    onChange={(e) => setAccessDays(Number(e.target.value))}
                  />
                  <button
                    onClick={handleGrantAccess}
                    disabled={isGrantingAccess}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGrantingAccess ? 'Firmando...' : 'Otorgar Acceso'}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isDentist && onAddNote && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nota</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex gap-4">
                <textarea
                  placeholder="Escribe una nota..."
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <button
                  onClick={() => {
                    onAddNote(newNote);
                    setNewNote('');
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Agregar Nota
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 