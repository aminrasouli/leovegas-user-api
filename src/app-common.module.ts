import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as configs from 'src/config';
import { getEnvFilePaths } from 'src/env';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.values(configs),
      envFilePath: getEnvFilePaths(),
      cache: process.env.NODE_ENV === 'production',
      expandVariables: true,
      skipProcessEnv: false,
      validatePredefined: true,
    }),
    LoggerModule,
  ],
})
export class AppCommonModule {}
