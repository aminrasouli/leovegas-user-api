import {
  type ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from './auth.guard';

// TODO: Move the error classes to a common file and reuse them across the app.
type UserPayload = {
  id: number;
  email: string;
};

export type User = UserPayload;
export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<{ user: UserPayload }>().user,
);

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse(),
  );
}
