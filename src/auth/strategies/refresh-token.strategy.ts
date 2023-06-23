import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh-token"
) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: configService.get("JWT_SECRET"),
      passReqToCallback: true,
    });
  }

  public async validate(request: Request, payload: any) {
    const user = await this.usersService.getByRefreshToken(
      payload.userId,
      request.cookies?.Refresh
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
