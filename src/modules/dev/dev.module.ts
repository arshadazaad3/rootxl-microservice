import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserDbModule } from 'database/repositories/core';
import { BotDbModule } from 'database/repositories/chatbot';
import { RabbitMqModule } from 'lib/rabbitmq';

import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { HttpModule } from '@nestjs/axios';
import { DevEventsListener } from './dev.events.listener';

@Module({
  imports: [ConfigModule, UserDbModule, BotDbModule, RabbitMqModule, HttpModule],
  controllers: [DevController],
  providers: [DevService, DevEventsListener]
})
export class DevModule {}
