// src/metrics/metrics.controller.ts
import { Controller, Get, UseGuards,Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards((AuthGuard('jwt'))) // Add appropriate guards if needed
@Controller('metrics')
export class MetricsController {
 constructor(private metricsService:MetricsService){}
@Get('deployment-frequency')
getDeploymentFrequency(
    @Query('project_id') projectId:number,
    @Query('days') days:number
){
    return this.metricsService.getDeploymentFrequency(projectId,days);
}
@Get('lead-time')
getLeadTimeforChanges(
    @Query('project_id') projectId:number,
    @Query('days') days:number
){
    return this.metricsService.getLeadTimeforChanges(projectId,days);
}
@Get('change-failure-rate')
getChangeFailureRate(
    @Query('project_id') projectId:number,
    @Query('days') days:number
){
    return this.metricsService.getChangeFailureRate(projectId,days);
}
@Get('mean-time-to-recovery')
getMeanTimeToRecovery(
    @Query('project_id') projectId:number,
    @Query('days') days:number
){
    return this.metricsService.getMeanTimeToRecovery(projectId,days);
}}
