import { TestBed } from '@angular/core/testing';

import { CompletionTypeService } from './completion-type.service';

describe('CompletionTypeService', () => {
  let service: CompletionTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompletionTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
