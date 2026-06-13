import { Injectable } from '@nestjs/common';

import { UserRole } from 'src/features/user/user.constants';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';

@Injectable()
export class UserSeeder {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create() {
    await this.prismaService.user.create({
      data: {
        role: UserRole.ADMIN,
        email: 'leo@vegas.com',
        name: 'John Doe',
        password: await this.hashService.hash('password123'),
      },
    });
  }
}
