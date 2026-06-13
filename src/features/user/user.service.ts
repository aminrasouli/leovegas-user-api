import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';

import {
  CreateUserInput,
  UserModel,
  ValidateUserInput,
  ValidateUserOutput,
} from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(body: CreateUserInput): Promise<UserModel> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.prismaService.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: await this.hashService.hash(body.password),
        role: body.role,
      },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async validate(body: ValidateUserInput): Promise<ValidateUserOutput> {
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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async findById(id: number): Promise<UserModel | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  }
}
