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

enum PrismaError {
  UniqueConstraintFailed = 'P2002',
  RecordNotFound = 'P2025',
}

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
  [PrismaError.UniqueConstraintFailed]: {
    status: HttpStatus.CONFLICT,
    message: 'Unique constraint failed',
  },
  [PrismaError.RecordNotFound]: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record not found',
  },
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
      const errorCode = exception.code as PrismaError;
      const knownError = PRISMA_KNOWN_ERROR_MAP[errorCode];
      if (knownError) {
        statusCode = knownError.status;
        message = knownError.message;

        if (
          errorCode === PrismaError.UniqueConstraintFailed &&
          exception.meta?.target
        ) {
          const target = exception.meta.target as string | string[];
          message = `Unique constraint failed on field(s): ${Array.isArray(target) ? target.join(', ') : target}`;
        } else if (
          errorCode === PrismaError.RecordNotFound &&
          (exception.meta?.cause || exception.meta?.message)
        ) {
          message = (exception.meta.cause || exception.meta.message) as string;
        }
      }
    }

    throw new HttpException(
      {
        statusCode,
        message,
        error: 'database_error',
      },
      statusCode,
      { cause: exception, description: errorType },
    );
  }
}
