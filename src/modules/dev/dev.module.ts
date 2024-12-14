import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMqModule } from 'lib/rabbitmq';

import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { HttpModule } from '@nestjs/axios';
import { DevEventsListener } from './dev.events.listener';

@Module({
  imports: [ConfigModule, RabbitMqModule, HttpModule],
  controllers: [DevController],
  providers: [DevService, DevEventsListener]
})
export class DevModule {}
