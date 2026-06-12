import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';

export function createOpenApiDocument(app: INestApplication) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(packageJson.name)
      .setVersion(packageJson.version)
      .setDescription(packageJson.description)
      .addBearerAuth()
      .build(),
    {
      operationIdFactory: (
        controllerKey: string,
        methodKey: string,
        version?: string,
      ) => {
        return [controllerKey, methodKey, version].filter(Boolean).join('_');
      },
    },
  );

  SwaggerModule.setup('swagger', app, document, {
    ui: true,
    raw: ['json', 'yaml'],
    jsonDocumentUrl: 'openapi-json',
    yamlDocumentUrl: 'openapi-yaml',
    swaggerOptions: {},
  });

  return { document };
}
