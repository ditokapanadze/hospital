import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Put,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  Param,
} from "@nestjs/common";
import { CreateHospitalDto } from "./dto/create-hospital.dto";
import { Roles } from "src/decorators/roles.decoratos";
import { Role } from "src/users/types/enum/roles.enum";
import { HospitalsService } from "./hospital.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CurrentUser } from "src/users/decorators/current-user.decorator";
import { BaseHospital, DBuser, Hospital } from "src/users/types/interfaces";
import { IsVerifiedGuard } from "src/auth/guards";

@Controller("hospital")
export class HospitalsController {
  constructor(private readonly hospitalService: HospitalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(Role.SUPER_ADMIN)
  public async createHospital(
    @Body() body: CreateHospitalDto
  ): Promise<BaseHospital> {
    return this.hospitalService.createHospital(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getHospitalByName(
    @Query("search") name: string
  ): Promise<BaseHospital[]> {
    return this.hospitalService.getHospitalByName(name);
  }

  @Get("/:id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getHospitalById(
    @Param("id") hospitalId: number
  ): Promise<BaseHospital> {
    return this.hospitalService.findHospitalWithDoctors(hospitalId);
  }

  @Put("/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateHospital(
    @Body() body: any,
    @CurrentUser() user: DBuser,
    @Param("id") hospitalId: number
  ): Promise<BaseHospital> {
    return this.hospitalService.updateHospital(body, user, hospitalId);
  }
}
