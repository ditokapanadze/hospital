import { Module } from "@nestjs/common";
import { Seeder } from "./seeder.service";

import { TypeOrmModule } from "@nestjs/typeorm";
import { HolidayEntity } from "./entity";
import { SeederRepo } from "./seeder.repo";

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])],
  providers: [Seeder, SeederRepo],
  exports: [Seeder],
})
export class SeederModule {}
