import { Pipe, PipeTransform } from '@angular/core';

/** Добавление px если число */
@Pipe({ name: 'pxPipe' })
export class PxPipe implements PipeTransform
{
  /**
   * Преобразование
   * @param value Значение
   * @returns Результат
   */
  transform(value: 'auto' | 'inherit' | number | undefined): string
  {
    if (value === undefined) return 'auto';
    if (typeof value === 'string') return value;
    return `${value}px`;
  }
}
