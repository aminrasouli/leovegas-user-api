import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FastifyRequest } from 'fastify';
import { UserRole } from 'src/features/user/user.constants';
import { UserModel } from 'src/features/user/user.types';

const ROLES_KEY = 'roles';

export const RolesMetaData = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: UserModel }>();
    if (!user) {
      return false;
    }
    return requiredRoles.some((role) => user.role === role);
  }
}
