import { Component, HostBinding, Input } from '@angular/core';

/** Веб компонент */
@Component({
    selector: 'app-doc-param',
    templateUrl: './doc-param.component.html',
    styleUrls: ['./doc-param.component.scss'],
    standalone: false
})
export class DocParamComponent
{
  /** Код параметра */
  private _dataCode?: string;

  /** @returns Получить код параметра */
  get dataCode(): string | undefined { return this._dataCode; }

  /** Установить код параметра */
  @HostBinding('attr.data-code')
  @Input()
  set dataCode(code: string | undefined) { this._dataCode = code; }

}
