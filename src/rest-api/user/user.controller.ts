import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { Auth, User } from 'src/features/auth/auth.decorators';

import { UserResponseDto } from './user.dto.response';
import { UserRole } from 'src/features/user/user.constants';

@Controller('user')
@Auth(UserRole.ADMIN)
export class UserController {
  @Get('')
  @SerializeOptions({ type: UserResponseDto })
  public getUser(@User() user: User): UserResponseDto {
    return user;
  }
}
