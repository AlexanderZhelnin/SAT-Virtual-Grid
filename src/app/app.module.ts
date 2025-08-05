import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';


import { AppComponent } from './app.component';
import { SATVirtualGridModule } from 'sat-virtual-grid';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    SATVirtualGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
