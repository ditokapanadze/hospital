import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { SignUpUser } from "src/users/types/interfaces";

export class CreateUserDto implements SignUpUser {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  repeatPassword: string;
}
