import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-doc-param',
  templateUrl: './doc-param.component.html',
  styleUrls: ['./doc-param.component.scss']
})
export class DocParamComponent implements OnDestroy
{
  ngOnDestroy(): void
  {
    if (this.dataCode === 'code_1')
    {
      console.log('Удаление');
    }
  }
  /** Код параметра */
  private _dataCode?: string;

  /** @returns Получить код параметра */
  get dataCode(): string | undefined { return this._dataCode; }

  /** Установить код параметра */
  @HostBinding('attr.data-code')
  @Input()
  set dataCode(code: string | undefined) { this._dataCode = code; }

}
