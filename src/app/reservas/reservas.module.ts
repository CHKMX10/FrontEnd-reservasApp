import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservaReporteComponent } from './reserva-reporte/reserva-reporte.component';
import { ReservaListComponent } from './reserva-list/reserva-list.component';
import { ReservaFormComponent } from './reserva-form/reserva-form.component';

@NgModule({
  declarations: [ReservaListComponent, ReservaFormComponent, ReservaReporteComponent],
  imports: [CommonModule, ReservasRoutingModule, MaterialModule, ReactiveFormsModule]
})
export class ReservasModule { }
