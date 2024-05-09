import { WebSocket } from 'ws';
import prisma from './prisma';
import Subscriber from './subscriber';
import Room from './room';

export default class UserManager {
  private subscriber: Subscriber;

  constructor() {
    this.subscriber = new Subscriber();
    this.subscriber.listen(this.distributeMessage.bind(this));
  }

  close = () => {
    this.subscriber.close();
  }

  addUserSocket = async (userId, ws) => {
    console.log('ADDING SOCKET', userId, ws.id);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || ws.readyState !== WebSocket.OPEN) {
      // early exit if the socket is already closed
      console.log('Socket closed before adding', ws.id);
      return false;
    }

    const channelNames = await this.channelsForUser(user.id);

    if (ws.readyState !== WebSocket.OPEN) {
      // early exit if the socket is already closed
      console.log('Socket closed before subscribing', ws.id);
      return false;
    }
    console.log('Go to subscribe', channelNames, ws.id);
    ws.subscribed = true;
    this.subscriber.subscribe(channelNames, ws);

    return true;
  };

  removeUserSocket = async (userId, ws) => {
    console.log('REMOVING SOCKET', userId, ws.id);

    const channelNames = await this.channelsForUser(userId)

    if (!ws.subscribed) {
      // If the socket closed before subscribing, then we
      // don't need to unsubscribe
      console.log('No need to unsubscribe', ws.id);
      return;
    }
    console.log('Go to unsubscribe', channelNames, ws.id);
    this.subscriber.unsubscribe(channelNames, ws);
  };

  private distributeMessage = async (channel, message) => {
    const { roomId, id } = JSON.parse(message);

    console.log('RECEIVED MESSAGE', roomId, id, channel);
    const msg = await prisma.message.findUnique({
      where: { id: id }
    });

    const sockets = this.subscriber.socketsForChannel(channel);
    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg));
      }
    });
  }

  private channelsForUser = async (userId) => {
    const userInRooms = await prisma.userInRoom.findMany({
      where: { userId: userId },
    });

    const roomIds = userInRooms.map((uir) => uir.roomId);
    return roomIds.map((roomId) => {
      return `room-${roomId}`;
    });
  }
}
