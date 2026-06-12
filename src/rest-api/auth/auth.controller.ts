import { Body, Controller, Post } from "@nestjs/common";

import { SignupBodyDto } from "./auth.dto.request";
import { SignupResponseDto } from "./auth.dto.response";

@Controller('auth')
export class AuthController {

  @Post('signup')
  async signup(@Body() body: SignupBodyDto): Promise<SignupResponseDto> {
    return {
      id: '123',
    };
  }

}