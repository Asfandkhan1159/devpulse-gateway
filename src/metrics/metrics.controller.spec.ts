import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

const mockMetricsService ={
  getDeploymentFrequency:jest.fn(),
  getLeadTimeforChanges : jest.fn(),
  getChangeFailureRate : jest.fn(),
  getMeanTimeToRecovery:jest.fn()
}
describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {provide:MetricsService, useValue:mockMetricsService}

      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
