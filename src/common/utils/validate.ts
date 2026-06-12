import { type ClassTransformOptions, plainToInstance } from 'class-transformer';
import { type ValidatorOptions, validateSync } from 'class-validator';

export function validateClass<T extends object>(
  cls: new () => T,
  values: Record<string, unknown>,
  options: {
    transformer?: ClassTransformOptions;
    validator?: ValidatorOptions;
  } = {},
): T {
  const instance = plainToInstance(cls, values, {
    enableImplicitConversion: true,
    ...options.transformer,
  });

  const errors = validateSync(instance, {
    skipMissingProperties: false,
    validationError: { target: false, value: true },
    ...options.validator,
  });

  if (errors.length > 0) {
    throw new Error(`${cls.name} validation failed: ${errors.toString()}`);
  }

  return instance;
}
