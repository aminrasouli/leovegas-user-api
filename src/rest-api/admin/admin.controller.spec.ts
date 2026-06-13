import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { AuthGuard } from 'src/features/auth/auth.guard';
import { RolesGuard } from 'src/features/auth/roles.guard';
import { UserService } from 'src/features/user/user.service';
import { UserModel } from 'src/features/user/user.types';
import { UserResponseDto } from 'src/rest-api/user/user.dto.response';

import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;

  const mockUserService = {
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const pageOptions = new PageOptionsDto();
      const result = {
        data: [],
        meta: {},
      } as unknown as PaginatedResult<UserResponseDto>;
      mockUserService.findMany.mockResolvedValue(result);

      expect(await controller.getUsers(pageOptions)).toEqual(result);
      expect(mockUserService.findMany).toHaveBeenCalledWith(pageOptions);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'Test' };
      mockUserService.findById.mockResolvedValue(user);

      expect(await controller.getUser({ id: 1 })).toEqual(user);
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const body = { name: 'Updated' };
      const updatedUser = { id: 1, ...body };
      mockUserService.update.mockResolvedValue(updatedUser);

      expect(await controller.updateUser({ id: 1 }, body)).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, body);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const currentUser = { id: 2 } as unknown as UserModel;
      mockUserService.delete.mockResolvedValue({ id: 1 });

      await controller.deleteUser(currentUser, { id: 1 });
      expect(mockUserService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if deleting self', async () => {
      const currentUser = { id: 1 } as unknown as UserModel;
      await expect(
        controller.deleteUser(currentUser, { id: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
