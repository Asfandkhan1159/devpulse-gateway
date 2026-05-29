import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from './metrics/metrics.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/user.entity';
import { ConnectedRepository } from './auth/connected-repository.entity';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        FASTAPI_URL: Joi.string().required(),
        GITLAB_CLIENT_ID: Joi.string().required(),
        GITLAB_CLIENT_SECRET: Joi.string().required(),
        GITLAB_CALLBACK_URL: Joi.string().required(),
        GITHUB_CLIENT_ID: Joi.string().required(),
        GITHUB_CLIENT_SECRET: Joi.string().required(),
        GITHUB_CALLBACK_URL: Joi.string().required(),
        GITLAB_TOKEN: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, ConnectedRepository],
  synchronize: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}),
    AuthModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}