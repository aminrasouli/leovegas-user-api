import { Prisma } from 'src/infrastructure/database/prisma.types';

export type CreateUserInput = Prisma.Prisma.UserCreateInput;

export type UpdateUserInput = Omit<
  Prisma.Prisma.UserUpdateInput,
  'createdAt' | 'updatedAt'
>;

export type UserModel = Omit<Prisma.User, 'password'>;

export type ValidateUserInput = Pick<Prisma.User, 'email' | 'password'>;

export type ValidateUserOutput = UserModel;
