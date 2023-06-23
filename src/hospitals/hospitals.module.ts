import { Module } from "@nestjs/common";

import { HospitalsController } from "./hospitals.controller";
import { HospitalsService } from "./hospital.service";
import { HospitalRepository } from "./hospital.repo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HospitalEntity } from "./entitiy/hospital.entity";
import { UserEntity } from "src/users/entitiy/user.entity";
import { UserRepository } from "src/users/users.repo";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/email/email.service";

@Module({
  imports: [TypeOrmModule.forFeature([HospitalEntity, UserEntity])],
  controllers: [HospitalsController],
  providers: [
    HospitalsService,
    HospitalRepository,
    UserRepository,
    UsersService,
    EmailService,
    JwtService,
  ],
  exports: [HospitalsService],
})
export class HospitalsModule {}
