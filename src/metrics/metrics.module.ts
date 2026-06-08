import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';




@Module({
  imports: [
PassportModule, AuthModule,HttpModule,],
  controllers: [MetricsController],
  providers: [MetricsService],

})
export class MetricsModule {}
