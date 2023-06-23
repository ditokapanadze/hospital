import { Injectable, UnauthorizedException } from "@nestjs/common";
import { BaseHospital, DBhospital, DBuser } from "src/users/types/interfaces";
import { HospitalRepository } from "./hospital.repo";
import { UsersService } from "src/users/users.service";
import { Role } from "src/users/types/enum/roles.enum";
import { EmailService } from "src/email/email.service";

@Injectable()
export class HospitalsService {
  constructor(
    private readonly hospitalRepo: HospitalRepository,
    private readonly userService: UsersService,
    private readonly emailService: EmailService
  ) {}
  async createHospital(hospital: BaseHospital): Promise<DBhospital> {
    let doctors;

    const newHospital = await this.hospitalRepo.createHospital(
      hospital.email,
      hospital.name
    );

    await this.userService.createMany(
      hospital.admin,
      newHospital.id,
      Role.ADMIN,
      true,
      newHospital.name
    );

    if (hospital.doctors?.length) {
      await this.userService.createMany(
        hospital.doctors,
        newHospital.id,
        Role.DOCTOR,
        true,
        newHospital.name
      );
    }

    return await this.hospitalRepo.findHospitalWithDoctors(newHospital.id);
  }

  public async getHospitalByName(name: string): Promise<DBhospital[]> {
    return await this.hospitalRepo.findHospitalByName(name);
  }

  public async findHospitalWithDoctors(id: number): Promise<BaseHospital> {
    return await this.hospitalRepo.findHospitalWithDoctors(Number(id));
  }
  public async updateHospital(
    body: any,
    user: DBuser,
    hospitalId: number
  ): Promise<BaseHospital> {
    const hospital = await this.hospitalRepo.findHospitalWithDoctors(
      Number(hospitalId)
    );

    const checkAdmin = hospital.admin.find((admin) => admin.id === user.id);

    if (!checkAdmin && !user.role.includes(Role.SUPER_ADMIN))
      throw new UnauthorizedException(
        "You are not authorized to update this hospital"
      );

    const promises = [];

    if (body.doctors?.length) {
      promises.push(
        this.userService.createMany(
          body.doctors,
          hospitalId,
          Role.DOCTOR,
          true,
          hospital.name
        )
      );
    }

    if (body.admin?.length) {
      promises.push(
        this.userService.createMany(
          body.admin,
          hospitalId,
          Role.ADMIN,
          true,
          hospital.name
        )
      );
    }

    return await Promise.all(promises).then(async (res) => {
      return this.hospitalRepo.findHospitalWithDoctors(hospitalId);
    });
  }
}
