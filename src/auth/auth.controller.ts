import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  Res,
  Request,
  Get,
  Param,
  Query,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { localAuthGuard } from "./guards/local.guard";
import { UsersService } from "src/users/users.service";
import { JwtAuthGuard } from "./guards/jwt.guard";

import { EmailService } from "src/email/email.service";
import { BaseUser, DBuser } from "src/users/types/interfaces";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService
  ) {}
  // TO DO -google registration
  @Post("register")
  @UseInterceptors(ClassSerializerInterceptor)
  public async register(
    @Body() body: CreateUserDto,
    @Req() req: { user: DBuser; res: Response }
  ): Promise<BaseUser> {
    const user = await this.authService.signup(body);

    const { id, email } = user;

    if (user) {
      this.emailService.sendVerificationMail(user.email);
    }

    const { cookie: accessCookie } =
      await this.authService.getCookieWithJwtToken(id, email);

    const { cookie, token } =
      await this.authService.getCookieWithJwtRefreshToken(id, email);

    await this.usersService.setHashedRefreshToken(id, token);

    req.res.setHeader("Set-Cookie", [accessCookie, cookie]);

    return user;
  }

  @Post("login")
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(localAuthGuard)
  public async login(@Request() { user, res }): Promise<DBuser> {
    const { id, email } = user;

    const { cookie: accessCookie } =
      await this.authService.getCookieWithJwtToken(id, email);

    const { cookie, token } =
      await this.authService.getCookieWithJwtRefreshToken(id, email);

    await this.usersService.setHashedRefreshToken(id, token);

    res.setHeader("Set-Cookie", [accessCookie, cookie]);

    return user;
  }

  @Post("logout")
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  public async logout(
    @Request() request: { user: DBuser; res: Response }
  ): Promise<void> {
    const userId = request.user.id;

    request.res.setHeader("Set-Cookie", [
      "Authentication=; HttpOnly; Path=/; Max-Age=0",
      "Refresh=; HttpOnly; Path=/; Max-Age=0",
    ]);

    await this.usersService.removeRefreshToken(userId);
  }

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  authenticate(@Req() request: { user: DBuser }) {
    const user = request.user;

    return user;
  }

  @Get("refresh")
  @UseGuards(AuthGuard("jwt-refresh-token"))
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @Request() req: { user: DBuser; res: Response }
  ): Promise<DBuser> {
    const { id, email } = req.user;

    const { cookie: accessCookie } =
      await this.authService.getCookieWithJwtToken(id, email);

    req.res.setHeader("Set-Cookie", accessCookie);

    return req.user;
  }

  @Get("verify")
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard("jwt"))
  async verify(
    @Request() req: { user: DBuser },
    @Query("token") token: string
  ) {
    const { id, email } = req.user;

    await this.usersService.verifyUser(id, email, token);
  }
}
