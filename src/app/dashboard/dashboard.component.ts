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
  totalHabitacionesDisponibles = 0;

  cargando = true;
  cargandoHabitaciones = true;
  errorHabitaciones = false;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private habitacionService: HabitacionService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);

    this.listarHabitaciones();

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
}
