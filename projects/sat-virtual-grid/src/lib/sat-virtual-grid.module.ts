import { NgModule } from '@angular/core';
import { SATVirtualGrigComponent } from './sat-virtual-grid.component';
import { TopPipe } from './pipes/top.pipe';
import { DynamicHeightDirective } from './dynamic-height.directive';
import { CommonModule } from '@angular/common';
import { ColumnsPipe } from './pipes/columns.pipe';



@NgModule({
  declarations: [
    SATVirtualGrigComponent,
    TopPipe,
    DynamicHeightDirective,
      ColumnsPipe
   ],
  imports: [
    CommonModule
  ],
  exports: [
    SATVirtualGrigComponent
  ]
})
export class SATVirtualGridModule { }
