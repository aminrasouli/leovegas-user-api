import { Module } from '@nestjs/common';

import { UserModule } from 'src/features/user/user.module';

import { AdminController } from './admin.controller';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
})
export class AdminRestModule {}
