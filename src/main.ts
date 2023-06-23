import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

import { ValidationPipe } from "@nestjs/common";
import cookieSession = require("cookie-session");
import { ConfigService } from "@nestjs/config";
import { HolidayAPI } from "holidayapi";
import { Seeder } from "./seeder/seeder.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get("PORT");

  const seeder = app.get(Seeder);

  seeder
    .seed()
    .then(() => console.log("Seeded!", process.env.PORT))
    .catch((err) => console.log(err, "seeder error"));

  // holidayApi
  //   .holidays({ country: "GEO", year: 2022 })
  //   .then((holidays) => {
  //     console.log(holidays);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });

  // app.use(cookieSession({ keys: ["aasd"] }));
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  //e2e ტესტირების დროს ესე შემოიპორტეპუი პაიპლაინი ფეილდება, ამიტო ჯობია აპპ მოდულში შეტანა
  await app.listen(port || 3000, () =>
    console.log(`Listening on port ${port}`)
  );
}
bootstrap();
