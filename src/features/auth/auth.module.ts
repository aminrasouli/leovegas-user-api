import { Module } from '@nestjs/common';

import { TokenModule } from 'src/infrastructure/token/token.module';

import { SignInService } from './sign-in.service';
import { SignUpService } from './sign-up.service';
import { HashModule } from 'src/infrastructure/hash/hash.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule, HashModule, TokenModule],
  providers: [SignUpService, SignInService],
  exports: [SignUpService, SignInService],
})
export class AuthModule {}
