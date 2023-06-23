import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Holiday" })
export class HolidayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: Date;
}
