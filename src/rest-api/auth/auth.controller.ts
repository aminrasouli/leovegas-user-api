import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AuthService } from 'src/features/auth/auth.service';
import { JsonApiResponse } from 'src/common/decorators/api.decorators';

import { SignInBodyDto, SignUpBodyDto } from './auth.dto.request';
import { SignInResponseDto, SignUpResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @JsonApiResponse(SignUpResponseDto)
  async signUp(@Body() body: SignUpBodyDto): Promise<SignUpResponseDto> {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @JsonApiResponse(SignInResponseDto)
  async signIn(@Body() body: SignInBodyDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body);
  }
}
