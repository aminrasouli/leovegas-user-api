import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { Auth, User } from 'src/features/auth/auth.decorators';
import { UserRole } from 'src/features/user/user.constants';

import { UserResponseDto } from './user.dto.response';

@Controller('user')
@Auth(UserRole.USER)
export class UserController {
  @Get('')
  @SerializeOptions({ type: UserResponseDto })
  public getUser(@User() user: User): UserResponseDto {
    return user;
  }
}
