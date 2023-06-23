import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtRefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

import { EmailService } from "src/email/email.service";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,

    EmailService,
    JwtService,
    LocalStrategy,
    JwtRefreshTokenStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
