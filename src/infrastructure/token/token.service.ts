import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { id: number }): string {
    return this.jwtService.sign({ sub: payload.id });
  }

  async verifyToken(token: string): Promise<{ id: number } | null> {
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
