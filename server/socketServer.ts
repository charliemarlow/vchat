import { WebSocket, WebSocketServer } from 'ws';
import prisma from './prisma';
import Subscriber from './subscriber';
import Room from './room';

export default class SocketServer {
  private wss: WebSocketServer;
  private userToSocket: Map<number, WebSocket[]>;
  private subscriber: Subscriber;
  private pingInterval: NodeJS.Timeout;

  constructor(port) {
    this.wss = new WebSocketServer({ port });
    this.subscriber = new Subscriber();
    this.userToSocket = new Map();

    this.wss.on('connection', this.onSocketConnection.bind(this));
    this.subscriber.listen(this.distributeMessage.bind(this));
    this.pingInterval = setInterval(this.pingSockets.bind(this), 30000);
  }

  close() {
    this.wss.close();
    this.subscriber.close();
    clearInterval(this.pingInterval);
  }

  private pingSockets = async () => {
    this.wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }

  private async distributeMessage(channel, message) {
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

  private onSocketConnection = async (ws, req) => {
    const userId = Number(req.url?.split('/')[1]);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      ws.close();
      return;
    }

    ws.isAlive = true;
    this.subscribeToRooms(user, ws);

    ws.on('error', console.error);

    ws.on('message', (data) => {
      console.log('Unexpectedly received: %s for user %s', data, userId);
    });

    ws.on('close', () => {
      if (!user) return;
      console.log('User %s disconnected', user.id);
      this.unsubscribeFromRooms(user, ws);
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }

  private subscribeToRooms = (user, ws) => {
    const connectedSockets = this.userToSocket.get(user.id) || [];
    this.userToSocket.set(user.id, [...connectedSockets, ws]);

    this.channelsForUser(user).then((channelNames) => {
      this.subscriber.subscribe(channelNames);
    });
  }

  private unsubscribeFromRooms = (user, ws) => {
    const connectedSockets = this.userToSocket.get(user.id) || [];
    // remove just this websocket from the list of connected sockets
    const remainingSockets = connectedSockets.filter((socket) => socket !== ws);

    // if the removal is the last socket, remove the user from the map
    if (remainingSockets.length > 0) {
      this.userToSocket.set(user.id, remainingSockets);
    } else {
      this.userToSocket.delete(user.id);
    }

    this.channelsForUser(user).then((channelNames) => {
      this.subscriber.unsubscribe(channelNames);
    });
  }

  private channelsForUser = async (user) => {
    const userInRooms = await prisma.userInRoom.findMany({
      where: { userId: user.id },
    });

    const roomIds = userInRooms.map((uir) => uir.roomId);
    return roomIds.map((roomId) => {
      return `room-${roomId}`;
    });
  }
}
