import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';

import { SignInService } from 'src/features/auth/sign-in.service';
import { SignUpService } from 'src/features/auth/sign-up.service';

import { SignInBodyDto, SignUpBodyDto } from './auth.dto.request';
import { SignInResponseDto, SignUpResponseDto } from './auth.dto.response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpService: SignUpService,
    private readonly signInService: SignInService,
  ) {}

  @Post('sign-up')
  @SerializeOptions({ type: SignUpResponseDto })
  async signUp(@Body() body: SignUpBodyDto): Promise<SignUpResponseDto> {
    return this.signUpService.signUp(body);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: SignInResponseDto })
  async signIn(@Body() body: SignInBodyDto): Promise<SignInResponseDto> {
    return this.signInService.signIn(body);
  }
}
