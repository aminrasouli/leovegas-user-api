import {
  type ExecutionContext,
  InternalServerErrorException,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserRole } from 'src/features/user/user.constants';
import { UserModel } from 'src/features/user/user.types';

import { AuthGuard } from './auth.guard';
import { RolesGuard, RolesMetaData } from './roles.guard';

export type User = UserModel;
export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<{ user: UserModel }>().user,
);

export function Auth(...roles: UserRole[]) {
  if (roles.length <= 0) {
    throw new InternalServerErrorException(
      'At least one role must be specified for @Auth decorator',
    );
  }

  const decorators = [
    RolesMetaData(...roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse(),
  ];

  return applyDecorators(...decorators);
}
