import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    response.header('Content-Type', 'application/vnd.api+json');

    return next.handle().pipe(
      map((payload) => {
        if (this.isPaginatedResult(payload)) {
          return this.transformPaginated(payload, request);
        }

        // If it's already wrapped in data (e.g. by another logic), return as is
        if (payload && payload.data) {
          return payload;
        }

        // Wrap single resources or arrays in data block
        return { data: payload };
      }),
    );
  }

  private isPaginatedResult(payload: any): boolean {
    return (
      payload &&
      Array.isArray(payload.data) &&
      payload.meta &&
      typeof payload.meta.totalItems === 'number'
    );
  }

  private transformPaginated(payload: any, request: FastifyRequest) {
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
