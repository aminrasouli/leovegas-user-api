import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedMeta {
  totalItems: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

interface PaginatedResult {
  data: unknown[];
  meta: PaginatedMeta;
}

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Record<string, unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    response.header('Content-Type', 'application/vnd.api+json');

    return next.handle().pipe(
      map((payload: unknown) => {
        if (this.isPaginatedResult(payload)) {
          return this.transformPaginated(payload, request);
        }

        // If it's already wrapped in data (e.g. by another logic), return as is
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in (payload as Record<string, unknown>)
        ) {
          return payload as Record<string, unknown>;
        }

        // Wrap single resources or arrays in data block
        return { data: payload };
      }),
    );
  }

  private isPaginatedResult(payload: unknown): payload is PaginatedResult {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      Array.isArray(p.data) &&
      typeof p.meta === 'object' &&
      p.meta !== null &&
      typeof (p.meta as Record<string, unknown>).totalItems === 'number'
    );
  }

  private transformPaginated(
    payload: PaginatedResult,
    request: FastifyRequest,
  ) {
    const { url } = request;
    const [baseUrl, queryString] = url.split('?');
    const params = new URLSearchParams(queryString);

    const buildUrl = (page: number) => {
      const newParams = new URLSearchParams(params.toString());
      newParams.set('page[number]', page.toString());
      newParams.set('page[size]', payload.meta.pageSize.toString());
      return `${baseUrl}?${newParams.toString()}`;
    };

    const { pageNumber, totalPages } = payload.meta;

    return {
      data: payload.data,
      links: {
        self: url,
        first: buildUrl(1),
        prev: pageNumber > 1 ? buildUrl(pageNumber - 1) : null,
        next: pageNumber < totalPages ? buildUrl(pageNumber + 1) : null,
        last: buildUrl(totalPages || 1),
      },
      meta: payload.meta,
    };
  }
}
