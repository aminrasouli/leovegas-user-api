import { Module } from '@nestjs/common';

import { TokenModule } from 'src/infrastructure/token/token.module';

import { SignInService } from './sign-in.service';
import { SignUpService } from './sign-up.service';

@Module({
  imports: [TokenModule],
  providers: [SignUpService, SignInService],
  exports: [SignUpService, SignInService],
})
export class AuthModule {}
