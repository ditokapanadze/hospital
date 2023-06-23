import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

import { UserEntity } from "src/users/entitiy/user.entity";
import { AdminOrDoctor } from "../types";

@ValidatorConstraint({ name: "SuperAdminValidator", async: false })
export class SuperAdminValidator implements ValidatorConstraintInterface {
  validate(superAdmins: AdminOrDoctor[]) {
    for (const superAdmin of superAdmins) {
      if (
        typeof superAdmin !== "object" ||
        !("name" in superAdmin) ||
        !("email" in superAdmin)
      ) {
        return false;
      }
    }

    return true;
  }

  defaultMessage() {
    return "The 'admin' object must contain 'name' and 'email' properties.";
  }
}

@ValidatorConstraint({ name: "DoctorValidator", async: false })
export class DoctorValidator implements ValidatorConstraintInterface {
  validate(doctors: AdminOrDoctor[]) {
    if (doctors) {
      for (const doctor of doctors) {
        if (
          typeof doctor !== "object" ||
          !("name" in doctor) ||
          !("email" in doctor)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  defaultMessage() {
    return "The 'doctors' array must contain objects with 'name' and 'email' properties.";
  }
}

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Validate(SuperAdminValidator)
  admin: UserEntity[];

  @IsOptional()
  @Validate(DoctorValidator)
  doctors: UserEntity[];
}
