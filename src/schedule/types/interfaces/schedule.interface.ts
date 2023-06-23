import { ScheduleStatus } from "src/schedule/types/enum";
import { UserEntity } from "src/users/entitiy/user.entity";

export interface BaseSchedule {
  id: number;
  startDate: Date;
  endDate: Date;
}

export interface DBschedule extends BaseSchedule {
  status: ScheduleStatus[];
  doctor: Partial<UserEntity>;
  visitor: Partial<UserEntity>;
  hospital: Partial<UserEntity>;
}
