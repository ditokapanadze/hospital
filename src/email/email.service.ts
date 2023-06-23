import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createTransport } from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";
import { Role } from "src/schedule/types/enum";
import { DBuser } from "src/users/types/interfaces";
import { UsersService } from "src/users/users.service";
@Injectable()
export class EmailService {
  private nodeMailer: Mail;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {
    this.nodeMailer = createTransport({
      host: this.configService.get("EMAIL_HOST"),
      port: this.configService.get("EMAIL_PORT"),
      auth: {
        user: this.configService.get("EMAIL_USER"),
        pass: this.configService.get("EMAIL_PASSWORD"),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public async sendVerificationMail(email: string) {
    const verificationToken = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: this.configService.get("JWT_VERIFICATION_EXPIRATION_TIME"),
      }
    );

    const verificationUrl = `${this.configService.get(
      "BASE_URL"
    )}/auth/verify/?token=${verificationToken}`;

    const html = `<div> <p>  you have just registered on New Hospital platform, please verify your email by clicking the button above  </p>  <a target="_blank" href=${verificationUrl}>  CLICK!</a></div>`;

    return this.send({
      to: email,
      from: this.configService.get("EMAIL_USER"),
      subject: "Email confirmation",
      text: "Confirm your email",
      html: html,
    });
  }

  public async sendPasswordResetEmail(
    id: number,
    email: string,
    passwordResetToken: string
  ) {
    const passwordResetUrl = `${this.configService.get(
      "BASE_URL"
    )}/user/reset-password/?token=${passwordResetToken}`;

    const html = `<div> <p>  You have requested to reset password for you New Hospital account, please follow the link above  </p>  <a target="_blank" href=${passwordResetUrl}>  CLICK!</a></div>`;
    return this.send({
      to: email,
      from: this.configService.get("EMAIL_USER"),
      subject: "Password reset",
      text: "Password reset",
      html: html,
    });
  }

  async doctorAndAdminVerification(
    hospitalName: string,
    role: Role,
    email: string,
    password: string
  ) {
    const verificationToken = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: this.configService.get("JWT_VERIFICATION_EXPIRATION_TIME"),
      }
    );
    console.log(hospitalName, "hospitalName");
    const verificationUrl = `${this.configService.get(
      "BASE_URL"
    )}/auth/verify/?token=${verificationToken}`;

    const html = `<div> <p>  ${hospitalName} registered you as ${role.toLocaleLowerCase()} on New Hospital platform, please verify your email by clicking the button above , your password is ${password} </p>  <a target="_blank" href=${verificationUrl}>  CLICK!</a></div>`;

    return this.send({
      to: email,
      from: this.configService.get("EMAIL_USER"),
      subject: "Email confirmation",
      text: "Confirm your email",
      html: html,
    });
  }
  async send(options: Mail.Options) {
    try {
      await this.nodeMailer.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (err) {
      console.log(err, "Error");
    }
  }
}
