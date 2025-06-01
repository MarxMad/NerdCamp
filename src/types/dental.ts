export interface PatientInfo {
  nombre: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  direccion: string;
  contacto: string;
  numeroSeguro?: string;
}

export interface HealthInfo {
  alergias: string[];
  enfermedadesCronicas: string[];
  medicamentos: string[];
  antecedentes: string;
}

export interface DentalObservation {
  fecha: string;
  observaciones: string;
  doctor: string;
}

export interface Treatment {
  id: string;
  type: string;
  date: string;
  description: string;
  dentist: string;
  status: 'completado' | 'en curso' | 'pendiente';
}

export interface XRay {
  id: string;
  date: string;
  type: string;
  ipfsHash: string;
  description: string;
}

export interface DentalNote {
  id: string;
  date: string;
  content: string;
  dentist: string;
}

export interface AccessGrant {
  dentistAddress: string;
  patientAddress: string;
  grantedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface AttachedDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface DentalRecord {
  patientInfo: PatientInfo;
  healthInfo: HealthInfo;
  lastCheckup: string;
  generalObservation: DentalObservation[];
  treatments: Treatment[];
  xRays: XRay[];
  currentTreatmentPlan: string;
  notes: DentalNote[];
  accessGrants: AccessGrant[];
  attachedDocuments: AttachedDocument[];
  nftStatus?: string;
} 