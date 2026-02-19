-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "region" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MachineModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    CONSTRAINT "MachineModel_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KitParameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    CONSTRAINT "KitParameter_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemoType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DemoRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "salespersonId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "demoType" TEXT NOT NULL,
    "proposedDate" TEXT NOT NULL,
    "expectedDuration" TEXT NOT NULL,
    "applicationParams" TEXT NOT NULL,
    "sampleVolume" TEXT NOT NULL,
    "specialRequirements" TEXT,
    "kitItems" TEXT NOT NULL,
    "doctorName" TEXT,
    "doctorDepartment" TEXT,
    "hospitalName" TEXT,
    "location" TEXT,
    "businessPotential" TEXT NOT NULL,
    "competitorDetails" TEXT,
    "reasonForDemo" TEXT NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "regionalManagerApproval" BOOLEAN NOT NULL DEFAULT false,
    "regionalManagerName" TEXT,
    "approvalDate" TEXT,
    "expectedPurchaseDate" TEXT,
    "expectedReturnDate" TEXT,
    "machineSerialNumber" TEXT,
    "dispatchedBy" TEXT,
    "dispatchDate" TEXT,
    "courierDetails" TEXT,
    "trackingNumber" TEXT,
    "conditionOnReturn" TEXT,
    "remarks" TEXT,
    CONSTRAINT "DemoRequest_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DemoRequest_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DemoRequest_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "DemoRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DemoType_name_key" ON "DemoType"("name");
