import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { DevModule } from './dev/dev.module';

@Module({
  controllers: [],
  providers: [],
  imports: [HomeModule, DevModule]
})
export default class RouterModule {}
