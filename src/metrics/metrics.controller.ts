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
async getDeploymentFrequency(
    @Query('project_id') projectId:number,
    @Query('days') days:number,
    @Req() req:Request
){
    const userId =  (req.user as any).userId
    return this.metricsService.getDeploymentFrequency(projectId,days,userId);
}
@Get('lead-time')
async getLeadTimeforChanges(
    @Query('project_id') projectId:number,
    @Query('days') days:number,
    @Req() req:Request

){
    const userId =  (req.user as any).userId
    return this.metricsService.getLeadTimeforChanges(projectId,days, userId);
}
@Get('change-failure-rate')
async getChangeFailureRate(
    @Query('project_id') projectId:number,
    @Query('days') days:number,
    @Req() req:Request
){
    const userId =  (req.user as any).userId
    return this.metricsService.getChangeFailureRate(projectId,days,userId);
}
@Get('mean-time-to-recovery')
async getMeanTimeToRecovery(
    @Query('project_id') projectId:number,
    @Query('days') days:number,
    @Req() req:Request
){
    const userId =  (req.user as any).userId
    return this.metricsService.getMeanTimeToRecovery(projectId,days,userId);
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
async getTrends(
    @Query('project_id') projectId: number,
    @Query('days') days: number,
    @Req() req:Request
) {
    const userId = (req.user as any).userId
    return this.metricsService.getTrends(projectId, days,userId);
}

}
