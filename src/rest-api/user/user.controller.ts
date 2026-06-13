import { Body, Controller, Get, Patch } from '@nestjs/common';

import { JsonApiResponse } from 'src/common/decorators/api.decorators';
import { Auth, User } from 'src/features/auth/auth.decorators';
import { UserRole } from 'src/features/user/user.constants';
import { UserService } from 'src/features/user/user.service';

import { UpdateUserBodyDto } from './user.dto.request';
import { UserResponseDto } from './user.dto.response';

@Controller('user')
@Auth(UserRole.USER, UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @JsonApiResponse(UserResponseDto, { resource: 'users' })
  public getUser(@User() user: User): UserResponseDto {
    return user;
  }

  @Patch('')
  @JsonApiResponse(UserResponseDto, { resource: 'users' })
  public async updateUser(
    @User() user: User,
    @Body() body: UpdateUserBodyDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, body);
  }
}
