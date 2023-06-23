import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "src/users/entitiy/user.entity";
import { DBuser } from "src/users/types/interfaces";
import { Role } from "src/schedule/types/enum";
import exp from "constants";
import { User } from "aws-sdk/clients/budgets";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;

  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: UserEntity[] = [];
    fakeUsersService = {
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers[0]);
      },
      findById: () => Promise.resolve({} as DBuser),
      create: (email: string, name: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9),
          email,
          name,
          password,
        } as UserEntity;

        users.push(user);
        return Promise.resolve(user as DBuser);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        JwtService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("Can create an instance of auth service", async () => {
    expect(service).toBeDefined();
  });

  it("create a new user with hashed password", async () => {
    await service
      .signup({
        email: "test@gmail.com",
        name: "testname",
        password: "password",
        repeatPassword: "password",
      })
      .then((user) => {
        expect(user.password).not.toEqual("password");
        // expect(user.id).toEqual(1);
        expect(user.email).toEqual("test@gmail.com");
        expect(user.name).toEqual("testname");
      });
  });

  it("throws an error if user signs up with email that is in use", async () => {
    await service
      .signup({
        email: "test@gmail.com",
        name: "testname",
        password: "password",
        repeatPassword: "password",
      })
      .then(async (user) => {
        await expect(
          service.signup({
            email: "test@gmail.com",
            name: "testname",
            password: "password",
            repeatPassword: "password",
          })
        ).rejects.toThrow(BadRequestException);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
