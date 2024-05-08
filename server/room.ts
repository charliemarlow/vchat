import prisma from './prisma';
import publisher from './publisher';

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

  async getMessages() {
    return prisma.message.findMany({
      where: { roomId: this.roomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(userId: number, text: string) {
    prisma.message.create({
      data: {
        text: text,
        userId: userId,
        roomId: this.roomId,
      }
    }).then((message) => {
      console.log('PUBLISHING MESSAGE', message.id, this.roomId);
      publisher.publish(
        `room-${this.roomId}`,
        JSON.stringify({
          id: message.id,
          roomId: this.roomId,
        }),
      )
    });
  }
}

export default Room;
