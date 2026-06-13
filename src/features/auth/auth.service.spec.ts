import { Test, TestingModule } from '@nestjs/testing';

import { TokenService } from 'src/infrastructure/token/token.service';

import { UserRole } from '../user/user.constants';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    create: jest.fn(),
    validate: jest.fn(),
  };

  const mockTokenService = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a user with USER role', async () => {
      const signUpDto = {
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
      };
      const createdUser = { id: 1, ...signUpDto, role: UserRole.USER };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await service.signUp(signUpDto);

      expect(mockUserService.create).toHaveBeenCalledWith({
        ...signUpDto,
        role: UserRole.USER,
      });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('signIn', () => {
    it('should return user info and access token on success', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      const validatedUser = { id: 1, email: signInDto.email, name: 'Test' };
      const accessToken = 'token_abc';

      mockUserService.validate.mockResolvedValue(validatedUser);
      mockTokenService.generate.mockReturnValue(accessToken);

      const result = await service.signIn(signInDto);

      expect(mockUserService.validate).toHaveBeenCalledWith(signInDto);
      expect(mockTokenService.generate).toHaveBeenCalledWith({
        id: validatedUser.id,
      });
      expect(result).toEqual({
        id: validatedUser.id,
        email: validatedUser.email,
        name: validatedUser.name,
        accessToken,
      });
    });
  });
});
