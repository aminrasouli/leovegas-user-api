import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/infrastructure/database/prisma.service';

import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    prisma = app.get(PrismaService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    // Register and login to get token
    const payload = {
      email: 'user@example.com',
      name: 'User One',
      password: 'Password123!',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/sign-up',
      payload,
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: {
        email: payload.email,
        password: payload.password,
      },
    });

    const body = JSON.parse(loginResponse.payload) as {
      data: { attributes: { accessToken: string } };
    };
    authToken = body.data.attributes.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user (GET)', () => {
    it('should return current user details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        data: {
          attributes: { email: string; name: string; password?: string };
        };
      };
      expect(body.data.attributes.email).toBe('user@example.com');
      expect(body.data.attributes.name).toBe('User One');
      expect(body.data.attributes.password).toBeUndefined();
    });

    it('should fail if not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('/user (PATCH)', () => {
    it('should update current user details', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/user',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        data: { attributes: { name: string } };
      };
      expect(body.data.attributes.name).toBe('Updated Name');

      // Verify in DB
      const user = await prisma.user.findUnique({
        where: { email: 'user@example.com' },
      });
      expect(user?.name).toBe('Updated Name');
    });

    it('should not allow updating role', async () => {
      await app.inject({
        method: 'PATCH',
        url: '/user',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          role: 'ADMIN',
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: 'user@example.com' },
      });
      expect(user?.role).toBe('USER');
    });
  });
});
