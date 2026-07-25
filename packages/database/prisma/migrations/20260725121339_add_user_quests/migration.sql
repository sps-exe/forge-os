-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'QUEST_COMPLETED';

-- CreateTable
CREATE TABLE "user_quests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_quests_userId_weekKey_idx" ON "user_quests"("userId", "weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_quests_userId_questId_weekKey_key" ON "user_quests"("userId", "questId", "weekKey");

-- AddForeignKey
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
