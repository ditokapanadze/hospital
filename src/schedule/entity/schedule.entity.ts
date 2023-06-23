import { HospitalEntity } from "src/hospitals/entitiy/hospital.entity";
import { ScheduleStatus } from "src/schedule/types/enum";
import { UserEntity } from "src/users/entitiy/user.entity";
import * as moment from "moment";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
} from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { DBschedule } from "../types/interfaces";

@Entity({ name: "Schedule" })
export class ScheduleEntity implements DBschedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp", nullable: true })
  startDate: Date;

  @Column({ type: "timestamp", nullable: true })
  endDate: Date;

  @Column({
    type: "enum",
    enum: ScheduleStatus,
    default: ScheduleStatus.PENDING,
  })
  status: ScheduleStatus[];

  @ManyToOne(() => UserEntity, (user) => user.schedule)
  doctor: Partial<UserEntity>;

  @ManyToOne(() => UserEntity, (user) => user.schedule)
  visitor: Partial<UserEntity>;

  @ManyToOne(() => HospitalEntity, (hospital) => hospital.schedule)
  hospital: Partial<UserEntity>;

  @BeforeInsert()
  @BeforeUpdate()
  validateTimeRange() {
    const startHour = moment(this.startDate).hours();
    const endHour = moment(this.endDate).hours();
    console.log(this.startDate, "startDate");

    if (startHour < 10 || endHour > 17) {
      throw new BadRequestException("The time range is not valid");
    }
  }
}
