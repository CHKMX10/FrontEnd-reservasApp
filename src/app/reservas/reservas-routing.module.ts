import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from '../core/guards/rol.guard';
import { ROLES } from '../core/models/usuario.model';
import { ReservaReporteComponent } from './reserva-reporte/reserva-reporte.component';
import { ReservaListComponent } from './reserva-list/reserva-list.component';

const routes: Routes = [{ path: 'reportes', component: ReservaReporteComponent, canActivate: [roleGuard], data: { roles: [ROLES[0]] } },
  { path: '', component: ReservaListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservasRoutingModule { }
