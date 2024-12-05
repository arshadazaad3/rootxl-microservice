import { registerAs } from '@nestjs/config';
import { IsString, IsOptional, IsInt } from 'class-validator';

import validateConfig from 'utils/validate-config';

import { CacheConfig } from './cache-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsInt()
  @IsOptional()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;

  @IsString()
  @IsOptional()
  REDIS_PREFIX: string;
}

export default registerAs<CacheConfig>('cache', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD,
    prefix: process.env.REDIS_PREFIX || 'rootxl'
  };
});
