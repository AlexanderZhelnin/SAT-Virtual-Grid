import { IGridFlat } from "./interfaces";
import { IRow } from "./models";

/** Плоская коллекция строк из сеток */
export class Flat //implements Iterable<IRow>
{
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

    if (this.rowStartIndex! >= items[this.gridStartIndex!].rows.length)
      this.rowStartIndex = items[this.gridStartIndex!].rows.length - 1;
  }

  forEach(callbackfn: (value: IRow, index?: number) => boolean | void): void
  {
    let index = this.index;
    if (this.gridStartIndex! >= this.items.length) return;
    let rows = this.items[this.gridStartIndex!].rows;
    while (this.rowStartIndex! < rows.length)
      if (callbackfn(rows[this.rowStartIndex!++], index++) ?? false) { this.rowStartIndex!--; return; }

    this.gridStartIndex!++;

    while (this.gridStartIndex! < this.items.length)
    {
      this.rowStartIndex = 0;
      rows = this.items[this.gridStartIndex!++].rows;
      while (this.rowStartIndex! < rows.length)
        if (callbackfn(rows[this.rowStartIndex++], index++) ?? false)
        {
          this.gridStartIndex!--;
          this.rowStartIndex--; return;
        }
    }
  }

  get index(): number
  {
    return this.startIndexGrid + this.rowStartIndex!;
  }

  /** Индекс в плоском списке текущей субмассива */
  get startIndexGrid(): number
  {
    let result = 0;
    for (let i = 0; i < this.gridStartIndex!; i++)
      result += this.items[i].rows.length;

    return result;
  }
  get length(): number
  {
    let result = 0;
    for (let i = 0; i < this.items.length; i++)
      result += this.items[i].rows.length;

    return result;
  }
}

