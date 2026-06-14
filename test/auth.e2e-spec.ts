import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/infrastructure/database/prisma.service';

import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/sign-up (POST)', () => {
    it('should register a new user', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/sign-up',
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload) as { data: { id: string } };
      expect(body.data).toBeDefined();
      expect(body.data.id).toBeDefined();
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should fail if email is already taken', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/sign-up',
        payload,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/auth/sign-up',
        payload,
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload) as {
        errors: Array<{ detail: string }>;
      };
      expect(body.errors[0].detail).toContain('Unique constraint failed');
    });
  });

  describe('/auth/sign-in (POST)', () => {
    it('should login and return access token', async () => {
      const signUpPayload = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/sign-up',
        payload: signUpPayload,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/auth/sign-in',
        payload: {
          email: signUpPayload.email,
          password: signUpPayload.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as {
        data: { attributes: { access_token: string; email: string } };
      };
      expect(body.data.attributes.access_token).toBeDefined();
      expect(body.data.attributes.email).toBe(signUpPayload.email);
    });

    it('should fail with invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/sign-in',
        payload: {
          email: 'wrong@example.com',
          password: 'wrong',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload) as {
        errors: Array<{ detail: string }>;
      };
      expect(body.errors[0].detail).toBe('Invalid email or password');
    });
  });
});
