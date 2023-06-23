import { Module } from "@nestjs/common";
import { CronjobService } from "./cronjob.services";
import { ScheduleService } from "src/schedule/schedule.service";
import { ScheduleModule } from "src/schedule/schedule.module";

@Module({
  imports: [ScheduleModule],
  providers: [CronjobService],
})
export class CronjobModule {}
