import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { createOpenApiDocument } from 'src/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
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
