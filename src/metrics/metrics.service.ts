import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotFoundException,InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MetricsService {
   
    constructor(private httpService:HttpService){}
    private async callFastAPI(endpoint: string, projectId: number, days: number) {
    try {
        const response = await firstValueFrom(
            this.httpService.get(`http://localhost:8000${endpoint}`, {
                params: { project_id: projectId, days }
            })
        );
        return response.data;
    } catch (error:any) {
        if (error.response?.status === 404) {
            throw new NotFoundException('Project not found');
        }
        throw new InternalServerErrorException('Failed to fetch metrics');
    }
}
    async getDeploymentFrequency(projectId:number, days:number){
        return this.callFastAPI('/metrics/deployment-frequency',projectId,days)
    }
    async getLeadTimeforChanges(projectId:number, days:number){
        return this.callFastAPI('/metrics/lead-time',projectId,days)
    }
    async getChangeFailureRate(projectId:number, days:number){
        return this.callFastAPI('/metrics/change-failure-rate',projectId,days)
    }

    async getMeanTimeToRecovery(projectId:number, days:number){
       return this.callFastAPI('/metrics/mean-time-to-recovery',projectId,days)
    }
}
