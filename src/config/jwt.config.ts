import { registerAs } from '@nestjs/config';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { validateClass } from 'src/common/utils/validate';

class JWTConfig {
  @IsString()
  @IsNotEmpty()
  secretKey: string;

  @IsNumber()
  @IsNotEmpty()
  expiresIn: number;
}

export const jwtConfigFactory = registerAs(JWTConfig.name, () =>
  validateClass(JWTConfig, {
    secretKey: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  }),
);
