import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HolidayEntity } from "./entity";
import { Repository } from "typeorm";

@Injectable()
export class SeederRepo {
  constructor(
    @InjectRepository(HolidayEntity)
    private readonly holidayRepo: Repository<HolidayEntity>
  ) {}

  async seedHolidays(holidays: string[]) {
    return await Promise.all(
      holidays.map((holiday) => {
        const newHoliday = this.holidayRepo.create({ date: holiday });

        this.holidayRepo.save(newHoliday);
      })
    );
  }
}
