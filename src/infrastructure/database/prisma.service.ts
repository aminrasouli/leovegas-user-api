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

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(databaseConfigFactory.KEY)
    private readonly databaseConfig: ConfigType<typeof databaseConfigFactory>,
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
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async ping() {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      throw new Error(
        'Failed to connect to the database. Check logs for more details.',
      );
    }
  }
}
