import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DynamicHeightDirective } from './dynamic-height.directive';
import { ColumnsPipe } from './pipes/columns.pipe';
import { PxPipe } from './pipes/px.pipe';
import { SATVirtualGrigComponent } from './sat-virtual-grid.component';

/** Модуль */
@NgModule({
  declarations: [
    SATVirtualGrigComponent,
    PxPipe,
    DynamicHeightDirective,
    ColumnsPipe
  ],
  imports: [
    CommonModule,
    NgScrollbarModule
  ],
  exports: [
    SATVirtualGrigComponent
  ]
})
export class SATVirtualGridModule { }
