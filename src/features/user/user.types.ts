import { Prisma } from 'src/infrastructure/database/prisma.types';

// TODO: fix types

export type CreateUserInput = Pick<
  Prisma.User,
  'email' | 'name' | 'password' | 'role'
>;

export type UserModel = Pick<Prisma.User, 'id' | 'email' | 'name' | 'role'>;

export type ValidateUserInput = Pick<Prisma.User, 'email' | 'password'>;

export type ValidateUserOutput = Pick<
  Prisma.User,
  'id' | 'email' | 'name' | 'role'
>;
