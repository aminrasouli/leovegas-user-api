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
import { sanitize } from 'src/common/utils/sanitize';
import { globalConfigFactory } from 'src/config';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  public constructor(
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const host = context.switchToHttp();
    const res = host.getResponse<FastifyReply>();
    const startedAt = process.hrtime.bigint();
    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const endedAt = process.hrtime.bigint();
        const durationMs = Number(endedAt - startedAt) / 1_000_000;
        this.logger.log({
          type: 'http_response',
          durationMs,
          statusCode: res.statusCode,
          responseBody: sanitize(responseBody),
        });
      }),
    );
  }
}
