import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { HttpService } from '@nestjs/axios';

const mockHttpService = {
  get: jest.fn()
};
describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService,
        {provide:HttpService, useValue:mockHttpService}
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
