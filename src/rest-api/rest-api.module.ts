import { Module } from '@nestjs/common';

import { AuthRestModule } from './auth/auth.module';
import { UserRestModule } from './user/user.module';

@Module({
  imports: [AuthRestModule, UserRestModule],
  providers: [],
})
export class RestApiModule {}
