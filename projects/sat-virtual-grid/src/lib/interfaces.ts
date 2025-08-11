import { ICell, IColumn, IId, IRow } from "./models";

/** Интерфейс индексов */
export interface IIndex
{
  /** Индекс начала */
  startIndex: number;
  /** Индекс конца */
  endIndex: number;
}

/** Отображаемая сетка */
export interface IDataGrid
{
  /** Уникальный идентификатор */
  id: string;
  /** Отображаемые ячейки */
  items: ICell[];
  /** Колонки */
  columns: IColumn[];
  /** Добавляемый прикрепляемый элемент  */
  addedSticky: { rowStart: number; height: number };
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

export interface IGridFlat extends IId
{
  /** Колонки */
  columns: IColumn[];
  /** Строки */
  rows: IRow[];
}

