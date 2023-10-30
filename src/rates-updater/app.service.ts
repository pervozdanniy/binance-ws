import { RedisWaitGroup } from '@utils/round-robin/redis/wait-group';
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { BinanceService, Price } from './binance.service';
import * as crypro from 'node:crypto';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  #id: string;
  #locked: boolean;

  constructor(
    private prisma: PrismaService,
    private waitGroup: RedisWaitGroup,
    private binance: BinanceService,
  ) {
    this.#id = crypro.randomBytes(8).toString('hex');
  }

  onApplicationBootstrap() {
    this.subscribe()
      .then(() => this.waitGroup.lock('binance:mutex', this.#id))
      .then((locked) => {
        this.#locked = locked;
        if (locked) {
          return this.waitGroup.add('binance:queue');
        }
      })
      .then(() => this.process());
  }

  async onApplicationShutdown() {
    if (this.#locked) {
      await this.waitGroup.release('binance:mutex', this.#id);
    }
  }

  private async subscribe() {
    const symbols = await this.list();
    await this.binance.connect();
    this.binance.addSymbols(symbols.map(({ name }) => name));
  }

  private async process() {
    await this.waitGroup.wait('binance:queue');
    let processed = 0;
    const onPrice = async (data: Price) => {
      await this.updateCache(data);
      if (++processed > 10) {
        this.binance.off('price', onPrice);
        await this.waitGroup.add('binance:queue');

        this.process();
      }
    };
    this.binance.on('price', onPrice);
  }

  async updateCache(data: Price): Promise<void> {
    console.log(data);
  }

  list() {
    return this.prisma.symbol.findMany();
  }

  async add(symbols: string[]) {
    await this.prisma.symbol.createMany({ data: symbols.map((name) => ({ name })) });
    this.binance.addSymbols(symbols);
  }

  async remove(symbols: string[]) {
    await this.prisma.symbol.deleteMany({ where: { name: { in: symbols } } });
    this.binance.removeSymbols(symbols);
  }
}
