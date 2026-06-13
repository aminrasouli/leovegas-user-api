import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';

import { Auth, User } from 'src/features/auth/auth.decorators';
import { UserRole } from 'src/features/user/user.constants';
import { UserService } from 'src/features/user/user.service';
import { UserResponseDto } from 'src/rest-api/user/user.dto.response';
import { JsonApiResponse } from 'src/common/decorators/api.decorators';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';

import {
  AdminUpdateUserBodyDto,
  AdminUserIdParamDto,
} from './admin.dto.request';

@Controller('admin')
@Auth(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @JsonApiResponse([UserResponseDto])
  async getUsers(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    return this.userService.findMany(pageOptionsDto);
  }

  @Get('users/:id')
  @JsonApiResponse(UserResponseDto)
  async getUser(
    @Param() params: AdminUserIdParamDto,
  ): Promise<UserResponseDto> {
    return this.userService.findById(params.id);
  }

  @Patch('users/:id')
  @JsonApiResponse(UserResponseDto)
  async updateUser(
    @Param() params: AdminUserIdParamDto,
    @Body() body: AdminUpdateUserBodyDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(params.id, body);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @User() currentUser: User,
    @Param() params: AdminUserIdParamDto,
  ): Promise<void> {
    if (currentUser.id === params.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.userService.delete(params.id);
  }
}
