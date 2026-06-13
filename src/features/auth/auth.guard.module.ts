import { Global, Module } from '@nestjs/common';

import { UserModule } from 'src/features/user/user.module';
import { TokenModule } from 'src/infrastructure/token/token.module';

@Global()
@Module({
  imports: [UserModule, TokenModule],
  exports: [UserModule, TokenModule],
})
export class AuthGuardModule {}
