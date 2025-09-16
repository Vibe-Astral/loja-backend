import { Test, TestingModule } from '@nestjs/testing';
import { FiliaisController } from './filiais.controller';

describe('FiliaisController', () => {
  let controller: FiliaisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiliaisController],
    }).compile();

    controller = module.get<FiliaisController>(FiliaisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
