import { TestBed } from '@angular/core/testing';

import { StompHandlerService } from './stomp-handler.service';

describe('StompHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StompHandlerService = TestBed.get(StompHandlerService);
    expect(service).toBeTruthy();
  });
});
