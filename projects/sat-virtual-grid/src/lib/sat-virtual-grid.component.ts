import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgScrollbar } from 'ngx-scrollbar';
import { BehaviorSubject, debounceTime, filter, firstValueFrom, fromEvent, Subject, Subscription } from 'rxjs';
import { ICell, IColumn, IGrid, IHeight, IId, IRow, ISource } from './models';
import { IData, IDataGrid, IGridFlat, IIndex } from './interfaces';
import { Flat } from './flat';




/** Компонент виртуального скроллинга таблицы */
@Component({
  selector: 'sat-virtual-grid[source]',
  templateUrl: './sat-virtual-grid.component.html',
  styleUrls: ['./sat-virtual-grid.component.scss']
})
export class SATVirtualGrigComponent implements OnInit, AfterViewInit, OnDestroy, IHeight
{
  /** Скроллинг */
  @ViewChild('sc', { static: true }) sc!: NgScrollbar;

  /** Скроллинг */
  @ViewChild('scContent', { static: true }) scContent!: ElementRef;

  /** Обнаружение изменений */
  private readonly cdr = inject(ChangeDetectorRef);
  /** Компонент */
  private readonly elementRef = inject(ElementRef);


  private refreshItems$ = new Subject<void>();
  private refresh$ = new Subject<void>();

  private subs: Subscription[] = [];

  /** Источник данных */
  private _source: ISource = { grids: new BehaviorSubject<IGrid[]>([{ id: '0', rows: new BehaviorSubject<IRow[]>([]), columns: new BehaviorSubject<IColumn[]>([]) }]) };

  /** @returns Источник */
  get source(): ISource { return this._source; }

  /** Источник */
  @Input() set source(value: ISource)
  {
    this._source = value;

    let canRefresh = false;
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
    this.subs.push(
      value.grids.subscribe(gs =>
      {
        //if (gs?.length > 0)

        //this.subs.push(gs[0].columns.subscribe(cs => this.columns = cs ?? []));
        gs.forEach(g => this.subs.push(g.columns.pipe(filter(() => canRefresh)).subscribe(() => this.refresh$.next())));
        gs.forEach(g => this.subs.push(g.rows.pipe(filter(() => canRefresh)).subscribe(() => this.refreshItems$.next())));

        this.calcItemsFlat();
        this._data = this.clearData;
        this.calcMaxHeight();
        canRefresh = true;
      }));
  }

  /** Событие загрузки ячеек */
  @Output() loadedRows = new EventEmitter<{ cells: ICell[]; waiter?: Subject<void>; position?: 'start' | 'end' | 'other' }>();
  /** Событие выгрузки ячеек */
  @Output() unLoadedRows = new EventEmitter<{ cells: ICell[]; waiter?: Subject<void> }>();

  /** Плоский список строк */
  private _itemsFlat: IGridFlat[] = [];

  /** Буферное количество строк */
  @Input() buffer = 5;
  // /** Колонки */
  // protected columns!: IColumn[];

  private get emptyIndex(): IIndex { return ({ startIndex: 0, endIndex: -1 }); }

  /** Индексы отрисовки */
  protected index: IIndex = this.emptyIndex;

  /** Максимальная высота всех элементов */
  protected maxHeight = 10;
  /** Текущая отображаемая высота строк */
  height = 10;

  /** Событие обновления высоты */
  readonly updateHeight$ = new Subject<void>();

  // readonly updateStart$ = new Subject<void>;
  /** Событие обновления */
  protected readonly updateScroll$ = new Subject<number>();

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

  /** @returns Пустые данные */
  protected get clearData(): IData
  {
    return {
      grids: [],
      index: this.emptyIndex,
      height: 0,
      startHeight: 0,
      endHeight: 0
    };
  }

  /** @returns Данные для отрисовки */
  protected get data(): IData
  {
    if (!this._itemsFlat.length) return this.clearData;
    if (!(this._data.index.startIndex === this.index.startIndex && this._data.height === this.height))
    {
      const d = this.calcData();
      this.diffData(this._data, d);
      this._data = d;

    }

    return this._data
  }

  /** @returns текущий объект */
  protected get getThis(): IHeight { return this; }

  /** Позиция скроллинга  */
  private scrollTop = 0;

  /** Жизненный цикл */
  ngOnInit(): void
  {
    this.refreshItems$.pipe(debounceTime(50)).subscribe(() =>
    {
      this.calcItemsFlat();
      this.calcMaxHeight();
      this.update();
    });

    this.refresh$.pipe(debounceTime(50)).subscribe(() => this.update());


    this.updateHeight$.pipe(debounceTime(100)).subscribe(() =>
    {
      this.calcMaxHeight();
      this.update();
    });

    this.updateScroll$.pipe(debounceTime(50)).subscribe(top =>
    {
      this.scrollTop = top;

      let h = 0;

      this.index = { startIndex: 0, endIndex: -1 };

      let i = 0;
      new Flat(this._itemsFlat).forEach(row =>
      {
        h += row.height ?? 20;

        if (top <= h)
        {
          i -= this.buffer;

          //if (i >= this.itemsFlat.length) i = this.itemsFlat.length - 1;
          if (i < 0) i = 0;

          this.index.startIndex = i;
          this.cdr.detectChanges();
          return true;
        }
        i++;
        return false;
      })
    });
  }

  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    fromEvent(this.sc.nativeElement.querySelector('.ng-scroll-viewport')!, 'scroll').subscribe((s: any) => this.onScroll(s.target.scrollTop));
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


