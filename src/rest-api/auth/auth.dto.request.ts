import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupBodyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
