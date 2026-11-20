import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HuespedesRoutingModule } from './huespedes-routing.module';
import { HuespedListComponent } from './huesped-list/huesped-list.component';
import { HuespedFormComponent } from './huesped-form/huesped-form.component';
import { MatDialogContent } from '@angular/material/dialog';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HuespedListComponent,
    HuespedFormComponent
  ],
  imports: [
    CommonModule,
    HuespedesRoutingModule,
    MatDialogContent,
    MaterialModule,
    ReactiveFormsModule
]
})
export class HuespedesModule { }
