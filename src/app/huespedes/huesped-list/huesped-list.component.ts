import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


import {
  HuespedResponse
} from '../../core/models/huesped.model';
import { HuespedFormComponent } from '../huesped-form/huesped-form.component';
import { HuespedService } from '../huesped.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-huesped-list',
  standalone: false,
  templateUrl: './huesped-list.component.html',
  styleUrl: './huesped-list.component.scss'
})
export class HuespedListComponent implements OnInit {

  columnas = ['nombreCompleto', 'email', 'telefono', 'documento', 'nacionalidad', 'acciones'];
  huespedes: HuespedResponse[] = [];
  cargando = false;
  puedeEliminar = false;

  constructor(
    private huespedService: HuespedService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.puedeEliminar = this.authService.isAdmin();
    this.buscar();
  }


  buscar(): void {
    this.cargando = true;
    this.huespedService.listar().subscribe({
      next: (data) => {
        this.huespedes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarMensaje(err?.error?.detail ?? err?.error?.message ?? 'Error al cargar la lista de huéspedes');
      }
    });
  }

  abrirFormulario(huesped?: HuespedResponse): void {
    const ref = this.dialog.open(HuespedFormComponent, {
      width: '500px',
      data: { huesped: huesped ?? null, soloLectura: false }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) {
        this.buscar();
      }
    });
  }

  consultar(huesped: HuespedResponse): void {
    this.huespedService.obtenerPorId(huesped.id).subscribe({
      next: data => this.dialog.open(HuespedFormComponent, {
        width: '500px', data: { huesped: data, soloLectura: true }
      }),
      error: err => this.mostrarMensaje(err?.error?.detail ?? 'Error al consultar huésped')
    });
  }

  eliminar(huesped: HuespedResponse): void {
    if (!this.puedeEliminar) return;

    if (!confirm(`¿Eliminar al huésped "${huesped.nombre} ${huesped.apellidos}"?`)) {
      return;
    }

    this.huespedService.eliminar(huesped.id).subscribe({
      next: () => {
        this.mostrarMensaje('Huésped eliminado correctamente');
        this.buscar();
      },
      error: (err) => {
        this.mostrarMensaje(err?.error?.detail ?? err?.error?.message ?? 'Error al eliminar el huésped');
      }
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
