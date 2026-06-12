import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { SignUpInput } from 'src/features/auth/auth.types';

export class SignupBodyDto implements SignUpInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
