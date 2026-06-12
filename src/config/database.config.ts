import { registerAs } from '@nestjs/config';

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { validateClass } from 'src/common/utils/validate';

export enum DatabaseProvider {
  POSTGRESQL = 'postgresql',
}

class DatabaseConfig {
  @IsNotEmpty()
  @IsEnum(DatabaseProvider)
  provider: DatabaseProvider;

  @IsString()
  @IsNotEmpty()
  connectionUrl: string;
}

export const databaseConfigFactory = registerAs(DatabaseConfig.name, () =>
  validateClass(DatabaseConfig, {
    provider: process.env.DATABASE_PROVIDER,
    connectionUrl: process.env.DATABASE_URL,
  }),
);
