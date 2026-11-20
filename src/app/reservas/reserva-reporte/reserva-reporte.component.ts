import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservaResponse, ReportePorEstado } from '../../core/models/reservas.model';
import { ReservaService } from '../reserva.service';
import { mensajeReserva } from '../reserva-error';

@Component({
  selector: 'app-reserva-reporte',
  standalone: false,
  templateUrl: './reserva-reporte.component.html',
  styleUrl: './reserva-reporte.component.scss'
})
export class ReservaReporteComponent implements OnInit {
  columnas = ['id', 'huesped', 'habitacion', 'entrada', 'salida', 'personas', 'precioNoche', 'total', 'estado', 'registro'];
  reservas: ReservaResponse[] = [];
  grupos: ReportePorEstado = {};
  estados = ['CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
  porEstado = false;
  cargando = false;
  error = false;

  constructor(private reservaService: ReservaService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.historico(); }

  historico(): void {
    this.porEstado = false;
    this.cargando = true;
    this.error = false;
    this.reservaService.historico().subscribe({
      next: data => { this.reservas = data; this.cargando = false; },
      error: err => { this.error = true; this.cargando = false; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  reportePorEstado(): void {
    this.porEstado = true;
    this.cargando = true;
    this.error = false;
    this.reservaService.reportePorEstado().subscribe({
      next: data => { this.grupos = data; this.cargando = false; },
      error: err => { this.error = true; this.cargando = false; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500 });
  }
}
