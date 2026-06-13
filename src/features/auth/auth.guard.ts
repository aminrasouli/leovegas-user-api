import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { UserService } from 'src/features/user/user.service';
import { TokenService } from 'src/infrastructure/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['authorization'];
    if (!header) {
      return false;
    }

    const [type, token] = header.split(' ') as [string, string];

    if (!type || type.toLowerCase() !== 'bearer' || !token) {
      return false;
    }

    const { id } = (await this.tokenService.verifyToken(token.trim())) ?? {};
    if (!id) {
      return false;
    }

    const user = await this.userService.findById(id);
    if (!user) {
      return false;
    }

    request.user = user;
    return !!user.email;
  }
}
