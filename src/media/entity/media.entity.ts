import {
  Column,
  Db,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DBmedia } from "../types/interfaces";
import { MediaType } from "../types/enums";
import { UserEntity } from "src/users/entitiy/user.entity";

@Entity({ name: "Media" })
export class MediaEntity implements DBmedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  key: string;

  @Column({ type: "varchar" })
  url: string;

  @DeleteDateColumn({ type: "timestamp with time zone" })
  deletedAt: Date;

  @Column({ type: "enum", enum: MediaType })
  mediaType: MediaType[];

  @OneToOne(() => UserEntity, {
    nullable: true,

    onDelete: "SET NULL",
  })
  user: UserEntity;
}
