export const TIPOS_DOCUMENTO_CATALOGO = [
  { id: 1, label: 'INE', descripcion: 'INE del huesped' },
  { id: 2, label: 'Licencia', descripcion: 'Licencia de conducir del huesped' },
  { id: 3, label: 'Pasaporte', descripcion: 'Pasaporte del huesped' }
];

export interface HuespedRequest {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  nacionalidad: string;
}

export interface HuespedResponse {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
  estadoRegistro: 'ACTIVO' | 'ELIMINADO';
}
