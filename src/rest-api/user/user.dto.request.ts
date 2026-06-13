import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UpdateUserInput } from 'src/features/user/user.types';

export class UpdateUserBodyDto implements UpdateUserInput {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsStrongPassword()
  password?: string;
}
