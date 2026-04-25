import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';


import { AppComponent } from './app.component';
// import { SATVirtualGridModule } from 'sat-virtual-grid';
import { SafeHtmlPipe } from './safe-html.pipe';
import { DocParamComponent } from './doc-param/doc-param.component';
import { SATVirtualGrigComponent } from 'sat-virtual-grid';

@NgModule({
  declarations: [
    AppComponent,
    SafeHtmlPipe,
    DocParamComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    SATVirtualGrigComponent
    // SATVirtualGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule
{
  constructor(injector: Injector)
  {
    customElements.define('doc-param', createCustomElement(DocParamComponent, { injector }));

  }
}
