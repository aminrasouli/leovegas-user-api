import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { TokenService } from 'src/infrastructure/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['authorization'];
    if (!header) {
      return false;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return false;
    }

    const { id } = (await this.tokenService.verifyToken(token)) ?? {};
    if (!id) {
      return false;
    }

    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      return false;
    }

    request.user = user;
    return !!user.email;
  }
}