  /**
   * Навигация к выбранной строке
   * @param rowIndex Номер строки
   */
  navigate(rowIndex: number): void
  {
    // let h = 0;
    // for (let i = 0; i < rowIndex; i++)
    //   h += this.itemsFlat[i].height ?? 20;

    // h -= 50;
    // if (h < 0) h = 0;

    // this.elementRef.nativeElement.scrollTo({ top: h, behavior: 'smooth' });
    // this.highlightIndex = rowIndex + 1;
    // setTimeout(() => this.highlightIndex = 0, 5000);
  }

  /**
   * Раскрытие строки
   * @param row Строка
   * @param isExpand Флаг раскрытия
   */
  onExpand(row: IRow, isExpand: boolean): void
  {
    if (row.isExpanded === isExpand) return;
    row.isExpanded = isExpand;

    if (!row.children?.length) return;

    const g = this._itemsFlat.find(gf => gf.id === row.grid.id);
    if (!g) return;
    const index = g.rows.findIndex(r => r === row);
    const item = g.rows[index];

    if (row.isExpanded)
    {
      const countAdd = (item.children ?? []).length;

      for (let i = index + 1; i < g.rows.length; i++)
        g.rows[i].cells.forEach(cell => cell.rowStart = i + countAdd + 1);

      g.rows.splice(index + 1, 0, ...item.children ?? []);
      item.children?.forEach((row, i) => row.cells.forEach(cell => cell.rowStart = index + i + 2));
    }
    else
    {
      g.rows.splice(index + 1, g.rows[index].children?.length ?? 0);
      for (let i = index + 1; i < g.rows.length; i++)
        g.rows[i].cells.forEach(cell => cell.rowStart = i + 1);
    }

    // this._itemsFlat = [...this._itemsFlat];
    this.calcMaxHeight();
    this.update();
  }

  /** Расчёт данных для вывода */
  private calcData(): IData
  {
    const result = this.clearData;

    result.index.startIndex = this.index.startIndex;
    result.index.endIndex = this.index.startIndex;
    result.height = this.height;

    let h = 0;
    // if (this.index.rowEndIndex < 0) this.index.rowEndIndex = 0;
    // if (this.index.gridEndIndex < 0) this.index.gridEndIndex = 0;
    //if (this.index.startIndex >= this.itemsFlat.length) this.index.startIndex = this.itemsFlat.length - 1;

    const flat = new Flat(this._itemsFlat);

    //#region Вычисление высоты до
    flat.forEach((row, index) =>
    {
      if (index === this.index.startIndex) return true;

      h += row.height ?? 20;

      return false;
    });

    result.startHeight = h;
    //#endregion

    const gridStartIndex = flat.gridStartIndex!;
    const rowStartIndex = flat.rowStartIndex!;
    const gridTop = flat.startIndexGrid;

    //#region Отображаемые данные
    let afterCount = 0;
    const dItems = new Set<ICell>();

    let cells: ICell[] = [];
    result.index.endIndex = this.index.startIndex - 1;
    flat.forEach(row =>
    {
      result.index.endIndex++;
      row.cells.forEach(cell =>
      {
        if (this.calcHideCell(cell)) return;
        cells.push(cell);
        dItems.add(cell);
      });

      h += row.height ?? 20;
      if (h - this.scrollTop >= this.height)
      {
        afterCount++;
        if (afterCount > this.buffer) return true;
      }

      return false;
    });
    //#endregion

    let firstStickyCell: ICell | undefined = undefined;
    let firstStickyIndex = 0;
    let stickyHeight = 0;
    let dGrid = new Map<IGrid, IDataGrid>();

    //#region Прикреплённые ячейки
    const added = new Set<number>();
    const addedCells: ICell[] = [];


    const rows = this._itemsFlat[gridStartIndex].rows;
    for (let ri = rowStartIndex - 1; ri >= 0; ri--)
    {
      const row = rows[ri];

      if (row.cells.some(cell => cell.position === 'sticky' && typeof cell.top === 'number' && !added.has(cell.top) && added.add(cell.top)))
      {
        row.cells.forEach(cell =>
        {
          if (cell.position !== 'sticky') return;

          if (this.calcHideCell(cell)) return;

          addedCells.push(cell);
          dItems.add(cell);

          if (!firstStickyCell)
          {
            firstStickyCell = cell;
            firstStickyIndex = ri;
          }
        });
        stickyHeight += row.height ?? 20;
      }

      row.cells.forEach(cell =>
      {
        if (cell.position === 'sticky') return;
        if (this.calcHideCell(cell)) return;

        if ((cell.rowspan ?? 1) < 2 || dItems.has(cell)) return;
        if ((cell.rowStart ?? 1) - 1 <= result.index.endIndex - gridTop &&
          ((cell.rowStart ?? 1) + (cell.rowspan ?? 1) - 2) >= result.index.startIndex - gridTop)
          addedCells.push(cell);
      });
    }

    cells = [...addedCells, ...cells];

    //#endregion

    //#region Группируем по сеткам
    let gridDraw: IDataGrid;
    let grid: IGrid | undefined = undefined;
    cells.forEach(cell =>
    {
      if (cell.row!.grid !== grid)
      {
        grid = cell.row!.grid;

        result.grids.push(gridDraw = {
          id: grid.id,
          items: [],
          columns: grid.columns.value,
          addedSticky: { rowStart: 0, height: 0 }
        });

        dGrid.set(grid, gridDraw);
      }

      gridDraw.items.push(cell);

    });
    //#endregion

    //#region Вычисление высоты после
    h = 0;
    flat.forEach(row => { h += row.height ?? 20; });

    result.endHeight = this.maxHeight - h;
    //#endregion

    //#region Вычисление дополнительного заполнения для прикреплённых
    const dy = this.index.endIndex - this.index.startIndex + 1;

    if (firstStickyCell && dy < flat.length)
    {
      const firstStickyRow = (firstStickyCell as ICell).rowStart ?? 1;
      gridDraw = dGrid.get((firstStickyCell as ICell).row?.grid!)!;
      if (gridDraw)
      {
        for (let i = firstStickyIndex + 1; i < rowStartIndex; i++)
          gridDraw.addedSticky.height += rows[i].height ?? 0;

        gridDraw.addedSticky.rowStart = firstStickyRow + 1;

        result.startHeight -= gridDraw.addedSticky.height;
      }
    }

    //#endregion

    return result;
  }

