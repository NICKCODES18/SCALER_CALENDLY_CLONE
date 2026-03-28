-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Backfill legacy user for existing EventType rows (e.g. seed userId "1")
INSERT INTO "User" ("id", "email", "name", "updatedAt")
SELECT DISTINCT et."userId", et."userId" || '@legacy.local', 'Legacy user', CURRENT_TIMESTAMP
FROM "EventType" et
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = et."userId");

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
