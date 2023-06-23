import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AwsSdkModule } from "nest-aws-sdk";
import { ScheduleModule as nestSchedule } from "@nestjs/schedule";

import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import cookieSession = require("cookie-session");
import * as Joi from "joi";
import { AuthModule } from "./auth/auth.module";
import { HospitalsModule } from "./hospitals/hospitals.module";
import { dataSourceOptions } from "./db/data-source";
import { EmailModule } from "./email/email.module";
import { SeederModule } from "./seeder/seeder.module";
import { Seeder } from "./seeder/seeder.service";
import { ScheduleModule } from "./schedule/schedule.module";
import { S3 } from "aws-sdk";
import { MediaModule } from "./media/media.module";
import { CronjobModule } from "./cronjob/cronjob.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB: Joi.string().required(),
        PORT: Joi.string(),
        COOKIE_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.number().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.number().required(),
        JWT_RESET_EXPIRATION_TIME: Joi.number().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        JWT_VERIFICATION_EXPIRATION_TIME: Joi.string().required(),
        BASE_URL: Joi.string().required(),
      }),
    }),
    nestSchedule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await dataSourceOptions(configService),
      inject: [ConfigService],
    }),
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory(configService: ConfigService) {
          return {
            accessKeyId: configService.get("AWS_ACCESS_KEY"),
            secretAccessKey: configService.get("AWS_SECRET_KEY"),
            region: configService.get("AWS_REGION"),
          };
        },
      },
      services: [S3],
    }),
    UsersModule,
    AuthModule,
    HospitalsModule,
    EmailModule,
    SeederModule,
    ScheduleModule,
    MediaModule,
    CronjobModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({ keys: [this.configService.get("COOKIE_KEY")] }))
      .forRoutes("*");
  }
}
