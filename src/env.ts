export function getEnvFilePaths() {
  const NODE_ENV = process.env.NODE_ENV;
  if (!NODE_ENV) throw new Error('getEnvFilePaths: NODE_ENV is not defined');
  return [`.env.${NODE_ENV}.local`, `.env.local`, `.env.${NODE_ENV}`, '.env'];
}
