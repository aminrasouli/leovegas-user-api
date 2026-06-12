import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

import type { FastifyReply } from 'fastify';
import { Observable, tap } from 'rxjs';
import { globalConfigFactory } from 'src/config';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  public constructor(
    private readonly logger: LoggerService,
    @Inject(globalConfigFactory.KEY)
    private readonly globalConfig: ConfigType<typeof globalConfigFactory>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // TODO: skip logging in production to avoid sensitive data exposure until we sanitize logs sensitive data
    if (this.globalConfig.isProduction) return next.handle();

    if (context.getType() !== 'http') return next.handle();

    const host = context.switchToHttp();
    const res = host.getResponse<FastifyReply>();
    //const req = host.getRequest<FastifyRequest>();

    const startedAt = process.hrtime.bigint();
    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const endedAt = process.hrtime.bigint();
        const durationMs = Number(endedAt - startedAt) / 1_000_000;
        this.logger.log({
          type: 'http_response',
          durationMs,
          statusCode: res.statusCode,
          responseBody: responseBody,
        });
      }),
    );
  }
}
