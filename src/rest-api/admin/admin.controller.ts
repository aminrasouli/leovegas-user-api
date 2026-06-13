import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';

import { JsonApiResponse } from 'src/common/decorators/api.decorators';
import { Auth, User } from 'src/features/auth/auth.decorators';
import { UserRole } from 'src/features/user/user.constants';
import { UserService } from 'src/features/user/user.service';
import { UserResponseDto } from 'src/rest-api/user/user.dto.response';

import {
  AdminUpdateUserBodyDto,
  AdminUserIdParamDto,
} from './admin.dto.request';

@Controller('admin')
@Auth(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @JsonApiResponse([UserResponseDto], { resource: 'users' })
  async getUsers(): Promise<UserResponseDto[]> {
    return this.userService.findMany();
  }

  @Get('users/:id')
  @JsonApiResponse(UserResponseDto, { resource: 'users' })
  async getUser(
    @Param() params: AdminUserIdParamDto,
  ): Promise<UserResponseDto> {
    return this.userService.findById(params.id);
  }

  @Patch('users/:id')
  @JsonApiResponse(UserResponseDto, { resource: 'users' })
  async updateUser(
    @User() currentUser: User,
    @Param() params: AdminUserIdParamDto,
    @Body() body: AdminUpdateUserBodyDto,
  ): Promise<UserResponseDto> {
    if (currentUser.id === params.id) {
      throw new ForbiddenException(
        'You cannot update your own account via admin endpoints',
      );
    }

    return this.userService.update(params.id, body);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @User() currentUser: User,
    @Param() params: AdminUserIdParamDto,
  ): Promise<void> {
    if (currentUser.id === params.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.userService.delete(params.id);
  }
}
