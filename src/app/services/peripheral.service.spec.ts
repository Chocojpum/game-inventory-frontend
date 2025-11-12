import { TestBed } from '@angular/core/testing';

import { PeripheralService } from './peripheral.service';

describe('PeripheralService', () => {
  let service: PeripheralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeripheralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
