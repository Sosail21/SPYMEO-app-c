-- CreateTable
CREATE TABLE IF NOT EXISTS "agenda_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agenda_blocks_userId_idx" ON "agenda_blocks"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agenda_blocks_startAt_idx" ON "agenda_blocks"("startAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agenda_blocks_endAt_idx" ON "agenda_blocks"("endAt");

-- AddForeignKey
ALTER TABLE "agenda_blocks" ADD CONSTRAINT "agenda_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
