import { WebSocket } from 'ws';
import prisma from './prisma';
import Subscriber from './subscriber';
import Room from './room';

export default class UserManager {
  private subscriber: Subscriber;
  private userToSocket: Map<number, WebSocket[]>;

  constructor() {
    this.subscriber = new Subscriber();
    this.userToSocket = new Map();
    this.subscriber.listen(this.distributeMessage.bind(this));
  }

  close = () => {
    this.subscriber.close();
  }

  addUserSocket = async (userId, ws) => {
    console.log('ADDING SOCKET', userId, this.userToSocket.get(userId)?.length, ws.id);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || ws.readyState !== WebSocket.OPEN) {
      // early exit if the socket is already closed
      console.log('Socket closed before adding', ws.id);
      return false;
    }

    const connectedSockets = this.userToSocket.get(user.id) || [];
    this.userToSocket.set(user.id, [...connectedSockets, ws]);

    const channelNames = await this.channelsForUser(user.id);

    if (ws.readyState !== WebSocket.OPEN) {
      // early exit if the socket is already closed
      console.log('Socket closed before subscribing', ws.id);
      return false;
    }
    console.log('Go to subscribe', channelNames, ws.id);
    ws.subscribed = true;
    this.subscriber.subscribe(channelNames);

    return true;
  };

  removeUserSocket = async (userId, ws) => {
    const connectedSockets = this.userToSocket.get(userId);
    console.log('REMOVING SOCKET', userId, connectedSockets?.length, ws.id);
    if (!connectedSockets) {
      return;
    }

    // remove just this websocket from the list of connected sockets
    const remainingSockets = connectedSockets.filter((socket) => socket !== ws);
    if (remainingSockets.length === connectedSockets.length) {
      // if the socket was not found, do nothing
      console.log('Socket not found at removal', ws.id);
      return;
    }

    // if the removal is the last socket, remove the user from the map
    if (remainingSockets.length > 0) {
      this.userToSocket.set(userId, remainingSockets);
    } else {
      this.userToSocket.delete(userId);
    }

    const channelNames = await this.channelsForUser(userId)

    if (!ws.subscribed) {
      // If the socket closed before subscribing, then we
      // don't need to unsubscribe
      console.log('No need to unsubscribe', ws.id);
      return;
    }
    console.log('Go to unsubscribe', channelNames, ws.id);
    this.subscriber.unsubscribe(channelNames);
  };

  private distributeMessage = async (channel, message) => {
    const { roomId, id } = JSON.parse(message);

    console.log('RECEIVED MESSAGE', roomId, id, channel);
    const room = new Room(roomId);
    const msg = await prisma.message.findUnique({
      where: { id: id }
    });

    room.getUsers().then((users) => {
      users.forEach((user) => {
        const sockets = this.userToSocket.get(user.id) || [];

        sockets.forEach((socket) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
          }
        });
      });
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
