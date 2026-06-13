import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';

import * as configs from 'src/config';
import { ExceptionLoggerFilter } from 'src/common/filters/exception-logger.filter';
import { PrismaExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { ResponseLoggerInterceptor } from 'src/common/interceptors/response-logger.interceptor';
import { getEnvFilePaths } from 'src/env';
import { ContextModule } from 'src/infrastructure/context/context.module';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { RestApiModule } from 'src/rest-api/rest-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.values(configs),
      envFilePath: getEnvFilePaths(),
      cache: process.env.NODE_ENV === 'production',
      expandVariables: true,
      skipProcessEnv: false,
      validatePredefined: true,
    }),
    ContextModule,
    LoggerModule,
    RestApiModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },

    { provide: APP_FILTER, useClass: ExceptionLoggerFilter },

    { provide: APP_FILTER, useClass: PrismaExceptionFilter },

    { provide: APP_INTERCEPTOR, useClass: ResponseLoggerInterceptor },
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector) =>
        new ClassSerializerInterceptor(reflector, {
          strategy: 'excludeAll',
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
    },
  ],
})
export class AppModule {}
