import { WebSocketServer } from 'ws';
import UserManager from './userManager';
import { v4 as uuidv4 } from 'uuid';

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
      if (ws.isAlive === false) {
        console.log('Terminating connection to user %s', ws.userId);
        ws.terminate();
        this.userManager.removeUserSocket(ws.userId, ws);
        return;
      }

      ws.isAlive = false;
      ws.ping();
    });
  }

  private onSocketConnection = async (ws, req) => {
    const userId = Number(req.url?.split('/')[1]);
    ws.id = uuidv4();
    this.userManager.addUserSocket(userId, ws)
      .then((success) => {
        if (success) return;
        ws.close();
      });

    ws.isAlive = true;
    ws.userId = userId;

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
