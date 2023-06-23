import { UserEntity } from "src/users/entitiy/user.entity";

export interface Hospital {
  email: string;
  name: string;
  password: string;
  repeatPassword: string;
  superAdmin: UserEntity[];
  doctors: UserEntity[];
}

// export interface BaseHospital {
//   id: number;
//   email: string;
//   name: string;
// }

export interface DBhospital extends BaseHospital {
  password?: string;
}

export interface BaseHospital {
  email: string;
  name: string;
  admin: Partial<UserEntity[]>;
  doctors?: Partial<UserEntity[]> | null;
}
