import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ICell, IColumn, IHeight, IId, IRow, ISource } from './models';
import { debounceTime, Subject } from 'rxjs';

/** Интерфейс индексов */
interface IIndex
{
  /** Индекс начала */
  startIndex: number;
  /** Индекс конца */
  endIndex: number
}

/** Интерфейс данных */
interface IData
{
  /** Отображаемые ячейки */
  items: ICell[];
  /** Добавляемый прикрепляемый элемент  */
  addedSticky: { rowStart: number; height: number },
  /** Индексы отображения */
  index: IIndex;
  /** Отображаемая высота */
  height: number;
  /** Начальная высота */
  startHeight: number;
  /** Конечная высота */
  endHeight: number;
}

/** Компонент виртуального скроллинга таблицы */
@Component({
  selector: 'sat-virtual-grid[source]',
  templateUrl: './sat-virtual-grid.component.html',
  styleUrls: ['./sat-virtual-grid.component.scss']
})
export class SATVirtualGrigComponent implements OnInit, AfterViewInit, OnDestroy, IHeight
{
  /** Обнаружение изменений */
  private readonly cdr = inject(ChangeDetectorRef);
  /** Компонент */
  private readonly elementRef = inject(ElementRef);

  /** Источник данных */
  private _source: ISource = { grids: [{ id: '0', rows: [], columns: [] }] };

  get source(): ISource { return this._source; }

  /** Строки */
  @Input() set source(value: ISource)
  {
    this._source = value;
    this.columns = value.grids[0]?.columns ?? [];
    this.calcItemsFlat();
    this._data = this.clearData;
    this.calcMaxHeight();
  }

  // /** Строки */
  // private _items: IRow[] = [];
  // /** Строки */
  // get items(): IRow[] { return this._items; }
  // /** Строки */
  // @Input() set items(value: IRow[])
  // {
  //   this._items = value;
  //   this.calcItemsFlat();
  //   this._data = this.clearData;
  //   this.calcMaxHeight();
  // }

  /** Плоский список строк */
  private itemsFlat: IRow[] = [];

  /** Буферное количество строк */
  @Input() buffer = 5;
  /** Колонки */
  protected columns!: IColumn[];

  /** Индексы отрисовки */
  protected index: IIndex = { startIndex: 0, endIndex: 0 };

  /** Максимальная высота всех элементов */
  protected maxHeight = 10;
  /** Текущая отображаемая высота строк */
  height = 10;

  /** Событие обновления высоты */
  readonly updateHeight$ = new Subject<void>;

  // readonly updateStart$ = new Subject<void>;
  /** Событие обновления */
  protected readonly updateScroll$ = new Subject<number>;

  /** Наблюдатель за размером */
  private resizeObserver = new ResizeObserver(entries =>
  {
    for (const entry of entries)
      if (entry.contentRect.height !== this.height)
        this.height = entry.contentRect.height;

    this.cdr.detectChanges();
  });

  /** данные */
  private _data: IData = this.clearData;

  /** Индекс подсветки */
  highlightIndex = 0;

  /** Пустые данные */
  protected get clearData(): IData
  {
    return {
      items: [],
      addedSticky: { rowStart: 0, height: 0 },
      index: { startIndex: 0, endIndex: 0 },
      height: 0,
      startHeight: 0,
      endHeight: 0
    };
  }

  /** Данные для отрисовки */
  protected get data(): IData
  {
    if (!this.itemsFlat.length) return this.clearData;
    if (this._data.index.startIndex === this.index.startIndex /* && this._data.index.endIndex === this.index.endIndex */ && this._data.height === this.height)
      return this._data;

    this._data = this.clearData;

    const items = this._data.items;
    let itemsDrawAddIndex = 0;

    let h = 0;

    if (this.index.startIndex < 0) this.index.startIndex = 0;
    if (this.index.startIndex >= this.itemsFlat.length) this.index.startIndex = this.itemsFlat.length - 1;

    for (let j = 0; j < this.index.startIndex; j++)
      h += this.itemsFlat[j].height ?? 20;

    let i = this.index.startIndex;
    let afterCount = 0;

    const dItems = new Set<ICell>();
    while (i < this.itemsFlat.length)
    {
      this.itemsFlat[i].cells.forEach(cell =>
      {
        if (this.calcHideCell(cell)) return;

        items.push(cell);
        dItems.add(cell);
      });

      h += this.itemsFlat[i].height ?? 20;
      if (h - this.scrollTop >= this.height)
      {
        afterCount++;
        if (afterCount > 5) break;
      }
      i++;
    }

    this.index.endIndex = i - 1;

    let stickyHeight = 0;
    {
      const added = new Set<number>();
      if (this.index.startIndex)
        for (let j = this.index.startIndex - 1; j >= 0; j--)
        {
          if (this.itemsFlat[j].cells.some(cell => cell.position === 'sticky' && typeof cell.top === 'number' && !added.has(cell.top) && added.add(cell.top)))
          {
            this.itemsFlat[j].cells.forEach(cell =>
            {
              if (cell.position !== 'sticky') return;

              if (this.calcHideCell(cell)) return;

              items.push(cell);
              dItems.add(cell)
            });
            stickyHeight += this.itemsFlat[j].height ?? 20;
            if (!itemsDrawAddIndex) itemsDrawAddIndex = j;
          }

          this.itemsFlat[j].cells.forEach(cell =>
          {
            if (cell.position === 'sticky') return;
            if (this.calcHideCell(cell)) return;

            if ((cell.rowspan ?? 1) < 2 || dItems.has(cell)) return;
            if ((cell.rowStart ?? 1) - 1 <= this.index.endIndex &&
              ((cell.rowStart ?? 1) + (cell.rowspan ?? 1) - 2) >= this.index.startIndex)
              items.push(cell);

          });
        }
    }

    this._data.index.startIndex = this.index.startIndex;
    this._data.index.endIndex = this.index.endIndex;
    this._data.height = this.height;

    const dy = this.index.endIndex - this.index.startIndex + 1;

    if (dy < items.length)
    {
      const firstStickyRow = this.itemsFlat[itemsDrawAddIndex].cells[0].rowStart ?? 1;
      for (let i = itemsDrawAddIndex + 1; i < this.index.startIndex; i++)
        this._data.addedSticky.height += this.itemsFlat[i].height ?? 0;

      this._data.addedSticky.rowStart = firstStickyRow + 1;
    }

    h = 0;
    for (let i = 0; i < this.index.startIndex; i++)
      h += this.itemsFlat[i].height ?? 20;

    this._data.startHeight = h - stickyHeight;

    for (let i = this.index.startIndex; i <= this.index.endIndex; i++)
      h += this.itemsFlat[i].height ?? 20;

    this._data.endHeight = this.maxHeight - h;

    let hh = 0;
    for (let i = 0; i < this.itemsFlat.length; i++)
      hh += this.itemsFlat[i].height ?? 20;

    return this._data;
  }

