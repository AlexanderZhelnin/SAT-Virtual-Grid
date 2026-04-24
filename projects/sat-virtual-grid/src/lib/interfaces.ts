import { BehaviorSubject } from 'rxjs';
import { ICell, IColumn, IId, IRow } from './models';

/** Интерфейс индексов */
export interface IIndex
{
  /** Индекс начала строки */
  startYIndex: number;
  /** Индекс конца  строки */
  endYIndex: number;
}

/** Отображаемая сетка */
export interface IDataGrid
{
  /** Уникальный идентификатор */
  id: string;
  /** Отображаемые ячейки */
  items: ICell[];

  /** Отображаемые ячейки */
  //itemsX: BehaviorSubject<ICell[]>;
  itemsX: ICell[];

  /** Колонки */
  columns: IColumn[];
  /** Добавляемый прикрепляемый элемент  */
  addedSticky: { /** Номер строки */ rowStart: number; /** Высота */ height: number };

  /** Номер начальной и конечной строки */
  index: IIndex;
  /** Номер сетки в общем массиве */
  gridIndex: number;
}

/** Интерфейс данных */
export interface IData
{
  /** Сетки */
  grids: IDataGrid[];
  /** Индексы отображения */
  index: IIndex;
  /** Отображаемая высота */
  height: number;
  /** Начальная высота */
  startHeight: number;
  /** Конечная высота */
  endHeight: number;
}

/** Интерфейс плоского списка */
export interface IGridFlat extends IId
{
  /** Колонки */
  columns: IColumn[];
  /** Строки */
  rows: IRow[];
}



