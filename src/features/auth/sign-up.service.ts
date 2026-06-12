import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma.service';

import { HashService } from 'src/infrastructure/hash/hash.service';
import { SignUpInput, SignUpOutput } from './auth.types';

@Injectable()
export class SignUpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async signUp(body: SignUpInput): Promise<SignUpOutput> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: await this.hashService.hash(body.password),
      },
    });

    return {
      id: user.id,
    };
  }
}
