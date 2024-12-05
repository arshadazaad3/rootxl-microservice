import { Module } from '@nestjs/common';

import { UserDbModule } from 'database/repositories/core/users/user.db.module';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [UserDbModule, FilesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UserDbModule]
})
export class UsersModule {}
