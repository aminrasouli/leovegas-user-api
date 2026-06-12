import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  constructor(@Inject(INQUIRER) parentClass: object) {
    super(parentClass.constructor?.name ?? '');
  }
}
