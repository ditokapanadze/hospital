import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDTO {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  newPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  repeatNewPassword: string;
}
