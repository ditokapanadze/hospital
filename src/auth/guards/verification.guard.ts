import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class IsVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: any = context.switchToHttp().getRequest();

    // Implement your verification logic here
    const isVerified = request.user; // Assuming you have a 'user' property on the request representing the authenticated user
    console.log(isVerified);
    // Return true if the user is verified, otherwise return false
    return false;
  }
}
