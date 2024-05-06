import Redis from 'ioredis';

class Publisher {
  redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  publish(channel, message) {
    this.redis.publish(channel, message);
  }

  close() {
    this.redis.disconnect();
  }
};

export default new Publisher();
