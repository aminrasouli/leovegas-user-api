import { Expose } from 'class-transformer';
import { UserRole } from 'src/features/user/user.constants';
import { UserModel } from 'src/features/user/user.types';

export class UserResponseDto implements UserModel {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
