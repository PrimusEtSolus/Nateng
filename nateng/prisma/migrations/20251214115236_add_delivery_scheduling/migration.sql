-- CreateTable
CREATE TABLE "DeliverySchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "proposedBy" INTEGER NOT NULL,
    "confirmedBy" INTEGER,
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "route" TEXT,
    "isCBD" BOOLEAN NOT NULL DEFAULT false,
    "truckWeightKg" INTEGER,
    "deliveryAddress" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeliverySchedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliverySchedule_proposedBy_fkey" FOREIGN KEY ("proposedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliverySchedule_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySchedule_orderId_key" ON "DeliverySchedule"("orderId");
