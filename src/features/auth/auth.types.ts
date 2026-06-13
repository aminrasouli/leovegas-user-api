import type {
  CreateUserInput,
  UserModel,
  ValidateUserInput,
} from 'src/features/user/user.types';

export type SignUpInput = CreateUserInput;

export type SignUpOutput = Pick<UserModel, 'id'>;

export type SignInInput = ValidateUserInput;

export type SignInOutput = Pick<UserModel, 'id' | 'email' | 'name'> & {
  accessToken: string;
};
