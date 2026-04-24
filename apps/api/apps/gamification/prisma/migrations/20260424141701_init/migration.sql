-- CreateTable
CREATE TABLE "UserXp" (
    "userCode" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserXp_pkey" PRIMARY KEY ("userCode")
);

-- CreateTable
CREATE TABLE "XpTransaction" (
    "id" BIGSERIAL NOT NULL,
    "userCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XpTransaction_userCode_createdAt_idx" ON "XpTransaction"("userCode", "createdAt");

-- AddForeignKey
ALTER TABLE "XpTransaction" ADD CONSTRAINT "XpTransaction_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "UserXp"("userCode") ON DELETE CASCADE ON UPDATE CASCADE;
