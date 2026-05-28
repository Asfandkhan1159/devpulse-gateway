// src/metrics/metrics.controller.ts
import { Controller, Get, UseGuards,Query,Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';


@UseGuards((AuthGuard('jwt'))) // Add appropriate guards if needed
@Controller('metrics')
export class MetricsController {
 constructor(
    private metricsService:MetricsService,
    private authService:AuthService
){}
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
}
 @Get('projects')
    async getProjects(@Req() req: Request) {
        const userId = (req.user as any).userId
        const [connectedRepos, allProjects] = await Promise.all([
            this.authService.getConnectedRepos(userId),
            this.metricsService.getAllProjects(),
        ])
        return allProjects.filter((p: any) =>
            connectedRepos.some(
                r => r.externalRepoId === String(p.external_id) 
            )
        )
    }
@Get('trends')
getTrends(
    @Query('project_id') projectId: number,
    @Query('days') days: number,
) {
    return this.metricsService.getTrends(projectId, days);
}

}
