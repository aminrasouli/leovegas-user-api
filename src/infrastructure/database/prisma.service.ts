import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { databaseConfigFactory } from 'src/config';
import { DatabaseProvider } from 'src/config/database.config';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(databaseConfigFactory.KEY)
    private readonly databaseConfig: ConfigType<typeof databaseConfigFactory>,
    private readonly logger: LoggerService,
  ) {
    const adapters = {
      [DatabaseProvider.POSTGRESQL]: () => {
        return new PrismaPg({ connectionString: databaseConfig.connectionUrl });
      },
    };

    super({ adapter: adapters[databaseConfig.provider]() });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.ping();
    this.logger.log(`Database connected: ${this.databaseConfig.provider}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async ping() {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed', {
        provider: this.databaseConfig.provider,
        error: error as unknown as Error,
      });
      throw new Error(
        'Failed to connect to the database. Check logs for more details.',
      );
    }
  }

  async paginate<T>(
    delegate: any,
    args: any,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<T>> {
    const [totalItems, data] = await this.$transaction([
      delegate.count({ where: args.where }),
      delegate.findMany({
        ...args,
        skip: options.skip,
        take: options.limit,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / options.limit);

    return {
      data,
      links: {
        self: '',
        first: '',
        prev: null,
        next: null,
        last: '',
      },
      meta: {
        totalItems,
        totalPages,
        pageNumber: options.pageNumber,
        pageSize: options.limit,
      },
    };
  }
}
