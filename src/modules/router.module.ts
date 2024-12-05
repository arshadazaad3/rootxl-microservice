import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionModule } from './session/session.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { DevModule } from './dev/dev.module';

@Module({
  controllers: [],
  providers: [],
  imports: [HomeModule, AuthModule, AuthGoogleModule, UsersModule, SessionModule, DevModule]
})
export default class RouterModule {}
