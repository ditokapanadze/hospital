import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsNumber()
  doctorId: number;

  @IsNotEmpty()
  @IsNumber()
  hospitalId: number;
}

export class RescheduleDto {
  @IsNotEmpty()
  @IsString()
  newDate: string;

  @IsNotEmpty()
  @IsNumber()
  scheduleId: number;

  @IsNotEmpty()
  @IsString()
  newTime: string;
}
