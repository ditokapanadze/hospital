import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Moment, MomentTz } from "@ccmos/nestjs-moment/dist/moment/interfaces";
import * as moment from "moment";
import { HolidayRepo } from "./holiday.repo";
import { ScheduleRepo } from "./schedule.repo";
import { HospitalsService } from "src/hospitals/hospital.service";
import { check, doc } from "prettier";
import { Check } from "typeorm";
import { format } from "path";
import { Role, ScheduleStatus } from "src/schedule/types/enum";
import { start } from "repl";
import { DBschedule } from "./types/interfaces";

@Injectable()
export class ScheduleService {
  constructor(
    private readonly holidayRepo: HolidayRepo,
    private readonly scheduleRepo: ScheduleRepo,
    private readonly hospitalService: HospitalsService
  ) {}

  async createSchedule(
    userId: number,
    date: string,
    time: string,
    doctorId: number,
    hospitalId: number
  ): Promise<DBschedule> {
    const startDate = this.formatDateTime(date, time);
    const endDate = this.formatDateTime(date, time, 30);

    this.checkDate(startDate);
    this.checkHoliday(startDate);

    const checkHospital = await this.hospitalService.findHospitalWithDoctors(
      hospitalId
    );

    if (!checkHospital) {
      throw new NotFoundException("Hospital not found");
    }

    const checkDoctor = checkHospital.doctors.find(
      (doctor) => doctor.id === doctorId
    );

    if (!checkDoctor) {
      throw new NotFoundException("Doctor not found");
    }

    await this.checkSchedule(startDate, doctorId);

    return await this.scheduleRepo.createVisit(
      startDate,
      userId,
      doctorId,
      hospitalId,
      endDate
    );
  }

  async getScheduleForVisitor(
    hospitalId: number,
    status: string,
    startDate: string,
    endDate: string,
    doctorId: number,
    visitorId: number,
    role?: string
  ): Promise<DBschedule[]> {
    startDate
      ? (startDate = this.formatDateTime(startDate?.toString(), "00:00 AM"))
      : (startDate = null);

    endDate
      ? (endDate = this.formatDateTime(endDate?.toString(), "00:00 AM"))
      : (endDate = null);

    return this.scheduleRepo.getHospitalSchedule(
      hospitalId,
      status,
      startDate,
      endDate,
      doctorId,
      visitorId,
      role
    );
  }

  async checkSchedule(startDate: string, doctorId: number) {
    const schedule = await this.scheduleRepo.getDoctorSchedule(doctorId);

    const dataToCheck = moment(startDate);

    const check = schedule.some((date) => {
      return dataToCheck.isBetween(
        moment(date.startDate),
        moment(date.endDate),
        null,
        "[]"
      );
    });

    if (check) {
      throw new BadRequestException(
        "The doctor is busy at this time, please choose another date"
      );
    }
  }

  async getFreeDate(date: string, doctorId: number) {
    // const getFreeDate = await this.scheduleRepo.getFreeDate(date, doctorId);
  }

  async getHospitalSchedule(
    hospitalId: number,
    userId: number,
    role: Role.ADMIN | Role.SUPER_ADMIN,
    status: string,
    startDate: string,
    endDate: string,
    doctorId: number,
    visitorId: number
  ): Promise<DBschedule[]> {
    startDate
      ? (startDate = this.formatDateTime(startDate?.toString(), "00:00 AM"))
      : (startDate = null);

    endDate
      ? (endDate = this.formatDateTime(endDate?.toString(), "00:00 AM"))
      : (endDate = null);

    const hospital = await this.hospitalService.findHospitalWithDoctors(
      hospitalId
    );

    if (!hospital) {
      throw new NotFoundException("Hospital not found");
    }

    if (role === Role.ADMIN) {
      const checkAdmin = hospital.admin.find((admin) => {
        return admin.id == userId;
      });

      if (!checkAdmin) {
        throw new ForbiddenException("You are not authorized");
      }
    }
    return await this.scheduleRepo.getHospitalSchedule(
      hospitalId,
      status,
      startDate,
      endDate,
      doctorId,
      visitorId
    );
  }

  public async getScheduleForDoctor(
    status: string,
    endDate: string,
    startDate: string,
    visitorId: number,
    doctorId: number
  ) {}
  public async scheduleStatusUpdate(
    userId: number,
    scheduleId: number,
    role: string,
    status: string
  ): Promise<boolean> {
    console.log(userId, scheduleId, role);
    const visit = await this.scheduleRepo.getScheduleById(
      scheduleId,
      role,
      userId
    );

    if (!visit.length) {
      throw new NotFoundException("Schedule not found");
    }

    if (role === Role.ADMIN) {
      const findHospital = await this.hospitalService.findHospitalWithDoctors(
        visit[0].hospital.id
      );

      const checkAdmin = findHospital.admin.find((admin) => {
        return admin.id == userId;
      });

      if (!checkAdmin) {
        console.log("You are not authorized");
        throw new UnauthorizedException("You are not authorized");
      }
    }

    return await this.scheduleRepo.updateScheduleStatus(scheduleId, status);
  }

  public async outdateSchedule() {
    return this.scheduleRepo.outdateSchedule();
  }

  public async reschedule(
    userId: number,
    newDate: string,
    newTime: string,
    scheduleId: number,
    role: Role.USER | Role.DOCTOR
  ) {
    const schedule = await this.scheduleRepo.getScheduleById(
      scheduleId,
      role,
      role === Role.DOCTOR ? userId : null,
      role === Role.USER ? userId : null
    );

    if (!schedule.length) {
      throw new NotFoundException("Schedule not found");
    }

    const newStartDate = this.formatDateTime(newDate, newTime);
    const newEndDate = this.formatDateTime(newDate, newTime, 30);

    const startHour = moment(newStartDate).hours();
    const endHour = moment(newEndDate).hours();

    this.checkDate(newStartDate);
    this.checkHoliday(newStartDate);

    if (startHour < 10 || endHour > 17) {
      throw new BadRequestException("The time range is not valid");
    }

    return await this.scheduleRepo.reschedule(
      userId,
      newStartDate,
      newEndDate,
      scheduleId
    );
  }

  private formatDateTime(
    date: string,
    time: string,
    endTime: number = null
  ): string {
    const combinedDateTime = `${date} ${time}`;

    return moment(combinedDateTime, "YYYY-MM-DD h:mm A")
      .add(endTime, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  private checkDate(date: string) {
    const currentDate = new Date();
    const checkDate = moment(date).isBefore(currentDate);

    if (checkDate) {
      throw new BadRequestException("You can't create schedule in the past");
    }
  }

  private async checkHoliday(date: string) {
    const checkHoliday = await this.holidayRepo.checkHoliday(date);

    if (checkHoliday) {
      throw new BadRequestException(
        "The date selected by you is a national holiday"
      );
    }
  }
}
