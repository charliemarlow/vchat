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
    console.log('PubSub subscription counts', this.subscriptionCounts);
  }

  subscribe(channels) {
    channels.forEach((channel) => {
      const count = this.subscriptionCounts.get(channel) || 0;
      if (count > 0) {
        this.subscriptionCounts.set(channel, count + 1);
      } else {
        this.subscriptionCounts.set(channel, 1);
        console.log('REDIS subscribe', channel);
        this.redis.subscribe(channel);
      }
    });
    console.log('PubSub subscription counts', this.subscriptionCounts);
  }
}
