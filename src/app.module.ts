import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { RestApiModule } from 'src/rest-api/rest-api.module';

@Module({
  imports: [RestApiModule],
  providers: [
    { 
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }) },
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
