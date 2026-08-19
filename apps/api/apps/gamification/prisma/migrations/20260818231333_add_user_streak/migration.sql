-- CreateTable
CREATE TABLE "UserStreak" (
    "userCode" TEXT NOT NULL,
    "streakCurrent" INTEGER NOT NULL DEFAULT 0,
    "streakBest" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("userCode")
);

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "UserXp"("userCode") ON DELETE CASCADE ON UPDATE CASCADE;