  protected get getThis(): IHeight { return this; }

  /** Позиция скроллинга  */
  private scrollTop = 0;

  /** Жизненный цикл */
  ngOnInit()
  {
    this.updateHeight$.pipe(debounceTime(100)).subscribe(() =>
    {
      this.calcMaxHeight();
      this.update();
    });

    this.updateScroll$.pipe(debounceTime(50)).subscribe(top =>
    {
      this.scrollTop = top;

      let h = 0;
      let i = 0;

      while (top > h && i < this.itemsFlat.length)
      {
        h += this.itemsFlat[i].height ?? 20;
        i++;
      }
      i -= this.buffer;
      if (i >= this.itemsFlat.length) i = this.itemsFlat.length - 1;
      if (i < 0) i = 0;

      this.index.startIndex = i;

      this.cdr.detectChanges();
    });
  }

  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /** Жизненный цикл уничтожения */
  ngOnDestroy(): void
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  /** Обновить */
  update(): void
  {
    this._data = this.clearData;
    this.cdr.detectChanges();
  }

  /** Навигация к выбранной строке */
  navigate(rowIndex: number): void
  {
    let h = 0;
    for (let i = 0; i < rowIndex; i++)
      h += this.itemsFlat[i].height ?? 20;

    h -= 50;
    if (h < 0) h = 0;

    this.elementRef.nativeElement.scrollTo({ top: h, behavior: 'smooth' });
    this.highlightIndex = rowIndex + 1;
    setTimeout(() => this.highlightIndex = 0, 5000);
  }

  /** Раскрытие строки */
  onExpand(row: IRow, isExpand: boolean): void
  {
    if (row.isExpanded === isExpand) return;
    if (!row.children?.length) return;
    row.isExpanded = isExpand;

    const index = this.itemsFlat.findIndex(r => r === row);
    const item = this.itemsFlat[index];

    if (row.isExpanded)
    {
      const countAdd = (item.children ?? []).length;

      for (let i = index + 1; i < this.itemsFlat.length; i++)
        this.itemsFlat[i].cells.forEach(cell => cell.rowStart = i + countAdd + 1);

      this.itemsFlat.splice(index + 1, 0, ...item.children ?? []);
      item.children?.forEach((row, i) => row.cells.forEach(cell => cell.rowStart = index + i + 2));
    }
    else
    {
      this.itemsFlat.splice(index + 1, this.itemsFlat[index].children?.length ?? 0);
      for (let i = index + 1; i < this.itemsFlat.length; i++)
        this.itemsFlat[i].cells.forEach(cell => cell.rowStart = i + 1);
    }

    this.itemsFlat = [...this.itemsFlat];
    this.calcMaxHeight();
    this.update();
  }

  /** Вычисление максимальной высоты */
  private calcMaxHeight()
  {
    this.maxHeight = 0;
    this.itemsFlat.forEach(row =>
    {
      let h = 0;
      row.cells.forEach(cell =>
      {
        if ((cell.rowspan ?? 1) > 1) return;

        if (this.calcHideCell(cell)) return;

        h = Math.max(h, cell.height ?? 0);
      });
      row.height = h;
      this.maxHeight += h;
    });

    this.maxHeight += 2;
  }

  /** Скрыта ли строка */
  private calcHideCell(cell: ICell): boolean
  {
    if (!this.columns) return false;
    const index = (cell.colStart ?? 1) - 1;
    if (index >= this.columns.length) return false;
    const collapsed = this.columns[index].collapsed;

    if (collapsed && !cell.wenColumnCollapsed && (cell.canHide ?? true)) return true;
    if (!collapsed && cell.wenColumnCollapsed) return true;

    cell.collapsed = collapsed && !(cell.canHide ?? true);
    return false;
  }

  /** Вычисление плоского списка */
  private calcItemsFlat(): void
  {
    this.itemsFlat = [];
    this.source.grids.forEach(g => g.rows.forEach(row => this.addFlatRow(row)));
  }

  /** Добавить строку */
  private addFlatRow(row: IRow): void
  {
    this.itemsFlat.push(row);
    row.cells.forEach(cell => cell.rowStart = this.itemsFlat.length);
    if (row.isExpanded)
      row.children?.forEach(chRow => this.addFlatRow(chRow));
  }

  /** Обработчик события скроллинга */
  @HostListener('scroll', ['$event.target.scrollTop'])
  private onScroll(top: number): void
  {
    this.updateScroll$.next(top);
  }

  protected trackById(_: number, row: IId): string { return row.id; }
}
