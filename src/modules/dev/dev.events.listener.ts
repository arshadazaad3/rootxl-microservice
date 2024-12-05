import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DEV_EVENTS } from './constants/dev.constants';

@Injectable()
export class DevEventsListener {
  private readonly logger = new Logger(DevEventsListener.name);

  constructor() {}

  @OnEvent(DEV_EVENTS.EVENT_EMITTER_TEST)
  handleDevTestEventEmitter(data: any) {
    try {
      const { testId } = data;
      this.logger.log(`testId: ${testId}`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
