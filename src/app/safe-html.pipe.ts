import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Обёртка для вставки html */
@Pipe({ name: 'safehtml' })
export class SafeHtmlPipe implements PipeTransform
{
  /**
   * Конструктор
   * @param sanitizer санитайзер
   */
  constructor(private readonly sanitizer: DomSanitizer) { }

  /**
   * Преобразование
   * @param url Адрес
   * @returns Результат
   */
  transform(url: string): SafeHtml
  {
    return this.sanitizer.bypassSecurityTrustHtml(url);
  }
}
