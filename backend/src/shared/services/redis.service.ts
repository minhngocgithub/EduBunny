import Redis from "ioredis";
import { logger } from "../utils/logger.utils";
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

type RedisSerializable = JsonValue | Record<string, JsonValue>;

class RedisService {
    private client: Redis | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        try {
            const config = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD || undefined,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    logger.warn(`Redis connection lost. Attempting to reconnect in ${delay}ms...`);
                    return delay;
                },
                maxRetriesPerRequest: 3
            };

            this.client = new Redis(config);

            this.client.on('connect', () => {
                logger.info('Connected to Redis');
                this.isConnected = true;
            });
            this.client.on('error', (err) => {
                logger.error('Redis error:', err);
                this.isConnected = false;
            });
            this.client.on('close', () => {
                logger.warn('Redis connection closed');
                this.isConnected = false;
            });
            this.client.on('reconnecting', (delay: unknown) => {
                logger.warn(`Redis reconnecting in ${delay}ms...`);
            });

            await new Promise<void>((resolve, reject) => {
                if (!this.client) return reject(new Error('Redis client not initialized'));

                this.client.once('ready', () => {
                    this.isConnected = true;
                    logger.info('Redis connection verified (ready)');
                    resolve();
                });

                this.client.once('error', (err) => {
                    reject(err);
                });
            });

        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
            logger.info('Disconnected from Redis');
        }
    }

    getClient(): Redis {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client is not connected');
        }
        return this.client;
    }

    isReady(): boolean {
        return this.isConnected && this.client !== null;
    }

    async set(key: string, value: RedisSerializable, ttlSeconds?: number): Promise<void> {
        const client = this.getClient();
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttlSeconds) {
            await client.set(key, stringValue, 'EX', ttlSeconds);
        } else {
            await client.set(key, stringValue);
        }
    }

    async get<T = RedisSerializable>(key: string, parseJson = true): Promise<T | null> {
        const client = this.getClient();
        const value = await client.get(key);

        if (!value) return null;

        if (parseJson) {
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        }

        return value as unknown as T;
    }

    async delete(key: string): Promise<boolean> {
        const client = this.getClient();
        const result = await client.del(key);
        return result > 0;
    }

    async exists(key: string): Promise<boolean> {
        const client = this.getClient();
        const result = await client.exists(key);
        return result === 1;
    }

    async expire(key: string, seconds: number): Promise<boolean> {
        const client = this.getClient();
        const result = await client.expire(key, seconds);
        return result === 1;
    }

    async ttl(key: string): Promise<number> {
        const client = this.getClient();
        return await client.ttl(key);
    }

    async hSet(key: string, field: string, value: RedisSerializable): Promise<void> {
        const client = this.getClient();
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await client.hset(key, field, stringValue);
    }

    async hGet<T = RedisSerializable>(key: string, field: string, parseJson = true): Promise<T | null> {
        const client = this.getClient();
        const value = await client.hget(key, field);

        if (!value) return null;

        if (parseJson) {
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        }

        return value as unknown as T;
    }

    async hGetAll(key: string): Promise<Record<string, string>> {
        const client = this.getClient();
        return await client.hgetall(key);
    }

    async hDelete(key: string, field: string): Promise<boolean> {
        const client = this.getClient();
        const result = await client.hdel(key, field);
        return result > 0;
    }

    async lPush(key: string, ...values: RedisSerializable[]): Promise<number> {
        const client = this.getClient();
        const stringValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
        return await client.lpush(key, ...stringValues);
    }

    async rPush(key: string, ...values: RedisSerializable[]): Promise<number> {
        const client = this.getClient();
        const stringValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
        return await client.rpush(key, ...stringValues);
    }

    async lRange<T = RedisSerializable>(key: string, start: number, stop: number, parseJson = true): Promise<T[]> {
        const client = this.getClient();
        const values = await client.lrange(key, start, stop);

        if (parseJson) {
            return values.map(v => {
                try {
                    return JSON.parse(v) as T;
                } catch {
                    return v as unknown as T;
                }
            });
        }

        return values as unknown as T[];
    }

    async zAdd(key: string, score: number, member: string): Promise<number> {
        const client = this.getClient();
        return await client.zadd(key, score, member);
    }

    async zIncrBy(key: string, increment: number, member: string): Promise<string> {
        const client = this.getClient();
        return await client.zincrby(key, increment, member);
    }

    async zRange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
        const client = this.getClient();
        if (withScores) {
            return await client.zrange(key, start, stop, 'WITHSCORES');
        }
        return await client.zrange(key, start, stop);
    }

    async zRevRange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
        const client = this.getClient();
        if (withScores) {
            return await client.zrevrange(key, start, stop, 'WITHSCORES');
        }
        return await client.zrevrange(key, start, stop);
    }

    async zRank(key: string, member: string): Promise<number | null> {
        const client = this.getClient();
        return await client.zrank(key, member);
    }

    async zRevRank(key: string, member: string): Promise<number | null> {
        const client = this.getClient();
        return await client.zrevrank(key, member);
    }

    async zScore(key: string, member: string): Promise<string | null> {
        const client = this.getClient();
        return await client.zscore(key, member);
    }

    async zCard(key: string): Promise<number> {
        const client = this.getClient();
        return await client.zcard(key);
    }

    async zRem(key: string, member: string): Promise<number> {
        const client = this.getClient();
        return await client.zrem(key, member);
    }


    async keys(pattern: string): Promise<string[]> {
        const client = this.getClient();
        return await client.keys(pattern);
    }

    async flushDb(): Promise<void> {
        const client = this.getClient();
        await client.flushdb();
        logger.warn('Redis database flushed');
    }
}

export const redisService = new RedisService();