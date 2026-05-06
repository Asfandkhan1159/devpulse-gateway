import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';


const mockHttpService = {
  get: jest.fn()
};


describe('MetricsService', () => {
  
  let service: MetricsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService,
        {provide:HttpService, useValue:mockHttpService}
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('it should get deployment frequency', async () => {
    const fakeData ={
    "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-04-21T22:18:49.944188",
    "total_deployments": 1,
    "daily_average": 0.03333333333333333,
    "frequency_label": "Once per month"
}
    mockHttpService.get.mockReturnValue(
      of({data:fakeData})
    )
    const result = await service.getDeploymentFrequency(1,30)
    expect(result).toEqual(fakeData)

    expect(mockHttpService.get).toHaveBeenCalledWith(
      'http://localhost:8000/metrics/deployment-frequency',
      {params:{project_id:1,days:30}}
    )
  });
  it('it should return leadtime',async()=>{
    const fakeDAta = {
    "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-04-21T22:39:39.160344",
    "average_lead_time_hours": 0
}
 mockHttpService.get.mockReturnValue(
  of({data:fakeDAta})
 )
 const result = await service.getLeadTimeforChanges(1,30)
 expect(result).toEqual(fakeDAta);
  expect(mockHttpService.get).toHaveBeenCalledWith(
  'http://localhost:8000/metrics/lead-time',
  {params:{project_id:1,days:30}}
 )

  })
  
  it('should throw 404',async () =>{
  
  mockHttpService.get.mockReturnValue(
    throwError(()=>({response:{
  
    "status": 404
}}))
  )
  await expect(service.getDeploymentFrequency(
    1,
    30
  )).rejects.toThrow('Project not found')
});
it('should throw InternalServerException', async()=>{
mockHttpService.get.mockReturnValue(
  throwError(()=>new Error('Network failure'))
)
await expect(service.getDeploymentFrequency(1,30)).rejects.toThrow('Failed to fetch metrics')
})

it('should return change failure rate', async()=>{
  const fakeData = {
    "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-04-22T12:16:50.180118",
    "failure_rate_percentage": 0
}

 mockHttpService.get.mockReturnValue(
  of({data:fakeData})
 )
 const result = await service.getChangeFailureRate(1,30)
expect(result).toEqual(fakeData)

expect(mockHttpService.get).toHaveBeenCalledWith(
  'http://localhost:8000/metrics/change-failure-rate',
  {params:{project_id:1,days:30}}

)

})
it('should return mttr',async()=>{
  const mockedData ={
    "project_id": 1,
    "period_days": 30,
    "calculated_at": "2026-04-22T12:26:07.578545",
    "avg_mttr": 0
}
mockHttpService.get.mockReturnValue(
  of({data:mockedData})
)
const result = await service.getMeanTimeToRecovery(1,30)
expect(result).toEqual(mockedData)
expect(mockHttpService.get).toHaveBeenCalledWith(
  'http://localhost:8000/metrics/mean-time-to-recovery',
  {params:{project_id:1, days:30}}
)
})

})