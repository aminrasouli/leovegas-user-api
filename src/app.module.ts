import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';

import { AppCommonModule } from 'src/app-common.module';
import { ExceptionLoggerFilter } from 'src/common/filters/exception-logger.filter';
import { PrismaExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { JsonApiInterceptor } from 'src/common/interceptors/json-api.interceptor';
import { ResponseLoggerInterceptor } from 'src/common/interceptors/response-logger.interceptor';
import { ContextModule } from 'src/infrastructure/context/context.module';
import { RestApiModule } from 'src/rest-api/rest-api.module';

@Module({
  imports: [AppCommonModule, ContextModule, RestApiModule],
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
    { provide: APP_INTERCEPTOR, useClass: JsonApiInterceptor },
  ],
})
export class AppModule {}
