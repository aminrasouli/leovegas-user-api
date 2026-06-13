import { Module } from '@nestjs/common';

import { AppCommonModule } from 'src/app-common.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { HashModule } from 'src/infrastructure/hash/hash.module';

import { UserSeeder } from './user.seeder';

@Module({
  imports: [AppCommonModule, DatabaseModule, HashModule],
  providers: [UserSeeder],
  exports: [UserSeeder],
})
export class SeedModule {}
