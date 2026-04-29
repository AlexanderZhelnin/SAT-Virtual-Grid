import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { ICell, IHeight } from './models';


/** Директива динамического определения высоты */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dynamicHeight]' })
export class DynamicHeightDirective implements AfterViewInit, OnDestroy
{
  /** Ячейка */
  @Input('dynamicHeight') cell: ICell | undefined;
  /** Объект обновления */
  @Input('root') r: IHeight | undefined;

  /** Отслеживание изменений размера */
  private resizeObserver: ResizeObserver | undefined;
  /** Элемент */
  private elementRef = inject(ElementRef);

  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    if (!this.cell || (this.cell.rowspan ?? 1) > 1) return;

    this.resizeObserver = new ResizeObserver(entries =>
    {
      let isUpdate = false;
      for (const entry of entries)
        if (this.cell && entry.borderBoxSize[0].blockSize !== this.cell.height)
        {
          this.cell.height = entry.borderBoxSize[0].blockSize;
          if (this.cell.linkedHeightCell)
            this.cell.linkedHeightCell.height = entry.borderBoxSize[0].blockSize;
          isUpdate = true;
        }

      if (isUpdate)
      {
        this.r?.updateHeight$?.next();
        this.r?.resizeCell.next(this.cell!);
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
