import { EstadoHabitacion } from './habitacion.model';

export interface ActualizarReservaRequest {
  fechaEntrada: string;
  fechaSalida: string;
}

export interface ReservaRequest extends ActualizarReservaRequest {
  idHuesped: number;
  idHabitacion: number;
  numeroPersonas: number;
}

// Descripciones que devuelve EstadoReserva.getDescripcion() en Java.
export const ESTADOS_RESERVA = {
  CONFIRMADA: 'Confirmada por el huésped',
  EN_CURSO: 'El huésped llegó al hotel',
  FINALIZADA: 'Reservación finalizada',
  CANCELADA: 'Reservación cancelada'
} as const;

export interface ReservaResponse {
  id: number;
  fechaEntrada: string;
  FechaSalida: string;
  numeroPesronas: number;
  estadoReserva: string;
  datosHuesped: DatosHuesped | null;
  datosHabitacion: DatosHabitacion | null;
  precioTotal: number;
  idHuesped: number;
  idHabitacion: number;
  precioNoche: number;
  estadoRegistro: 'ACTIVO' | 'ELIMINADO';
}

export interface DatosHabitacion {
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
  estado: EstadoHabitacion;
}

export interface DatosHuesped {
  nombre: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
}


export interface HuespedOpcion {
  id: number;
  nombre: string;
  apellidos: string;
  estadoRegistro: string;
}

export type ReportePorEstado = Record<string, ReservaResponse[]>;
