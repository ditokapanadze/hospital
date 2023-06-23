import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
// import { Role } from "@peteasy/types";

import { Observable } from "rxjs";
import { Role } from "src/users/types/enum/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles: Role[] = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log(user, "user");
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
