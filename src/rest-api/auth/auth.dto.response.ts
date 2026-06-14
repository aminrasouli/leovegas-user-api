import { Expose } from 'class-transformer';

export class SignUpResponseDto {
  @Expose()
  id: number;
}

export class SignInResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose({ name: 'access_token' })
  accessToken: string;
}
