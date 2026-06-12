import {
  ConsoleLogger,
  Inject,
  Injectable,
  LogLevel,
  Scope,
} from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

import { ContextService } from 'src/infrastructure/context/context.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  constructor(
    @Inject(INQUIRER) parentClass: object,
    private readonly contextService: ContextService,
  ) {
    super(parentClass.constructor?.name ?? '');
  }

  protected override stringifyMessage(message: unknown, logLevel: LogLevel) {
    return super.stringifyMessage(
      this.withContext(message),
      logLevel,
    ) as unknown;
  }

  private withContext(message: unknown) {
    try {
      const context = this.contextService.value;
      if (!context) throw new Error('Context is not defined');
      if (Object.keys(context).length === 0) {
        return message;
      }
      if (typeof message === 'object' && message !== null) {
        return { context, ...message };
      }
      return { context, message };
    } catch {
      return message;
    }
  }
}
