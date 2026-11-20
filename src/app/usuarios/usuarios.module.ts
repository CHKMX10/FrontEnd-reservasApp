import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { MaterialModule } from '../material/material.module';
import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';

@NgModule({
  declarations: [
    UsuarioListComponent,
    UsuarioFormComponent
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UsuariosModule { }