import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICell, ICellChange, IColumn, IDrawResult, IGrid, IRow, ISource, SATVirtualGrigComponent } from 'sat-virtual-grid';
import { loremIpsum } from 'lorem-ipsum';

/** Тестовый компонент */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
  // animations: [Show]
})
export class AppComponent implements OnInit
{
  stestH1 = 41;
  stestH2 = 1000;
  @ViewChild('stest', { static: true }) stest!: ElementRef<any>;
  /** Обнаружение изменений */
  readonly cdr = inject(ChangeDetectorRef);


  /** Шаблон раздела */
  @ViewChild('section', { static: true }) sectionTemplate!: TemplateRef<any>;
  /** Шаблон подраздела */
  @ViewChild('subSection', { static: true }) subSectionTemplate!: TemplateRef<any>;
  /** Шаблон Свёрнутой колонки */
  @ViewChild('columnCollapsed', { static: true }) columnCollapsedTemplate!: TemplateRef<any>;
  /** Шаблон колонки */
  @ViewChild('column', { static: true }) columnTemplate!: TemplateRef<any>;
  /** Шаблон ячейки с данными */
  @ViewChild('block', { static: true }) blockTemplate!: TemplateRef<any>;
  /** Шаблон нумерации */
  @ViewChild('number', { static: true }) numberTemplate!: TemplateRef<any>;
  /** Шаблон ячейки стабилизации высоты */
  @ViewChild('block_stub', { static: true }) blockStubTemplate!: TemplateRef<any>;
  /** Шаблон последней ячейки */
  @ViewChild('blockLast', { static: true }) blockLastTemplate!: TemplateRef<any>;
  /** Шаблон добавить строку */
  @ViewChild('addRow', { static: true }) addRowTemplate!: TemplateRef<any>;
  /** Шаблон добавить колонки */
  @ViewChild('addColumn', { static: true }) addColumnTemplate!: TemplateRef<any>;

  /** Виртуальный грид */
  @ViewChild('vg') vg!: SATVirtualGrigComponent;

  /** Уникальный идентификатор */
  private id = 0;
  /** Номер строки */
  private rowIndex = 0;
  /** zIndex */
  private zIndex = 100;
  /** zIndex раздела */
  private zIndexSection = Number.MAX_SAFE_INTEGER - 10000;
  /** Последняя строка */
  private lastRow: IRow | undefined = undefined;

  /** Данные ячейки */
  private cellsData: Record<string, Record<string, any>> = {};

