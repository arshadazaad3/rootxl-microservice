import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const QueueExchanges = Object.freeze({
  DEV_TEST: 'dev_test',
  USER: 'users'
});

export const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: QueueExchanges.DEV_TEST,
    type: 'topic',
    options: {
      durable: true
    }
  },
  {
    name: QueueExchanges.USER,
    type: 'topic',
    options: {
      durable: true
    }
  }
];
