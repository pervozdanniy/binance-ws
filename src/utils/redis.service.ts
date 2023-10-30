import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@redis/client';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  #client?: ReturnType<typeof createClient>;

  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {}

  onApplicationShutdown() {
    return this.#client?.disconnect();
  }

  #connect() {
    const { host, port } = this.config.get('redis');

    const client = createClient({ url: `redis://${host}:${port}` });
    client.on('ready', () => this.logger.verbose('Connected'));
    client.on('error', (err) => this.logger.error('Connection failed', err.message, err));

    return client.connect();
  }

  async get() {
    if (!this.#client) {
      this.#client = await this.#connect();
    }

    return this.#client;
  }
}
