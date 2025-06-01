'use client';

import React, { useState } from 'react';
import { DentalRecord as DentalRecordType } from '../types/dental';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';
import { AnimatedCard } from './AnimatedCard';

interface PatientModeProps {
  record: DentalRecordType;
  provider?: ethers.providers.Web3Provider;
  patientAddress?: string;
}

export const PatientMode: React.FC<PatientModeProps> = ({
  record,
  provider,
  patientAddress,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'access' | 'history' | 'dentists' | 'studies' | 'calendar' | 'stats'>('record');
  const [dentistAddress, setDentistAddress] = useState('');
  const [accessDays, setAccessDays] = useState(7);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Datos de ejemplo para dentistas
  const dentists = [
    {
      id: '1',
      name: 'Dr. García',
      specialty: 'Ortodoncista',
      address: '0x456...',
      rating: 4.8,
      lastVisit: '2024-03-15',
      image: 'https://placehold.co/100x100',
      isVerified: true
    },
    {
      id: '2',
      name: 'Dra. Martínez',
      specialty: 'Endodoncista',
      address: '0x789...',
      rating: 4.9,
      lastVisit: '2024-02-20',
      image: 'https://placehold.co/100x100',
      isVerified: true
    }
  ];

  // Datos de ejemplo para estudios
  const studies = [
    {
      id: '1',
      type: 'Radiografía Panorámica',
      date: '2024-03-15',
      description: 'Radiografía completa de la mandíbula',
      image: 'https://placehold.co/400x300',
      findings: 'No se observan anomalías significativas',
      recommendations: 'Continuar con el plan de tratamiento actual'
    },
    {
      id: '2',
      type: 'TAC Dental',
      date: '2024-02-20',
      description: 'Tomografía axial computarizada',
      image: 'https://placehold.co/400x300',
      findings: 'Visualización detallada de la estructura ósea',
      recommendations: 'Seguimiento en 6 meses'
    }
  ];

  // Datos de ejemplo para citas
  const appointments = [
    {
      id: '1',
      date: '2024-04-15',
      time: '10:00',
      type: 'Limpieza Dental',
      dentist: 'Dr. García',
      status: 'confirmada'
    },
    {
      id: '2',
      date: '2024-04-20',
      time: '15:30',
      type: 'Revisión Ortodoncia',
      dentist: 'Dra. Martínez',
      status: 'pendiente'
    }
  ];

  // Datos de ejemplo para estadísticas
  const healthStats = {
    visitsLastYear: 6,
    treatmentsCompleted: 3,
    nextAppointment: '2024-04-15',
    hygieneScore: 85,
    monthlyProgress: [
      { month: 'Ene', score: 75 },
      { month: 'Feb', score: 80 },
      { month: 'Mar', score: 85 },
      { month: 'Abr', score: 90 }
    ],
    habits: [
      { name: 'Cepillado Diario', completed: 28, total: 30 },
      { name: 'Uso de Hilo Dental', completed: 25, total: 30 },
      { name: 'Enjuague Bucal', completed: 30, total: 30 }
    ]
  };

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
      alert('¡Acceso otorgado correctamente!');
    } catch (err: any) {
      setError('Error al otorgar acceso: ' + (err.reason || err.message));
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
          {dayAppointments.map(app => (
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
            <div className="space-y-6">
              <AnimatedCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Datos Personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-800"><span className="font-medium">Nombre:</span> {record.patientInfo.nombre}</p>
                    <p className="text-gray-800"><span className="font-medium">Fecha de nacimiento:</span> {record.patientInfo.fechaNacimiento} ({record.patientInfo.edad} años)</p>
                    <p className="text-gray-800"><span className="font-medium">Género:</span> {record.patientInfo.genero}</p>
                  </div>
                  <div>
                    <p className="text-gray-800"><span className="font-medium">Dirección:</span> {record.patientInfo.direccion}</p>
                    <p className="text-gray-800"><span className="font-medium">Contacto:</span> {record.patientInfo.contacto}</p>
                    {record.patientInfo.numeroSeguro && <p className="text-gray-800"><span className="font-medium">Seguro:</span> {record.patientInfo.numeroSeguro}</p>}
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Información General de Salud</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-800"><span className="font-medium">Alergias:</span> {record.healthInfo.alergias.join(', ') || 'Ninguna'}</p>
                    <p className="text-gray-800"><span className="font-medium">Enfermedades crónicas:</span> {record.healthInfo.enfermedadesCronicas.join(', ') || 'Ninguna'}</p>
                  </div>
                  <div>
                    <p className="text-gray-800"><span className="font-medium">Medicamentos:</span> {record.healthInfo.medicamentos.join(', ') || 'Ninguno'}</p>
                    <p className="text-gray-800"><span className="font-medium">Antecedentes:</span> {record.healthInfo.antecedentes || 'Ninguno'}</p>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Historial Dental y Observaciones</h3>
                <div className="space-y-2">
                  <p className="text-gray-800"><span className="font-medium">Última revisión:</span> {record.lastCheckup}</p>
                  {record.generalObservation.map((obs, idx) => (
                    <div key={idx} className="border-l-4 border-blue-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{obs.observaciones}</p>
                      <p className="text-xs text-gray-500">{obs.fecha} — Dr. {obs.doctor}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tratamientos Realizados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.treatments.map((treatment) => (
                    <AnimatedCard key={treatment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{treatment.type}</p>
                          <p className="text-sm text-gray-500">{treatment.date}</p>
                        </div>
                        <span className="text-sm text-gray-500">Dr. {treatment.dentist}</span>
                      </div>
                      <p className="mt-2 text-gray-800">{treatment.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                        treatment.status === 'completado' ? 'bg-green-100 text-green-800' : treatment.status === 'en curso' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                      </span>
                    </AnimatedCard>
                  ))}
                </div>
              </div>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Plan de Tratamiento Actual</h3>
                <p className="text-gray-800">{record.currentTreatmentPlan}</p>
              </AnimatedCard>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Radiografías y Estudios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.xRays.map((xray) => (
                    <AnimatedCard key={xray.id} className="p-4">
                      <p className="font-medium text-gray-900">{xray.type}</p>
                      <p className="text-sm text-gray-500">{xray.date}</p>
                      <p className="mt-2 text-gray-800">{xray.description}</p>
                      <a
                        href={`https://ipfs.io/ipfs/${xray.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium block"
                      >
                        Ver archivo
                      </a>
                    </AnimatedCard>
                  ))}
                </div>
              </div>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Notas y Recomendaciones</h3>
                <div className="space-y-2">
                  {record.notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-purple-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{note.content}</p>
                      <p className="text-xs text-gray-500">{note.date} — Dr. {note.dentist}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Documentos Adjuntos</h3>
                <div className="space-y-2">
                  {record.attachedDocuments.length === 0 && <p className="text-gray-500">No hay documentos adjuntos.</p>}
                  {record.attachedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{doc.name}</span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver documento
                      </a>
                      <span className="text-xs text-gray-400">{doc.type} — {doc.uploadedAt}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
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
                  {appointments.map(appointment => (
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
                    {healthStats.monthlyProgress.map((item, index) => (
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
                    {healthStats.monthlyProgress.map((item, index) => (
                      <span key={index} className="text-sm text-gray-500">{item.month}</span>
                    ))}
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hábitos de Higiene</h3>
                <div className="space-y-4">
                  {healthStats.habits.map((habit, index) => (
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dentists.map((dentist) => (
                  <div key={dentist.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={dentist.image}
                        alt={dentist.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{dentist.name}</h3>
                            <p className="text-sm text-gray-500">{dentist.specialty}</p>
                          </div>
                          {dentist.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verificado
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(dentist.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">{dentist.rating}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Última visita: {new Date(dentist.lastVisit).toLocaleDateString()}
                        </p>
                        <div className="mt-4 flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            Ver Perfil →
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            Agendar Cita →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'studies' && (
            <div className="space-y-6">
              {studies.map((study) => (
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
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Otorgar Acceso a Dentista</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Dirección del dentista"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                        value={dentistAddress}
                        onChange={(e) => setDentistAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGrantAccess}
                    disabled={isGrantingAccess}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGrantingAccess ? 'Procesando...' : 'Otorgar Acceso'}
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Activos</h3>
                <div className="space-y-4">
                  {record.accessGrants.map((grant, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">Dentista: {grant.dentistAddress}</p>
                          <p className="text-sm text-gray-500">
                            Otorgado: {new Date(grant.grantedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          grant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {grant.isActive ? 'Activo' : 'Expirado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Accesos</h3>
                <div className="space-y-4">
                  {record.accessGrants.map((grant, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">Dentista: {grant.dentistAddress}</p>
                          <p className="text-sm text-gray-500">
                            Otorgado: {new Date(grant.grantedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expira: {new Date(grant.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          grant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {grant.isActive ? 'Activo' : 'Expirado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 py-2">
          {tabs.map(({ key, label }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
}; 