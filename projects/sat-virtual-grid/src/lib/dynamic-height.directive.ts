import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { ICell, IHeight } from './models';


/** Директива динамического определения высоты */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
    selector: '[dynamicHeight]',
    standalone: false
})
export class DynamicHeightDirective implements AfterViewInit, OnDestroy
{
  /** Ячейка */
  @Input() dynamicHeight: ICell | undefined;
  /** Объект обновления */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('root') r: IHeight | undefined;

  /** Отслеживание изменений размера */
  private resizeObserver: ResizeObserver | undefined;
  /** Элемент */
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
          if (this.dynamicHeight.linkedHeightCell)
            this.dynamicHeight.linkedHeightCell.height = entry.borderBoxSize[0].blockSize;
          isUpdate = true;
        }

      if (isUpdate)
      {
        this.r?.updateHeight$?.next();
        this.r?.resizeCell.next(this.dynamicHeight!);
      }
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /** Жизненный цикл после уничтожения */
  ngOnDestroy(): void
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
