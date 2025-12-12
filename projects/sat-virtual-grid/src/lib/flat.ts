import { IGridFlat } from './interfaces';
import { IRow } from './models';

/** Плоская коллекция строк из сеток */
export class Flat //implements Iterable<IRow>
{
  /**
   * Конструктор
   * @param items Плоские списка
   * @param gridStartIndex Начальная сетка
   * @param rowStartIndex Начальная строка
   */
  constructor(protected items: IGridFlat[], public gridStartIndex?: number, public rowStartIndex?: number)
  {
    if (gridStartIndex === undefined)
    {
      this.gridStartIndex = 0;
      this.rowStartIndex = 0;
    }

    if (rowStartIndex === undefined)
      for (let i = 0; i < items.length; i++)
        if (this.gridStartIndex! - this.items[i].rows.length < 0)
        {
          this.rowStartIndex = this.gridStartIndex;
          this.gridStartIndex = i;
          break;
        }
        else
          this.gridStartIndex! -= this.items[i].rows.length;

    if (items.length > 0 && this.rowStartIndex! >= items[this.gridStartIndex!].rows.length)
      this.rowStartIndex = items[this.gridStartIndex!].rows.length - 1;
  }

  /**
   * Функция перечисления
   * @param callbackfn Функция вызова
   */
  forEach(callbackfn: (value: IRow, index?: number) => boolean | void): void
  {
    let index = this.index;
    if (this.gridStartIndex! >= this.items.length) return;
    let rows = this.items[this.gridStartIndex!].rows;
    while (this.rowStartIndex! < rows.length)
    {
      const rf = callbackfn(rows[this.rowStartIndex!], index++) ?? false;
      if (rf) return;

      this.rowStartIndex!++;

      //if (callbackfn(rows[this.rowStartIndex!++], index++) ?? false) { this.rowStartIndex!--; return; }
    }

    this.gridStartIndex!++;

    while (this.gridStartIndex! < this.items.length)
    {
      this.rowStartIndex = 0;
      rows = this.items[this.gridStartIndex!].rows;
      while (this.rowStartIndex < rows.length)
      {
        const rf = callbackfn(rows[this.rowStartIndex], index++) ?? false;
        if (rf) return;
        this.rowStartIndex++;

        //   if (callbackfn(rows[this.rowStartIndex++], index++) ?? false)
        //   {
        //     this.gridStartIndex!--;
        //     this.rowStartIndex--; return;
        //   }
      }
      this.gridStartIndex!++;
    }
  }

  /** @returns Текущий индекс */
  get index(): number { return this.startIndexGrid + this.rowStartIndex!; }

  /** @returns Индекс в плоском списке текущей суб массива */
  get startIndexGrid(): number
  {
    let result = 0;
    for (let i = 0; i < this.gridStartIndex!; i++)
      result += this.items[i].rows.length;

    return result;
  }

  /** @returns Размер плоского списка */
  get length(): number { return this.items.reduce((r, v) => { r += v.rows.length; return r; }, 0); }
}
