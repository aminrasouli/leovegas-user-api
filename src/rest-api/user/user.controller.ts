import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { Auth, User } from 'src/features/auth/auth.decorators';
import { UserResponseDto } from './user.dto.response';

@Controller('user')
@Auth()
export class UserController {
  @Get('')
  @SerializeOptions({ type: UserResponseDto })
  public getUser(@User() user: User): UserResponseDto {
    return user;
  }
}
