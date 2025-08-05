import { Directive, ElementRef, AfterViewInit, OnDestroy, Input, inject } from '@angular/core';
import { ICell, IHeight } from './models';

@Directive({
  selector: '[dynamicHeight]'
})
export class DynamicHeightDirective implements AfterViewInit, OnDestroy
{
  @Input() dynamicHeight: ICell | undefined;
  @Input('root') r: IHeight | undefined;

  private resizeObserver: ResizeObserver | undefined;
  private elementRef = inject(ElementRef);

  constructor() { }

  ngAfterViewInit()
  {
    if (!this.dynamicHeight || (this.dynamicHeight.rowspan ?? 1) > 1) return;

    this.resizeObserver = new ResizeObserver(entries =>
    {
      let isUpdate = false;
      for (const entry of entries)
        if (this.dynamicHeight && entry.contentRect.height !== this.dynamicHeight.height)
        {
          this.dynamicHeight.height = entry.contentRect.height;
          isUpdate = true;
        }

      //console.log(this.dynamicHeight!.height)
      if (isUpdate) this.r?.updateHeight$?.next();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy()
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
