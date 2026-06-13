import { Injectable } from '@nestjs/common';

import { UserService } from 'src/features/user/user.service';
import { TokenService } from 'src/infrastructure/token/token.service';

import {
  SignInInput,
  SignInOutput,
  SignUpInput,
  SignUpOutput,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async signUp(body: SignUpInput): Promise<SignUpOutput> {
    const user = await this.userService.create({
      email: body.email,
      name: body.name,
      // Password is hashed in the user service, so we can pass it directly
      password: body.password,
    });

    return {
      id: user.id,
    };
  }

  async signIn(body: SignInInput): Promise<SignInOutput> {
    const user = await this.userService.validate({
      email: body.email,
      password: body.password,
    });

    const accessToken = this.tokenService.generateToken({ id: user.id });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }
}
