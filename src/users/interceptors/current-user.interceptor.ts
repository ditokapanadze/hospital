import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from "@nestjs/common";
import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const { userId } = request.session || {};

    console.log(userId, "userid");

    if (userId) {
      const user = await this.userService.findById(userId);
      request.currentUser = user;

      console.log(request.currentUser);
    }

    return handler.handle();
  }
}
