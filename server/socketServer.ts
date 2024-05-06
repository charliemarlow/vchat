import { WebSocketServer } from 'ws';
import UserManager from './userManager';

export default class SocketServer {
  private wss: WebSocketServer;
  private userManager: UserManager;
  private pingInterval: NodeJS.Timeout;

  constructor(port) {
    this.wss = new WebSocketServer({ port });
    this.userManager = new UserManager();

    this.wss.on('connection', this.onSocketConnection.bind(this));
    this.pingInterval = setInterval(this.pingSockets.bind(this), 30000);
  }

  close() {
    this.wss.close();
    this.userManager.close();
    clearInterval(this.pingInterval);
  }

  private pingSockets = async () => {
    this.wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }

  private onSocketConnection = async (ws, req) => {
    const userId = Number(req.url?.split('/')[1]);
    const found = await this.userManager.addUserSocket(userId, ws);

    if (!found) {
      ws.close();
      return;
    }

    ws.isAlive = true;

    ws.on('error', console.error);

    ws.on('message', (data) => {
      console.log('Unexpectedly received: %s for user %s', data, userId);
    });

    ws.on('close', () => {
      console.log('User %s disconnected', userId);
      this.userManager.removeUserSocket(userId, ws);
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }
}
