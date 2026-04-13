import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { IColumn, IUpdate } from './models';


/** Директива динамического определения ширины */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dynamicWidth]' })
export class DynamicWidthDirective implements AfterViewInit, OnDestroy
{
  @Input() column: IColumn | undefined;
  @Input() columns: IColumn[] | undefined;

  // @Input() cdr: ChangeDetectorRef | undefined;
  // @Input() column: IColumn | undefined;
  @Input('root') r: IUpdate | undefined;
  

  private resizeObserver: ResizeObserver | undefined;
  private elementRef = inject(ElementRef);


  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    this.resizeObserver = new ResizeObserver(entries =>
    {
      let isUpdate = false;
      for (const entry of entries)
      {
        if (!this.column || this.column?.widthInPx === entry.contentRect.width) continue;
        isUpdate = true;
        this.column.widthInPx = entry.contentRect.width;
      }

      // if (!isUpdate || this.columns?.some(c => c.widthInPx === undefined)) return;

      // this.cdr?.detectChanges();
      // this.r?.update();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /** Жизненный цикл после уничтожения */
  ngOnDestroy(): void
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
