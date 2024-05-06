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
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return false;
    }

    const connectedSockets = this.userToSocket.get(user.id) || [];
    this.userToSocket.set(user.id, [...connectedSockets, ws]);

    this.channelsForUser(user.id).then((channelNames) => {
      this.subscriber.subscribe(channelNames);
    });

    return true;
  };

  removeUserSocket = async (userId, ws) => {
    const connectedSockets = this.userToSocket.get(userId);

    if (!connectedSockets) return;

    // remove just this websocket from the list of connected sockets
    const remainingSockets = connectedSockets.filter((socket) => socket !== ws);

    // if the removal is the last socket, remove the user from the map
    if (remainingSockets.length > 0) {
      this.userToSocket.set(userId, remainingSockets);
    } else {
      this.userToSocket.delete(userId);
    }

    this.channelsForUser(userId).then((channelNames) => {
      this.subscriber.unsubscribe(channelNames);
    });
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
