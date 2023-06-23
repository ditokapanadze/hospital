import { MediaType } from "../enums";

export interface DBmedia {
  id: number;
  deletedAt: Date;
}

export interface BaseMedia {
  key: string;
  url: string;
}

export interface UrlParams {
  filename: string;
  contentLength: number;
  mediaType: MediaType[];
}
