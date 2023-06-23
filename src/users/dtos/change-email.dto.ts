import { IsEmail, IsNotEmpty } from "class-validator";

export class changeEmailDTO {
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}
