import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entitiy/user.entity";
import { Repository } from "typeorm";
import { Role } from "src/users/types/enum/roles.enum";
import { create } from "domain";
import { DBuser } from "src/users/types/interfaces";
import { resolve } from "path";
import { promises } from "dns";
import { MediaType } from "src/media/types/enums";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async createUser(
    email: string,
    name: string,
    password: string,
    hospital: any,
    role?: Role
  ) {
    const user = this.userRepo.create({
      email,
      name,
      password,
      hospitalAdmin: role === Role.ADMIN ? hospital : null,
      hospitalDoctor: role === Role.DOCTOR ? hospital : null,
      role: [role || Role.USER],
    });

    return this.userRepo.save(user);
  }

  public setCurrentRefreshToken(userId: number, refreshToken: string) {
    return this.userRepo.update(userId, { hashedRefreshToken: refreshToken });
  }
  public update(userId: number, refreshToken: string) {
    return this.userRepo.update(userId, { hashedRefreshToken: refreshToken });
  }

  public remove(userId: number, refreshToken: string) {
    return this.userRepo.update(userId, { hashedRefreshToken: refreshToken });
  }

  public async findByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    return user;
  }

  public async findById(id: number): Promise<DBuser> {
    const user = await this.userRepo.findOne({ where: { id } });

    return user;
  }

  public async removeRefreshToken(userId: number) {
    const user = await this.setCurrentRefreshToken(userId, null);
  }

  public async getById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    return user;
  }

  public async createMany(users: any[]): Promise<any[]> {
    const createdUsersPromises = users.map((user) => {
      const newUser = this.userRepo.create(user);
      return this.userRepo.save(newUser);
    });
    return Promise.all(createdUsersPromises);
  }

  public async changePassword(newPassword: string, userId: number) {
    await this.userRepo.update(userId, { password: newPassword });
    return this.getById(userId);
  }

  public async checkEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      throw new Error("Email already exists");
    }
  }

  public async changeEmail(email: string, userId: number) {
    await this.userRepo.update(userId, { email });

    return this.getById(userId);
  }

  public async verifyUser(id: number) {
    await this.userRepo.update(id, { isVerified: true });
  }
  public async deactivateUser(userId: number) {
    const user = await this.getById(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const removedUser = await this.userRepo.softRemove(user);

    await this.userRepo.save(removedUser);

    await this.userRepo.update(
      { id: userId },
      {
        isDeleted: true,
      }
    );
  }

  public async setPasswordResetToken(id: number, token: string) {
    await this.userRepo.update(id, { resetPasswordToken: token });
  }

  public async updateUserMedia(userId: number, mediaId: number) {
    return this.userRepo
      .update(userId, { avatar: { id: mediaId } })
      .then((updatedResult) => {
        if (updatedResult.affected) {
          return { message: "avatar updated successfully" };
        }
        return false;
      });
  }
}
