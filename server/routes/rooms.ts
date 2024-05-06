import { Router } from 'express';
import UsersRouter from './rooms/users';
import MessagesRouter from './rooms/messages';
import prisma from '../prisma';
import Room from '../room';

const router = Router();

router.post('/', async (req, res) => {
  // deserialize the request body into JSON object
  const { name, userId } = req.body;

  if (!name || !userId) {
    res.status(400).json({ error: 'Name and userId are required' });
    return;
  }

  // upsert a room
  const roomDb = await prisma.room.upsert({
    where: { name: name },
    update: {},
    create: { name: name },
  });

  const room = new Room(roomDb.id);
  room.addUser(parseInt(userId)).then(() => {
    res.json(roomDb);
  });
});

router.get('/', (req, res) => {
  prisma.room.findMany().then((rooms) => {
    res.json(rooms);
  });
});

router.delete('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  // remove users from the room
  await prisma.userInRoom.deleteMany({
    where: { roomId: parseInt(roomId) },
  });

  await prisma.room.delete({
    where: { id: parseInt(roomId) },
  });

  res.json({ status: 'ok' });
});

router.use('/:roomId/messages', MessagesRouter);
router.use('/:roomId/users', UsersRouter);

export default router;
