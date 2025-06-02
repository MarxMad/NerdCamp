/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { DentalRecord as DentalRecordType } from '../types/dental';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';
import { AnimatedCard } from './AnimatedCard';
import { useAccount } from 'wagmi';

interface PatientModeProps {
  provider?: ethers.providers.Web3Provider;
  patientAddress?: string;
}

interface ExpedienteDocumento {
  ipfsHash: string;
  timestamp: number;
  dentista: string;
  data: any; // Puedes tipar esto mejor si sabes la estructura
}

export const PatientMode: React.FC<PatientModeProps> = ({
  provider,
  patientAddress,
}) => {
  const { address } = useAccount();
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'record' | 'access' | 'history' | 'dentists' | 'studies' | 'calendar' | 'stats'>('record');
  const [dentistAddress, setDentistAddress] = useState('');
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [documentos, setDocumentos] = useState<ExpedienteDocumento[]>([]);
  const [detalle, setDetalle] = useState<ExpedienteDocumento | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
      // Buscar expediente por wallet (address)
      const expediente = expedientes.find((exp: any) => exp.paciente?.toLowerCase() === (address || '').toLowerCase());
      if (expediente) {
        setRecord(expediente);
      } else {
        setRecord(null);
      }
    } catch (err) {
      setError('No se pudo cargar el expediente local.');
      setRecord(null);
    }
    setLoading(false);
  }, [address]);

  // Nuevo: Escuchar cambios en localStorage (evento 'storage')
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'expedientes') {
        try {
          const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
          const expediente = expedientes.find((exp: any) => exp.paciente?.toLowerCase() === (address || '').toLowerCase());
          setRecord(expediente || null);
        } catch {
          setRecord(null);
        }
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [address]);

  useEffect(() => {
    const fetchExpedientes = async () => {
      if (!provider || !patientAddress) return;
      setLoading(true);
      setError(null);
      try {
        const signer = provider.getSigner();
        const contractAddress = "0xe3B1B985422E56Da480af78238C3bc4B82f1965B";
        const contractABI = (await import('../abi/MyDentalVault.json')).default;
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        // Leer eventos DocumentoReferenciado
        const filter = contract.filters.DocumentoReferenciado(patientAddress);
        const logs = await contract.queryFilter(filter);
        const expedientes: ExpedienteDocumento[] = await Promise.all(
          logs.map(async (log: any) => {
            const ipfsHashBytes32 = log.args.ipfsHash;
            const timestamp = log.args.timestamp.toNumber();
            const dentista = log.args.dentista;
            // Convertir bytes32 a hash base58 (CID)
            const ipfsHash = bytes32ToIpfsHash(ipfsHashBytes32);
            // Consultar IPFS
            let data = null;
            try {
              const res = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
              data = await res.json();
            } catch (e) {
              data = null;
            }
            return { ipfsHash, timestamp, dentista, data };
          })
        );
        setDocumentos(expedientes);
      } catch (err: unknown) {
        setError('No se pudo cargar la lista de expedientes.');
        setDocumentos([]);
      }
      setLoading(false);
    };
    fetchExpedientes();
  }, [provider, patientAddress]);

  // Función para convertir bytes32 a hash base58 (CID)
  function bytes32ToIpfsHash(bytes32: string): string {
    // Si tus hashes en el contrato ya están en formato CID, solo retorna el valor
    // Si están en bytes32, necesitas convertirlos (esto es un ejemplo, puede requerir ajuste)
    // Aquí se asume que el hash es CIDv0 (Qm...)
    // Si usas CIDv1, la conversión es diferente
    // Puedes usar la librería 'multiformats' para una conversión robusta
    if (bytes32.startsWith('Qm')) return bytes32; // Ya es CID
    // Si no, retorna como string hexadecimal (no ideal, pero placeholder)
    return bytes32;
  }

  const handleGrantAccess = async () => {
    if (!provider) {
      setError('No hay wallet conectada');
      return;
    }
    if (!dentistAddress) {
      setError('Ingresa la dirección del dentista');
      return;
    }
    try {
      setIsGrantingAccess(true);
      setError(null);
      const signer = provider.getSigner();
      const contractAddress = "0xe3B1B985422E56Da480af78238C3bc4B82f1965B";
      const contractABI = (await import('../abi/MyDentalVault.json')).default;
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.otorgarAcceso(dentistAddress);
      await tx.wait();
      setDentistAddress('');
      setError(null);
      // --- Simulación: guardar acceso en localStorage para la demo ---
      const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');
      const idx = expedientes.findIndex((exp) => exp.paciente?.toLowerCase() === (address || '').toLowerCase());
      if (idx !== -1) {
        expedientes[idx].accessGrants = expedientes[idx].accessGrants || [];
        expedientes[idx].accessGrants.push({
          dentistAddress,
          grantedAt: new Date().toISOString(),
          isActive: true
        });
        localStorage.setItem('expedientes', JSON.stringify(expedientes));
        window.dispatchEvent(new StorageEvent('storage', { key: 'expedientes' }));
        setRecord({ ...expedientes[idx] }); // Actualiza el estado local inmediatamente
      }
      alert('¡Acceso otorgado correctamente!');
    } catch (err: unknown) {
      const errorObj = err as { reason?: string; message?: string };
      setError('Error al otorgar acceso: ' + (errorObj.reason || errorObj.message || 'Error desconocido'));
      console.error(err);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayAppointments = appointments.filter(
        app => new Date(app.date).toDateString() === currentDate.toDateString()
      );

      days.push(
        <div key={day} className="h-24 border border-gray-200 p-2">
          <span className="text-sm text-gray-500">{day}</span>
          {dayAppointments.map((app: any) => (
            <div
              key={app.id}
              className={`mt-1 p-1 text-xs rounded ${
                app.status === 'confirmada'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {app.time} - {app.type}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const renderTabContent = () => {
    if (loading) return <div className="p-6 text-center">Cargando expediente...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!record) return <div className="p-6 text-center">No hay expediente disponible.</div>;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={theme.animations.tabTransition.initial}
          animate={theme.animations.tabTransition.animate}
          exit={theme.animations.tabTransition.exit}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === 'record' && (
            <div className="text-center py-8 space-y-4">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Expediente del Paciente</h2>
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-left">
                <p><span className="font-semibold text-gray-900">Nombre:</span> <span className="text-gray-800">{record.datos?.nombre}</span></p>
                <p><span className="font-semibold text-gray-900">Fecha de nacimiento:</span> <span className="text-gray-800">{record.datos?.fechaNacimiento}</span></p>
                <p><span className="font-semibold text-gray-900">Edad:</span> <span className="text-gray-800">{record.datos?.edad}</span></p>
                <p><span className="font-semibold text-gray-900">Género:</span> <span className="text-gray-800">{record.datos?.genero}</span></p>
                <p><span className="font-semibold text-gray-900">Dirección:</span> <span className="text-gray-800">{record.datos?.direccion}</span></p>
                <p><span className="font-semibold text-gray-900">Contacto:</span> <span className="text-gray-800">{record.datos?.contacto}</span></p>
                <p><span className="font-semibold text-gray-900">Número de Seguro:</span> <span className="text-gray-800">{record.datos?.numeroSeguro}</span></p>
                <p><span className="font-semibold text-gray-900">Alergias:</span> <span className="text-gray-800">{record.datos?.alergias?.join(', ') || 'Ninguna'}</span></p>
                <p><span className="font-semibold text-gray-900">Enfermedades crónicas:</span> <span className="text-gray-800">{record.datos?.enfermedadesCronicas?.join(', ') || 'Ninguna'}</span></p>
                <p><span className="font-semibold text-gray-900">Medicamentos:</span> <span className="text-gray-800">{record.datos?.medicamentos?.join(', ') || 'Ninguno'}</span></p>
                <p><span className="font-semibold text-gray-900">Antecedentes:</span> <span className="text-gray-800">{record.datos?.antecedentes || 'Ninguno'}</span></p>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <AnimatedCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDate.toLocaleString('es', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      ←
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      →
                    </motion.button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="bg-white p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h3>
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <motion.div
                      key={appointment.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{appointment.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-500">Dr. {appointment.dentist}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitas Anuales</h3>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-blue-600"
                  >
                    {healthStats.visitsLastYear}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">En los últimos 12 meses</p>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tratamientos Completados</h3>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-green-600"
                  >
                    {healthStats.treatmentsCompleted}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">En el último año</p>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Puntuación de Higiene</h3>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-purple-600"
                  >
                    {healthStats.hygieneScore}%
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Promedio mensual</p>
                </AnimatedCard>
              </div>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Mensual</h3>
                <div className="h-64">
                  <div className="flex items-end h-48 space-x-4">
                    {healthStats.monthlyProgress.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${item.score}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {healthStats.monthlyProgress.map((item: any, index: number) => (
                      <span key={index} className="text-sm text-gray-500">{item.month}</span>
                    ))}
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hábitos de Higiene</h3>
                <div className="space-y-4">
                  {healthStats.habits.map((habit: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                        <span className="text-sm text-gray-500">
                          {habit.completed}/{habit.total} días
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(habit.completed / habit.total) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          )}

          {activeTab === 'dentists' && (
            record?.accessGrants?.length > 0 ? (
              <div className="space-y-6 max-w-xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Dentistas con Acceso</h3>
                {record.accessGrants.map((grant: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900">Dentista: <span className="text-gray-800">{grant.dentistAddress}</span></div>
                    <div className="text-sm text-gray-700">Otorgado: {new Date(grant.grantedAt).toLocaleString()}</div>
                    <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay dentistas con acceso</div>
              </div>
            )
          )}

          {activeTab === 'studies' && (
            <div className="space-y-6">
              {studies.map((study: any) => (
                <div key={study.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{study.type}</h3>
                        <p className="text-sm text-gray-500">{study.date}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Descargar PDF
                      </button>
                    </div>
                    <p className="mt-2 text-gray-700">{study.description}</p>
                  </div>
                  <div className="border-t border-gray-200">
                    <img
                      src={study.image}
                      alt={study.type}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Hallazgos</h4>
                        <p className="text-gray-700">{study.findings}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
                        <p className="text-gray-700">{study.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Otorgar Acceso a Dentista</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Dirección del dentista"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-700"
                    value={dentistAddress}
                    onChange={(e) => setDentistAddress(e.target.value)}
                  />
                  <button
                    onClick={handleGrantAccess}
                    disabled={isGrantingAccess || !dentistAddress}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGrantingAccess ? 'Procesando...' : 'Otorgar Acceso'}
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                </div>
              </div>
              {/* Mostrar accesos activos si existen, si no, mensaje claro */}
              {record?.accessGrants?.length > 0 ? (
                <div className="mt-6 max-w-md mx-auto">
                  <h4 className="font-semibold mb-2 text-gray-900">Accesos Activos</h4>
                  {record.accessGrants.map((grant: any, idx: number) => (
                    <div key={idx} className="border rounded p-2 mb-2 bg-white">
                      <div className="text-gray-900 font-medium">Dentista: <span className="text-gray-800 font-normal">{grant.dentistAddress}</span></div>
                      <div className="text-gray-900 font-medium">Otorgado: <span className="text-gray-800 font-normal">{new Date(grant.grantedAt).toLocaleString()}</span></div>
                      <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 max-w-md mx-auto text-center text-gray-500">No hay accesos registrados</div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            record?.accessGrants?.length > 0 ? (
              <div className="space-y-6 max-w-xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Historial de Accesos</h3>
                {record.accessGrants.map((grant: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900">Dentista: <span className="text-gray-800">{grant.dentistAddress}</span></div>
                    <div className="text-sm text-gray-700">Otorgado: {new Date(grant.grantedAt).toLocaleString()}</div>
                    <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay historial disponible</div>
              </div>
            )
          )}

          {activeTab === 'calendar' && (
            record?.appointments?.length > 0 ? (
              <div className="space-y-6 max-w-xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Citas Programadas</h3>
                <div className="space-y-4">
                  {record.appointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.type}</p>
                        <p className="text-sm text-gray-500">{appointment.date} - {appointment.time}</p>
                        <p className="text-sm text-gray-500">Dentista: {appointment.dentist}</p>
                        <p className="text-xs text-gray-500">{appointment.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay citas programadas</div>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Definir los tabs en español
  const tabs = [
    { key: 'record', label: 'Expediente' },
    { key: 'calendar', label: 'Calendario' },
    { key: 'stats', label: 'Estadísticas' },
    { key: 'dentists', label: 'Dentistas' },
    { key: 'studies', label: 'Estudios' },
    { key: 'access', label: 'Accesos' },
    { key: 'history', label: 'Historial' },
  ];

  // Renderizado principal
  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.key ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">
        {activeTab === 'record' && (
          record ? (
            <div className="text-center py-8 space-y-4">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Expediente del Paciente</h2>
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-left">
                <p><span className="font-semibold text-gray-900">Nombre:</span> <span className="text-gray-800">{record.datos?.nombre}</span></p>
                <p><span className="font-semibold text-gray-900">Fecha de nacimiento:</span> <span className="text-gray-800">{record.datos?.fechaNacimiento}</span></p>
                <p><span className="font-semibold text-gray-900">Edad:</span> <span className="text-gray-800">{record.datos?.edad}</span></p>
                <p><span className="font-semibold text-gray-900">Género:</span> <span className="text-gray-800">{record.datos?.genero}</span></p>
                <p><span className="font-semibold text-gray-900">Dirección:</span> <span className="text-gray-800">{record.datos?.direccion}</span></p>
                <p><span className="font-semibold text-gray-900">Contacto:</span> <span className="text-gray-800">{record.datos?.contacto}</span></p>
                <p><span className="font-semibold text-gray-900">Número de Seguro:</span> <span className="text-gray-800">{record.datos?.numeroSeguro}</span></p>
                <p><span className="font-semibold text-gray-900">Alergias:</span> <span className="text-gray-800">{record.datos?.alergias?.join(', ') || 'Ninguna'}</span></p>
                <p><span className="font-semibold text-gray-900">Enfermedades crónicas:</span> <span className="text-gray-800">{record.datos?.enfermedadesCronicas?.join(', ') || 'Ninguna'}</span></p>
                <p><span className="font-semibold text-gray-900">Medicamentos:</span> <span className="text-gray-800">{record.datos?.medicamentos?.join(', ') || 'Ninguno'}</span></p>
                <p><span className="font-semibold text-gray-900">Antecedentes:</span> <span className="text-gray-800">{record.datos?.antecedentes || 'Ninguno'}</span></p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay expediente disponible</div>
            </div>
          )
        )}
        {activeTab === 'history' && (
          record?.accessGrants?.length > 0 ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Historial de Accesos</h3>
              {record.accessGrants.map((grant: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900">Dentista: <span className="text-gray-800">{grant.dentistAddress}</span></div>
                  <div className="text-sm text-gray-700">Otorgado: {new Date(grant.grantedAt).toLocaleString()}</div>
                  <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay historial disponible</div>
            </div>
          )
        )}
        {activeTab === 'studies' && (
          record?.documentos?.length > 0 ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Estudios</h3>
              {/* Renderiza aquí los estudios reales si existen */}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay estudios disponibles</div>
            </div>
          )
        )}
        {activeTab === 'calendar' && (
          record?.appointments?.length > 0 ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Citas Programadas</h3>
              <div className="space-y-4">
                {record.appointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.type}</p>
                      <p className="text-sm text-gray-500">{appointment.date} - {appointment.time}</p>
                      <p className="text-sm text-gray-500">Dentista: {appointment.dentist}</p>
                      <p className="text-xs text-gray-500">{appointment.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'confirmada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay citas programadas</div>
            </div>
          )
        )}
        {activeTab === 'stats' && (
          record?.estadisticas ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Estadísticas</h3>
              {/* Renderiza aquí las estadísticas reales si existen */}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay estadísticas disponibles</div>
            </div>
          )
        )}
        {activeTab === 'dentists' && (
          record?.accessGrants?.length > 0 ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Dentistas con Acceso</h3>
              {record.accessGrants.map((grant: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900">Dentista: <span className="text-gray-800">{grant.dentistAddress}</span></div>
                  <div className="text-sm text-gray-700">Otorgado: {new Date(grant.grantedAt).toLocaleString()}</div>
                  <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto text-gray-500">No hay dentistas con acceso</div>
            </div>
          )
        )}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Otorgar Acceso a Dentista</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Dirección del dentista"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-700"
                  value={dentistAddress}
                  onChange={(e) => setDentistAddress(e.target.value)}
                />
                <button
                  onClick={handleGrantAccess}
                  disabled={isGrantingAccess || !dentistAddress}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGrantingAccess ? 'Procesando...' : 'Otorgar Acceso'}
                </button>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
            </div>
            {record?.accessGrants?.length > 0 ? (
              <div className="mt-6 max-w-md mx-auto">
                <h4 className="font-semibold mb-2 text-gray-900">Accesos Activos</h4>
                {record.accessGrants.map((grant: any, idx: number) => (
                  <div key={idx} className="border rounded p-2 mb-2 bg-white">
                    <div className="text-gray-900 font-medium">Dentista: <span className="text-gray-800 font-normal">{grant.dentistAddress}</span></div>
                    <div className="text-gray-900 font-medium">Otorgado: <span className="text-gray-800 font-normal">{new Date(grant.grantedAt).toLocaleString()}</span></div>
                    <div className="text-green-600 text-xs font-semibold">{grant.isActive ? 'Activo' : 'Expirado'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 max-w-md mx-auto text-center text-gray-500">No hay accesos registrados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 