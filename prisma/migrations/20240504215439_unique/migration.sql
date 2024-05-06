/*
  Warnings:

  - A unique constraint covering the columns `[roomId,userId]` on the table `UserInRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserInRoom_roomId_userId_key" ON "UserInRoom"("roomId", "userId");
