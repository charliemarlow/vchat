/*
  Warnings:

  - You are about to drop the column `authorId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authorId",
DROP COLUMN "content",
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
