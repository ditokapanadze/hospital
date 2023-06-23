import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SignUpUser, BaseUser } from "src/users/types/interfaces";
import * as argon from "argon2";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenResponse } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    public readonly configService: ConfigService
  ) {}

  public async signup(user: SignUpUser): Promise<BaseUser> {
    const { email, password, repeatPassword, name } = user;

    this.ValidatePassword(password, repeatPassword);

    const hashedPass = await argon.hash(user.password);

    try {
      const newUser = await this.usersService.create(email, name, hashedPass);

      return newUser;
    } catch (error) {
      if (error.code === "23505") {
        throw new BadRequestException("Email already in use");
      }
      console.log(error);
    }
  }

  private ValidatePassword(password: string, repeatPassword: string): void {
    if (password !== repeatPassword) {
      throw new BadRequestException("Passwords do not match");
    }
  }

  public async getCookieWithJwtToken(
    userId: number,
    email: string
  ): Promise<TokenResponse> {
    const jwtPayload: { userId: number; email: string } = { userId, email };

    const token = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: `${this.configService.get("JWT_EXPIRATION_TIME")}s`,
    });

    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      "JWT_EXPIRATION_TIME"
    )}`;

    return {
      cookie,
      token,
    };
  }

  public async getCookieWithJwtRefreshToken(
    userId: number,
    email: string
  ): Promise<TokenResponse> {
    const jwtPayload: { userId: number; email: string } = { userId, email };

    const token = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: `${this.configService.get("JWT_REFRESH_EXPIRATION_TIME")}s`,
    });

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      "JWT_REFRESH_EXPIRATION_TIME"
    )}`;

    return {
      cookie,
      token,
    };
  }

  public async getAuthenticatedUser(
    email: string,
    password: string
  ): Promise<BaseUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return argon.verify(user.password, password).then((result) => {
      if (result) {
        return user;
      }
      throw new UnauthorizedException("Invalid credentials");
    });
  }
}
