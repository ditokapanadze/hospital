import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { AwsSdkModule } from "nest-aws-sdk";
import { S3 } from "aws-sdk";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaEntity } from "./entity";
import { MediaRepo } from "./media.repo";

@Module({
  imports: [
    AwsSdkModule.forFeatures([S3]),
    TypeOrmModule.forFeature([MediaEntity]),
    UsersModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, ConfigService, MediaRepo],
})
export class MediaModule {}
