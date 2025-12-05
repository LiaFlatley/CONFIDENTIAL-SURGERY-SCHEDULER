import { ethers } from "hardhat";

/**
 * @title Interaction Script for Confidential Surgery Scheduler
 * @notice Example script demonstrating contract interactions
 *
 * This script shows how to:
 * - Connect to deployed contract
 * - Authorize users
 * - Create surgery slots
 * - Request appointments
 * - Process assignments
 *
 * Usage:
 *   1. Update CONTRACT_ADDRESS with your deployed contract
 *   2. Run: npx hardhat run scripts/interact.ts --network <network-name>
 */

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x...";

async function main() {
  console.log("🏥 Interacting with Confidential Surgery Scheduler\n");

  // Get signers
  const [admin, surgeon, patient1, patient2] = await ethers.getSigners();

  console.log("📋 Account Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Admin:    ${admin.address}`);
  console.log(`Surgeon:  ${surgeon.address}`);
  console.log(`Patient1: ${patient1.address}`);
  console.log(`Patient2: ${patient2.address}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Connect to contract
  const scheduler = await ethers.getContractAt(
    "ConfidentialSurgeryScheduler",
    CONTRACT_ADDRESS
  );

  // 1. Authorize surgeon
  console.log("1️⃣  Authorizing surgeon...");
  const tx1 = await scheduler.connect(admin).authorizeSurgeon(surgeon.address);
  await tx1.wait();
  console.log("   ✓ Surgeon authorized\n");

  // 2. Authorize patients
  console.log("2️⃣  Authorizing patients...");
  const tx2 = await scheduler.connect(admin).authorizePatient(patient1.address);
  await tx2.wait();
  const tx3 = await scheduler.connect(admin).authorizePatient(patient2.address);
  await tx3.wait();
  console.log("   ✓ Patients authorized\n");

  // 3. Create surgery slot
  console.log("3️⃣  Creating surgery slot...");
  const surgeonId = 1;
  const scheduleTime = Math.floor(Date.now() / 1000) + 86400; // +1 day
  const maxCapacity = 5;

  const tx4 = await scheduler
    .connect(surgeon)
    .createSurgerySlot(surgeonId, scheduleTime, maxCapacity);
  await tx4.wait();
  console.log("   ✓ Surgery slot created\n");

  // 4. Request appointments
  console.log("4️⃣  Requesting appointments...");

  // Patient 1 request
  const tx5 = await scheduler
    .connect(patient1)
    .requestAppointment(
      1001, // patientId
      8,    // urgencyLevel (1-10)
      5     // surgeryType
    );
  await tx5.wait();
  console.log("   ✓ Patient 1 requested appointment");

  // Patient 2 request
  const tx6 = await scheduler
    .connect(patient2)
    .requestAppointment(
      1002, // patientId
      6,    // urgencyLevel (1-10)
      5     // surgeryType
    );
  await tx6.wait();
  console.log("   ✓ Patient 2 requested appointment\n");

  // 5. Check current slot info
  console.log("5️⃣  Checking slot information...");
  const slotInfo = await scheduler.getCurrentSlotInfo();
  console.log("   Slot ID:         ", slotInfo.slotId.toString());
  console.log("   Generated:       ", slotInfo.slotGenerated);
  console.log("   Assigned:        ", slotInfo.slotAssigned);
  console.log("   Request Count:   ", slotInfo.requestCount.toString());
  console.log("   Max Capacity:    ", slotInfo.maxCapacity.toString());
  console.log("   Current Bookings:", slotInfo.currentBookings.toString());
  console.log();

  // 6. Check patient request status
  console.log("6️⃣  Checking patient request status...");
  const status1 = await scheduler.getPatientRequestStatus(patient1.address);
  const status2 = await scheduler.getPatientRequestStatus(patient2.address);
  console.log("   Patient 1:");
  console.log("   - Has Requested:", status1.hasRequested);
  console.log("   - Timestamp:    ", new Date(Number(status1.requestTimestamp) * 1000).toISOString());
  console.log("   Patient 2:");
  console.log("   - Has Requested:", status2.hasRequested);
  console.log("   - Timestamp:    ", new Date(Number(status2.requestTimestamp) * 1000).toISOString());
  console.log();

  // 7. Process assignments
  console.log("7️⃣  Processing assignments...");
  const tx7 = await scheduler.connect(admin).processAssignments();
  const receipt = await tx7.wait();

  // Find SlotAssigned event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = scheduler.interface.parseLog(log);
      return parsed?.name === "SlotAssigned";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = scheduler.interface.parseLog(event);
    console.log("   ✓ Slot assigned!");
    console.log("   - Slot ID:       ", parsed?.args[0].toString());
    console.log("   - Patient:       ", parsed?.args[1]);
    console.log("   - Urgency Level: ", parsed?.args[2].toString());
  }
  console.log();

  // 8. Check slot history
  console.log("8️⃣  Checking slot history...");
  const history = await scheduler.getSlotHistory(1);
  console.log("   Slot Assigned:   ", history.slotAssigned);
  console.log("   Assigned Patient:", history.assignedPatient);
  console.log("   Urgency Level:   ", history.revealedUrgencyLevel.toString());
  console.log("   Creation Time:   ", new Date(Number(history.creationTime) * 1000).toISOString());
  console.log("   Assignment Time: ", new Date(Number(history.assignmentTime) * 1000).toISOString());
  console.log("   Request Count:   ", history.requestCount.toString());
  console.log();

  console.log("✨ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
