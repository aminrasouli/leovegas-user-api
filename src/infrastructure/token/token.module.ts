import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { jwtConfigFactory } from 'src/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: jwtConfigFactory.asProvider().imports,
      inject: [jwtConfigFactory.KEY],
      useFactory: (jwtConfig: ConfigType<typeof jwtConfigFactory>) => ({
        secret: jwtConfig.secretKey,
        signOptions: { expiresIn: jwtConfig.expiresIn },
      }),
    }),
  ],
})
export class TokenModule {}
