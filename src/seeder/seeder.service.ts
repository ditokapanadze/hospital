import { Injectable } from "@nestjs/common";

import { HolidayAPI } from "holidayapi";
import { SeederRepo } from "./seeder.repo";

const key = "e6788273-5454-430f-aad0-956557c4bccb";
const holidayApi = new HolidayAPI({ key });
@Injectable()
export class Seeder {
  key = "e6788273-5454-430f-aad0-956557c4bccb";

  holidayApi = new HolidayAPI({ key });
  constructor(private readonly seederRepo: SeederRepo) {}
  async seed() {
    const holidays = [];
    holidayApi
      .holidays({ country: "GEO", year: 2022 })
      .then((res) => {
        res.holidays.forEach((holiday) => {
          const newDate = new Date(holiday.date);
          if (holiday.public)
            holidays.push(
              new Date(newDate.setFullYear(newDate.getFullYear() + 1))
            );
        });
      })
      .then((res) => {
        this.seederRepo.seedHolidays(holidays);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
