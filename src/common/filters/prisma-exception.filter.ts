import {
  BadRequestException,
  Catch,
  ConflictException,
  type ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
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

@Catch(
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Error) {
    let message = exception.message;

    if (exception instanceof PrismaClientKnownRequestError) {
      const errorCode = exception.code as PrismaError;

      if (errorCode === PrismaError.UniqueConstraintFailed) {
        if (exception.meta?.target) {
          const target = exception.meta.target as string | string[];
          message = `Unique constraint failed on field(s): ${Array.isArray(target) ? target.join(', ') : target}`;
        }
        throw new ConflictException(message);
      }

      if (errorCode === PrismaError.RecordNotFound) {
        if (exception.meta?.cause || exception.meta?.message) {
          message = (exception.meta.cause || exception.meta.message) as string;
        }
        throw new NotFoundException(message);
      }

      throw new BadRequestException(message);
    }

    if (exception instanceof PrismaClientValidationError) {
      throw new BadRequestException(message);
    }

    throw new InternalServerErrorException(message);
  }
}
