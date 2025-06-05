import { Module } from '@nestjs/common';
import { AssignCashService } from './assign-cash.service';
import { AssignCashController } from './assign-cash.controller';

@Module({
  controllers: [AssignCashController],
  providers: [AssignCashService],
})
export class AssignCashModule {}
