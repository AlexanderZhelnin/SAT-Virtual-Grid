import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DynamicHeightDirective } from './dynamic-height.directive';
import { ColumnsPipe } from './pipes/columns.pipe';
import { TopPipe } from './pipes/top.pipe';
import { SATVirtualGrigComponent } from './sat-virtual-grid.component';


@NgModule({
  declarations: [
    SATVirtualGrigComponent,
    TopPipe,
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
