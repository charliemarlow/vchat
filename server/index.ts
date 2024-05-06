import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import SocketServer from './socketServer';
import UsersRouter from './routes/users';
import RoomsRouter from './routes/rooms';
import prisma from './prisma';
import publisher from './publisher';

const app = express();

// middleware
let corsOptions = {
  origin : ['http://localhost:5173'],
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dist")))

// routes
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});
app.use('/users', UsersRouter);
app.use('/rooms', RoomsRouter);

// listen for API and WebSocket connections
const apiPort = 3000;
const socketPort = 8080;
const wss = new SocketServer(socketPort);
const server = app.listen(apiPort, () => {
  console.log(`Server is running on http://localhost:${apiPort}`);
});

// gracefully shut down the server
const shutDown = async () => {
  console.log('Shutting down server');

  await prisma.$disconnect();
  publisher.close();
  wss.close();
  server.close((err) => {
    console.log('Server is shut down', err);
    process.exit(err ? 1 : 0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000); // 5 seconds
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
