import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ScheduleService } from "src/schedule/schedule.service";

@Injectable()
export class CronjobService {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Cron("* 0 0 * * *")
  handleCron() {
    console.log("CronjobService");
    return this.scheduleService.outdateSchedule();
  }
}
