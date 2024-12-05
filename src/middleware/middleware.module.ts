import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AppLoggerMiddleware } from 'common/interceptors/app.interceptor';

import { UserAgentMiddleware } from './user-agent/user-agent.middleware';
import { CorsMiddleware } from './cors/cors.middleware';
import { ResponseTimeMiddleware } from './response-time/response-time.middleware';
import { RequestIdMiddleware } from './request-id/request-id.middleware';

@Module({})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AppLoggerMiddleware, UserAgentMiddleware, CorsMiddleware, ResponseTimeMiddleware, RequestIdMiddleware)
      .forRoutes('*');
  }
}
