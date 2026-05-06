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
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {provide:MetricsService, useValue:mockMetricsService}

      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should call get deployment frequency service when the parameters are valid', async () => {
    const fakeData = {
      "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-04-22T12:49:57.692541",
    "total_deployments": 1,
    "daily_average": 0.03333333333333333,
    "frequency_label": "Once per month"

    }
  mockMetricsService.getDeploymentFrequency.mockResolvedValue(
   fakeData
  )
  const result = await controller.getDeploymentFrequency(1,30);
  expect(result).toEqual(
    fakeData
  )
  expect(mockMetricsService.getDeploymentFrequency).toHaveBeenCalledWith(
    1,
    30
  )
  });
  it('should throw 404 when credentials doesnt exist or invalid',async()=>{
   mockMetricsService.getDeploymentFrequency.mockRejectedValue(
   new Error ('Project not found')
   )
   await expect(controller.getDeploymentFrequency(1,30)).rejects.toThrow('Project not found')

  })
  it('should call get lead time changes when paramters are valid',async()=>{
    const fakeData ={
    "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-05-05T18:32:15.880617",
    "average_lead_time_hours": 0
    }
    mockMetricsService.getLeadTimeforChanges.mockResolvedValue(
      fakeData
    )
    const result = await controller.getLeadTimeforChanges(1,30);
    expect(result).toEqual(
      fakeData
    )
    expect(mockMetricsService.getLeadTimeforChanges).toHaveBeenCalledWith(
      1,
      30
    )
  })
  it('should call get change failure rate when the paramters are valid',async()=>{
    const fakeData = {
      "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-05-05T18:44:13.128494",
    "failure_rate_percentage": 0
    }
    mockMetricsService.getChangeFailureRate.mockResolvedValue(
      fakeData
    )
    const result = await controller.getChangeFailureRate(1,30);
    expect(result).toEqual(
      fakeData
    )
    expect(mockMetricsService.getChangeFailureRate).toHaveBeenCalledWith(
      1,30
    )
  })
  it('should call get mean time to recovery when parameters are valid',async()=>{
    const fakeData = {
       "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-05-05T18:46:28.812720",
    "avg_mttr": 0
    }
    mockMetricsService.getMeanTimeToRecovery.mockResolvedValue(
      fakeData
    )
    const result = await controller.getMeanTimeToRecovery(1,30);
    expect(result).toEqual(
      fakeData
    )
    expect(mockMetricsService.getMeanTimeToRecovery).toHaveBeenCalledWith(
      1,30
    )
  })
});
