import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from 'src/app.module';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { createOpenApiDocument } from 'src/openapi';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({});
  //TODO: const fastifyApp = fastifyAdapter.getInstance();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bufferLogs: true,
  });

  app.enableCors();

  // Config
  const config = app.get(ConfigService);

  // Logger
  const logger = await app.resolve(LoggerService);
  logger.setContext('Bootstrapping');
  app.useLogger(logger);

  // OpenAPI
  createOpenApiDocument(app);

  await app.listen(config.get<number>('PORT', 3000), '0.0.0.0', () => {
    app
      .getUrl()
      .then((url) => {
        logger.log(`Server is running on ${url}`);
      })
      .catch((err) => {
        logger.error(`Failed to get URL: ${err}`);
      });
  });
}

void bootstrap();
