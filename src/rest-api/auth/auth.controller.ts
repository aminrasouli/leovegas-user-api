import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';

import { SignUpService } from 'src/features/auth/sign-up.service';

import { SignupBodyDto } from './auth.dto.request';
import { SignupResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post('signup')
  @SerializeOptions({ type: SignupResponseDto })
  signup(@Body() body: SignupBodyDto): SignupResponseDto {
    return this.signUpService.signUp(body);
  }
}
