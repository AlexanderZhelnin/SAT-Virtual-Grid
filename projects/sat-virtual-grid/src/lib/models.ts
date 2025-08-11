import { TemplateRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';


export interface IId
{
  /** Уникальный идентификатор */
  id: string;
}

export interface IRow
{
  cells: ICell[];
  height?: number;
  children?: IRow[];
  isExpanded?: boolean;
  parent?: IRow;
  grid: IGrid;
  tag?: any;
}

export interface IColumn
{
  width: string;
  collapsed?: boolean;
  collapsedTemplate?: TemplateRef<any>;
}

export interface ICell extends IId
{
  row?: IRow;

  colspan?: number;
  rowspan?: number;

  colStart?: number;
  rowStart?: number;

  height?: number;
  maxHeight?: number;
  background?: string;
  zIndex?: number;
  position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit' | 'sticky' | 'unset' | 'revert' | 'revert-layer';
  top?: 'auto' | 'inherit' | number;
  left?: 'auto' | 'inherit' | number;
  right?: 'auto' | 'inherit' | number;
  bottom?: 'auto' | 'inherit' | number;

  content?: any;
  template?: TemplateRef<any>;

  class?: string;

  click?: (me: MouseEvent, cell: ICell) => void;
  dblclick?: (me: MouseEvent, cell: ICell) => void;
  mouseover?: (me: MouseEvent, cell: ICell) => void;
  mouseout?: (me: MouseEvent, cell: ICell) => void;

  canHide?: boolean;
  wenColumnCollapsed?: boolean;
  collapsed?: boolean;
  tag?: any;
}

export interface IHeight
{
  updateHeight$: Subject<void>;
}

export interface IGrid extends IId
{
  /** Колонки */
  columns: BehaviorSubject<IColumn[]>;
  /** Строки */
  rows: BehaviorSubject<IRow[]>;
}

export interface ISource
{
  /** Набор таблиц */
  grids: BehaviorSubject<IGrid[]>;
}
