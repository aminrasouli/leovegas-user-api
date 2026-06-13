import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

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
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = header.split(' ') as [string, string];

    if (!type || type.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const { id } = (await this.tokenService.verifyToken(token.trim())) ?? {};
    if (!id) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
}
