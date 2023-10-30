import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { WebSocket } from 'ws';

export type Price = { symbol: string; price: string };

export interface BinanceServiceEvents {
  on(event: 'price', listener: (data: Price) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
}

@Injectable()
export class BinanceService extends EventEmitter implements OnApplicationShutdown, BinanceServiceEvents {
  #nextId = 1;
  #socket?: WebSocket;
  private readonly logger = new Logger(BinanceService.name);

  constructor() {
    super();
  }

  onApplicationShutdown() {
    this.#socket?.terminate();
  }

  connect() {
    this.#socket = new WebSocket('wss://stream.binance.com:9443/ws/@ticker');

    return new Promise((res, rej) => {
      this.#socket
        .once('open', res)
        .once('error', rej)
        .once('close', () => this.connect())
        .on('message', (data) => {
          try {
            const payload = JSON.parse(data.toString('utf8'));
            this.emit('data', payload);
            this.#processMessage(payload);
          } catch (err) {
            this.emit('error', err);
          }
        });
    });
  }

  #processMessage(payload: Record<string, any>) {
    if (payload.id) {
      if (payload.error) {
        this.emit('error', new Error(payload.error.msg));
      }
    } else {
      this.emit('price', { symbol: payload.s, price: payload.c });
    }
  }

  addSymbols(symbols: string[]) {
    this.#socket.send(
      JSON.stringify({
        id: this.#nextId++,
        method: 'SUBSCRIBE',
        params: symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`),
      }),
    );

    return this;
  }

  removeSymbols(symbols: string[]) {
    this.#socket.send(
      JSON.stringify({
        id: this.#nextId++,
        method: 'UNSUBSCRIBE',
        params: symbols.map((symbol) => `${symbol}@ticker`),
      }),
    );

    return this;
  }
}
