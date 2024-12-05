import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleController } from './auth-google.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [AuthGoogleService],
  exports: [AuthGoogleService],
  controllers: [AuthGoogleController]
})
export class AuthGoogleModule {}
