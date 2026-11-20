import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ESTADOS_RESERVA, HuespedOpcion, ReservaRequest, ReservaResponse } from '../../core/models/reservas.model';
import { HabitacionResponse } from '../../core/models/habitacion.model';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { HuespedService } from '../../huespedes/huesped.service';
import { ReservaService } from '../reserva.service';
import { mensajeReserva } from '../reserva-error';

@Component({
  selector: 'app-reserva-form',
  standalone: false,
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.scss'
})
export class ReservaFormComponent implements OnInit {
  form: FormGroup;
  guardando = false;
  cargandoHabitaciones = false;
  cargandoHuespedes = false;
  huespedes: HuespedOpcion[] = [];
  habitaciones: HabitacionResponse[] = [];

  get esEdicion(): boolean { return !!this.data.reserva; }
  get soloLectura(): boolean {
    if (this.data.soloLectura) return true;
    const reserva = this.data.reserva;
    return !!reserva && reserva.estadoReserva !== ESTADOS_RESERVA.CONFIRMADA && reserva.estadoReserva !== ESTADOS_RESERVA.EN_CURSO;
  }
  get habitacionSeleccionada(): HabitacionResponse | undefined {
    return this.habitaciones.find(h => h.idHabitacion === this.form.get('idHabitacion')?.value);
  }

  constructor(private fb: FormBuilder, private reservaService: ReservaService,
    private habitacionService: HabitacionService, private huespedService: HuespedService, private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ReservaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reserva: ReservaResponse | null; soloLectura: boolean }) {
    this.form = this.fb.group({
      idHuesped: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      idHabitacion: [null, Validators.required],
      fechaEntrada: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      numeroPersonas: [null, [Validators.required, Validators.min(1), Validators.max(32767), Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnInit(): void {
    this.form.get('fechaEntrada')?.valueChanges.subscribe(() => this.form.get('fechaSalida')?.updateValueAndValidity());
    this.form.get('idHabitacion')?.valueChanges.subscribe(() => this.form.get('numeroPersonas')?.updateValueAndValidity());
    const reserva = this.data.reserva;
    if (reserva) {
      // En edición se conservan los identificadores y la cantidad de personas.
      this.form.patchValue({ idHuesped: reserva.idHuesped, idHabitacion: reserva.idHabitacion, fechaEntrada: reserva.fechaEntrada, fechaSalida: reserva.FechaSalida, numeroPersonas: reserva.numeroPesronas });
      this.form.get('idHuesped')?.disable();
      this.form.get('idHabitacion')?.disable();
      this.form.get('numeroPersonas')?.disable();
      if (reserva.estadoReserva === ESTADOS_RESERVA.EN_CURSO) this.form.get('fechaEntrada')?.disable();
      if (this.soloLectura) this.form.disable();
    } else {
      this.cargarHabitaciones();
      this.cargarHuespedes();
    }
  }


  cargarHabitaciones(): void {
    this.cargandoHabitaciones = true;
    this.habitacionService.listar().subscribe({
      next: data => { this.habitaciones = data.filter(h => h.estado === 'DISPONIBLE'); this.cargandoHabitaciones = false; },
      error: err => { this.cargandoHabitaciones = false; this.mostrarMensaje(mensajeReserva(err)); }
    });
  }

  cargarHuespedes(): void {
    this.cargandoHuespedes = true;
    this.huespedService.listar().subscribe({
      next: data => {
        this.huespedes = data.filter(h => h.estadoRegistro === 'ACTIVO');
        this.cargandoHuespedes = false;
      },
      error: err => {
        this.cargandoHuespedes = false;
        this.mostrarMensaje(mensajeReserva(err));
      }
    });
  }

  guardar(): void {
    if (this.soloLectura || this.guardando) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const valores = this.form.getRawValue();
    if (valores.fechaSalida <= valores.fechaEntrada) {
      this.form.get('fechaSalida')?.setErrors({ rango: true });
      this.form.get('fechaSalida')?.markAsTouched();
      return;
    }
    if (!this.esEdicion && (!this.habitacionSeleccionada || valores.numeroPersonas > this.habitacionSeleccionada.capacidad)) {
      this.form.get('numeroPersonas')?.setErrors({ capacidad: true });
      this.form.get('numeroPersonas')?.markAsTouched();
      return;
    }
    const request: ReservaRequest = {
      idHuesped: valores.idHuesped,
      idHabitacion: valores.idHabitacion,
      fechaEntrada: valores.fechaEntrada,
      fechaSalida: valores.fechaSalida,
      numeroPersonas: valores.numeroPersonas
    };
    this.guardando = true;
    const obs = this.data.reserva
      ? this.reservaService.actualizar(this.data.reserva.id, request)
      : this.reservaService.registrar(request);
    obs.subscribe({
      next: () => { this.guardando = false; this.dialogRef.close(true); this.mostrarMensaje('Reserva guardada correctamente'); },
      error: err => {
        this.guardando = false;
        if (err.status === 400 && Array.isArray(err.error?.errores)) {
          for (const error of err.error.errores) {
            if (typeof error !== 'string') continue;
            const i = error.indexOf(':');
            if (i < 0) continue;
            const control = this.form.get(error.slice(0, i).trim());
            if (control) { control.setErrors({ ...control.errors, servidor: error.slice(i + 1).trim() }); control.markAsTouched(); }
          }
        }
        this.mostrarMensaje(mensajeReserva(err));
      }
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
  private mostrarMensaje(mensaje: string): void { this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 }); }
}
