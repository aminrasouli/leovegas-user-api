import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';

import {
  CreateUserInput,
  UpdateUserInput,
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

  async update(id: number, data: UpdateUserInput): Promise<UserModel> {
    const updateData: UpdateUserInput = { ...data };

    if (data.email && typeof data.email === 'string') {
      const existingUser = await this.prismaService.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    if (data.password && typeof data.password === 'string') {
      updateData.password = await this.hashService.hash(data.password);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateData,
      omit: { password: true },
    });
  }
}
