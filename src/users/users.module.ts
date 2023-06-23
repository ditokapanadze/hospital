import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "./entitiy/user.entity";

import { UserRepository } from "./users.repo";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/email/email.service";
import { EmailModule } from "src/email/email.module";
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), EmailModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, JwtService, EmailService],
  exports: [UsersService],
})
export class UsersModule {}
