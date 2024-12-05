import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

import validateConfig from 'utils/validate-config';

import { QueueConfig } from './queue-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  RABBITMQ_QUEUE_URL: string;
}

export default registerAs<QueueConfig>('queue', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.RABBITMQ_QUEUE_URL || 'amqp://localhost:5672'
  };
});
