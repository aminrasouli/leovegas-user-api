import { Module } from '@nestjs/common';

import { AuthGuardModule } from 'src/features/auth/auth.guard.module';

import { AdminRestModule } from './admin/admin.module';
import { AuthRestModule } from './auth/auth.module';
import { UserRestModule } from './user/user.module';

@Module({
  imports: [AuthGuardModule, AuthRestModule, UserRestModule, AdminRestModule],
})
export class RestApiModule {}
