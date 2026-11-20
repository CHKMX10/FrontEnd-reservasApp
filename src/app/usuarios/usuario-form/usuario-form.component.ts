import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioResponse, UsuarioRequest, ROLES_CATALOGO } from '../../core/models/usuario.model';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: false,
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {

  guardando = false;
  esEdicion = false;
  soloLectura = false;
  form: FormGroup;
  readonly rolesCatalogo = ROLES_CATALOGO;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: UsuarioResponse | null; soloLectura: boolean }
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(/^(?=.*[A-Za-z])(?=.*[0-9]).+$/)]],
      rol: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const usuario = this.data.usuario;
    this.soloLectura = this.data.soloLectura;
    if (usuario) {
      this.esEdicion = true;
      this.form.patchValue({
        username: usuario.username,
        rol: usuario.roles[0]
      });

      this.form.get('username')?.disable();
      this.form.get('password')?.removeValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
    if (this.soloLectura) this.form.disable();
  }

  guardar(): void {
    if (this.soloLectura || this.guardando) return;
    if (!this.esEdicion) {
      const username = this.form.get('username');
      username?.setValue((username.value ?? '').trim());
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valores = this.form.getRawValue();
    const request: UsuarioRequest = { username: valores.username, password: valores.password || null, roles: [valores.rol] };

    const obs = this.esEdicion
      ? this.usuarioService.actualizar(this.data.usuario!.id, request)
      : this.usuarioService.registrar(request);

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.dialogRef.close(true);
        this.mostrarMensaje(`Usuario: ${request.username} ${this.esEdicion ? 'actualizado' : 'registrado'}`);
      },
      error: (err) => {
        this.guardando = false;
        if (err.status === 400 && Array.isArray(err.error?.errores)) {
          for (const error of err.error.errores) {
            if (typeof error !== 'string' || !error.includes(':')) continue;
            const i = error.indexOf(':');
            const campo = error.slice(0, i).trim();
            const control = this.form.get(campo === 'roles' ? 'rol' : campo);
            if (control) {
              control.setErrors({ servidor: error.slice(i + 1).trim() });
              control.markAsTouched();
            }
          }
        }
        this.mostrarMensaje(err?.error?.detail ?? err?.error?.message ?? 'Error al guardar el usuario');
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}