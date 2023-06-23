import { ScheduleStatus } from "src/schedule/types/enum";

import { IsNotEmpty, IsEnum, IsIn, IsNumber } from "class-validator";

export class StatusUpdateDto {
  @IsNotEmpty()
  @IsEnum(ScheduleStatus)
  @IsIn([...Object.values(ScheduleStatus)])
  status: string;

  @IsNotEmpty()
  @IsNumber()
  scheduleId: number;
}
