import {
  type ClassSerializerContextOptions,
  Type as DtoType,
  SerializeOptions,
  applyDecorators,
} from '@nestjs/common';
import {
  ApiProperty,
  ApiResponse,
  type ApiResponseOptions,
  ApiSchema,
  OmitType,
} from '@nestjs/swagger';

import { Expose, Transform, Type } from 'class-transformer';

export function JsonApiResponse<T>(
  dtoClass: DtoType<T> | [DtoType<T>],
  options?: {
    api?: Omit<ApiResponseOptions, 'type'>;
    serializer?: Omit<ClassSerializerContextOptions, 'type'>;
  },
) {
  const isArray = Array.isArray(dtoClass);
  const classRef: DtoType<T> = isArray ? dtoClass[0] : dtoClass;

  let type: DtoType;

  @ApiSchema({ name: `${classRef.name}Attributes` })
  class AttributesDto extends OmitType(classRef as DtoType, ['id', 'type']) {}

  @ApiSchema({ name: `${classRef.name}Data` })
  class DataDto {
    @Expose()
    @ApiProperty()
    @Transform(({ obj }) => obj?.id)
    id: string;

    @Expose()
    @ApiProperty()
    @Transform(({ obj }) => obj?.type || classRef.name)
    type: string;

    @Expose()
    @ApiProperty({ type: AttributesDto })
    @Type(() => AttributesDto)
    @Transform(({ obj }) => ({ ...obj }))
    attributes: AttributesDto;
  }

  @ApiSchema({ name: `${classRef.name}Meta` })
  class MetaDto {
    @Expose()
    @ApiProperty()
    totalItems: number;

    @Expose()
    @ApiProperty()
    totalPages: number;

    @Expose()
    @ApiProperty()
    currentPage: number;
  }

  if (isArray) {
    @ApiSchema({ name: `${classRef.name}ListJsonApi` })
    class JsonApiDto {
      @Expose()
      @ApiProperty({ type: [DataDto] })
      @Type(() => DataDto)
      @Transform(({ obj }) => obj?.data ?? obj)
      data: DataDto[];

      @Expose()
      @ApiProperty({ type: MetaDto })
      @Type(() => MetaDto)
      meta: MetaDto;
    }
    type = JsonApiDto;
  } else {
    @ApiSchema({ name: `${classRef.name}JsonApi` })
    class JsonApiDto {
      @Expose()
      @ApiProperty({ type: DataDto })
      @Type(() => DataDto)
      @Transform(({ obj }) => obj?.data ?? obj)
      data: DataDto;
    }
    type = JsonApiDto;
  }

  return applyDecorators(
    ApiResponse({ status: 200, type, ...options?.api }),
    SerializeOptions({ type, ...options?.serializer }),
  );
}