  /** Массив в словарь по ключу */
  private toDictionary<T extends IId>(mas: T[]): Map<string, T>
  {
    return mas.reduce((r, v) =>
    {
      r.set(v.id, v);
      return r;
    }, new Map<string, T>());

  }


  private loadedWaiter = new Subject<void>();
  private unLoadedWaiter = new Subject<void>();
  /** Разница между отрисовками */
  private async diffData(old: IData, current: IData): Promise<void>
  {
    const dOld = this.toDictionary(old.grids);
    const dNew = this.toDictionary(current.grids);

    const removed: ICell[] = [];
    const added: ICell[] = [];

    for (const gOld of old.grids)
    {
      const grid = dNew.get(gOld.id);
      if (!grid)
        removed.push(...gOld.items);
      else
      {
        const dNewRows = this.toDictionary(grid.items);
        for (const cell of gOld.items)
          if (!dNewRows.has(cell.id))
            removed.push(cell);
      }
    }

    for (const gNew of current.grids)
    {
      const grid = dOld.get(gNew.id);
      if (!grid)
        added.push(...gNew.items);
      else
      {
        const dOldRows = this.toDictionary(grid.items);
        for (const cell of gNew.items)
          if (!dOldRows.has(cell.id))
            added.push(cell);
      }
    }

    this.unLoadedRows.emit({ cells: removed, waiter: this.unLoadedWaiter });
    await firstValueFrom(this.unLoadedWaiter);

    this.loadedRows.emit({ cells: added, waiter: this.loadedWaiter });
    await firstValueFrom(this.loadedWaiter);
  }


  /** Вычисление максимальной высоты */
  private calcMaxHeight(): void
  {
    this.maxHeight = 0;

    new Flat(this._itemsFlat).forEach(row =>
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

  /**
   * Скрыта ли строка
   * @param cell Ячейка
   * @returns Флаг скрытия
   */
  private calcHideCell(cell: ICell): boolean
  {
    const columns = cell.row?.grid.columns.value;
    if (!columns) return false;
    const index = (cell.colStart ?? 1) - 1;
    if (index >= columns.length) return false;
    const collapsed = columns[index].collapsed;

    if (collapsed && !cell.wenColumnCollapsed && (cell.canHide ?? true)) return true;
    if (!collapsed && cell.wenColumnCollapsed) return true;

    cell.collapsed = collapsed && !(cell.canHide ?? true);
    return false;
  }

  /** Вычисление плоского списка */
  private calcItemsFlat(): void
  {
    this._itemsFlat = [];
    this.source.grids.value.forEach(grid =>
    {
      const g = { ...grid, columns: grid.columns.value, rows: [] };
      this._itemsFlat.push(g);
      grid.rows.value.forEach(row => this.addFlatRow(g, row));
    });
  }

  /**
   * Добавить строку
   * @param row строка
   */
  private addFlatRow(g: IGridFlat, row: IRow): void
  {
    g.rows.push(row);
    row.cells.forEach(cell => cell.rowStart = g.rows.length);
    if (row.isExpanded)
      row.children?.forEach(chRow => this.addFlatRow(g, chRow));
  }

  /**
   * Обработчик события скроллинга
   * @param top Верхний отступ
   */
  // @HostListener('scroll', ['$event.target.scrollTop'])
  private onScroll(top: number): void
  {
    this.updateScroll$.next(top);
  }

  protected trackById(_: number, row: IId): string { return row.id; }
}
