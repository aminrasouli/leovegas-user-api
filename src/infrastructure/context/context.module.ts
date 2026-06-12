import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { ContextMiddleware } from './context.middleware';
import { ContextService } from './context.service';

@Global()
@Module({
  imports: [],
  providers: [ContextService, ContextMiddleware],
  exports: [ContextService],
})
export class ContextModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
