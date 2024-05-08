import Redis from 'ioredis';

export default class Subscriber {
  redis: Redis;
  subscriptionCounts: Map<string, number>;

  constructor() {
    this.redis = new Redis();
    this.subscriptionCounts = new Map();
  }

  listen(callback) {
    this.redis.on('message', callback);
  }

  close() {
    this.redis.disconnect();
  }

  unsubscribe(channels) {
    const singletonChannels = channels.filter((channel) => {
      return this.subscriptionCounts.get(channel) === 1;
    });

    if (singletonChannels.length > 0) {
      console.log('REDIS unsubscribe', singletonChannels);
      this.redis.unsubscribe(singletonChannels);
    }

    channels.forEach((channel) => {
      const count = this.subscriptionCounts.get(channel) || 0;
      if (count > 1) {
        this.subscriptionCounts.set(channel, count - 1);
      } else {
        this.subscriptionCounts.delete(channel);
      }
    });
    console.log('After unsubscribe: subscription counts', this.subscriptionCounts);
  }

  subscribe(channels) {
    const toSubscribe = channels.filter((channel) => {
      return !this.subscriptionCounts.has(channel);
    });

    if (toSubscribe.length > 0) {
      console.log('REDIS subscribe', toSubscribe);
      this.redis.subscribe(toSubscribe);
    }
    channels.forEach((channel) => {
      const count = this.subscriptionCounts.get(channel) || 0;
      this.subscriptionCounts.set(channel, count + 1);
    });
    console.log('After subscribe: subscription counts', this.subscriptionCounts);
  }
}
