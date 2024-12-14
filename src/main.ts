import 'dotenv/config';
import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { WinstonModule } from 'nest-winston';
import { LoggerOptions } from 'winston';

import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import CustomLogger from './lib/logger/customLogger';

async function bootstrap() {
  const customLoggerService = new CustomLogger();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger(customLoggerService.createLoggerConfig as LoggerOptions)
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.getOrThrow('app.apiPrefix', { infer: true }), {
    exclude: ['/']
  });
  app.enableVersioning({
    type: VersioningType.URI
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('rootxl-microservice')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/docs-json')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const logger = new Logger('App');

  const port = configService.getOrThrow('app.port', { infer: true });
  await app.listen(port);
  logger.log(
    `app: ${configService.getOrThrow('app.name', { infer: true })} listening on port: ${port} | env: ${configService.getOrThrow('app.nodeEnv', { infer: true })}`
  );
}

void bootstrap();
