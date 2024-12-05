import { Module } from '@nestjs/common';
import { MiddlewareModule } from '../middleware/middleware.module';

@Module({
  controllers: [],
  providers: [],
  imports: [MiddlewareModule]
})
export class CommonModule {}
