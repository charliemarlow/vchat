import Redis from 'ioredis';
import { WebSocket } from 'ws';

export default class Subscriber {
  redis: Redis;
  socketIDsByChannel: Map<string, Set<string>>;
  socketByID: Map<string, WebSocket>;

  constructor() {
    this.redis = new Redis();
    this.socketIDsByChannel = new Map<string, Set<string>>();
    this.socketByID = new Map();
  }

  listen(callback) {
    this.redis.on('message', callback);
  }

  close() {
    this.redis.disconnect();
  }

  socketsForChannel(channel: string) {
    const socketIDs = this.socketIDsByChannel.get(channel);
    const sockets: WebSocket[] = [];

    if (!socketIDs) return sockets;

    socketIDs.forEach((socketID) => {
      const socket: WebSocket = this.socketByID.get(socketID);
      if (socket) sockets.push(socket);
    });

    return sockets;
  }

  unsubscribe(channels: string[], ws) {
    this.socketByID.delete(ws.id);

    const singletonChannels: string[] = [];
    channels.forEach((channel) => {
      const sockets = this.socketIDsByChannel.get(channel) || new Set<string>();

      if (!sockets.has(ws.id)) return;

      sockets.delete(ws.id);
      if (sockets.size > 0) return;

      singletonChannels.push(channel);
      this.socketIDsByChannel.delete(channel);
    });

    console.log('After subscribe: subscription counts', this.socketIDsByChannel);

    if (singletonChannels.length === 0) return;

    console.log('REDIS unsubscribe', singletonChannels);
    this.redis.unsubscribe(...singletonChannels);
  }

  subscribe(channels, ws) {
    this.socketByID.set(ws.id, ws);

    const toSubscribe: string[] = channels.filter((channel) => {
      return !this.socketIDsByChannel.has(channel);
    });
    channels.forEach((channel) => {
      const socketSet = this.socketIDsByChannel.get(channel) || new Set<string>();
      socketSet.add(ws.id);
      this.socketIDsByChannel.set(channel, socketSet);
    });

    console.log('After subscribe: subscription counts', this.socketIDsByChannel);

    if (toSubscribe.length === 0) return;

    console.log('REDIS subscribe', toSubscribe);
    this.redis.subscribe(...toSubscribe);
  }
}
