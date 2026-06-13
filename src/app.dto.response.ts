import { Expose } from 'class-transformer';

export class AppResponseDto {
  @Expose()
  message: string;
}
