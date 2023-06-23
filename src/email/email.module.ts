import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { UserRepository } from "src/users/users.repo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/users/entitiy/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [EmailService, JwtService],
  exports: [EmailService],
})
export class EmailModule {}
