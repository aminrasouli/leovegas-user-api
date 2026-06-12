import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';
import { TokenService } from 'src/infrastructure/token/token.service';

import { SignInInput, SignInOutput } from './auth.types';

@Injectable()
export class SignInService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async signIn(body: SignInInput): Promise<SignInOutput> {
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.hashService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.tokenService.generateToken({ id: user.id });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }
}
