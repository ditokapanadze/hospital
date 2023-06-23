import { IsString, IsNotEmpty, IsNumber, IsEnum, IsIn } from "class-validator";
import { MediaType } from "../types/enums";

export class PresignedUrlDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsNumber()
  contentLength: number;

  @IsNotEmpty()
  @IsEnum(MediaType)
  @IsIn([...Object.values(MediaType)])
  mediaType: MediaType[];
}
