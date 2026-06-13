import { NestFactory } from '@nestjs/core';

import { LoggerService } from 'src/infrastructure/logger/logger.service';

import { SeedModule } from './seed.module';
import { UserSeeder } from './user.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    bufferLogs: true,
  });

  const logger = await app.resolve(LoggerService);
  logger.setContext('SeedRunner');
  app.useLogger(logger);

  try {
    await app.get(UserSeeder).create();
    logger.log('User seeding completed');
  } catch (error: unknown) {
    logger.error('User seeding failed', error as Error);
  } finally {
    await app.close();
  }
}

void bootstrap();
