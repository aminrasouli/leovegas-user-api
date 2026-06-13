import {
  Injectable,
  NotFoundException,
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

  async create(data: CreateUserInput): Promise<UserModel> {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: await this.hashService.hash(data.password),
        role: data.role,
      },
      omit: { password: true },
    });
  }

  async update(id: number, data: UpdateUserInput): Promise<UserModel> {
    const updateData: UpdateUserInput = { ...data };

    if (data.password && typeof data.password === 'string') {
      updateData.password = await this.hashService.hash(data.password);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateData,
      omit: { password: true },
    });
  }

  async findById(id: number): Promise<UserModel> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findMany(): Promise<UserModel[]> {
    return this.prismaService.user.findMany({
      omit: { password: true },
    });
  }

  async delete(id: number): Promise<UserModel> {
    return this.prismaService.user.delete({
      where: { id },
      omit: { password: true },
    });
  }

  async validate(data: ValidateUserInput): Promise<ValidateUserOutput> {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;

    const isPasswordValid = await this.hashService.compare(
      data.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return userWithoutPassword;
  }
}
