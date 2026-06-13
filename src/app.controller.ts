import { Controller, Get } from '@nestjs/common';

import { JsonApiResponse } from 'src/common/decorators/api.decorators';

import { AppResponseDto } from './app.dto.response';

@Controller()
export class AppController {
  @Get()
  @JsonApiResponse(AppResponseDto, { resource: 'apps' })
  getHello(): AppResponseDto {
    return { message: 'Welcome to LeoVegas User API' };
  }
}
