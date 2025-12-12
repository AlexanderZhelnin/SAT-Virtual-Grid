import { Pipe, PipeTransform } from '@angular/core';
import { IColumn } from '../models';

/** Преобразование объектов размера колонок к строке */
@Pipe({ name: 'columnsPipe' })
export class ColumnsPipe implements PipeTransform
{

  /**
   * @param value Массив колонок
   * @returns Преобразование
   */
  transform(value: IColumn[]): string
  {
    return value.map(c => c.width).join(' ');
  }

}
