import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HospitalEntity } from "./entitiy/hospital.entity";

@Injectable()
export class HospitalRepository {
  constructor(
    @InjectRepository(HospitalEntity)
    private readonly hospitalRepo: Repository<HospitalEntity>
  ) {}

  async createHospital(email: string, name: string): Promise<HospitalEntity> {
    const newHospital = this.hospitalRepo.create({
      email,
      name,
    });

    return await this.hospitalRepo.save(newHospital);
  }

  async findHospitalWithDoctors(id: number): Promise<HospitalEntity> {
    const hospital = await this.hospitalRepo
      .createQueryBuilder("hospital")
      .leftJoinAndSelect("hospital.doctors", "doctors")
      .leftJoinAndSelect("hospital.admin", "admin")
      .where("hospital.id = :id", { id: id })
      .getOne();

    if (!hospital) throw new NotFoundException("Hospital not found");

    return hospital;
  }
  async findHospitalByName(name: string) {
    const hospital = this.hospitalRepo.createQueryBuilder("hospital");

    hospital
      .leftJoinAndSelect("hospital.doctors", "doctors")
      .leftJoinAndSelect("hospital.admin", "admin")
      .where("hospital.name LIKE :name", { name: `%${name}%` })
      .getMany();

    const { entities } = await hospital.getRawAndEntities();

    return entities;
  }

  public async updateHospital(body: any, hospitalId: number) {
    const hospital = this.hospitalRepo.createQueryBuilder("hospital");

    hospital
      .update()
      .set({ ...body })
      .where("hospital.id = :id", { id: hospitalId })
      .execute();

    return await this.findHospitalWithDoctors(hospitalId);
  }
}
