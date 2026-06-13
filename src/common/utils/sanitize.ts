const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'authorization',
  'cookie',
  'set-cookie',
];

export function sanitize<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item: unknown) => sanitize(item)) as unknown as T;
  }

  const sanitized = { ...data } as Record<string, unknown>;

  for (const key in sanitized) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized as T;
}
