import { Expose } from 'class-transformer';

export class SignupResponseDto {
  @Expose()
  id: string;
}
