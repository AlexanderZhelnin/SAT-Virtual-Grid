import { TestBed } from '@angular/core/testing';

import { SatVirtualGridService } from './sat-virtual-grid.service';

describe('SatVirtualGridService', () => {
  let service: SatVirtualGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SatVirtualGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
