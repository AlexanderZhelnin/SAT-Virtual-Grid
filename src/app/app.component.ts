import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ICell, IColumn, IGrid, IRow, ISource, SATVirtualGrigComponent } from 'sat-virtual-grid';

// import { Show } from './animations';
/**
 * Получить текущую позицию курсора
 * @param context узел html
 * @returns позиция
 */
function getCursorPosition(context: Node): number
{
  const selection = window.getSelection();
  if (!selection) return 0;
  const range = selection.getRangeAt(0);
  range.setStart(context, 0);

  return range.toString().length;
}

/**
 * Установить позицию курсора
 * @param context узел html
 * @param len позиция
 */
function setCursorPosition(context: Node, len: number): void
{
  const selection = window.getSelection();
  const pos = getTextNodeAtPosition(context, len);
  selection?.removeAllRanges();
  const r = new Range();
  r.setStart(pos.node, pos.position);
  selection?.addRange(r);
}

/**
 * Получить позицию узла
 *
 * @param root Корневой узел
 * @param index Индекс
 * @returns Позиция
 */
function getTextNodeAtPosition(root: Node, index: number): { /** Узел */node: Node; /** Позиция */position: number }
{
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT,
    {
      acceptNode: (elem: Node): number =>
      {
        const l = elem?.textContent?.length ?? 0;
        if (index > l)
        {
          index -= l;
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

  return { node: treeWalker.nextNode() ?? root, position: index };
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
  // animations: [Show]
})
export class AppComponent implements OnInit
{
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('section', { static: true }) sectionTemplate!: TemplateRef<any>;
  @ViewChild('subSection', { static: true }) subSectionTemplate!: TemplateRef<any>;
  @ViewChild('columnCollapsed', { static: true }) columnCollapsedTemplate!: TemplateRef<any>;
  @ViewChild('column', { static: true }) columnTemplate!: TemplateRef<any>;
  @ViewChild('block', { static: true }) blockTemplate!: TemplateRef<any>;
  @ViewChild('number', { static: true }) numberTemplate!: TemplateRef<any>;
  @ViewChild('block_stub', { static: true }) blockStubTemplate!: TemplateRef<any>;
  @ViewChild('blockLast', { static: true }) blockLastTemplate!: TemplateRef<any>;
  @ViewChild('addRow', { static: true }) addRowTemplate!: TemplateRef<any>;
  @ViewChild('addColumn', { static: true }) addColumnTemplate!: TemplateRef<any>;


  @ViewChild('sc') sc!: SATVirtualGrigComponent;
  @ViewChild('sc', { read: ElementRef }) svg!: ElementRef<HTMLElement>;

  private id = 0;
  private rowIndex = 0;
  private zIndex = 100;
  private zIndexSection = Number.MAX_SAFE_INTEGER - 10000;
  private lastRow: IRow | undefined = undefined;

  columns: IColumn[] = [
    { width: '17rem' },
    { width: '4rem' },
    //{ width: '0px' }, { width: '1fr' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },

    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '2rem' }
  ];

  // get columnsStr(): string { return this.columns.map(c => c.width).join(' '); }

  source: ISource = {
    grids: new BehaviorSubject<IGrid[]>([])
  };

  constructor()
  {

  }

  ngOnInit(): void
  {
    this.loadGrids();
  }

  loadGrids(): void
  {
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
            this.sc.onExpand(cell.row, !cell.row.isExpanded);
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
            zIndex: this.zIndex++,
            canHide: false,
            position: 'sticky',
            top: 20,
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
              background: 'darkgrey',
              template: this.columnTemplate,
              zIndex: this.zIndex++,
              canHide: false,
              position: 'sticky',
              top: 20,
              maxHeight: 21,
              dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn(cell.row?.grid!, (cell.colStart ?? 1) - 1)
            } as ICell)),
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

  }

  onUnLoadedCells(e: { cells: ICell[]; waiter?: Subject<void> | undefined; }): void
  {
    // console.log('onUnLoadedCells', e.cells);
    setTimeout(() => e.waiter?.next(), 0);
  }
  onLoadedCells(e: { cells: ICell[]; waiter?: Subject<void> | undefined }): void
  {
    // console.log('onLoadedCells', e.cells);

    if (e.cells.some(cell => cell.row === this.lastRow))
      this.loadGrids();
    // if(e.cells.some(cell=>cell.ro))

    setTimeout(() => e.waiter?.next(), 0);
  }

  onAfterDraw(e: { scrollTop: number; scrollLeft: number; cells: ICell[]; })
  {

    //const svg = document.querySelector('#svg')!;
    const cell = e.cells.find(cell => cell.content === 3)!;
    const cellElement = document.querySelector(`#${cell?.id}`);
    if (!cellElement) return;

    const y = cellElement.getBoundingClientRect().y - this.svg.nativeElement.getBoundingClientRect().y;


    const newClass = y <= 55 ? 'hidden' : undefined;
    if (cell.class !== newClass)
    {
      cell.class = newClass;
      this.sc.update();
    }


    //console.log(y);

  }

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
  };

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

  private generateBlockCells(columns: IColumn[]): ICell[]
  {
    const count = (columns.length - 3) / 2;

    const collapsedCells: ICell[] = [...Array(count - 1).keys()]
      .map(j => ({
        id: `_${++this.id}`,
        height: 40,
        colStart: j * 2 + 4,
        template: this.blockStubTemplate,
        wenColumnCollapsed: true,
        zIndex: -1
      }));

    collapsedCells.push({
      id: `_${++this.id}`,
      height: 40,
      colStart: (count - 1) * 2 + 4,
      template: this.blockStubTemplate,
      wenColumnCollapsed: true,
      zIndex: -1
    })

    return [
      {
        id: `_${++this.id}`,
        height: 40,
        colStart: 2,
        content: ++this.rowIndex,
        template: this.numberTemplate
      },
      ...collapsedCells,
      ...[...Array(count - 1).keys()]
        .map(j => ({
          id: `_${++this.id}`,
          height: 40,
          colStart: j * 2 + 4,
          content: this.generateRandomString(),
          template: this.blockTemplate,
          linkedHeightCell: collapsedCells[j]
        })),
      {
        id: `_${++this.id}`,
        height: 40,
        colStart: (count - 1) * 2 + 4,
        content: this.generateRandomString(),
        template: this.blockLastTemplate,
        linkedHeightCell: collapsedCells[collapsedCells.length - 1]
      }
    ];
  }

  private generateAddRow(parent: IRow, subSection: ICell): IRow
  {
    // const count = (parent.grid.columns.value.length - 3) / 2;
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


      // ...[...Array(count - 1).keys()].map(j =>
      // ({
      //   id: `${++this.id}`,
      //   height: 0,
      //   zIndex: 2,
      //   colStart: j * 2 + 4,//this.columns.length - 1,
      //   position: 'relative',
      //   template: this.addRowTemplate
      // } as ICell))
    ], parent, subSection);
  }

  generateRow(cells: ICell[], parent: IRow | undefined = undefined, subSection: ICell | undefined = undefined): IRow
  {
    const row: IRow = { cells, parent, grid: parent ? parent.grid : this.source.grids.value[this.source.grids.value.length - 1], tag: subSection };
    cells.forEach(cell => cell.row = row);

    return row;
  }

  generateRandomString(): string
  {
    const length = Math.floor(Math.random() * 100);
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++)
      result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
  }

  onClickColumn(grid: IGrid, columnIndex: number): void
  {
    const column = grid.columns.value[columnIndex];
    column.collapsed = !(column.collapsed ?? false);
    column.width = column.collapsed ? '23px' : '200px';

    grid.columns.next([...grid.columns.value]);
  }

  onScrollTo(): void
  {
    let index = -1;
    let fined = false;
    function finedRow(r: IRow): boolean
    {
      if (r.cells.some(cell => cell.content == '100'))
      {
        console.log('srg', r);
        return true;
      }

      index++;

      if (r.isExpanded)
        for (const ch of r.children ?? [])
          if (finedRow(ch)) return true;

      return false;
    }

    for (const g of this.source.grids.value)
      for (const r of g.rows.value)
      {
        if (finedRow(r))
        {
          this.sc.navigate(index);
          return;
        }
        index++;
      }
  }

  private addedColumnIndex = 0;
  onAddColumn(grid: IGrid, index: number): void
  {
    function shift(row: IRow): void
    {
      row.cells.forEach(cell =>
      {
        if ((cell.colStart ?? 1) >= index)
          cell.colStart = (cell.colStart ?? 1) + 2;
      });

      row.children?.forEach(chRow => shift(chRow));
    }

    const columns = grid.columns.value;//[...splice(index - 1, 0, { width: '0px' }, { width: '200px' })];
    columns.splice(index - 1, 0, { width: '0px' }, { width: '200px' });
    grid.columns.next(columns);

    grid.rows.value.forEach(row => row.children?.forEach(ch => shift(ch)));

    //this.source.grids.value.forEach(grid =>
    //grid.rows.value.forEach(row =>
    //{

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
    for (let i = 1; i < row.children!.length; i += 2)
      row.children![i].cells.push(
        collapsedCells = {
          row: row.children![i],
          id: `${++this.id}`,
          height: 40,
          colStart: index + 1,
          template: this.blockStubTemplate,
          wenColumnCollapsed: true,
          zIndex: -1
        },
        {
          row: row.children![i],
          id: `${++this.id}`,
          height: 40,
          colStart: index + 1,
          content: this.generateRandomString(),
          template: this.blockTemplate,
          linkedHeightCell: collapsedCells
        }
      );

    this.source.grids.next(this.source.grids.value);
  }

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

  /** Потеря фокуса на ячейке */
  onCellLostFocus(cell: ICell): void
  {

  }

  onChangedCell(cell: ICell, e: Event): void
  {
    cell.row!.height = 0;
    cell.row?.cells.forEach(c => c.height = 0);
    const pos = getCursorPosition(e.target as Node);
    cell.content = (e.target as any).textContent;

    setTimeout(() => 
    {
      setCursorPosition(e.target as Node, pos + 1);
      this.sc.update();
    });

  }

}
