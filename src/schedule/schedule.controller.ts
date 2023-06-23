import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Query,
  Put,
  Param,
  Inject,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { ScheduleService } from "./schedule.service";

import { CreateScheduleDto, RescheduleDto, StatusUpdateDto } from "./dto";
import { Role } from "src/schedule/types/enum";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/decorators/roles.decoratos";
import { DBschedule } from "./types/interfaces";
import { DBuser } from "src/users/types/interfaces";

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createSchedule(
    @Request() req: { user: DBuser },
    @Body() body: CreateScheduleDto
  ): Promise<DBschedule> {
    const { date, time, doctorId, hospitalId } = body;
    const { id: userId } = req.user;
    return this.scheduleService.createSchedule(
      userId,
      date,
      time,
      doctorId,
      hospitalId
    );
  }

  // get schedule by hospital id, doctor id, visitor id, status, start date, end date
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  public async getHospitalSchedule(
    @Request() req: { user: DBuser; role: string },
    // @Param("id") hospitalId: string,
    @Query()
    query: {
      status: string;
      endDate: string;
      startDate: string;
      visitorId: number;
      doctorId: number;
      hospitalId: number;
    }
  ): Promise<DBschedule[]> {
    const { id: userId } = req.user;
    const role = req.role;
    const { status, endDate, startDate, doctorId, visitorId, hospitalId } =
      query;

    return await this.scheduleService.getHospitalSchedule(
      hospitalId,
      userId,
      Role[role],
      status,
      startDate,
      endDate,
      doctorId,
      visitorId
    );
  }

  //get schedule for visitor
  @Get("/visitor")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getScheduleForVisitor(
    @Request() req: { user: DBuser; role: string },
    @Query()
    query: {
      status: string;
      endDate: string;
      startDate: string;

      doctorId: number;
      hospitalId: number;
    }
  ): Promise<DBschedule[]> {
    const { id: visitorId } = req.user;
    const role = req.role;
    const { status, endDate, startDate, doctorId, hospitalId } = query;

    return this.scheduleService.getScheduleForVisitor(
      hospitalId,
      status,
      startDate,
      endDate,
      doctorId,
      visitorId,
      role
    );
  }

  // get schedule for doctor
  @Get("/doctor-schedule")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getScheduleForDoctor(
    @Request() req: { user: DBuser; role: string },
    @Query()
    query: {
      status: string;
      endDate: string;
      startDate: string;
      visitorId: number;
      hospitalId: number;
    }
  ) {
    const { id: doctorId } = req.user;
    const role = req.role;
    const { status, endDate, startDate, visitorId, hospitalId } = query;

    return await this.scheduleService.getScheduleForVisitor(
      hospitalId,
      status,
      endDate,
      startDate,
      visitorId,
      doctorId,
      Role[role]
    );
  }

  @Put("/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR, Role.ADMIN)
  public async updateSchedule(
    @Request() req: { user: DBuser; role: string },
    @Body() body: StatusUpdateDto
  ): Promise<boolean> {
    const { id: userId } = req.user;
    const role = req.role;

    const { status, scheduleId } = body;

    return this.scheduleService.scheduleStatusUpdate(
      userId,
      scheduleId,
      role,
      status
    );
  }

  @Put("/reschedule")
  @UseGuards(JwtAuthGuard)
  public async reschedule(
    @Request() req: { user },
    @Body() body: RescheduleDto
  ) {
    const { id: userId, role } = req.user;
    const { newDate, newTime, scheduleId } = body;

    return this.scheduleService.reschedule(
      userId,
      newDate,
      newTime,
      scheduleId,
      Role[role]
    );
  }
}
