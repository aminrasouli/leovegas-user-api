/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';

const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  PrismaClientKnownRequestError: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Prisma Client Known Request Error',
  },
  PrismaClientValidationError: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Prisma Client Validation Error',
  },
  PrismaClientUnknownRequestError: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Prisma Client Unknown Request Error',
  },
  PrismaClientRustPanicError: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Prisma Client Rust Panic Error',
  },
  PrismaClientInitializationError: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Prisma Client Initialization Error',
  },
};

const PRISMA_KNOWN_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Unique constraint failed' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
};

@Catch(
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Error, _host: ArgumentsHost) {
    const errorType = exception.constructor.name;
    let { status: statusCode, message } = PRISMA_ERROR_MAP[errorType] || {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Prisma Client Internal Error',
    };

    if (exception instanceof PrismaClientKnownRequestError) {
      const knownError = PRISMA_KNOWN_ERROR_MAP[exception.code];
      if (knownError) {
        statusCode = knownError.status;
        message = knownError.message;
      }
    }

    throw new HttpException(
      {
        statusCode,
        message,
        error: errorType,
      },
      statusCode,
      { cause: exception, description: errorType },
    );
  }
}
