import { Prisma } from 'src/infrastructure/database/prisma.types';

// TODO: fix types

export type CreateUserInput = Prisma.Prisma.UserCreateInput;

export type UserModel = Omit<Prisma.User, 'password'>;

export type ValidateUserInput = Pick<Prisma.User, 'email' | 'password'>;

export type ValidateUserOutput = UserModel;
