import { Injectable, type NestMiddleware } from '@nestjs/common';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { ContextService } from './context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  public async use(
    req: FastifyRequest,
    _reply: FastifyReply,
    next: () => void,
  ): Promise<void> {
    await this.contextService.run(req, next);
  }
}
