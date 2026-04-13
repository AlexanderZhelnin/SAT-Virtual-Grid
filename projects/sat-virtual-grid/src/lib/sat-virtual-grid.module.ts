import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DynamicHeightDirective } from './dynamic-height.directive';
import { ColumnsPipe } from './pipes/columns.pipe';
import { PxPipe } from './pipes/px.pipe';
import { SATVirtualGrigComponent } from './sat-virtual-grid.component';
import { DynamicWidthDirective } from './dynamic-width.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';


/** Модуль */
@NgModule({
  declarations: [
    SATVirtualGrigComponent,
    PxPipe,
    SafeHtmlPipe,
    DynamicHeightDirective,
    DynamicWidthDirective,
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
