import { Injectable } from '@nestjs/common';

import { AsyncLocalStorage } from 'node:async_hooks';

import type { FastifyRequest } from 'fastify';

import type { ContextStore } from './context.types';

@Injectable()
export class ContextService {
  // https://docs.nestjs.com/recipes/async-local-storage
  private readonly als = new AsyncLocalStorage<ContextStore>();

  public async run<T>(req: FastifyRequest, next: () => T): Promise<T> {
    const headers = Object.freeze({ ...req.headers });

    const store: ContextStore = Object.freeze({
      requestId: req.id,
      requestIp: req.ip,
      userAgent: headers['user-agent'] ?? '',
      userUrl: req.originalUrl || req.url,
    });

    return await this.als.run(store, next);
  }

  public get value(): ContextStore {
    const value = this.als.getStore();
    if (!value) {
      throw new Error(
        'Context is not defined. This must not be used during bootstrapping',
      );
    }
    return value;
  }
}
