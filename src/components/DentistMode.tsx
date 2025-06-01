"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { DentalRecord as DentalRecordBase, DentalNote, Treatment, XRay, AttachedDocument } from "../types/dental";
import { AnimatedCard } from "./AnimatedCard";

interface DentistModeProps {
  // provider?: ethers.providers.Web3Provider; // Comentado por no uso
}

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

// Simulación de pacientes con acceso
const mockPatients = [
  {
    address: '0xabc123',
    nombre: 'Juan Pérez',
    lastCheckup: '2024-04-01',
  },
  {
    address: '0xdef456',
    nombre: 'Ana López',
    lastCheckup: '2024-03-20',
  },
];

// Simulación de historial de accesos
const mockAccessHistory = [
  { id: '1', patient: 'Juan Pérez', address: '0xabc123', date: '2024-04-10', action: 'Visualización de expediente' },
  { id: '2', patient: 'Ana López', address: '0xdef456', date: '2024-04-09', action: 'Subida de documento' },
];

// Extender el tipo DentalRecord para incluir appointments opcional
interface DentalRecord extends DentalRecordBase {
  appointments?: Appointment[];
}

export const DentistMode: React.FC<DentistModeProps> = ({
  // provider, // Comentado por no uso
}) => {
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

  // Simulación de búsqueda de expediente (en real, llamada a contrato)
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Aquí iría la lógica real de contrato
    setTimeout(() => {
      // Simulación: solo muestra un expediente si la dirección termina en "123"
      if (patientAddress.endsWith("123")) {
        setRecord({
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
          treatments: [],
          xRays: [],
          currentTreatmentPlan: "Revisión en 6 meses.",
          notes: [],
          accessGrants: [],
          attachedDocuments: [],
          nftStatus: "verificado"
        });
        setSuccess("Expediente cargado correctamente.");
      } else {
        setRecord(null);
        setError("No tienes acceso a este expediente o no existe.");
      }
      setLoading(false);
    }, 1200);
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

  // Crear expediente
  const handleCreateRecord = () => {
    setRecord({
      patientInfo: {
        nombre: newRecord.nombre,
        fechaNacimiento: newRecord.fechaNacimiento,
        edad: Number(newRecord.edad),
        genero: newRecord.genero,
        direccion: newRecord.direccion,
        contacto: newRecord.contacto,
        numeroSeguro: newRecord.numeroSeguro,
      },
      healthInfo: {
        alergias: newRecord.alergias.split(',').map(a => a.trim()).filter(Boolean),
        enfermedadesCronicas: newRecord.enfermedadesCronicas.split(',').map(e => e.trim()).filter(Boolean),
        medicamentos: newRecord.medicamentos.split(',').map(m => m.trim()).filter(Boolean),
        antecedentes: newRecord.antecedentes,
      },
      lastCheckup: '',
      generalObservation: [],
      treatments: [],
      xRays: [],
      currentTreatmentPlan: '',
      notes: [],
      accessGrants: [],
      attachedDocuments: [],
      nftStatus: undefined,
    });
    setShowCreateForm(false);
    setSuccess('Expediente creado correctamente');
  };

  // Subir documento
  const handleUploadDocument = () => {
    if (!newDoc.name || !newDoc.file || !newDoc.type) return;
    const doc: AttachedDocument = {
      id: Date.now().toString(),
      name: newDoc.name,
      url: URL.createObjectURL(newDoc.file), // Simulación, en real sería IPFS
      type: newDoc.type,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setDocuments([...documents, doc]);
    setNewDoc({ name: '', file: null, type: '' });
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
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('expediente')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'expediente' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          Expediente
        </button>
        <button
          onClick={() => setActiveTab('pacientes')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'pacientes' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          Pacientes
        </button>
        <button
          onClick={() => setActiveTab('calendario')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'calendario' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          Calendario
        </button>
        <button
          onClick={() => setActiveTab('accesos')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'accesos' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          Historial de Accesos
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'documentos' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          Documentos
        </button>
      </div>

      {activeTab === 'pacientes' && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Pacientes con Acceso</h3>
          <div className="space-y-2">
            {mockPatients.map((p) => (
              <div key={p.address} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-800">{p.nombre}</p>
                  <p className="text-sm text-gray-500">Última revisión: {p.lastCheckup}</p>
                  <p className="text-xs text-gray-400">{p.address}</p>
                </div>
                <button
                  onClick={() => {
                    setPatientAddress(p.address);
                    setActiveTab('expediente');
                    setSelectedPatient(p.address);
                    handleSearch();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Ver Expediente
                </button>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'calendario' && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Calendario de Citas</h3>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Filtrar por paciente</label>
            <select
              className="p-2 border rounded-lg text-gray-800"
              value={selectedPatient || ''}
              onChange={e => setSelectedPatient(e.target.value || null)}
            >
              <option value="">Todos</option>
              {mockPatients.map(p => (
                <option key={p.address} value={p.address}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {Object.entries(patientRecords).flatMap(([address, rec]) =>
              (!selectedPatient || address === selectedPatient)
                ? (rec.appointments || []).map((app: Appointment) => (
                    <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="font-medium text-gray-800">{app.type}</p>
                        <p className="text-sm text-gray-500">{app.date} {app.time}</p>
                        <p className="text-xs text-gray-400">Paciente: {address}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        app.status === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  ))
                : []
            )}
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'accesos' && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Historial de Accesos</h3>
          <div className="space-y-2">
            {mockAccessHistory.map((h) => (
              <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-800">{h.patient}</p>
                  <p className="text-sm text-gray-500">{h.action}</p>
                  <p className="text-xs text-gray-400">{h.date} — {h.address}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'documentos' && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Gestión de Documentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
            <input
              type="text"
              placeholder="Nombre del documento"
              className="p-2 border rounded-lg text-gray-800 placeholder-gray-700"
              value={newDoc.name}
              onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tipo (PDF, Imagen, etc.)"
              className="p-2 border rounded-lg text-gray-800 placeholder-gray-700"
              value={newDoc.type}
              onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
            />
            <input
              type="file"
              className="p-2 border rounded-lg text-gray-800"
              onChange={e => setNewDoc({ ...newDoc, file: e.target.files ? e.target.files[0] : null })}
            />
            <button
              onClick={handleUploadDocument}
              disabled={!newDoc.name || !newDoc.file || !newDoc.type}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Subir
            </button>
          </div>
          <div className="space-y-2">
            {documents.length === 0 && <p className="text-gray-500">No hay documentos subidos.</p>}
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                  <p className="text-xs text-gray-400">Subido: {doc.uploadedAt}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver/Descargar
                </a>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'expediente' && (
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
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                >
                  Crear expediente para este paciente
                </button>
              </div>
            )}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
          </AnimatedCard>

          {showCreateForm && !record && (
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Crear Nuevo Expediente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.nombre} onChange={e => setNewRecord({ ...newRecord, nombre: e.target.value })} />
                <input type="date" placeholder="Fecha de nacimiento" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.fechaNacimiento} onChange={e => setNewRecord({ ...newRecord, fechaNacimiento: e.target.value })} />
                <input type="number" placeholder="Edad" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.edad} onChange={e => setNewRecord({ ...newRecord, edad: e.target.value })} />
                <input type="text" placeholder="Género" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.genero} onChange={e => setNewRecord({ ...newRecord, genero: e.target.value })} />
                <input type="text" placeholder="Dirección" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.direccion} onChange={e => setNewRecord({ ...newRecord, direccion: e.target.value })} />
                <input type="text" placeholder="Contacto" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.contacto} onChange={e => setNewRecord({ ...newRecord, contacto: e.target.value })} />
                <input type="text" placeholder="Número de seguro" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.numeroSeguro} onChange={e => setNewRecord({ ...newRecord, numeroSeguro: e.target.value })} />
                <input type="text" placeholder="Alergias (separadas por coma)" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.alergias} onChange={e => setNewRecord({ ...newRecord, alergias: e.target.value })} />
                <input type="text" placeholder="Enfermedades crónicas (separadas por coma)" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.enfermedadesCronicas} onChange={e => setNewRecord({ ...newRecord, enfermedadesCronicas: e.target.value })} />
                <input type="text" placeholder="Medicamentos (separados por coma)" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.medicamentos} onChange={e => setNewRecord({ ...newRecord, medicamentos: e.target.value })} />
                <input type="text" placeholder="Antecedentes" className="p-2 border rounded-lg text-gray-800 placeholder-gray-700" value={newRecord.antecedentes} onChange={e => setNewRecord({ ...newRecord, antecedentes: e.target.value })} />
              </div>
              <button
                onClick={handleCreateRecord}
                className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200"
              >
                Guardar expediente
              </button>
            </AnimatedCard>
          )}

          {record && (
            <>
              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Datos del Paciente</h3>
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
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Añadir Nota</h3>
                <div className="flex gap-4 items-end">
                  <input
                    type="text"
                    placeholder="Escribe una nota..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Añadir
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {record.notes.map(note => (
                    <div key={note.id} className="border-l-4 border-purple-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{note.content}</p>
                      <p className="text-xs text-gray-500">{note.date} — Dr. {note.dentist}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Añadir Tratamiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <input
                    type="text"
                    placeholder="Tipo de tratamiento"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newTreatment.type}
                    onChange={e => setNewTreatment({ ...newTreatment, type: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newTreatment.description}
                    onChange={e => setNewTreatment({ ...newTreatment, description: e.target.value })}
                  />
                  <input
                    type="date"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    value={newTreatment.date}
                    onChange={e => setNewTreatment({ ...newTreatment, date: e.target.value })}
                  />
                  <button
                    onClick={handleAddTreatment}
                    disabled={!newTreatment.type || !newTreatment.description || !newTreatment.date}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Añadir
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {record.treatments.map(treatment => (
                    <div key={treatment.id} className="border-l-4 border-blue-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{treatment.type} - {treatment.description}</p>
                      <p className="text-xs text-gray-500">{treatment.date} — Dr. {treatment.dentist}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Subir Radiografía/Estudio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <input
                    type="text"
                    placeholder="Tipo de estudio"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newXRay.type}
                    onChange={e => setNewXRay({ ...newXRay, type: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newXRay.description}
                    onChange={e => setNewXRay({ ...newXRay, description: e.target.value })}
                  />
                  <input
                    type="file"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    onChange={e => setNewXRay({ ...newXRay, file: e.target.files ? e.target.files[0] : null })}
                  />
                  <button
                    onClick={handleAddXRay}
                    disabled={!newXRay.type || !newXRay.description || !newXRay.file}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Subir
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {record.xRays.map(xray => (
                    <div key={xray.id} className="border-l-4 border-blue-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{xray.type} - {xray.description}</p>
                      <p className="text-xs text-gray-500">{xray.date}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Agendar Cita</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <select
                    className="p-2 border rounded-lg text-gray-800"
                    value={selectedPatient || ''}
                    onChange={e => setSelectedPatient(e.target.value)}
                  >
                    <option value="">Selecciona paciente</option>
                    {mockPatients.map(p => (
                      <option key={p.address} value={p.address}>{p.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                  <input
                    type="time"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    value={newAppointment.time}
                    onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Tipo de cita"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newAppointment.type}
                    onChange={e => setNewAppointment({ ...newAppointment, type: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-700"
                    value={newAppointment.description}
                    onChange={e => setNewAppointment({ ...newAppointment, description: e.target.value })}
                  />
                  <button
                    onClick={handleAddAppointment}
                    disabled={!selectedPatient || !newAppointment.date || !newAppointment.time || !newAppointment.type}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Agendar
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {(patientRecords[selectedPatient || '']?.appointments || []).map((app: Appointment) => (
                    <div key={app.id} className="border-l-4 border-green-400 pl-4 my-2">
                      <p className="text-sm text-gray-800">{app.type} - {app.description}</p>
                      <p className="text-xs text-gray-500">{app.date} {app.time} — Dr. {app.dentist}</p>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </>
          )}
        </>
      )}
    </div>
  );
}; 