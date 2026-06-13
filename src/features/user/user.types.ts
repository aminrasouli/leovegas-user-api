import { Prisma } from 'src/infrastructure/database/prisma.types';

export type CreateUserInput = Pick<Prisma.User, 'email' | 'name' | 'password'>;

export type UserModel = Pick<Prisma.User, 'id' | 'email' | 'name'>;

export type ValidateUserInput = Pick<Prisma.User, 'email' | 'password'>;

export type ValidateUserOutput = Pick<Prisma.User, 'id' | 'email' | 'name'>;
