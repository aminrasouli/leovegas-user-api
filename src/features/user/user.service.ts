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
      omit: { password: true },
    });
  }

  async validate(body: ValidateUserInput): Promise<ValidateUserOutput> {
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;

    const isPasswordValid = await this.hashService.compare(
      body.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return userWithoutPassword;
  }

  async findById(id: number): Promise<UserModel | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }
}
