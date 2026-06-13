import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { FastifyReply } from 'fastify';

@Catch()
export class JsonApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // If response was already sent by another filter (like PrismaExceptionFilter), do nothing
    if (response.sent) {
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as Record<string, unknown>;
      if (typeof res === 'object' && res !== null) {
        message = (res.message as string | string[]) || exception.message;
        error = (res.error as string) || exception.name;
      } else {
        message = exception.message;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const e = exception as Record<string, unknown>;
      status = (e.status as number) || (e.statusCode as number) || status;
      message = (e.message as string | string[]) || message;
      error = (e.error as string) || e.constructor.name || error;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
    }

    const errors = Array.isArray(message)
      ? message.map((m) => ({
          status: status.toString(),
          title: error,
          detail: m,
        }))
      : [
          {
            status: status.toString(),
            title: error,
            detail: message,
          },
        ];

    void response
      .status(status)
      .header('Content-Type', 'application/vnd.api+json')
      .send({ errors });
  }
}
