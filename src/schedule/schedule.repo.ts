import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ScheduleEntity } from "./entity/schedule.entity";
import { LessThan, Repository } from "typeorm";
import { Role, ScheduleStatus } from "src/schedule/types/enum";
import { getConnection } from "typeorm";

@Injectable()
export class ScheduleRepo {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepo: Repository<ScheduleEntity>
  ) {}

  async createVisit(
    startDate: string,
    userId: number,
    doctorId: number,
    hospitalId: number,
    endDate: string
  ) {
    const visit = this.scheduleRepo.create({
      startDate: startDate,
      visitor: { id: userId },
      doctor: { id: doctorId },
      hospital: { id: hospitalId },
      endDate,
    });
    return await this.scheduleRepo.save(visit);
  }

  async getDoctorSchedule(doctorId: number) {
    const schedule = this.scheduleRepo.createQueryBuilder("schedule");

    schedule
      .leftJoinAndSelect("schedule.doctor", "doctor")
      .where("schedule.doctor = :doctorId", { doctorId: doctorId })
      .andWhere("schedule.status = :statusPending", {
        statusPending: ScheduleStatus[ScheduleStatus.PENDING],
      })
      .orWhere("schedule.status = :statusApproved", {
        statusApproved: ScheduleStatus[ScheduleStatus.APPROVED],
      })
      .getMany();

    const { entities } = await schedule.getRawAndEntities();

    return entities;
  }
  async getFeeDate(date: string, role: string, doctorId: number) {}

  async getScheduleById(
    scheduleId: number,
    role: string,
    doctorId: number,
    visitorId?: number
  ) {
    const schedule = this.scheduleRepo.createQueryBuilder("schedule");

    schedule
      .leftJoinAndSelect("schedule.doctor", "doctor")
      .leftJoinAndSelect("schedule.hospital", "hospital")
      .leftJoinAndSelect("schedule.visitor", "visitor")
      .where("schedule.id = :id", {
        id: scheduleId,
      })
      .andWhere(doctorId ? "schedule.doctorId = :doctorId" : "1 = 1", {
        doctorId: doctorId ? doctorId : undefined,
      })
      .andWhere(visitorId ? "schedule.visitorId = :visitorId" : "1 = 1", {
        visitorId: visitorId ? visitorId : undefined,
      })

      .getOne();

    const { entities } = await schedule.getRawAndEntities();

    return entities;
  }

  async updateScheduleStatus(scheduleId: number, status: string) {
    return this.scheduleRepo
      .update(scheduleId, {
        status: ScheduleStatus[status.toUpperCase()],
      })
      .then((updateResult) => {
        if (updateResult.affected) {
          return;
        }
        return false;
      });
  }

  async getHospitalSchedule(
    hospitalId: number,
    status: string,
    startDate: string,
    endDate: string,
    doctorId: number,
    visitorId: number,
    role?: string
  ) {
    const schedule = this.scheduleRepo.createQueryBuilder("schedule");

    schedule
      .where(hospitalId ? "schedule.hospitalId = :hospitalId" : "1 = 1", {
        hospitalId: hospitalId ? hospitalId : undefined,
      })
      .andWhere(status ? "schedule.status = :status" : "1 = 1", {
        status: status ? ScheduleStatus[status.toUpperCase()] : undefined,
      })
      .andWhere(doctorId ? "schedule.doctorId = :doctorId" : "1 = 1", {
        doctorId: doctorId ? doctorId : undefined,
      })
      .andWhere(visitorId ? "schedule.visitorId = :visitorId" : "1 = 1", {
        visitorId: visitorId ? visitorId : undefined,
      })
      .andWhere(startDate ? "schedule.startDate >= :startDate" : "1 = 1", {
        startDate: startDate ? startDate : undefined,
      })
      .andWhere(endDate ? "schedule.endDate <= :endDate" : "1 = 1", {
        endDate: endDate ? endDate : undefined,
      });

    if (role !== Role.DOCTOR) {
      schedule.leftJoinAndSelect("schedule.doctor", "doctor");
      schedule.leftJoinAndSelect("schedule.hospital", "hospital");
    }

    if (role !== Role.USER) {
      schedule.leftJoinAndSelect("schedule.visitor", "visitor");
    }
    const { entities } = await schedule.getRawAndEntities();

    return entities;
  }

  async outdateSchedule() {
    const pastDate = new Date();
    return await this.scheduleRepo.update(
      { endDate: LessThan(pastDate), status: ScheduleStatus.PENDING },
      { status: [ScheduleStatus.OUTDATED] }
    );
  }
  async getSchedules(userId: number, status: string) {
    const schedule = this.scheduleRepo.createQueryBuilder("schedule");

    schedule
      .leftJoinAndSelect("schedule.doctor", "doctor")
      .leftJoinAndSelect("schedule.visitor", "visitor")
      .leftJoinAndSelect("schedule.hospital", "hospital")
      .where("schedule.visitor = :id", { id: userId })
      .andWhere(status ? "schedule.status = :status" : "1 = 1", {
        status: status ? ScheduleStatus[status.toLocaleUpperCase()] : undefined,
      })
      .getMany();

    const { entities } = await schedule.getRawAndEntities();

    return entities;
  }

  public async reschedule(
    userId: number,
    newStartDate: string,
    newEndDate: string,
    scheduleId: number
  ) {
    return await this.scheduleRepo
      .update(scheduleId, {
        startDate: newStartDate,
        endDate: newEndDate,
      })
      .then((updateResult) => {
        if (updateResult.affected) {
          return true;
        }
        return false;
      });
  }
}
