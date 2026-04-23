import { EventEmitter, TemplateRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';


/** Интерфейс уникального идентификатора */
export interface IId
{
  /** Уникальный идентификатор */
  id: string;
}

/** Строка */
export interface IRow
{
  /** Ячейки */
  cells: ICell[];
  /** Высота строки */
  height?: number;
  /** Дочерние строки */
  children?: IRow[];
  /** Флаг строка развёрнута */
  isExpanded?: boolean;
  /** Родительская строка */
  parent?: IRow;
  /** Родительская сетка */
  grid: IGrid;
  /** Дополнительная информация */
  tag?: any;
}

/** Интерфейс колонки */
export interface IColumn
{
  /** Уникальный идентификатор */
  id?: string;
  /** Ширина колонки */
  width: string;
  /** Размер колонки в пикселях */
  widthInPx?: number;
  /** Флаг колонка свёрнута */
  collapsed?: boolean;
  /** Шаблон для свёрнутой колонки */
  collapsedTemplate?: TemplateRef<any>;
}

/** Интерфейс ячейки */
export interface ICell extends IId
{
  /** Родительская строка */
  row?: IRow;

  /** Сколько колонок занимает */
  colspan?: number;
  /** Сколько ячеек занимает */
  rowspan?: number;

  /** Начальная колонка */
  colStart?: number;
  /** начальная строка */
  rowStart?: number;

  /** Высота */
  height?: number;
  /** Максимальная высота */
  maxHeight?: number;
  /** Фон */
  background?: string;
  /** Z индекс */
  zIndex?: number;
  /** Позиционирование */
  position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit' | 'sticky' | 'unset' | 'revert' | 'revert-layer';
  /** Сверху */
  top?: 'auto' | 'inherit' | number;
  /** Слева */
  left?: 'auto' | 'inherit' | number;
  /** Справа */
  right?: 'auto' | 'inherit' | number;
  /** Снизу */
  bottom?: 'auto' | 'inherit' | number;

  /** Содержание */
  content?: any;
  /** Шаблон */
  template?: TemplateRef<any>;

  /** Классы */
  class?: string;

  /** Функция клика */
  click?: (me: MouseEvent, cell: ICell) => void;
  /** Функция двойного клика */
  dblclick?: (me: MouseEvent, cell: ICell) => void;
  /** Функция наведения мышки */
  mouseover?: (me: MouseEvent, cell: ICell) => void;
  /** Функция покидания мышки */
  mouseout?: (me: MouseEvent, cell: ICell) => void;

  /** Флаг может ли скрываться */
  canHide?: boolean;
  /** Флаг отображение для свёрнутой колонки */
  wenColumnCollapsed?: boolean;
  /** Флаг свёрнута */
  collapsed?: boolean;
  /** Дополнительная информация */
  tag?: any;
  /** Связанная ячейка по высоте, если меняется высота этой ячейки, то и меняется высота связанной */
  linkedHeightCell?: ICell;

}

/** Интерфейс изменения высоты */
export interface IHeight
{
  /** Событие обновление высоты */
  updateHeight$: Subject<void>;
  /** Событие изменения размера ячейки */
  resizeCell: EventEmitter<ICell>;
}

/** Интерфейс изменения высоты */
export interface IUpdate
{
  /** Событие обновление высоты */
  update(): void;
}

/** Интерфейс сетка */
export interface IGrid extends IId
{
  /** Колонки */
  columns: BehaviorSubject<IColumn[]>;
  /** Строки */
  rows: BehaviorSubject<IRow[]>;
}

/** Интерфейс источник */
export interface ISource
{
  /** Набор таблиц */
  grids: BehaviorSubject<IGrid[]>;
}

/** Положение скролла */
export interface IScrollPosition
{
  /** Сверху */
  top: number;
  /** Слева */
  left: number;
}

/** Результат отображения */
export interface IDrawResult extends IScrollPosition
{
  /** Ячейки */
  cells: ICell[];
}

/** Изменение ячеек */
export interface ICellChange
{
  /** Ячейки */
  cells: ICell[];
  /** Ожидание */
  waiter: Subject<void>;
}
