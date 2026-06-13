import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { sanitize } from 'src/common/utils/sanitize';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Catch()
export class ExceptionLoggerFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error({
      exception: sanitize(exception),
    });

    super.catch(exception, host);
  }
}
