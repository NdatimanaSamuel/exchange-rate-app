import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module'; // <-- Add this
import { RateModule } from './rate/rate.module';
import { CurrencyModule } from './currency/currency.module';
import { AssignCashModule } from './assign-cash/assign-cash.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RateModule,
    CurrencyModule,
    AssignCashModule,
    TransactionsModule,
  ], // <-- Add PrismaModule here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
