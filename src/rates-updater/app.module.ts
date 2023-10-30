import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@utils/prisma/prisma.service';
import { RedisWaitGroup } from '@utils/round-robin/redis/wait-group';
import { BinanceService } from './binance.service';
import { RedisService } from '@utils/redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, RedisService, RedisWaitGroup, BinanceService, ConfigService],
})
export class AppModule {}
