import { RabbitMQQueueConfig } from '@golevelup/nestjs-rabbitmq';

import { QueueExchanges } from './queue-exchanges';

export const QueueRoutingKeys = Object.freeze({
  DEV_TEST: Object.freeze({
    TEST: 'dev_test.test',
    DIRECT_REPLY: 'dev_test.direct.reply'
  }),
  USER: Object.freeze({
    REGISTER: 'user.register',
    DELETE: 'user.delete'
  })
});

export const QueueNames = {
  USER: {
    QUEUE: 'users'
  },
  DEV_TEST: {
    QUEUE: 'dev_test'
  },
  REPLY_TO: 'amq.rabbitmq.reply-to' // predefined for direct replies
};

export const queues: RabbitMQQueueConfig[] = [
  {
    name: QueueNames.DEV_TEST.QUEUE,
    exchange: QueueExchanges.DEV_TEST,
    routingKey: QueueRoutingKeys.DEV_TEST.TEST,
    options: {
      durable: true
    }
  },
  {
    name: QueueNames.DEV_TEST.QUEUE,
    exchange: QueueExchanges.DEV_TEST,
    routingKey: QueueRoutingKeys.DEV_TEST.DIRECT_REPLY,
    options: {
      durable: true
    }
  },
  {
    name: QueueNames.USER.QUEUE,
    exchange: QueueExchanges.USER,
    routingKey: QueueRoutingKeys.USER.REGISTER,
    options: {
      durable: true
    }
  }
];
