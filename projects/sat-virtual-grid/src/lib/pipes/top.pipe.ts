import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'topPipe' })
export class TopPipe implements PipeTransform
{

  transform(value: 'auto' | 'inherit' | number | undefined): string
  {
    if (value === undefined) return 'auto';
    if (typeof value === 'string') return value;
    return `${value}px`;
  }

}
