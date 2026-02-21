-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "region" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,

    CONSTRAINT "MachineModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitParameter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "KitParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DemoType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "readableId" TEXT,
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
    "receivedDate" TEXT,
    "conditionOnReturn" TEXT,
    "remarks" TEXT,

    CONSTRAINT "DemoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userIndex_key" ON "User"("userIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DemoType_name_key" ON "DemoType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DemoRequest_readableId_key" ON "DemoRequest"("readableId");

-- AddForeignKey
ALTER TABLE "MachineModel" ADD CONSTRAINT "MachineModel_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitParameter" ADD CONSTRAINT "KitParameter_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoRequest" ADD CONSTRAINT "DemoRequest_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoRequest" ADD CONSTRAINT "DemoRequest_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoRequest" ADD CONSTRAINT "DemoRequest_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "DemoRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
