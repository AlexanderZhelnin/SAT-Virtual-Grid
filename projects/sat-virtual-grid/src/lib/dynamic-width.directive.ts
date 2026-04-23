import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { IColumn, IUpdate } from './models';


/** Директива динамического определения ширины */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
    selector: '[dynamicWidth]',
    standalone: false
})
export class DynamicWidthDirective implements AfterViewInit, OnDestroy
{
  /** Колонки */
  @Input() column: IColumn | undefined;
  /** Список колонок */
  @Input() columns: IColumn[] | undefined;

  /** Объект обновления */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('root')
  r: IUpdate | undefined;

  /** Отслеживание изменений размера */
  private resizeObserver: ResizeObserver | undefined;
  /** Элемент */
  private elementRef = inject(ElementRef);


  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    this.resizeObserver = new ResizeObserver(entries =>
    {
      // let isUpdate = false;
      for (const entry of entries)
      {
        if (!this.column || this.column?.widthInPx === entry.contentRect.width) continue;
        // isUpdate = true;
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
