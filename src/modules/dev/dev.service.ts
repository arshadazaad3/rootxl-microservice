import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

import { PrimaryConnection } from '@db/connections';
import { UserSchemaClass } from '@db/repositories/core';

import { AllConfigType } from 'config/config.type';
import { QueueExchanges, QueueNames, QueueRoutingKeys } from 'lib/rabbitmq';

import { UsersService } from '../users/users.service';
import { DEV_EVENTS } from './constants/dev.constants';

@Injectable()
export class DevService {
  private readonly logger = new Logger(DevService.name);

  constructor(
    // private usersService: UsersService,
    private configService: ConfigService<AllConfigType>,
    // private readonly usersRepository: UserRepository,
    private readonly amqpConnection: AmqpConnection,
    private readonly httpService: HttpService,
    private eventEmitter: EventEmitter2,

    @Inject(CACHE_MANAGER)
    private cacheService: Cache,

    @InjectModel(UserSchemaClass.name, PrimaryConnection)
    private readonly userModel: Model<UserSchemaClass>
  ) {}

  async testMethod() {
    const data = await this.userModel.find({});
    return { status: 'ok', data };
  }

  async testPublishQueueMessage(body: any): Promise<any> {
    await this.amqpConnection.publish(QueueExchanges.DEV_TEST, QueueRoutingKeys.DEV_TEST.TEST, body);
    return true;
  }

  async testPublishDirectQueueMessage(body: any): Promise<any> {
    const correlationId = uuidv4();
    const replyQueue = QueueNames.REPLY_TO;

    return new Promise((resolve, reject) => {
      this.amqpConnection
        .request({
          exchange: QueueExchanges.DEV_TEST,
          routingKey: QueueRoutingKeys.DEV_TEST.DIRECT_REPLY,
          payload: body,
          publishOptions: {
            replyTo: replyQueue
          },
          correlationId
        })
        .then((response) => {
          this.logger.log(`Received reply: ${response}`);
          resolve(response);
        })
        .catch((error) => {
          this.logger.error(`Failed to receive reply: ${error.message}`);
          reject(error);
        });
    });
  }

  @RabbitRPC({
    exchange: QueueExchanges.DEV_TEST,
    routingKey: QueueRoutingKeys.DEV_TEST.TEST
  })
  public consumeTestQueueMessage(body: any) {
    this.logger.log(`test: ${JSON.stringify(body)}`);
  }

  @RabbitRPC({
    exchange: QueueExchanges.DEV_TEST,
    routingKey: QueueRoutingKeys.DEV_TEST.DIRECT_REPLY
  })
  public consumeDirectQueueMessage(body: any) {
    this.logger.log(`direct: ${JSON.stringify(body)}`);
    return {
      response: 'ok direct rec',
      message: body
    };
  }

  async testCacheData(id: number): Promise<string> {
    const cacheId = `test_cache_${id}`;
    // check if data is in cache:
    const cachedData = await this.cacheService.get<{ name: string }>(cacheId);
    if (cachedData) {
      this.logger.log(`getting info from cache: name: ${cachedData?.name}`);
      return `${cachedData.name}`;
    }

    // if not, call API and set the cache:
    const { data } = await this.httpService.axiosRef.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    this.logger.log(`getting info from axios: name: ${data?.name}`);
    await this.cacheService.set(cacheId, { name: data?.name || null });
    return `${data.name}`;
  }

  testEventEmitter(): boolean {
    this.eventEmitter.emit(DEV_EVENTS.EVENT_EMITTER_TEST, { testId: 'abcd' });
    return true;
  }
}
