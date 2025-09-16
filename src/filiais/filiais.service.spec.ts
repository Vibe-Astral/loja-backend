import { Test, TestingModule } from '@nestjs/testing';
import { FiliaisService } from './filiais.service';

describe('FiliaisService', () => {
  let service: FiliaisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiliaisService],
    }).compile();

    service = module.get<FiliaisService>(FiliaisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
