import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';

import { AuthService } from 'src/features/auth/auth.service';

import { SignInBodyDto, SignUpBodyDto } from './auth.dto.request';
import { SignInResponseDto, SignUpResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @SerializeOptions({ type: SignUpResponseDto })
  async signUp(@Body() body: SignUpBodyDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: SignInResponseDto })
  async signIn(@Body() body: SignInBodyDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body);
  }
}
