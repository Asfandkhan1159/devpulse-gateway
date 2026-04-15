import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {User} from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [TypeOrmModule.forFeature([User]),
  PassportModule,
  JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: '7d' },
  }),
  inject: [ConfigService],
}),],
 
   
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports:[AuthService,JwtStrategy,PassportModule],
})
export class AuthModule {}
