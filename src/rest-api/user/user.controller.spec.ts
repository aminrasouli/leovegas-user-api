import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from 'src/features/auth/auth.guard';
import { RolesGuard } from 'src/features/auth/roles.guard';
import { UserRole } from 'src/features/user/user.constants';
import { UserService } from 'src/features/user/user.service';
import { UserModel } from 'src/features/user/user.types';

import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return the current user', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: UserRole.USER,
      } as unknown as UserModel;
      expect(controller.getUser(user)).toEqual(user);
    });
  });

  describe('updateUser', () => {
    it('should update the current user', async () => {
      const user = { id: 1 } as unknown as UserModel;
      const body = { name: 'New Name' };
      const updatedUser = { id: 1, name: 'New Name' } as unknown as UserModel;

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(user, body);

      expect(mockUserService.update).toHaveBeenCalledWith(user.id, body);
      expect(result).toEqual(updatedUser);
    });
  });
});
