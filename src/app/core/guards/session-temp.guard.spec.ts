import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sessionTempGuard } from './session-temp.guard';

describe('sessionTempGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sessionTempGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
