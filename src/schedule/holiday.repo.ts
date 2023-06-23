import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HolidayEntity } from "src/seeder/entity";
import { Repository } from "typeorm";

@Injectable()
export class HolidayRepo {
  constructor(
    @InjectRepository(HolidayEntity)
    private readonly holidayRepo: Repository<HolidayEntity>
  ) {}
  async checkHoliday(date: any) {
    const holiday = await this.holidayRepo.findOne({ where: { date } });
    if (holiday) {
      return true;
    }
    return false;
  }
}
