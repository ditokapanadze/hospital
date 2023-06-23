import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { User } from "./entitiy/user.entity";
import { NotFoundException } from "@nestjs/common";
import { exec } from "child_process";

describe("UsersController", () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findByEmail: (email: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password: "passwird",
        } as User);
      },
      findOneById: (id: number) => {
        return Promise.resolve({
          id,
          email: "test@gmail.com",
          password: "passwird",
        } as User);
      },
      //   remove: () => {},
      //   update: () => {},
    };
    fakeAuthService = {
      //   signup: () => {},
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be definer", () => {
    expect(controller).toBeDefined();
  });

  it("return user with email", async () => {
    const user = await controller.findAllUSers("test@gmail.com");
    expect(user.email).toEqual("test@gmail.com");
  });

  it("returns single user with id", async () => {
    const user = await controller.findUser("1");

    expect(user).toBeDefined();
  });

  it("throws error if user with given id is not found", async () => {
    fakeUsersService.findOneById = () =>
      Promise.reject(new NotFoundException());

    await expect(controller.findUser("1")).rejects.toThrow(NotFoundException);
  });

  it("signin updates session object and return user", async () => {
    const session = { userId: -10 };
    const user = await controller.signinUser(
      { email: "tet@gmail.com", password: "password" },
      session
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
