import { Router } from 'express';
import Room from '../../room';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { roomId } = req.params;

  const room = new Room(parseInt(roomId));
  room.getMessages().then((messages) => {
    res.json(messages);
  });
});

router.post('/', (req, res) => {
  const { roomId } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text) {
    res.status(400).json({ error: 'userId and text are required' });
    return;
  }

  const room = new Room(parseInt(roomId));
  room.sendMessage(parseInt(userId), text).then(() => {
    res.json({ status: 'ok' });
  });
});

export default router;
