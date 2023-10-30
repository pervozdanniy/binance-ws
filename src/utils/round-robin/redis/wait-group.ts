import { Injectable } from '@nestjs/common';
import { RedisService } from '@utils/redis.service';

@Injectable()
export class RedisWaitGroup {
  #addHash?: string;
  #releaseHash?: string;

  constructor(private readonly redis: RedisService) {
    this.#registerScripts().catch(() => {});
  }

  async #registerScripts() {
    const client = await this.redis.get();
    this.#addHash = await client.scriptLoad(
      `local v = redis.call('LLEN', KEYS[1]); if v == 0 then return redis.call('LPUSH', KEYS[1], ARGV[1]); else return 0; end;`,
    );
    this.#releaseHash = await client.scriptLoad(
      `if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
          return 0
      end`,
    );
  }

  async lock(key: string, id: string) {
    const client = await this.redis.get();
    const res = await client.set(key, id, { NX: true, PX: 10000 });

    return res === 'OK';
  }

  async release(key: string, id: string) {
    const client = await this.redis.get();
    await client.evalSha(this.#releaseHash, { keys: [key], arguments: [id] });
  }

  async add(queue: string) {
    const client = await this.redis.get();
    await client.evalSha(this.#addHash, { keys: [queue], arguments: ['1'] });
  }

  async wait(queue: string, timeout = 0) {
    const client = await this.redis.get();
    await client.brPop(queue, timeout);
  }
}
