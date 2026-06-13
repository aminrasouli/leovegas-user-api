import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { HashService } from 'src/infrastructure/hash/hash.service';

import { UserRole } from './user.constants';
import { UserService } from './user.service';
import { UserModel } from './user.types';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockHashService = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HashService, useValue: mockHashService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const data = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.USER,
      };
      const createdUser: UserModel = {
        id: 1,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(data);

      expect(mockHashService.hash).toHaveBeenCalledWith('password123');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: data.email,
          name: data.name,
          password: 'hashed_password',
          role: data.role,
        },
        omit: { password: true },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update a user and hash password if provided', async () => {
      const id = 1;
      const data = { name: 'Updated Name', password: 'newpassword' };
      const updatedUser: UserModel = {
        id,
        email: 'test@example.com',
        name: data.name,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, data);

      expect(mockHashService.hash).toHaveBeenCalledWith('newpassword');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should update a user without hashing if password not provided', async () => {
      const id = 1;
      const data = { name: 'Updated Name' };
      const updatedUser = { id, email: 'test@example.com', ...data };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, data);

      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { name: 'Updated Name' },
        omit: { password: true },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMany', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, email: 'test@example.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findMany();
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockPrismaService.user.delete.mockResolvedValue(user);

      const result = await service.delete(1);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
      });
      expect(result).toEqual(user);
    });
  });

  describe('validate', () => {
    it('should return user if credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockHashService.compare.mockResolvedValue(true);

      const result = await service.validate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.validate({ email: 'none@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ password: 'h' });
      mockHashService.compare.mockResolvedValue(false);
      await expect(
        service.validate({ email: 'test@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
