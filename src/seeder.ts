// import { Injectable } from "@nestjs/common";

// import { HolidayAPI } from "holidayapi";

// const key = "e6788273-5454-430f-aad0-956557c4bccb";
// const holidayApi = new HolidayAPI({ key });
// @Injectable()
// export class Seeder {
//   constructor(private readonly holidayApi: HolidayAPI) {
//     this.holidayApi = new HolidayAPI({ key });
//   }
//   async seed() {
//     const holidays = [];
//     holidayApi
//       .holidays({ country: "GEO", year: 2022 })
//       .then((res) => {
//         res.holidays.forEach((holiday) => {
//           if (holiday.public) holidays.push(holiday);
//         });
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//     console.log(holidays);
//   }
// }
