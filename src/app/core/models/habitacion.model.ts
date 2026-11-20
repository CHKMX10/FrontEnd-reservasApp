export const TIPOS_HABITACION = ['Sencilla', 'Doble', 'Suite'] as const;
export type TipoHabitacion = typeof TIPOS_HABITACION[number];
export const ESTADOS_HABITACION = [
  { id: 1, label: 'DISPONIBLE' }, { id: 2, label: 'OCUPADA' },
  { id: 3, label: 'LIMPIEZA' }, { id: 4, label: 'MANTENIMIENTO' }
] as const;
export type EstadoHabitacion = typeof ESTADOS_HABITACION[number]['label'];
export interface HabitacionRequest {
  numero: number;
  tipo: TipoHabitacion;
  precio: number;
  capacidad: number;
}
export interface HabitacionResponse extends HabitacionRequest {
  idHabitacion: number;
  estado: EstadoHabitacion;
  estadoRegistro: 'ACTIVO' | 'ELIMINADO';
}
