import { Router } from 'express';
import prisma from '../prisma';
import Room from '../room';

const router = Router();

router.post('/', async (req, res) => {
  // deserialize the request body into JSON object
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  // create a user, connecting to "main" room
  const user = await prisma.user.upsert({
    where: { name: name },
    update: {},
    create: { name: name },
  });

  const mainRoom = await prisma.room.findFirst({
    where: { name: 'main' },
  });

  if (!mainRoom) {
    res.status(400).json({ error: 'Main room not found' });
    return;
  }

  const room = new Room(mainRoom.id);
  await room.addUser(user.id);

  res.json(user);
});

export default router;
