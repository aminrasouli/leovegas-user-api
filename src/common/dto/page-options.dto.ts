import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class PageDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly number: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly size: number = 10;
}

export class PageOptionsDto {
  @ApiPropertyOptional({ type: PageDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageDto)
  @Transform(({ obj }) => {
    // Handle both nested object and flat keys like page[number]
    const page = {
      number: obj['page[number]'] ?? obj?.page?.number ?? 1,
      size: obj['page[size]'] ?? obj?.page?.size ?? 10,
    };
    return {
      number: Number(page.number),
      size: Number(page.size),
    };
  })
  readonly page: PageDto = new PageDto();

  get skip(): number {
    return ((this.page?.number ?? 1) - 1) * (this.page?.size ?? 10);
  }

  get limit(): number {
    return this.page?.size ?? 10;
  }

  get pageNumber(): number {
    return this.page?.number ?? 1;
  }
}
