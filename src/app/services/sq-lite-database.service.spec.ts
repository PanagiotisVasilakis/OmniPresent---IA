import { TestBed } from '@angular/core/testing';

import { SqLiteDatabaseService } from './sq-lite-database.service';

describe('SqLiteDatabaseService', () => {
  let service: SqLiteDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqLiteDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
