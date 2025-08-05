import { Pipe, PipeTransform } from '@angular/core';
import { IColumn } from '../models';

@Pipe({ name: 'columnsPipe' })
export class ColumnsPipe implements PipeTransform
{

  transform(value: IColumn[]): string
  {
    return value.map(c => c.width).join(' ');
  }

}
