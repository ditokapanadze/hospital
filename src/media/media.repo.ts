import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaEntity } from "./entity";
import { Repository } from "typeorm";
import { MediaType } from "./types/enums";
import { UsersService } from "src/users/users.service";

@Injectable()
export class MediaRepo {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepo: Repository<MediaEntity>,
    private readonly usersService: UsersService
  ) {}

  public async createMedia(
    url: string,
    key: string,
    userId: number,
    mediaType: string
  ) {
    const newMedia = this.mediaRepo.create({
      key,
      url,
      mediaType: MediaType[mediaType],
    });

    const createdMedia = await this.mediaRepo.save(newMedia);

    return await this.usersService.updateUserMedia(userId, createdMedia.id);
  }
}
