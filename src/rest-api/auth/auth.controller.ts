import { Body, Controller, Post } from '@nestjs/common';

import { SignupBodyDto } from './auth.dto.request';
import { SignupResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  @Post('signup')
  signup(@Body() body: SignupBodyDto): SignupResponseDto {
    console.log(body);
    return {
      id: '123',
    };
  }
}
