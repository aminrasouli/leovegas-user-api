import { type ArgumentsHost, Catch, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { BaseExceptionFilter } from '@nestjs/core';

import { globalConfigFactory } from 'src/config';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Catch()
export class ExceptionLoggerFilter extends BaseExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    @Inject(globalConfigFactory.KEY)
    private readonly globalConfig: ConfigType<typeof globalConfigFactory>,
  ) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // TODO: skip logging in production to avoid sensitive data exposure until we sanitize logs sensitive data
    const isProduction = this.globalConfig.isProduction;

    if (!isProduction) {
      this.logger.error({
        // TODO:Filter it later
        exception,
      });
    }

    super.catch(exception, host);
  }
}
