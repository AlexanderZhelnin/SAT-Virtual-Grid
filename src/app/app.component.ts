import { ChangeDetectorRef, Component, Inject, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICell, IColumn, IRow, ISource, SATVirtualGrigComponent } from 'sat-virtual-grid';

// import { Show } from './animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  @ViewChild('blockLast', { static: true }) blockLastTemplate!: TemplateRef<any>;
  @ViewChild('addRow', { static: true }) addRowTemplate!: TemplateRef<any>;
  @ViewChild('addColumn', { static: true }) addColumnTemplate!: TemplateRef<any>;


  @ViewChild('sc') sc!: SATVirtualGrigComponent;

  items: IRow[] = [];
  private id = 0;
  private zIndex = 100;

  columns: IColumn[] = [
    { width: '17rem' },
    { width: '0px' }, { width: '200px' },
    { width: '0px' }, { width: 'minmax(1rem, 1fr)' },
    { width: '0px' }, { width: '200px' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    // { width: '0px' }, { width: 'minmax(25rem, 1fr)' },
    { width: '2rem' }];

  get columnsStr(): string { return this.columns.map(c => c.width).join(' '); }

  source = {
    grids: new BehaviorSubject([{
      id: '0',
      rows: new BehaviorSubject(this.items),
      columns: new BehaviorSubject(this.columns)
    }])
  };

  constructor()
  {

  }

  ngOnInit(): void
  {
    for (let l = 0; l < 20; l++)
    {
      const sectionRow = this.generateRow([
        {
          id: `${++this.id}`,
          colspan: 1000,
          content: `Раздел ${l}`,
          zIndex: this.zIndex++,
          top: 0,
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

      this.items.push(sectionRow);

      const item = sectionRow;

      item.children!.push(
        this.generateRow([
          ...[...Array(3).keys()]
            .map(j => ({
              id: `${++this.id}`,
              colStart: j * 2 + 2,
              template: this.addColumnTemplate,
              zIndex: 1000000,
              position: 'sticky',
              top: 20,
            } as ICell)),

          ...[...Array(3).keys()]
            .map(j => ({
              id: `${++this.id}`,
              content: `${j}-${l}`,
              colStart: j * 2 + 3,
              background: 'darkgrey',
              template: this.columnTemplate,
              zIndex: this.zIndex++,
              canHide: false,
              position: 'sticky',
              top: 20,
              maxHeight: 21,
              dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn((cell.colStart ?? 1) - 1)
            } as ICell)),
          ...[...Array(3).keys()]
            .map(j => ({
              id: `${++this.id}`,
              content: `${j}-${l}`,
              colStart: j * 2 + 3,
              rowspan: 200 * 5 + 1,
              template: this.columnCollapsedTemplate,
              zIndex: 0,
              wenColumnCollapsed: true,
              dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn((cell.colStart ?? 1) - 1)
            } as ICell)),

          {
            id: `${++this.id}`,
            content: `Субраздел ${l} - ${0}`,
            colStart: 1,
            rowspan: 201,
            template: this.subSectionTemplate,
          }
        ], item));

      item.children!.push(...this.generateRowsBlock(100, item));

      for (let i = 1; i < 5; i++)
        item.children!.push(
          this.generateRow([
            {
              id: `${++this.id}`,
              content: `Субраздел ${l} - ${i}`,
              colStart: 1,
              rowspan: 200,
              template: this.subSectionTemplate,
            },
            ...this.generateBlockCells()
          ], item),
          this.generateAddRow(item),
          ...this.generateRowsBlock(99, item));
    }

    this.source.grids.value[0].rows.next(this.items);
  }

  private generateRowsBlock(count: number, parent: IRow): IRow[]
  {
    const result: IRow[] = [];
    for (let i = 0; i < count; i++)
      result.push(
        this.generateRow(this.generateBlockCells(), parent),
        this.generateAddRow(parent)
      );
    return result;
  }

  private generateBlockCells(): ICell[]
  {
    const count = (this.columns.length - 2) / 2;

    return [
      // {
      //   id: `${++this.id}`,
      //   height: 40,
      //   colStart: 2,
      //   colspan: 10000,
      //   template: this.blockToolbarTemplate
      // },
      ...[...Array(count - 1).keys()]
        .map(j => ({
          id: `${++this.id}`,
          height: 40,
          colStart: j * 2 + 3,
          content: this.generateRandomString(),
          template: this.blockTemplate
        })),

      {
        id: `${++this.id}`,
        height: 40,
        colStart: (count - 1) * 2 + 3,
        content: this.generateRandomString(),
        template: this.blockLastTemplate
      }
    ];

  }

  private generateAddRow(parent: IRow): IRow
  {
    return this.generateRow([
      {
        id: `${++this.id}`,
        height: 0,
        zIndex: 2,
        colStart: this.columns.length - 1,
        position: 'relative',
        template: this.addRowTemplate
      }], parent);

    // return this.generateRow([...Array((this.columns.length - 2) / 2).keys()]
    //   .map(j => ({
    //     id: `${++this.id}`,
    //     height: 0,
    //     zIndex: 2,
    //     colStart: j * 2 + 3,
    //     position: 'relative',
    //     template: this.addRowTemplate
    //   })), parent);
  }

  generateRow(cells: ICell[], parent: IRow | undefined = undefined): IRow
  {
    const row: IRow = { cells, parent, grid: this.source.grids.value[0] };
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

  onClickColumn(columnIndex: number): void
  {
    const column = this.columns[columnIndex];
    column.collapsed = !(column.collapsed ?? false);
    column.width = column.collapsed ? '23px' : '200px';

    this.sc.update();
  }

  onScrollTo(): void
  {
    this.sc.navigate(100);
  }
  onAddColumn(index: number): void
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

    this.columns.splice(index - 1, 0, { width: '0px' }, { width: 'minmax(25rem, 1fr)' });

    this.items.forEach(row =>
    {
      shift(row);

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
          content: `safbagrbsertg`,
          colStart: index + 1,
          background: 'darkgrey',
          template: this.columnTemplate,
          zIndex: this.zIndex++,
          canHide: false,
          position: 'sticky',
          top: 20,
          maxHeight: 21,
          dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn((cell.colStart ?? 1) - 1)
        } as ICell,
        {
          row: row.children?.[0],
          id: `${++this.id}`,
          content: `safbagrbsertg`,
          colStart: index + 1,
          rowspan: 101 * 5 + 1,
          template: this.columnCollapsedTemplate,
          zIndex: 0,
          wenColumnCollapsed: true,
          dblclick: (me: MouseEvent, cell: ICell): void => this.onClickColumn((cell.colStart ?? 1) - 1)
        } as ICell
      );
    })

    this.columns = [...this.columns];
    this.items = [...this.items];

    this.source.grids.value[0].rows.next(this.items);
  }

  onAddRow(cell: ICell): void
  {
    const parent = cell.row?.parent;
    if (!parent) return;

    const index = parent.children!.indexOf(cell.row!);

    const addedRows = [this.generateRow(this.generateBlockCells(), parent), this.generateAddRow(parent)];

    //if(parent.isExpanded())

    parent.children!.splice(index + 1, 0, ...addedRows);


    this.items = [...this.items];

    this.source.grids.value[0].rows.next(this.items);

  }

}
