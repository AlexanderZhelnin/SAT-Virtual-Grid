import { TemplateRef } from "@angular/core";
import { Subject } from "rxjs";


export interface IId
{
  id: string;
}

export interface IRow
{
  cells: ICell[];
  height?: number;
  children?: IRow[];
  isExpanded?: boolean;
  parent?: IRow;
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
  background?: string
  zIndex?: number;
  position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit' | 'sticky' | 'unset' | 'revert' | 'revert-layer';
  top?: 'auto' | 'inherit' | number;
  left?: 'auto' | 'inherit' | number;
  right?: 'auto' | 'inherit' | number;
  bottom?: 'auto' | 'inherit' | number;


  content?: any;
  template?: TemplateRef<any>;

  class?: string;

  click?: (cell: ICell) => void;
  dblclick?: (cell: ICell) => void;

  canHide?: boolean;
  wenColumnCollapsed?: boolean;
  collapsed?: boolean;
}

export interface IHeight
{
  updateHeight$: Subject<void>;
}

export interface IGrid extends IId
{
  /** Колонки */
  columns: IColumn[];
  /** Строки */
  rows: IRow[];
}

export interface ISource
{
  /** Набор гридов */
  grids: IGrid[];
}
