import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectAwsService } from "nest-aws-sdk";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import * as lookup from "mime-types";
import { UsersService } from "src/users/users.service";
import { UrlParams } from "./types/interfaces";
import { MediaType } from "./types/enums";
import { MediaRepo } from "./media.repo";

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    @InjectAwsService(S3) private readonly s3: S3,

    private readonly mediaRepo: MediaRepo
  ) {}

  public async getPresignedUrl(urlParams: UrlParams, userId: number) {
    const { filename, contentLength, mediaType } = urlParams;

    if (contentLength > 10 * 1024 * 1024) {
      throw new HttpException("File is too large", 400);
    }

    const extension = filename.split(".")[1];
    if (!extension) {
      throw new HttpException("Invalid file extension", 400);
    }

    const Key = `${uuidv4()}-${filename}`;
    const ContentType = lookup.lookup(extension);

    const uploadParams = {
      Bucket: this.configService.get("AWS_BUCKET_NAME"),
      Key,
      Expires: 3600,
      ContentType,
    };

    const preUrl = await this.s3.getSignedUrlPromise("putObject", uploadParams);

    const url = preUrl.split("?")[0];

    await this.mediaRepo.createMedia(url, Key, userId, MediaType["AVATAR"]);

    return preUrl;
  }
}
