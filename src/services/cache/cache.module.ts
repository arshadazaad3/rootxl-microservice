import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [ConfigModule],
  exports: [CacheModule]
})
export class CustomCacheModule {
  static register() {
    return CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get<string>('cache.host', { infer: true }),
        port: configService.get<number>('cache.port', { infer: true }),
        password: configService.get<number>('cache.password', { infer: true }),
        prefix: configService.get<number>('cache.prefix', { infer: true }),
        no_ready_check: true // new property // ReplyError: Ready check failed: NOAUTH Authentication required
      })
    });
  }
}
