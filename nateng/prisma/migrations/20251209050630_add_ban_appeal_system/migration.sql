-- CreateTable
CREATE TABLE "Appeal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "appealReason" TEXT NOT NULL,
    "appealDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "adminNotes" TEXT,
    CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_userId_status_key" ON "Appeal"("userId", "status");
