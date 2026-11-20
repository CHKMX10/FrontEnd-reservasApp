import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  HuespedRequest,
  HuespedResponse,
  TIPOS_DOCUMENTO_CATALOGO
} from '../../core/models/huesped.model';
import { HuespedService } from '../huesped.service';

@Component({
  selector: 'app-huesped-form',
  standalone: false,
  templateUrl: './huesped-form.component.html',
  styleUrl: './huesped-form.component.scss'
})
export class HuespedFormComponent implements OnInit {

  form: FormGroup;
  guardando = false;
  esEdicion = false;
  soloLectura = false;
  readonly tiposDocumento = TIPOS_DOCUMENTO_CATALOGO;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HuespedFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { huesped: HuespedResponse | null; soloLectura: boolean }
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      idTipoDocumento: [null, [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      nacionalidad: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    const huesped = this.data.huesped;
    this.soloLectura = this.data.soloLectura;
    if (huesped) {
      this.esEdicion = true;
      this.form.patchValue({
        nombre: huesped.nombre,
        apellidos: huesped.apellidos,
        email: huesped.email,
        telefono: huesped.telefono,
        idTipoDocumento: this.tiposDocumento.find(t => t.descripcion === huesped.tipoDocumento)?.id ?? null,
        numeroDocumento: huesped.numeroDocumento,
        nacionalidad: huesped.nacionalidad
      });
    }
    if (this.soloLectura) this.form.disable();
  }

  guardar(): void {
    if (this.soloLectura || this.guardando) return;
    for (const campo of ['nombre', 'apellidos', 'email', 'telefono', 'numeroDocumento', 'nacionalidad']) {
      const control = this.form.get(campo);
      control?.setValue((control.value ?? '').trim());
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const request: HuespedRequest = {
      nombre: raw.nombre.trim(),
      apellidos: raw.apellidos.trim(),
      email: raw.email.trim(),
      telefono: raw.telefono.trim(),
      numeroDocumento: raw.numeroDocumento.trim(),
      idTipoDocumento: Number(raw.idTipoDocumento),
      nacionalidad: raw.nacionalidad.trim()
    };

    this.guardando = true;
    const obs$ = this.esEdicion
      ? this.huespedService.actualizar(this.data.huesped!.id, request)
      : this.huespedService.registrar(request);

    obs$.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarMensaje(
          `Huésped ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando = false;
        if (err.status === 400 && Array.isArray(err.error?.errores)) {
          for (const error of err.error.errores) {
            if (typeof error !== 'string' || !error.includes(':')) continue;
            const i = error.indexOf(':');
            const campo = error.slice(0, i).trim();
            const control = this.form.get(campo);
            if (control) {
              control.setErrors({ servidor: error.slice(i + 1).trim() });
              control.markAsTouched();
            }
          }
        }
        const erroresBackend = Array.isArray(err?.error?.errores)
          ? err.error.errores.join(' | ')
          : null;
        this.mostrarMensaje(
          erroresBackend ?? err?.error?.detail ?? err?.error?.message ?? 'Error al guardar el huésped'
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
