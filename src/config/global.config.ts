import { registerAs } from '@nestjs/config';

import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { validateClass } from 'src/common/utils/validate';

enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

class GlobalConfig {
  @IsNotEmpty()
  @IsEnum(NodeEnv)
  nodeEnv: NodeEnv;

  @IsNotEmpty()
  @IsBoolean()
  isProduction: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isDevelopment: boolean;
}

export const globalConfigFactory = registerAs(GlobalConfig.name, () =>
  validateClass(GlobalConfig, {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === NodeEnv.PRODUCTION,
    isDevelopment: process.env.NODE_ENV === NodeEnv.DEVELOPMENT,
  }),
);
