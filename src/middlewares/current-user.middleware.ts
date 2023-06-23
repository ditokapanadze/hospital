import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../users/users.service";

import { UserEntity } from "../users/entitiy/user.entity";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserEntity;
    }
  }
}
@Injectable()
export class CurrentUSerMiddleware implements NestMiddleware {
  constructor(private userService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.userService.findById(userId);

      req.currentUser = user;
    }

    next();
  }
}
