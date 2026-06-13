import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from 'src/features/auth/auth.service';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call signUp service', async () => {
      const dto = { email: 't@e.com', name: 'T', password: 'P' };
      mockAuthService.signUp.mockResolvedValue({ id: 1 });

      expect(await controller.signUp(dto)).toEqual({ id: 1 });
      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('signIn', () => {
    it('should call signIn service', async () => {
      const dto = { email: 't@e.com', password: 'P' };
      const response = { id: 1, email: 't@e.com', accessToken: 'token' };
      mockAuthService.signIn.mockResolvedValue(response);

      expect(await controller.signIn(dto)).toEqual(response);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(dto);
    });
  });
});
