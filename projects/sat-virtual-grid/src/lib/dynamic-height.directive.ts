import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { ICell, IHeight } from './models';


/** Директива динамического определения высоты */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dynamicHeight]' })
export class DynamicHeightDirective implements AfterViewInit, OnDestroy
{
  @Input() dynamicHeight: ICell | undefined;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('root') r: IHeight | undefined;

  private resizeObserver: ResizeObserver | undefined;
  private elementRef = inject(ElementRef);

  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    if (!this.dynamicHeight || (this.dynamicHeight.rowspan ?? 1) > 1) return;

    this.resizeObserver = new ResizeObserver(entries =>
    {
      let isUpdate = false;
      for (const entry of entries)
        if (this.dynamicHeight && entry.borderBoxSize[0].blockSize !== this.dynamicHeight.height)
        {
          this.dynamicHeight.height = entry.borderBoxSize[0].blockSize;
          isUpdate = true;
        }

      if (isUpdate) this.r?.updateHeight$?.next();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /** Жизненный цикл после уничтожения */
  ngOnDestroy(): void
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
