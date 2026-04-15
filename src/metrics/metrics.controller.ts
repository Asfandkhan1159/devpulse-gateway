import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards((AuthGuard('jwt'))) // Add appropriate guards if needed
@Controller('metrics')
export class MetricsController {
@Get()
test(){
    return {message:'Metrics endpoint is working'};
}

}
