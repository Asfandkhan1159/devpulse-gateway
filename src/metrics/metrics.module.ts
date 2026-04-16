import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  imports: [PassportModule, AuthModule,HttpModule],
})
export class MetricsModule {}
