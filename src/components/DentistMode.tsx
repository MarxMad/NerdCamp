/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { DentalRecord as DentalRecordBase, DentalNote, Treatment, XRay, AttachedDocument } from "../types/dental";
import { AnimatedCard } from "./AnimatedCard";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import contractABI from '../abi/MyDentalVault.json';
const contractAddress = "0xe3B1B985422E56Da480af78238C3bc4B82f1965B";

// Agregar tipo para citas
interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  dentist: string;
  status: 'confirmada' | 'pendiente';
  description: string;
}

// Extender el tipo DentalRecord para incluir appointments opcional
interface DentalRecord extends DentalRecordBase {
  appointments?: Appointment[];
}

export const DentistMode: React.FC = () => {
  const [patientAddress, setPatientAddress] = useState("");
  const [record, setRecord] = useState<DentalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formularios para añadir datos
  const [newNote, setNewNote] = useState("");
  const [newTreatment, setNewTreatment] = useState({
    type: "",
    description: "",
    date: "",
  });
  const [newXRay, setNewXRay] = useState({
    type: "",
    description: "",
    file: null as File | null,
  });

  // Nuevo estado para citas
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: '',
    description: '',
  });

  // Nuevo estado para crear expediente
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
    antecedentes: '',
  });

  // Nuevo estado para pestañas
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const { address } = useAccount();
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [errorExpediente, setErrorExpediente] = useState<string | null>(null);
  const [successExpediente, setSuccessExpediente] = useState<string | null>(null);

  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [selectedExpediente, setSelectedExpediente] = useState<any | null>(null);

  // Cargar expedientes al montar el componente
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const todosExpedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
      // Filtrar expedientes por el dentista conectado
      const expedientesFiltrados = todosExpedientes.filter((exp: any) => 
        exp.dentista?.toLowerCase() === (address || '').toLowerCase()
      );
      setExpedientes(expedientesFiltrados);
    } catch (err) {
      setError('No se pudieron cargar los expedientes.');
      setExpedientes([]);
    }
    setLoading(false);
  }, [address]);

  // Aseguro que cualquier inicialización de provider esté dentro de useEffect y solo en cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Aquí puedes inicializar ethers o cualquier lógica que dependa de la wallet
      // Por ejemplo:
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // setProvider(provider); // Si usas un estado para el provider
    }
  }, []);

  // Simulación de búsqueda de expediente (en real, llamada a contrato)
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Lógica real: buscar expediente por wallet y verificar acceso
    try {
      const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
      const expediente = expedientes.find((exp: any) => exp.paciente?.toLowerCase() === patientAddress.toLowerCase());
      if (expediente) {
        // Verificar si el dentista tiene acceso
        const tieneAcceso =
          expediente.dentista?.toLowerCase() === (address || '').toLowerCase() ||
          (expediente.accessGrants && Array.isArray(expediente.accessGrants) &&
            expediente.accessGrants.some((grant: any) => grant.dentistAddress?.toLowerCase() === (address || '').toLowerCase() && grant.isActive));
        if (tieneAcceso) {
          setRecord(expediente);
          setSuccess('Expediente cargado correctamente.');
        } else {
          setRecord(null);
          setError('No tienes acceso a este expediente o no existe.');
        }
      } else {
        setRecord(null);
        setError('No tienes acceso a este expediente o no existe.');
      }
    } catch (err) {
      setRecord(null);
      setError('No tienes acceso a este expediente o no existe.');
    }
    setLoading(false);
  };

  // Añadir nota
  const handleAddNote = () => {
    if (!record) return;
    const note: DentalNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      content: newNote,
      dentist: "Dr. Dentista"
    };
    setRecord({ ...record, notes: [...record.notes, note] });
    setNewNote("");
    setSuccess("Nota añadida");
  };

  // Añadir tratamiento
  const handleAddTreatment = () => {
    if (!record) return;
    const treatment: Treatment = {
      id: Date.now().toString(),
      type: newTreatment.type,
      date: newTreatment.date,
      description: newTreatment.description,
      dentist: "Dr. Dentista",
      status: "en curso"
    };
    setRecord({ ...record, treatments: [...record.treatments, treatment] });
    setNewTreatment({ type: "", description: "", date: "" });
    setSuccess("Tratamiento añadido");
  };

  // Añadir radiografía (simulado)
  const handleAddXRay = () => {
    if (!record || !newXRay.file) return;
    const xray: XRay = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: newXRay.type,
      ipfsHash: "Qm...", // Aquí iría el hash real de IPFS
      description: newXRay.description
    };
    setRecord({ ...record, xRays: [...record.xRays, xray] });
    setNewXRay({ type: "", description: "", file: null });
    setSuccess("Radiografía añadida");
  };

  // Simulación de expedientes por paciente
  const [patientRecords, setPatientRecords] = useState<{ [address: string]: DentalRecord }>({});

  // Modificar handleAddAppointment para guardar la cita en el expediente del paciente seleccionado
  const handleAddAppointment = () => {
    if (!selectedPatient) return;
    const appointment: Appointment = {
      id: Date.now().toString(),
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type,
      dentist: 'Dr. Dentista',
      status: 'confirmada',
      description: newAppointment.description,
    };
    setPatientRecords(prev => {
      const prevRecord = prev[selectedPatient] || {
        ...record,
        appointments: [],
      };
      return {
        ...prev,
        [selectedPatient]: {
          ...prevRecord,
          appointments: [...(prevRecord.appointments || []), appointment],
        },
      };
    });
    setNewAppointment({ date: '', time: '', type: '', description: '' });
    setSuccess('Cita agendada');
  };

  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [newDoc, setNewDoc] = useState({
    name: '',
    file: null as File | null,
    type: '',
  });

  // Nuevo estado para pestañas
  const [activeTab, setActiveTab] = useState<'expediente' | 'pacientes' | 'calendario' | 'accesos' | 'documentos'>('expediente');

  return (
    <div className="space-y-8">
      {/* Mensajes de loading y error siempre arriba del contenido */}
      {loading && (
        <div className="p-6 text-center">Cargando expedientes...</div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl w-full mb-2 flex items-center justify-between">
            <span>{error}</span>
            <button
              className="ml-4 text-red-700 font-bold text-lg focus:outline-none"
              onClick={() => setError(null)}
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
          <button
            className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            onClick={() => {
              setError(null);
              setActiveTab('pacientes');
            }}
          >
            Volver a Pacientes
          </button>
        </div>
      )}
      {/* Formulario de búsqueda/creación siempre visible */}
      {!loading && !error && (
        <>
          <AnimatedCard className="p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Buscar Expediente de Paciente</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="patient-address" className="block text-xs font-medium text-gray-700 mb-1">Dirección del paciente</label>
                <input
                  id="patient-address"
                  type="text"
                  placeholder="0x..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                  value={patientAddress}
                  onChange={e => setPatientAddress(e.target.value)}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !patientAddress}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {error && (
              <div className="mt-2">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
          </AnimatedCard>

          {/* Barra de tabs SIEMPRE visible */}
          <div className="flex gap-4 mb-4">
            <button onClick={() => setActiveTab('expediente')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'expediente' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Expediente</button>
            <button onClick={() => setActiveTab('pacientes')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'pacientes' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Pacientes</button>
            <button onClick={() => setActiveTab('calendario')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'calendario' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Calendario</button>
            <button onClick={() => setActiveTab('accesos')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'accesos' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Historial de Accesos</button>
            <button onClick={() => setActiveTab('documentos')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'documentos' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Documentos</button>
          </div>

          {/* Contenido de los tabs solo info real o mensaje vacío */}
          {activeTab === 'expediente' && (
            <div className="p-6">
              {record ? (
                (() => {
                  const datos = (record as any).datos ?? (record as any).patientInfo ?? {};
                  return (
                    <div className="text-center py-8 space-y-4">
                      <h2 className="text-2xl font-bold text-blue-900 mb-4">Expediente del Paciente</h2>
                      <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-left">
                        <p><span className="font-semibold text-gray-900">Nombre:</span> <span className="text-gray-800">{datos.nombre}</span></p>
                        <p><span className="font-semibold text-gray-900">Fecha de nacimiento:</span> <span className="text-gray-800">{datos.fechaNacimiento}</span></p>
                        <p><span className="font-semibold text-gray-900">Edad:</span> <span className="text-gray-800">{datos.edad}</span></p>
                        <p><span className="font-semibold text-gray-900">Género:</span> <span className="text-gray-800">{datos.genero}</span></p>
                        <p><span className="font-semibold text-gray-900">Dirección:</span> <span className="text-gray-800">{datos.direccion}</span></p>
                        <p><span className="font-semibold text-gray-900">Contacto:</span> <span className="text-gray-800">{datos.contacto}</span></p>
                        <p><span className="font-semibold text-gray-900">Número de Seguro:</span> <span className="text-gray-800">{datos.numeroSeguro}</span></p>
                        <p><span className="font-semibold text-gray-900">Alergias:</span> <span className="text-gray-800">{datos.alergias?.join(', ') || 'Ninguna'}</span></p>
                        <p><span className="font-semibold text-gray-900">Enfermedades crónicas:</span> <span className="text-gray-800">{datos.enfermedadesCronicas?.join(', ') || 'Ninguna'}</span></p>
                        <p><span className="font-semibold text-gray-900">Medicamentos:</span> <span className="text-gray-800">{datos.medicamentos?.join(', ') || 'Ninguno'}</span></p>
                        <p><span className="font-semibold text-gray-900">Antecedentes:</span> <span className="text-gray-800">{datos.antecedentes || 'Ninguno'}</span></p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay expediente disponible</div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'pacientes' && (
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Pacientes con Acceso</h3>
              {expedientes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No hay pacientes registrados aún</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expedientes.map((expediente) => {
                    const datos = expediente.datos || expediente.patientInfo || {};
                    const esCreador = expediente.dentista?.toLowerCase() === (address || '').toLowerCase();
                    const accessGrant = expediente.accessGrants?.find(
                      (grant: any) => grant.dentistAddress?.toLowerCase() === (address || '').toLowerCase()
                    );

                    return (
                      <div key={expediente.paciente} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{datos.nombre || 'Sin nombre'}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            esCreador 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {esCreador ? 'Creador' : 'Acceso Otorgado'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Edad:</span> {datos.edad || 'No especificada'}</p>
                          <p><span className="font-medium">Género:</span> {datos.genero || 'No especificado'}</p>
                          <p><span className="font-medium">Contacto:</span> {datos.contacto || 'No especificado'}</p>
                          {!esCreador && accessGrant && (
                            <p className="text-xs text-gray-500 mt-2">
                              Acceso otorgado el: {new Date(accessGrant.timestamp).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setPatientAddress(expediente.paciente);
                            setActiveTab('expediente');
                            handleSearch();
                          }}
                          className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                        >
                          Ver Expediente
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </AnimatedCard>
          )}
          {activeTab === 'calendario' && (
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Calendario de Citas</h3>
              {/* Formulario para agendar cita */}
              <form
                className="space-y-4 mb-8"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newAppointment.date || !newAppointment.time || !newAppointment.type || !selectedPatient) return;
                  // Leer expedientes
                  const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
                  const idx = expedientes.findIndex((exp: any) => exp.paciente?.toLowerCase() === selectedPatient.toLowerCase());
                  if (idx !== -1) {
                    expedientes[idx].appointments = expedientes[idx].appointments || [];
                    expedientes[idx].appointments.push({
                      id: Date.now().toString(),
                      date: newAppointment.date,
                      time: newAppointment.time,
                      type: newAppointment.type,
                      dentist: address,
                      status: 'confirmada',
                      description: newAppointment.description,
                    });
                    localStorage.setItem('expedientes', JSON.stringify(expedientes));
                    window.dispatchEvent(new StorageEvent('storage', { key: 'expedientes' }));
                    setSuccess('Cita agendada correctamente');
                    setNewAppointment({ date: '', time: '', type: '', description: '' });
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Paciente</label>
                  <select
                    className="w-full p-2 border rounded-lg text-black"
                    value={selectedPatient || ''}
                    onChange={e => setSelectedPatient(e.target.value)}
                  >
                    <option value="">Selecciona un paciente</option>
                    {expedientes.map((exp) => (
                      <option key={exp.paciente} value={exp.paciente}>
                        {(exp.datos?.nombre || exp.patientInfo?.nombre || exp.paciente) + ' (' + exp.paciente.slice(0, 6) + '...)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" className="w-full p-2 border rounded-lg text-black" value={newAppointment.date} onChange={e => setNewAppointment(a => ({ ...a, date: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hora</label>
                    <input type="time" className="w-full p-2 border rounded-lg text-black" value={newAppointment.time} onChange={e => setNewAppointment(a => ({ ...a, time: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de cita</label>
                  <input type="text" className="w-full p-2 border rounded-lg text-black" value={newAppointment.type} onChange={e => setNewAppointment(a => ({ ...a, type: e.target.value }))} placeholder="Consulta, limpieza, etc." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea className="w-full p-2 border rounded-lg text-black" value={newAppointment.description} onChange={e => setNewAppointment(a => ({ ...a, description: e.target.value }))} />
                </div>
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 mt-2" disabled={!selectedPatient || !newAppointment.date || !newAppointment.time || !newAppointment.type}>
                  Agendar Cita
                </button>
                {success && <div className="text-green-600 mt-2">{success}</div>}
              </form>
              {/* Lista de citas agendadas */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">Citas Agendadas</h4>
                {expedientes.filter(exp => exp.appointments && exp.appointments.length > 0).length === 0 ? (
                  <div className="text-gray-600">No hay citas programadas</div>
                ) : (
                  <div className="space-y-4">
                    {expedientes.filter(exp => exp.appointments && exp.appointments.length > 0).map(exp => (
                      <div key={exp.paciente} className="mb-4">
                        <div className="font-medium text-blue-900 mb-1">{exp.datos?.nombre || exp.patientInfo?.nombre || exp.paciente}</div>
                        <div className="space-y-2">
                          {exp.appointments.map((app: any) => (
                            <div key={app.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">{app.type}</div>
                                <div className="text-sm text-gray-500">{app.date} {app.time}</div>
                                <div className="text-xs text-gray-500">{app.description}</div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">{app.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedCard>
          )}
          {activeTab === 'accesos' && (
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Historial de Accesos</h3>
              <div className="text-center py-8">
                <p className="text-gray-600">No hay historial de accesos</p>
              </div>
            </AnimatedCard>
          )}
          {activeTab === 'documentos' && (
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Gestión de Documentos</h3>
              <div className="text-center py-8">
                <p className="text-gray-600">No hay documentos disponibles</p>
              </div>
            </AnimatedCard>
          )}
        </>
      )}
    </div>
  );
}; 