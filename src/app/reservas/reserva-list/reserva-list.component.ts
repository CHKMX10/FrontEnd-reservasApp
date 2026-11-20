import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ESTADOS_RESERVA, ReservaResponse } from '../../core/models/reservas.model';
import { AuthService } from '../../core/services/auth.service';
import { ReservaFormComponent } from '../reserva-form/reserva-form.component';
import { ReservaService } from '../reserva.service';
import { mensajeReserva } from '../reserva-error';

@Component({
  selector: 'app-reserva-list',
  standalone: false,
  templateUrl: './reserva-list.component.html',
  styleUrl: './reserva-list.component.scss'
})
export class ReservaListComponent implements OnInit {
  columnas = ['id', 'huesped', 'habitacion', 'fechaEntrada', 'fechaSalida', 'numeroPersonas', 'precioTotal', 'estado', 'acciones'];
  reservas: ReservaResponse[] = [];
  cargando = false;
  errorListado = false;
  operando = false;
  readonly estados = ESTADOS_RESERVA;

  get isAdmin(): boolean { return this.authService.isAdmin(); }

  constructor(private reservaService: ReservaService, private dialog: MatDialog,
    private snackBar: MatSnackBar, private authService: AuthService) { }

  ngOnInit(): void { this.buscar(); }

  buscar(): void {
    this.cargando = true;
    this.errorListado = false;
    this.reservaService.listar().subscribe({
      next: data => { this.reservas = data; this.cargando = false; },
      error: err => { this.cargando = false; this.errorListado = true; this.reservas = []; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  puedeEditar(reserva: ReservaResponse): boolean {
    return reserva.estadoReserva === this.estados.CONFIRMADA || reserva.estadoReserva === this.estados.EN_CURSO;
  }

  puedeEliminar(reserva: ReservaResponse): boolean {
    return this.isAdmin && (reserva.estadoReserva === this.estados.FINALIZADA || reserva.estadoReserva === this.estados.CANCELADA);
  }

  consultar(reserva: ReservaResponse): void {
    this.reservaService.obtenerPorId(reserva.id).subscribe({
      next: data => this.dialog.open(ReservaFormComponent, { width: '450px', data: { reserva: data, soloLectura: true } }),
      error: err => this.mostrarMensaje(mensajeReserva(err))
    });
  }

  abrirFormulario(reserva?: ReservaResponse): void {
    if (reserva && !this.puedeEditar(reserva)) return;
    this.dialog.open(ReservaFormComponent, { width: '450px', data: { reserva: reserva ?? null, soloLectura: false } })
      .afterClosed().subscribe(guardado => { if (guardado) this.buscar(); });
  }

  cambiarEstado(reserva: ReservaResponse, idEstado: number, accion: string): void {
    if (this.operando) return;
    if (reserva.estadoReserva === this.estados.CONFIRMADA) {
      if (idEstado !== 2 && idEstado !== 4) return;
    } else if (reserva.estadoReserva === this.estados.EN_CURSO) {
      if (idEstado !== 3) return;
    } else return;
    if (!confirm(`¿${accion} de la reserva ${reserva.id}?`)) return;
    this.operando = true;
    this.reservaService.cambiarEstado(reserva.id, idEstado).subscribe({
      next: () => { this.operando = false; this.mostrarMensaje('Estado actualizado correctamente'); this.buscar(); },
      error: err => { this.operando = false; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  eliminar(reserva: ReservaResponse): void {
    if (!this.puedeEliminar(reserva) || this.operando) return;
    if (!confirm(`¿Eliminar la reserva ${reserva.id}?`)) return;
    this.operando = true;
    this.reservaService.eliminar(reserva.id).subscribe({
      next: () => { this.operando = false; this.mostrarMensaje('Reserva eliminada correctamente'); this.buscar(); },
      error: err => { this.operando = false; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  private mostrarMensaje(mensaje: string): void { this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 }); }
}
