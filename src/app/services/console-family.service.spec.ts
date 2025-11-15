import { TestBed } from '@angular/core/testing';

import { ConsoleFamilyService } from './console-family.service';

describe('ConsoleFamilyService', () => {
  let service: ConsoleFamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsoleFamilyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
