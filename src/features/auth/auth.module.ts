import { Module } from '@nestjs/common';

import { UserModule } from 'src/features/user/user.module';
import { TokenModule } from 'src/infrastructure/token/token.module';

import { AuthService } from './auth.service';

@Module({
  imports: [TokenModule, UserModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
