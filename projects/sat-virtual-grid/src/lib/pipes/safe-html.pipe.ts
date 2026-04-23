import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** SafeHtmlPipe */
@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform
{
    /** Санитайзер */
    private readonly sanitizer = inject(DomSanitizer);

    /**
     * Обработка входящего html
     * @param html Строка с html
     * @returns SafeHtml
     */
    transform(html: string): SafeHtml
    {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
