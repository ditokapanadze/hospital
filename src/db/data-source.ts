import { DataSourceOptions, DataSource } from "typeorm";

import { HospitalEntity } from "src/hospitals/entitiy/hospital.entity";
import { UserEntity } from "src/users/entitiy/user.entity";

import { HolidayEntity } from "src/seeder/entity";
import { ConfigService } from "@nestjs/config";
import { ScheduleEntity } from "src/schedule/entity/schedule.entity";
import { MediaEntity } from "src/media/entity";

export const dataSourceOptions = async (
  configService: ConfigService
): Promise<DataSourceOptions> => {
  return {
    type: "postgres",
    host: configService.get<string>("DB_HOST", "localhost"),
    port: configService.get<number>("DB_PORT", 5432),
    username: configService.get<string>("DB_USERNAME", "postgres"),
    password: configService.get<string>("DB_PASSWORD", "postgres"),
    database: configService.get<string>("DB", "postgres"),
    entities: [
      UserEntity,
      HospitalEntity,
      HolidayEntity,
      ScheduleEntity,
      MediaEntity,
    ],
    synchronize: true,
  };
};
