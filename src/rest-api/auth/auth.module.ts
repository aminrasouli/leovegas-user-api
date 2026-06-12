import { Module } from '@nestjs/common';

import { AuthModule } from 'src/features/auth/auth.module';

import { AuthController } from './auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class AuthRestModule {}
