import { Module } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { Type } from "class-transformer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleEntity } from "./entity/schedule.entity";
import { ScheduleController } from "./schedule.controller";
import { MomentModule } from "@ccmos/nestjs-moment";
import { HolidayEntity } from "src/seeder/entity";
import { HolidayRepo } from "./holiday.repo";
import { ScheduleRepo } from "./schedule.repo";
import { HospitalsService } from "src/hospitals/hospital.service";
import { HospitalsModule } from "src/hospitals/hospitals.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleEntity, HolidayEntity]),
    HospitalsModule,
  ],
  providers: [ScheduleService, HolidayRepo, ScheduleRepo],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
