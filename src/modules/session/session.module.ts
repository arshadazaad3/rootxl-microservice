import { Module } from '@nestjs/common';

import { SessionService } from './session.service';
import { SessionDbModule } from '../../database/repositories/core/sessions/session.db.module';

@Module({
  imports: [SessionDbModule],
  providers: [SessionService],
  exports: [SessionService, SessionDbModule]
})
export class SessionModule {}
