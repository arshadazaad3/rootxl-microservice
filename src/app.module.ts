import { Module } from '@nestjs/common';
import path from 'path';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AllConfigType } from './config/config.type';
import configs from './config';

import RouterModule from './modules/router.module';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from './services/mailer/mailer.module';
import { CustomCacheModule } from './services/cache/cache.module';
import { CommonModule } from './common/common.module';
import { RabbitMqModule } from './lib/rabbitmq';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      verboseMemoryLeak: true,
      global: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: ['.env']
    }),
    CustomCacheModule.register(), // Use the custom cache module

    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true }
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true
              })
            ];
          },
          inject: [ConfigService]
        }
      ],
      imports: [ConfigModule],
      inject: [ConfigService]
    }),
    RabbitMqModule,
    CommonModule,
    MailModule,
    MailerModule,
    RouterModule
  ]
})
export class AppModule {}
