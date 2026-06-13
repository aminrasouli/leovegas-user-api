import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';

import {
  CreateUserInput,
  UpdateUserInput,
  UserModel,
  ValidateUserInput,
  ValidateUserOutput,
} from './user.types';

/**
 * Error Handling:
 * Most database-related errors (such as unique constraint violations on email or
 * record not found during update/delete) are handled globally by the
 * `PrismaExceptionFilter` in `src/common/filters/prisma-exception.filter.ts`.
 * This avoids repetitive try-catch blocks within the service methods.
 */
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

  async findMany(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PaginatedResult<UserModel>> {
    return this.prismaService.paginate(
      this.prismaService.user,
      {
        omit: { password: true },
        orderBy: { createdAt: 'desc' },
      },
      pageOptionsDto,
    );
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
