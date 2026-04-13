import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgScrollbar } from 'ngx-scrollbar';
import { BehaviorSubject, debounceTime, filter, firstValueFrom, fromEvent, Subject, Subscription } from 'rxjs';
import { Flat } from './flat';
import { IData, IDataGrid, IGridFlat, IIndex } from './interfaces';
import { ICell, IColumn, IGrid, IHeight, IId, IRow, ISource, IUpdate } from './models';


/** Компонент виртуального скроллинга таблицы */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'sat-virtual-grid[source]',
  templateUrl: './sat-virtual-grid.component.html',
  styleUrls: ['./sat-virtual-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SATVirtualGrigComponent implements OnInit, AfterViewInit, OnDestroy, IHeight
{
  /** Скроллинг */
  @ViewChild('sc', { static: true }) sc!: NgScrollbar;

  /** Обнаружение изменений */
  readonly cdr = inject(ChangeDetectorRef);
  /** Компонент */
  private readonly elementRef = inject(ElementRef);

  /** Событие перерасчёта элементов */
  refreshItems$ = new Subject<void>();
  /** Событие обновления */
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
        gs.forEach(g => this.subs.push(g.columns.pipe(filter(() => canRefresh)).subscribe(() => this.refresh$.next())));
        gs.forEach(g => this.subs.push(g.rows.pipe(filter(() => canRefresh)).subscribe(() => this.refreshItems$.next())));

        this.calcItemsFlat();
        this._data = this.clearData;
        this.calcMaxHeight();
        canRefresh = true;
        this.update();
      }));
  }

  /** Событие загрузки ячеек */
  @Output() loadedCells = new EventEmitter<{ cells: ICell[]; waiter?: Subject<void> }>();
  /** Событие выгрузки ячеек */
  @Output() unLoadedCells = new EventEmitter<{ cells: ICell[]; waiter?: Subject<void> }>();

  /** Событие Отрисовки */
  @Output() afterDraw = new EventEmitter<{ scrollTop: number; scrollLeft: number, cells: ICell[] }>();

  /** Плоский список строк */
  private _itemsFlat: IGridFlat[] = [];

  /** Буферное количество строк */
  @Input() buffer = { y: 5, x: 2 };

  /**
   * Пустой индекс
   * @returns Индекс
   */
  private get emptyIndex(): IIndex { return ({ startYIndex: 0, endYIndex: -1 }); }

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
  protected readonly updateScroll$ = new Subject<{ top: number; left: number }>();

  /** Наблюдатель за размером */
  private resizeObserver = new ResizeObserver(entries =>
  {
    for (const entry of entries)
      if (entry.contentRect.height !== this.height)
        this.height = entry.contentRect.height;


    this.lastUpdateScroll = 0;
    this.lastPositionTop.length = 0;
    // this.updateScroll$.next({
    //   top: this._scrollTop,
    //   left: this._scrollLeft
    // });
    this.update();
  });

  /** данные */
  private _data: IData = this.clearData;

  /** данные */
  private _oldData: IData = this.clearData;

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
  protected get data(): IData { return this._data; }

  /** @returns текущий объект */
  protected get getThis(): IHeight & IUpdate { return this; }

  /** Позиция скроллинга по вертикали */
  private _scrollTop = 0;
  /** @returns Позиция скроллинга по вертикали */
  get scrollTop() { return this._scrollTop; }

  /** Позиция скроллинга по горизонтали  */
  private _scrollLeft = 0;
  /** @returns Позиция скроллинга по горизонтали */
  get scrollLeft() { return this._scrollLeft; }

  private lastUpdateScroll = 0;
  private lastPositionTop: number[] = [];

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



    this.updateScroll$.pipe(debounceTime(50)).subscribe(position =>
    {
      const dTime = new Date().getTime();
      if (dTime - this.lastUpdateScroll > 200)
      {
        this.lastUpdateScroll = 0;
        this.lastPositionTop.length = 0;
      }
      else if (this.lastPositionTop.some(pTop => Math.abs(pTop - position.top) < 2)) return;

      this.lastUpdateScroll = dTime;
      this.lastPositionTop.push(this._scrollTop);
      if (this.lastPositionTop.length > 4) this.lastPositionTop.shift();

      this._scrollTop = position.top;
      this._scrollLeft = position.left;
      const top = position.top;

      let h = 0;

      this.index = { startYIndex: 0, endYIndex: -1 };

      let i = 0;
      new Flat(this._itemsFlat).forEach(row =>
      {
        h += row.height ?? 20;

        if (top <= h)
        {
          i -= this.buffer.y;

          //if (i >= this.itemsFlat.length) i = this.itemsFlat.length - 1;
          if (i < 0) i = 0;

          this.index.startYIndex = i;
          this.update();
          //this.cdr.detectChanges();
          return true;
        }
        i++;
        return false;
      });
    });
  }

  /** Жизненный цикл после построения представления */
  ngAfterViewInit(): void
  {
    fromEvent(this.sc.nativeElement.querySelector('.ng-scroll-viewport')!, 'scroll').subscribe((s: any) => this.updateScroll$.next({ top: s.target.scrollTop, left: s.target.scrollLeft }));
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /** Жизненный цикл уничтожения */
  ngOnDestroy(): void
  {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  /** Обновить */
  async update(): Promise<void>
  {
    if (!this._itemsFlat.length)
      this._data = this.clearData;
    else
    {
      this._oldData = this._data;
      this._data = this.calcData();
      await this.diffData(this._oldData, this._data);
    }

    this.cdr.detectChanges();

    this.afterDraw.next({
      scrollTop: this.scrollTop,
      scrollLeft: this.scrollLeft,
      cells: [...this.data.grids.map(g => g.itemsX.value).flat(), ...this.data.grids.map(g => g.items ?? []).flat()]
    });
  }

  /**
   * Навигация к выбранной строке
   * @param rowIndex Номер строки
   * @param dy Отступ
   */
  navigate(rowIndex: number, dy: number = 50): void
  {
    const nav = (): void =>
    {
      let h = 0;
      new Flat(this._itemsFlat).forEach((row, index) =>
      {
        if (rowIndex < index!) return true;
        h += row.height ?? 20;
        return false;
      });

      h -= dy;
      if (h < 0) h = 0;

      this.sc.scrollTo({ top: h, left: this.scrollLeft, duration: 0 });
      // this.updateScroll$.next({ top: h, left: this.scrollLeft });

    };
    nav();
    setTimeout(() => nav(), 1000);
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
    this._data = this.clearData;
    this.update();
  }

  /** @returns Расчёт данных для вывода */
  private calcData(): IData
  {
    const result = this.clearData;

    result.index.startYIndex = this.index.startYIndex;
    result.index.endYIndex = this.index.startYIndex;
    result.height = this.height;

    let h = 0;

    const flat = new Flat(this._itemsFlat);

    //#region Вычисление высоты до
    flat.forEach((row, index) =>
    {
      if (index === this.index.startYIndex) return true;

      h += row.height ?? 20;

      return false;
    });

    result.startHeight = h;
    //#endregion

    const gridStartIndex = flat.gridStartIndex!;
    const rowStartIndex = flat.rowStartIndex!;
    const gridTop = flat.startIndexGrid;
    let grid: IGrid | undefined;
    let gridDraw: IDataGrid;
    const dGrid = new Map<IGrid, IDataGrid>();

    //#region Отображаемые данные
    let afterCount = 0;
    const dItems = new Set<ICell>();

    let cells: ICell[] = [];
    result.index.endYIndex = this.index.startYIndex - 1;
    let calcEnd = true;

    flat.forEach(row =>
    {
      if (row.grid !== grid)
      {
        grid = row.grid;
        result.grids.push(gridDraw = {
          id: grid.id,
          items: [],
          columns: grid.columns.value,
          addedSticky: { rowStart: 0, height: 0 },
          index: { startYIndex: flat.rowStartIndex!, endYIndex: flat.rowStartIndex! },
          gridIndex: flat.gridStartIndex!,
          itemsX: new BehaviorSubject<ICell[]>([])
        });

        dGrid.set(grid, gridDraw);
      }
      else
        gridDraw.index.endYIndex++;

      if (calcEnd) result.index.endYIndex++;
      // row.cells.forEach(cell =>
      // {
      //   if (this.calcHideCell(cell)) return;
      //   cells.push(cell);
      //   dItems.add(cell);
      // });

      h += row.height ?? 20;
      if (h - this.scrollTop >= this.height)
      {
        calcEnd = false;
        afterCount++;
        if (afterCount > this.buffer.y) return true;
      }

      return false;
    });
    //#endregion

    let firstStickyCell: ICell | undefined;
    let firstStickyIndex = 0;

    //#region Прикреплённые ячейки
    let rows: IRow[] = [];
    if (gridStartIndex < this._itemsFlat.length)
    {
      const added = new Set<number>();
      const addedCells: ICell[] = [];
      rows = this._itemsFlat[gridStartIndex].rows;
      for (let ri = rowStartIndex - 1; ri >= 0; ri--)
      {
        const row = rows[ri];

        if (row.cells.some(cell => cell.position === 'sticky' && typeof cell.top === 'number' && !added.has(cell.top) && added.add(cell.top)))
        {
          row.cells.forEach(cell =>
          {
            if (cell.position !== 'sticky' || typeof cell.top !== 'number') return;

            if (this.calcHideCell(cell)) return;

            addedCells.push(cell);
            dItems.add(cell);

            if (!firstStickyCell)
            {
              firstStickyCell = cell;
              firstStickyIndex = ri;
            }
          });
        }

        row.cells.forEach(cell =>
        {
          if (cell.position === 'sticky' && typeof cell.top === 'number') return;
          if (this.calcHideCell(cell)) return;

          if ((cell.rowspan ?? 1) < 2 || dItems.has(cell)) return;
          if ((cell.rowStart ?? 1) - 1 <= result.index.endYIndex - gridTop &&
            ((cell.rowStart ?? 1) + (cell.rowspan ?? 1) - 2) >= result.index.startYIndex - gridTop)
            addedCells.push(cell);
        });
      }

      cells = [...addedCells, ...cells];
    }
    //#endregion

    // Группируем по сеткам
    cells.forEach(cell => dGrid.get(cell.row!.grid)?.items.push(cell));


    //#region Вычисление высоты после
    h = 0;
    flat.forEach(row => { h += row.height ?? 20; });

    result.endHeight = h;//this.maxHeight - result.startHeight - h;
    //#endregion

    //#region Вычисление дополнительного заполнения для прикреплённых
    const dy = this.index.endYIndex - this.index.startYIndex + 1;

    if (firstStickyCell && dy < flat.length && gridStartIndex < this._itemsFlat.length)
    {
      const firstStickyRow = firstStickyCell.rowStart ?? 1;
      gridDraw = dGrid.get(firstStickyCell.row?.grid!)!;
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

  /**
   * Массив в словарь по ключу
   * @param mas Массив
   * @returns Словарь
   */
  private toDictionary<T extends IId>(mas: T[]): Map<string, T>
  {
    return mas.reduce((r, v) => { r.set(v.id, v); return r; }, new Map<string, T>());
  }

  /**
   * Разница между отображениями
   * @param old Предыдущие данные
   * @param current Текущие данные
   */
  private async diffData(old: IData, current: IData): Promise<void>
  {
    const dNew = this.toDictionary(current.grids);
    const removed: ICell[] = [];
    old.grids.forEach(grid =>
    {
      if (dNew.has(grid.id)) return;
      removed.push(...grid.items);
      removed.push(...grid.itemsX.value);
    });
  }

  /** Вычисление максимальной высоты */
  private calcMaxHeight(): void
  {
    this.maxHeight = 0;

    new Flat(this._itemsFlat).forEach(row => { this.maxHeight += this.calcRowHight(row); });

    this.maxHeight += 2;
  }

  /**
   * Вычислить высоту строки
   * @param row строка
   * @returns Высота
   */
  calcRowHight(row: IRow): number
  {
    let h = 0;
    row.cells.forEach(cell =>
    {
      if ((cell.rowspan ?? 1) > 1) return;
      if (this.calcHideCell(cell)) return;

      h = Math.max(h, cell.height ?? 0);
    });
    row.height = h;
    return h;
  }

  /**
   * Скрыта ли ячейка
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
   * @param g Сетка
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
   * Расчёт ключа
   * @param _ номер
   * @param row строка
   * @returns Ключ
   */
  protected trackById(_: number, row: IId): string { return row.id; }

  /**
   * Расчёт ключа
   * @param _ номер
   * @param v элемент
   * @returns Ключ
   */
  protected trackByIndex(index: number, v: unknown): number { return index; }

  /**
   * Получить ячейки
   * @param grid Сетка
   * @returns Пустая строка
   */
  protected getCells(grid: IDataGrid): string
  {
    this.getCellsAsync(grid);

    return '';
  }

  /**
   * Получить ячейки
   * @param grid Сетка
   */
  // protected getCellsAsync(grid: IDataGrid): void
  protected async getCellsAsync(grid: IDataGrid): Promise<void>
  {
    if (grid.columns.some(c => c.widthInPx === undefined)) return;
    if (grid.itemsX.value.length > 0) return;

    const element = this.sc.nativeElement.querySelector(`#sat-virtual-grid-${grid.id}`);
    if (!element) return;

    const actualWith = this.sc.nativeElement.getBoundingClientRect().width;

    const columnsWidthPx = grid.columns.map(c => c.widthInPx!);

    let startIndex = 0;
    let startWidth = 0;
    while (startIndex < grid.columns.length && (startWidth + columnsWidthPx[startIndex]) < this.scrollLeft)
    {
      startWidth += columnsWidthPx[startIndex];
      startIndex++;
    }

    let endIndex = startIndex;
    let endsWith = startWidth;
    const maxWidth = this.scrollLeft + actualWith;

    while (endIndex < grid.columns.length && endsWith < maxWidth)
    {
      endsWith += !Number.isNaN(columnsWidthPx[endIndex]) ? columnsWidthPx[endIndex] : 0;
      endIndex++;
    }

    startIndex -= this.buffer.x;
    endIndex += this.buffer.x;

    if (startIndex < 0) startIndex = 0;
    if (endIndex >= grid.columns.length) endIndex = grid.columns.length - 1;

    const dItems = new Set<ICell>(grid.items);

    const result: ICell[] = [];
    const rows = this._itemsFlat[grid.gridIndex].rows;
    for (let i = grid.index.startYIndex; i <= grid.index.endYIndex; i++)
      rows[i].cells.forEach(cell =>
      {
        if (this.calcHideCell(cell)) return;

        const start = (cell.colStart ?? 1) - 1;
        const end = (cell.colStart ?? 1) - 1 + (cell.colspan ?? 1) - 1;
        if (dItems.has(cell)) return;

        if (cell.position === 'sticky' && (typeof cell.left === 'number' || typeof cell.right === 'number'))
        {
          result.push(cell);
          dItems.add(cell);
          return;
        }

        if (start > endIndex || end < startIndex) return;

        result.push(cell);
        dItems.add(cell);
      });

    grid.itemsX.next(result);

    const removed: ICell[] = [];
    const added: ICell[] = [];

    const oldGrid = this._oldData.grids.find(g => g.id === grid.id);
    if (oldGrid)
    {
      const dNewCells = this.toDictionary([...result, ...grid.items]);
      const dOldCells = this.toDictionary([...oldGrid.itemsX.value, ...oldGrid.items]);

      for (const cell of oldGrid.items)
        if (!dNewCells.has(cell.id))
          removed.push(cell);

      for (const cell of oldGrid.itemsX.value)
        if (!dNewCells.has(cell.id))
          removed.push(cell);

      for (const cell of result)
        if (!dOldCells.has(cell.id))
          added.push(cell);

      for (const cell of grid.items)
        if (!dOldCells.has(cell.id))
          added.push(cell);
    }
    else
      added.push(...result);


    // if (removed.length)
    // {
    //   const unLoadedWaiter = new Subject<void>();
    //   this.unLoadedCells.emit({ cells: removed, waiter: unLoadedWaiter });
    //   await firstValueFrom(unLoadedWaiter);
    // }

    if (added.length)
    {
      const loadedWaiter = new Subject<void>();
      this.loadedCells.emit({ cells: added, waiter: loadedWaiter });
      await firstValueFrom(loadedWaiter);
    }
  }

}
