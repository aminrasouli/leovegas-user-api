import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from 'src/features/user/user.constants';
import { UserService } from 'src/features/user/user.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

import { AppModule } from '../src/app.module';

describe('AdminController (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let userService: UserService;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    prisma = app.get(PrismaService);
    userService = app.get(UserService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    // Create Admin using UserService to ensure password is hashed
    await userService.create({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'Password123!',
      role: UserRole.ADMIN,
    });

    const adminLogin = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { email: 'admin@example.com', password: 'Password123!' },
    });
    const adminLoginBody = JSON.parse(adminLogin.payload) as {
      data: { attributes: { access_token: string } };
    };
    adminToken = adminLoginBody.data.attributes.access_token;

    // Create Regular User
    const user = await userService.create({
      email: 'user@example.com',
      name: 'User',
      password: 'Password123!',
      role: UserRole.USER,
    });
    testUserId = user.id;

    const userLogin = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { email: 'user@example.com', password: 'Password123!' },
    });
    const userLoginBody = JSON.parse(userLogin.payload) as {
      data: { attributes: { access_token: string } };
    };
    userToken = userLoginBody.data.attributes.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/users (GET)', () => {
    it('should allow admin to list users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/users',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as any[];
      expect(body).toHaveLength(2);
      expect(body[0].data).toBeDefined();
    });

    it('should deny regular user access', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/users',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('/admin/users/:id (GET)', () => {
    it('should allow admin to get user by id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/admin/users/${testUserId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { data: { id: string } };
      expect(parseInt(body.data.id)).toBe(testUserId);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/users/9999',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('/admin/users/:id (PATCH)', () => {
    it('should allow admin to update user role and details', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/admin/users/${testUserId}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          name: 'Updated by Admin',
          role: UserRole.ADMIN,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        data: { attributes: { role: string } };
      };
      expect(body.data.attributes.role).toBe(UserRole.ADMIN);

      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(updatedUser?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('/admin/users/:id (DELETE)', () => {
    it('should allow admin to delete a user', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/users/${testUserId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(204);

      const deletedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(deletedUser).toBeNull();
    });

    it('should not allow admin to delete themselves', async () => {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/admin/users/${admin?.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload) as {
        errors: Array<{ detail: string }>;
      };
      expect(body.errors[0].detail).toBe('You cannot delete your own account');
    });

    it('should not allow admin to update themselves via admin endpoint', async () => {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
      });

      const response = await app.inject({
        method: 'PATCH',
        url: `/admin/users/${admin?.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { name: 'New Name' },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload) as {
        errors: Array<{ detail: string }>;
      };
      expect(body.errors[0].detail).toBe(
        'You cannot update your own account via admin endpoints',
      );
    });
  });
});
