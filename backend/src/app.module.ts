import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module'; // <-- Add this
import { RateModule } from './rate/rate.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, RateModule], // <-- Add PrismaModule here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
