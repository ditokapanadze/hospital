import { Controller, Post, UseGuards, Body, Req } from "@nestjs/common";
import { MediaService } from "./media.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { PresignedUrlDto } from "./dto";
import { DBuser } from "src/users/types/interfaces";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public upload(@Body() body: PresignedUrlDto, @Req() req: { user: DBuser }) {
    const { id: userId } = req.user;

    return this.mediaService.getPresignedUrl(body, userId);
  }
}
