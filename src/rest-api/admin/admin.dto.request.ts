import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from 'src/features/user/user.constants';
import { UpdateUserInput } from 'src/features/user/user.types';

export class AdminUpdateUserBodyDto implements UpdateUserInput {
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

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class AdminUserIdParamDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
