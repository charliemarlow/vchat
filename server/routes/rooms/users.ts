import { Router } from 'express';
import prisma from '../../prisma';
import Room from '../../room';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });
    return;
  }

  const room = new Room(parseInt(roomId));
  room.getUsers().then((users) => {
    res.json(users);
  });
});

// Add a user to a room
router.put('/:userId', (req, res) => {
  const { roomId, userId } = req.params;

  const room = new Room(parseInt(roomId));
  room.addUser(parseInt(userId)).then(() => {
    res.json({ status: 'ok' });
  });
});

router.delete('/:userId', (req, res) => {
  const { roomId, userId } = req.params;

  const room = new Room(parseInt(roomId));
  room.removeUser(parseInt(userId)).then(() => {
    res.json({ status: 'ok' });
  });
});

export default router;
