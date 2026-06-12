import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { HashModule } from 'src/infrastructure/hash/hash.module';
import { TokenModule } from 'src/infrastructure/token/token.module';

import { SignInService } from './sign-in.service';
import { SignUpService } from './sign-up.service';

@Module({
  imports: [DatabaseModule, HashModule, TokenModule],
  providers: [SignUpService, SignInService],
  exports: [SignUpService, SignInService],
})
export class AuthModule {}
