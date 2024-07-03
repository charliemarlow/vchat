import prisma from './prisma';
import redis from './redis';
import AI from './ai';

class Room {
  roomId: number;

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  async getUsers() {
    return prisma.userInRoom.findMany({
      where: { roomId: this.roomId },
      include: { user: true },
    }).then((userInRooms) => {
      return userInRooms.map((uir) => uir.user);
    });
  }

  async addUser(userId: number) {
    return prisma.userInRoom.upsert({
      where: { roomId_userId: { userId, roomId: this.roomId } },
      update: {},
      create: { userId, roomId: this.roomId },
    });
  }

  async removeUser(userId: number) {
    return prisma.userInRoom.delete({
      where: { roomId_userId: { userId, roomId: this.roomId } },
    });
  }

  async getMessages(limit = 100) {
    return prisma.message.findMany({
      where: { roomId: this.roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async sendMessage(userId: number, text: string) {
    prisma.message.create({
      data: {
        text: text,
        userId: userId,
        roomId: this.roomId,
      }
    }).then(async (message) => {
      console.log('PUBLISHING MESSAGE', message.id, this.roomId);
      redis.publish(
        `room-${this.roomId}`,
        JSON.stringify({
          id: message.id,
          roomId: this.roomId,
        }),
      )

      if (userId === 1) {
        return;
      }
      const chatHistory = await this.getMessages(10);
      AI.respond(this.roomId, message.id, chatHistory);
    });
  }
}

export default Room;
