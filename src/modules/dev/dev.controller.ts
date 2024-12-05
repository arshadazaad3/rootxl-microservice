import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DevService } from './dev.service';

@ApiTags('Dev')
@Controller({
  path: 'dev',
  version: '1'
})
export class DevController {
  constructor(private service: DevService) {}

  @Get('test')
  testMethod() {
    return this.service.testMethod();
  }

  @Post('rabbitmq/testPublishQueueMessage')
  rabbitMqTestPublishQueueMessaged(@Body() body: any) {
    return this.service.testPublishQueueMessage(body);
  }

  @Post('rabbitmq/testPublishDirectQueueMessage')
  rabbitMqTestPublishDirectQueueMessaged(@Body() body: any) {
    return this.service.testPublishDirectQueueMessage(body);
  }

  @Get('cache/test-cache/:id')
  testRedisCache(@Param('id') id: number) {
    return this.service.testCacheData(id);
  }

  @Get('events/event-emitter/test')
  testEventEmitter() {
    return this.service.testEventEmitter();
  }
}
