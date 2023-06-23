import { ScheduleEntity } from "src/schedule/entity/schedule.entity";
import { DBhospital } from "src/users/types/interfaces";
import { UserEntity } from "src/users/entitiy/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity({ name: "Hospital" })
export class HospitalEntity implements DBhospital {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  public email: string;

  @OneToMany(() => UserEntity, (user) => user.hospitalDoctor)
  public doctors: UserEntity[];

  @OneToMany(() => ScheduleEntity, (schedule) => schedule.hospital)
  public schedule: ScheduleEntity[];

  @OneToMany(() => UserEntity, (user) => user.hospitalAdmin)
  public admin: UserEntity[];
}
