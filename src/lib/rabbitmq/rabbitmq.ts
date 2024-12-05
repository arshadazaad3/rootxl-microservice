import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { exchanges } from '../../constants/queue-exchanges';
import { queues } from '../../constants/queues';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = [configService.get<string>('queue.url', { infer: true }) || 'amqp://localhost:5672'];
        if (!uri) {
          throw new Error('RabbitMQ URL is not defined');
        }
        return {
          uri,
          exchanges: exchanges,
          queues: queues,
          name: configService.get<string>('app.consumerTag', { infer: true }) || 'portal_api_service',
          consumerTag: configService.get<string>('app.consumerTag', { infer: true }) || 'portal_api_service',
          connectionInitOptions: { wait: false }
        };
      },
      inject: [ConfigService]
    })
  ],
  exports: [RabbitMQModule]
})
export class RabbitMqModule {}
