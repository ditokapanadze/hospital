import {
  Body,
  Controller,
  Put,
  Post,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  BadRequestException,
  Query,
  NotFoundException,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import {
  ChangePasswordDTO,
  ForgottenPasswordDTO,
  changeEmailDTO,
} from "./dtos";
import { CurrentUser } from "./decorators/current-user.decorator";
import { DBuser } from "src/users/types/interfaces";
import { EmailService } from "src/email/email.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Controller("user")
// @UseInterceptors(new SerializeInterceptor(UserDto))
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  public async changePassword(
    @Body() body: ChangePasswordDTO,
    @CurrentUser() user: DBuser
  ): Promise<boolean> {
    const { oldPassword, newPassword, repeatNewPassword } = body;

    await this.userService.changePassword(
      oldPassword,
      newPassword,
      repeatNewPassword,
      user
    );

    return true;
  }

  @Put("change-email")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public async(
    @Body() body: changeEmailDTO,
    @CurrentUser() user: DBuser
  ): Promise<DBuser> {
    return this.userService.changeEmail(body.newEmail, user);
  }

  @Post("password-reset-email")
  @UseInterceptors(ClassSerializerInterceptor)
  public async passwordResetEmail(@Body() body: { email: string }) {
    const { email } = body;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordResetToken = this.jwtService.sign(
      { email, id: user.id },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: this.configService.get("JWT_RESET_EXPIRATION_TIME"),
      }
    );

    return this.emailService.sendPasswordResetEmail(
      user.id,
      email,
      passwordResetToken
    );
  }

  @Put("password-reset")
  public async passwordReset(
    @Query("token") token: string,
    @Body() body: ForgottenPasswordDTO
  ): Promise<{ message: string }> {
    const { password, repeatPassword } = body;

    if (password !== repeatPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const { id } = await this.userService.decodeToken(token);

    await this.userService.resetPassword(token, password, id);

    return { message: "Password reset successful" };
  }

  @Put("deactivate")
  @UseGuards(JwtAuthGuard)
  public async deactivate(@CurrentUser() user: DBuser): Promise<boolean> {
    const id = user.id;
    await this.userService.deactivateUser(id, user);

    return true;
  }
}
