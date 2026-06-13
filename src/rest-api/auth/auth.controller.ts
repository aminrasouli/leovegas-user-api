import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { JsonApiResponse } from 'src/common/decorators/api.decorators';
import { AuthService } from 'src/features/auth/auth.service';

import { SignInBodyDto, SignUpBodyDto } from './auth.dto.request';
import { SignInResponseDto, SignUpResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @JsonApiResponse(SignUpResponseDto, { resource: 'users' })
  async signUp(@Body() body: SignUpBodyDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @JsonApiResponse(SignInResponseDto, { resource: 'users' })
  async signIn(@Body() body: SignInBodyDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body);
  }
}