  /** Колонки */
  columns: IColumn[] = [
    { width: '10rem' },
    { width: '4rem' },

    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '2rem' }
  ];

  /** Источник */
  source: ISource = {
    grids: new BehaviorSubject<IGrid[]>([])
  };

  /** Количество строк */
  rowsCount = 0;

  /** Обработчик инициализация */
  ngOnInit(): void
  {
    this.loadGrids();
  }

  /** Загрузка сеток */
  loadGrids(): void
  {
    this.source.grids.value.flatMap(g => g.rows);

    for (let l = 0; l < 20; l++)
    {
      const rows: IRow[] = [];

      this.source.grids.value.push({
        id: `_${++this.id}`,
        columns: new BehaviorSubject(this.columns.map(c => ({ ...c }))),
        rows: new BehaviorSubject(rows)
      });

      const sectionRow = this.generateRow([
        {
          id: `_${++this.id}`,
          colspan: 1000,
          content: `Раздел ${this.source.grids.value.length}`,
          zIndex: this.zIndexSection++,
          top: 0,
          height: 20,
          template: this.sectionTemplate,
          click: (me: MouseEvent, cell: ICell): void =>
          {
            if (!cell.row) return;
            this.vg.onExpand(cell.row, !cell.row.isExpanded);
            cell.position = cell.row.isExpanded ? 'sticky' : undefined;
          }

        } as ICell
      ]);

      sectionRow.children = [];

      rows.push(sectionRow);

      const item = sectionRow;

      let subSection: ICell;
      item.children!.push(
        this.generateRow([

          {
            id: `_${++this.id}`,
            content: `№`,
            colStart: 2,
            background: 'darkgrey',
            template: this.columnTemplate,
            zIndex: 103 + this.zIndex++,
            canHide: false,
            position: 'sticky',
            top: 20,
            left: 160,
            maxHeight: 21
          } as ICell,
          ...[...Array((this.columns.length - 3) / 2).keys()]
            .map(j => ({
              id: `_${++this.id}`,
              colStart: j * 2 + 3,
              template: this.addColumnTemplate,
              zIndex: 1000000,
              position: 'sticky',
              top: 20,
            } as ICell)),

          ...[...Array((this.columns.length - 3) / 2).keys()]
            .map(j => ({
              id: `_${++this.id}`,
              content: `${j}-${l}`,
              colStart: j * 2 + 4,
              background: (j === ((this.columns.length - 3) / 2 - 1))
                ? 'gray'
                : 'darkgrey',
              template: this.columnTemplate,
              zIndex: this.zIndex++,
              canHide: false,
              position: 'sticky',
              top: 20,
              right: (j === ((this.columns.length - 3) / 2 - 1))
                ? 30
                : undefined,
              maxHeight: 21,
              dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn(cell.row?.grid!, (cell.colStart ?? 1) - 1)
            } as ICell)),
          {
            id: `_${++this.id}`,
            content: '',
            colStart: this.columns.length,
            background: 'white',

            zIndex: this.zIndex++,
            canHide: false,
            position: 'sticky',
            top: 20,
            right: 0,
            maxHeight: 21
          } as ICell,

          ...[...Array((this.columns.length - 3) / 2).keys()]
            .map(j => ({
              id: `_${++this.id}`,
              content: `${j}-${l}`,
              colStart: j * 2 + 4,
              rowspan: 200 * 5 + 1,
              template: this.columnCollapsedTemplate,
              zIndex: 0,
              wenColumnCollapsed: true,
              dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn(cell.row?.grid!, (cell.colStart ?? 1) - 1)
            } as ICell)),
          subSection = {
            id: `_${++this.id}`,
            content: `Субраздел ${l} - ${0}`,
            colStart: 1,
            rowspan: 201,
            template: this.subSectionTemplate,
            zIndex: 102 + this.zIndex++,
            position: 'sticky',
            left: 0
          }
        ], item));

      item.children!.push(...this.generateRowsBlock(100, item, subSection));

      for (let i = 1; i < 5; i++)
        item.children!.push(
          this.generateRow([
            subSection = {
              id: `_${++this.id}`,
              content: `Субраздел ${l} - ${i}`,
              colStart: 1,
              rowspan: 200,
              template: this.subSectionTemplate,
              position: 'sticky',
              zIndex: 102 + this.zIndex++,
              left: 0
            },
            ...this.generateBlockCells(this.source.grids.value[this.source.grids.value.length - 1].columns.value)
          ], item),
          this.generateAddRow(item, subSection),
          ...this.generateRowsBlock(99, item, subSection));
    }

    this.lastRow = this.source.grids.value[this.source.grids.value.length - 1].rows.value[0].children![this.source.grids.value[this.source.grids.value.length - 1].rows.value[0].children!.length - 1];
    //this.source.grids.value[0].rows.next(this.items);
    this.source.grids.next(this.source.grids.value);

    this.rowsCount = this.source.grids.value.flatMap(g => g.rows.value.flatMap(r => r.children)).length;

  }

  /**
   * Обработчик события выгрузки ячеек
   * @param e аргумент
   */
  onUnLoadedCells(e: ICellChange): void
  {
    // console.log('onUnLoadedCells', e.cells);
    setTimeout(() => e.waiter.next(), 0);
  }

  /**
   * Обработчик события загрузки ячеек
   * @param e аргумент
   */
  onLoadedCells(e: ICellChange): void
  {
    // console.log('onLoadedCells', e.cells);

    if (e.cells.some(cell => cell.row === this.lastRow))
      this.loadGrids();
    // if(e.cells.some(cell=>cell.ro))

    setTimeout(() => e.waiter.next(), 0);
  }

  /** Последние отрисованные ячейки */
  lastDrawCells: ICell[] = [];
  /**
   * Обработчик события после отрисовки
   * @param e Аргумент
   */
  onAfterDraw(e: IDrawResult): void
  {
    this.lastDrawCells = e.cells;
  }

  /**
   * Группировка
   * @param xs Ячейки
   * @param predicate функция
   * @returns Сгруппированные ячейки
   */
  groupBy<T>(xs: ICell[], predicate: (cell: ICell) => T): Map<T, ICell[]>
  {
    return xs.reduce((rv, cell) =>
    {
      const key = predicate(cell);
      let mas = rv.get(key);
      if (mas === undefined) rv.set(key, mas = []);

      mas.push(cell);
      return rv;
    }, new Map<T, ICell[]>());
  }

  /**
   * Генерация строки
   * @param count Количество
   * @param parent Родитель
   * @param subSection Подраздел
   * @returns строка ячеек
   */
  private generateRowsBlock(count: number, parent: IRow, subSection: ICell): IRow[]
  {
    const result: IRow[] = [];
    for (let i = 0; i < count; i++)
      result.push(
        this.generateRow(this.generateBlockCells(subSection.row!.grid.columns.value), parent, subSection),
        this.generateAddRow(parent, subSection)
      );
    return result;
  }

  /**
   * Генерация ячеек
   * @param columns Колонки
   * @returns Ячейки
   */
  private generateBlockCells(columns: IColumn[]): ICell[]
  {
    const count = (columns.length - 3) / 2;

    const collapsedCells: ICell[] = [...Array(count - 1).keys()]
      .map(j => ({
        id: `_${++this.id}`,
        height: 100,
        colStart: j * 2 + 4,
        template: this.blockStubTemplate,
        wenColumnCollapsed: true,
        zIndex: -1
      }));

    collapsedCells.push({
      id: `_${++this.id}`,
      height: 100,
      colStart: (count - 1) * 2 + 4,
      template: this.blockStubTemplate,
      wenColumnCollapsed: true,
      zIndex: -1
    });

    let maxWords = Math.random() * 15;
    if (maxWords < 5) maxWords = 5;

    return [
      {
        id: `_${++this.id}`,
        height: 100,
        colStart: 2,
        content: ++this.rowIndex,
        template: this.numberTemplate,
        position: 'sticky',
        zIndex: 103,
        left: 160
      },
      ...collapsedCells,
      ...[...Array(count - 1).keys()]
        .map(j => ({
          id: `_${++this.id}`,
          height: 100,
          colStart: j * 2 + 4,
          content: this.generateRandomString(maxWords),
          template: this.blockTemplate,
          linkedHeightCell: collapsedCells[j],
          background: 'white',
        })),
      {
        id: `_${++this.id}`,
        height: 100,
        background: 'lightgray',
        colStart: (count - 1) * 2 + 4,
        content: this.generateRandomString(maxWords),
        template: this.blockLastTemplate,
        linkedHeightCell: collapsedCells[collapsedCells.length - 1],
        position: 'sticky',
        right: 30,
        zIndex: 3
      },
      {
        id: `_${++this.id}`,
        height: 100,
        colStart: columns.length,
        content: '',
        background: 'white',
        zIndex: 2,
        position: 'sticky',
        right: 0

      }

    ];
  }

  /**
   * Генерация строки с кнопкой добавить
   * @param parent Родитель
   * @param subSection Подраздел
   * @returns Строка
   */
  private generateAddRow(parent: IRow, subSection: ICell): IRow
  {
    return this.generateRow([

      {
        id: `_${++this.id}`,
        height: 0,
        zIndex: 2,
        colStart: 1,//this.columns.length - 1,
        colspan: 1000,
        position: 'relative',
        template: this.addRowTemplate
      } as ICell
    ], parent, subSection);
  }

  /**
   * Генерация строки
   * @param cells Ячейки
   * @param parent Родитель
   * @param subSection Подраздел
   * @returns Строка
   */
  generateRow(cells: ICell[], parent: IRow | undefined = undefined, subSection: ICell | undefined = undefined): IRow
  {
    const row: IRow = { cells, parent, grid: parent ? parent.grid : this.source.grids.value[this.source.grids.value.length - 1], tag: subSection };
    cells.forEach(cell => cell.row = row);

    return row;
  }

  /** Индекс web component */
  dataCodeIndex = 1;
  /**
   * @param max Max. number of words per sentence
   * @returns Генерация строки
   */
  generateRandomString(max: number): string
  {
    let result = loremIpsum({
      count: 2,                // Number of "words", "sentences", or "paragraphs"
      format: 'plain',         // "plain" or "html"
      paragraphLowerBound: 3,  // Min. number of sentences per paragraph.
      paragraphUpperBound: 3,  // Max. number of sentences per paragarph.
      random: Math.random,     // A PRNG function
      sentenceLowerBound: 5,   // Min. number of words per sentence.
      sentenceUpperBound: Math.round(max),  // Max. number of words per sentence.
      suffix: '\n',            // Line ending, defaults to "\n" or "\r\n" (win32)
      units: 'sentences',      // paragraph(s), "sentence(s)", or "word(s)"
      //words: ["ad", ...]       // Array of words to draw from
    });

    result = result
      .split(' ').map((s, index) =>
        (index % 2) === 0 ? ` ${s} <doc-param contenteditable="false" data-code="code_${this.dataCodeIndex++}"></doc-param>` : ` ${s}`).join();

    return result;
  }

  /**
   * Обработчик события клика по колонке
   * @param grid Сетка
   * @param columnIndex Индекс колонки
   */
  onClickColumn(grid: IGrid, columnIndex: number): void
  {
    const column = grid.columns.value[columnIndex];
    column.collapsed = !(column.collapsed ?? false);
    column.width = column.collapsed ? '23px' : '200px';

    grid.columns.next([...grid.columns.value]);
  }

  /** Номер новой колонки */
  private addedColumnIndex = 0;

  /**
   * Обработчик события добавления колонки
   * @param grid Сетка
   * @param index Индекс колонки
   */
  onAddColumn(grid: IGrid, index: number): void
  {
    /**
     * Функция раздвижки
     * @param row Строка
     */
    function shift(row: IRow): void
    {
      row.cells.forEach(cell =>
      {
        if ((cell.colStart ?? 1) >= index)
          cell.colStart = (cell.colStart ?? 1) + 2;
      });

      row.children?.forEach(chRow => shift(chRow));
    }

    const columns = grid.columns.value;
    columns.splice(index - 1, 0, { width: '0px', widthInPx: 0 }, { width: '200px', widthInPx: 200 });
    grid.columns.next([...columns]);

    grid.rows.value.forEach(row => row.children?.forEach(ch => shift(ch)));

    const header = `Добавленная колонка ${++this.addedColumnIndex}`;

    const row = grid.rows.value[0];
    row.children?.[0].cells.push(
      {
        row: row.children?.[0],
        id: `${++this.id}`,
        colStart: index,
        template: this.addColumnTemplate,
        zIndex: 1000000,
        position: 'sticky',
        top: 20,
      } as ICell,
      {
        row: row.children?.[0],
        id: `${++this.id}`,
        content: header,
        colStart: index + 1,
        background: 'darkgrey',
        template: this.columnTemplate,
        zIndex: this.zIndex++,
        canHide: false,
        position: 'sticky',
        top: 20,
        maxHeight: 21,
        dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn(cell.row?.grid!, (cell.colStart ?? 1) - 1)
      } as ICell,
      {
        row: row.children?.[0],
        id: `${++this.id}`,
        content: header,
        colStart: index + 1,
        rowspan: 101 * 5 + 1,
        template: this.columnCollapsedTemplate,
        zIndex: 0,
        wenColumnCollapsed: true,
        dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn(cell.row?.grid!, (cell.colStart ?? 1) - 1)
      } as ICell
    );


    let collapsedCells: ICell;
    for (let i = 3; i < row.children!.length; i += 2)
      row.children![i].cells.push(
        collapsedCells =
        {
          row: row.children![i],
          id: `${++this.id}`,
          height: 40,
          colStart: index + 1,
          rowStart: i,
          template: this.blockStubTemplate,
          wenColumnCollapsed: true,
          zIndex: -1
        },
        {
          row: row.children![i],
          id: `${++this.id}`,
          height: 40,
          colStart: index + 1,
          rowStart: i,
          content: this.generateRandomString(15),
          template: this.blockTemplate,
          linkedHeightCell: collapsedCells
        }
      );

    this.vg.update();
  }

  /**
   * Обработчик события добавления строки
   * @param cell Ячейка
   */
  onAddRow(cell: ICell): void
  {
    const parent = cell.row?.parent;
    if (!parent) return;

    const index = parent.children!.indexOf(cell.row!);
    const subSection = cell.row!.tag as ICell;

    subSection.rowspan = (subSection.rowspan ?? 1) + 2;

    const addedRows = [this.generateRow(this.generateBlockCells(cell.row!.grid.columns.value), parent, subSection), this.generateAddRow(parent, subSection)];

    addedRows.forEach(r => r.grid = parent.grid);

    parent.children!.splice(index + 1, 0, ...addedRows);

    this.source.grids.next(this.source.grids.value);
  }

  /**
   * Потеря фокуса на ячейке
   * @param cell Ячейка
   * @param e Аргумент
   */
  onCellLostFocus(cell: ICell, e: Event): void
  {
    cell.row!.height = 0;
    cell.row?.cells.forEach(c => c.height = 0);
    cell.content = (e.target as any).innerHTML;
    this.vg.update();
  }

  /** Предыдущая позиция мышки */
  private prevMousePosition!: number;
  /** Предыдущий размер колонки */
  private prevWidth!: number;
  /** Ячейка */
  private mouseCell!: ICell;

  /**
   * Обработчик нажатия изменения размера колонки
   * @param event Аргумент
   * @param cell Ячейка
   */
  onColumnResizeMousedown(event: MouseEvent, cell: ICell): void
  {
    event.preventDefault();
    this.prevMousePosition = event.clientX;
    this.mouseCell = cell;
    this.prevWidth = this.getColumn(cell).widthInPx!;

    window.addEventListener('mousemove', this.handleMousemove, true);
    window.addEventListener('mouseup', this.handleMouseup, true);
  }

  /**
   * Обработчик событий движения мышки
   * @param event Данные события
   */
  private readonly handleMousemove = (event: MouseEvent): void =>
  {
    //this.movedPosition$.next(event.offsetX);

    const dWidth = this.prevWidth + (event.clientX - this.prevMousePosition);
    // this.prevMousePosition = event.clientX;

    const column = this.mouseCell.row!.grid.columns.value[this.mouseCell.colStart! - 1];
    column.width = `${dWidth}px`;
    column.widthInPx = dWidth;
    this.mouseCell.row?.grid.columns.next([...this.mouseCell.row?.grid.columns.value]);


    this.lastDrawCells
      .filter(cell => cell.template === this.blockTemplate)
      .forEach(cell =>
      {
        cell.height = 40;
        cell.row!.height = 40;
      });

    this.vg.update();
  };

  /**
   * Получение колонки
   * @param cell Ячейка
   * @returns Колонка
   */
  getColumn(cell: ICell): IColumn
  {
    return cell.row!.grid.columns.value[cell.colStart! - 1];
  }

  /** Обработчик событий отжатия мышки */
  private readonly handleMouseup = (): void =>
  {
    // this.widthChanged.next();
    this.unsubscribeMouse();
  };

  /** Отписка от событий мышки */
  private unsubscribeMouse(): void
  {
    // this.movedPosition$.next(0);
    window.removeEventListener('mousemove', this.handleMousemove, true);
    window.removeEventListener('mouseup', this.handleMouseup, true);
  }

}
