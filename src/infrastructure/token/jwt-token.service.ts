import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  generate(payload: { id: number }): string {
    return this.jwtService.sign({ sub: payload.id });
  }

  async verify(token: string): Promise<{ id: number } | null> {
    try {
      const { sub: id } = await this.jwtService.verifyAsync<{ sub: number }>(
        token,
      );
      return { id };
    } catch {
      return null;
    }
  }
}
