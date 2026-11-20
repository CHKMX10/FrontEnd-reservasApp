import { HuespedService } from '../huespedes/huesped.service';
import { ReservaService } from '../reservas/reserva.service';
import { ESTADOS_RESERVA } from '../core/models/reservas.model';
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuarios/usuario.service';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';
import { HabitacionService } from '../habitaciones/habitacion.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  totalUsuarios = 0;
  totalHuespedes = 0;
  cargandoHuespedes = true;
  errorHuespedes = false;
  totalReservasActivas = 0;
  cargandoReservas = true;
  errorReservas = false;
  totalHabitacionesDisponibles = 0;

  cargando = true;
  errorUsuarios = false;
  cargandoHabitaciones = true;
  errorHabitaciones = false;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private habitacionService: HabitacionService,
    private reservaService: ReservaService,
    private huespedService: HuespedService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);

    this.listarHabitaciones();
    this.listarReservas();
    this.listarHuespedes();

    if (this.isAdmin) {
      this.listarUsuarios();
    }
  }

  // Usuarios registrados
  listarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.totalUsuarios = data.length;
        this.cargando = false;
      },
      error: () => {
        this.errorUsuarios = true;
        this.cargando = false;
      },
    });
  }

  // Habitaciones disponibles
  listarHabitaciones(): void {
    this.habitacionService.listar().subscribe({
      next: (data) => {
        this.totalHabitacionesDisponibles = data.filter(
          (habitacion) => habitacion.estado === 'DISPONIBLE',
        ).length;

        this.cargandoHabitaciones = false;
      },
      error: () => {
        this.errorHabitaciones = true;
        this.cargandoHabitaciones = false;
      },
    });
  }
  listarHuespedes(): void {
    this.huespedService.listar().subscribe({
      next: data => { this.totalHuespedes = data.length; this.cargandoHuespedes = false; },
      error: () => { this.errorHuespedes = true; this.cargandoHuespedes = false; }
    });
  }
  // Reservaciones vigentes
  listarReservas(): void {
    this.reservaService.listar().subscribe({
      next: (data) => {
        this.totalReservasActivas = data.filter(reserva =>
          reserva.estadoReserva === ESTADOS_RESERVA.CONFIRMADA ||
          reserva.estadoReserva === ESTADOS_RESERVA.EN_CURSO
        ).length;
        this.cargandoReservas = false;
      },
      error: () => {
        this.errorReservas = true;
        this.cargandoReservas = false;
      }
    });
  }
}
