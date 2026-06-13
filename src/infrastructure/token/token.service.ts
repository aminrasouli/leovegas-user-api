import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class TokenService {
  abstract generate(payload: { id: number }): string;
  abstract verify(token: string): Promise<{ id: number } | null>;
}
