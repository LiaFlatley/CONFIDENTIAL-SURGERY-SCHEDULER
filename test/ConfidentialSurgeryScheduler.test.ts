import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialSurgeryScheduler } from "../typechain-types";

/**
 * @title Confidential Surgery Scheduler Test Suite
 * @notice Comprehensive tests demonstrating FHEVM concepts and functionality
 *
 * This test suite demonstrates:
 * - FHE encryption of sensitive patient data
 * - Access control patterns (FHE.allow, FHE.allowThis)
 * - Role-based permissions
 * - Time-based business logic
 * - Encrypted data operations
 *
 * @chapter: access-control
 * @chapter: encryption
 * @chapter: healthcare-privacy
 */
describe("ConfidentialSurgeryScheduler", function () {
  let scheduler: ConfidentialSurgeryScheduler;
  let admin: SignerWithAddress;
  let surgeon: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let patient3: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  /**
   * Deploy the contract before each test
   * Sets up test accounts with different roles
   */
  beforeEach(async function () {
    // Get test signers
    [admin, surgeon, patient1, patient2, patient3, unauthorized] = await ethers.getSigners();

    // Deploy the contract
    const SchedulerFactory = await ethers.getContractFactory("ConfidentialSurgeryScheduler");
    scheduler = await SchedulerFactory.deploy();
    await scheduler.waitForDeployment();

    // Authorize surgeon and patients
    await scheduler.connect(admin).authorizeSurgeon(surgeon.address);
    await scheduler.connect(admin).authorizePatient(patient1.address);
    await scheduler.connect(admin).authorizePatient(patient2.address);
    await scheduler.connect(admin).authorizePatient(patient3.address);
  });

  /**
   * Test suite: Contract Deployment and Initialization
   * Verifies initial state and admin setup
   */
  describe("Deployment and Initialization", function () {
    /**
     * Verify that the contract is deployed with correct admin
     * @test Should set the deployer as hospital admin
     */
    it("Should set the deployer as hospital admin", async function () {
      expect(await scheduler.hospitalAdmin()).to.equal(admin.address);
    });

    /**
     * Verify initial schedule ID
     * @test Should initialize with schedule ID 1
     */
    it("Should initialize with schedule ID 1", async function () {
      expect(await scheduler.currentScheduleId()).to.equal(1);
    });

    /**
     * Verify deployer permissions
     * @test Should authorize deployer as both surgeon and patient
     */
    it("Should authorize deployer as both surgeon and patient", async function () {
      expect(await scheduler.authorizedSurgeons(admin.address)).to.be.true;
      expect(await scheduler.authorizedPatients(admin.address)).to.be.true;
    });
  });

  /**
   * Test suite: Authorization and Access Control
   * Demonstrates role-based access control patterns
   * @chapter: access-control
   */
  describe("Authorization and Access Control", function () {
    /**
     * Test surgeon authorization
     * @test Should allow admin to authorize surgeons
     */
    it("Should allow admin to authorize surgeons", async function () {
      const newSurgeon = unauthorized;
      await expect(scheduler.connect(admin).authorizeSurgeon(newSurgeon.address))
        .to.emit(scheduler, "SurgeonAuthorized")
        .withArgs(newSurgeon.address);

      expect(await scheduler.authorizedSurgeons(newSurgeon.address)).to.be.true;
    });

    /**
     * Test patient authorization
     * @test Should allow admin to authorize patients
     */
    it("Should allow admin to authorize patients", async function () {
      const newPatient = unauthorized;
      await expect(scheduler.connect(admin).authorizePatient(newPatient.address))
        .to.emit(scheduler, "PatientAuthorized")
        .withArgs(newPatient.address);

      expect(await scheduler.authorizedPatients(newPatient.address)).to.be.true;
    });

    /**
     * Test authorization restrictions
     * @test Should prevent non-admin from authorizing surgeons
     */
    it("Should prevent non-admin from authorizing surgeons", async function () {
      await expect(
        scheduler.connect(unauthorized).authorizeSurgeon(unauthorized.address)
      ).to.be.revertedWith("Not authorized hospital admin");
    });

    /**
     * Test authorization restrictions
     * @test Should prevent non-admin from authorizing patients
     */
    it("Should prevent non-admin from authorizing patients", async function () {
      await expect(
        scheduler.connect(unauthorized).authorizePatient(unauthorized.address)
      ).to.be.revertedWith("Not authorized hospital admin");
    });
  });

  /**
   * Test suite: Surgery Slot Creation with Encryption
   * Demonstrates FHE encryption and access control setup
   * @chapter: encryption
   * @chapter: access-control
   */
  describe("Surgery Slot Creation (FHE Encryption)", function () {
    /**
     * Test successful slot creation with encrypted data
     * @test Should create surgery slot with encrypted surgeon and time data
     * @fhe-concept: FHE.asEuint8(), FHE.asEuint16(), FHE.asEuint32()
     * @fhe-concept: FHE.allowThis() for contract access permissions
     */
    it("Should create surgery slot with encrypted data", async function () {
      const surgeonId = 1;
      const scheduleTime = Math.floor(Date.now() / 1000) + 86400; // +1 day
      const maxCapacity = 5;

      await expect(
        scheduler.connect(surgeon).createSurgerySlot(surgeonId, scheduleTime, maxCapacity)
      ).to.emit(scheduler, "SlotCreated");

      const slotInfo = await scheduler.getCurrentSlotInfo();
      expect(slotInfo.slotGenerated).to.be.true;
      expect(slotInfo.slotAssigned).to.be.false;
      expect(slotInfo.maxCapacity).to.equal(maxCapacity);
    });

    /**
     * Test slot creation restrictions
     * @test Should prevent unauthorized users from creating slots
     * @security: Role-based access control
     */
    it("Should prevent unauthorized users from creating slots", async function () {
      await expect(
        scheduler.connect(unauthorized).createSurgerySlot(1, 1234567890, 5)
      ).to.be.revertedWith("Not authorized surgeon");
    });

    /**
     * Test capacity validation
     * @test Should validate maximum capacity constraints
     */
    it("Should reject invalid capacity values", async function () {
      await expect(
        scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 0)
      ).to.be.revertedWith("Invalid capacity");

      await expect(
        scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 11)
      ).to.be.revertedWith("Invalid capacity");
    });

    /**
     * Test slot uniqueness
     * @test Should prevent creating multiple active slots
     */
    it("Should prevent creating duplicate active slots", async function () {
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 5);

      await expect(
        scheduler.connect(surgeon).createSurgerySlot(2, 1234567891, 5)
      ).to.be.revertedWith("Slot already active");
    });
  });

  /**
   * Test suite: Appointment Requests with Encrypted Patient Data
   * Demonstrates encryption of user input and ACL permissions
   * @chapter: encryption
   * @chapter: access-control
   * @chapter: user-input
   */
  describe("Appointment Requests (Encrypted Patient Data)", function () {
    beforeEach(async function () {
      // Create a surgery slot first
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 5);
    });

    /**
     * Test encrypted appointment request
     * @test Should accept appointment request with encrypted patient data
     * @fhe-concept: Encrypting user input (patientId, urgencyLevel, surgeryType)
     * @fhe-concept: FHE.allow() for granting user access to their encrypted data
     * @fhe-concept: FHE.allowThis() for contract access
     */
    it("Should accept appointment request with encrypted data", async function () {
      const patientId = 1001;
      const urgencyLevel = 7;
      const surgeryType = 5;

      await expect(
        scheduler.connect(patient1).requestAppointment(patientId, urgencyLevel, surgeryType)
      )
        .to.emit(scheduler, "AppointmentRequested")
        .withArgs(patient1.address, 1, await ethers.provider.getBlock("latest").then(b => b!.timestamp));

      const status = await scheduler.getPatientRequestStatus(patient1.address);
      expect(status.hasRequested).to.be.true;
    });

    /**
     * Test multiple patient requests
     * @test Should handle multiple patients requesting same slot
     * @privacy: Each patient's urgency level remains encrypted
     */
    it("Should accept requests from multiple patients", async function () {
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
      await scheduler.connect(patient2).requestAppointment(1002, 9, 5);
      await scheduler.connect(patient3).requestAppointment(1003, 5, 5);

      const status1 = await scheduler.getPatientRequestStatus(patient1.address);
      const status2 = await scheduler.getPatientRequestStatus(patient2.address);
      const status3 = await scheduler.getPatientRequestStatus(patient3.address);

      expect(status1.hasRequested).to.be.true;
      expect(status2.hasRequested).to.be.true;
      expect(status3.hasRequested).to.be.true;
    });

    /**
     * Test input validation for urgency level
     * @test Should validate urgency level range (1-10)
     */
    it("Should reject invalid urgency levels", async function () {
      await expect(
        scheduler.connect(patient1).requestAppointment(1001, 0, 5)
      ).to.be.revertedWith("Urgency level must be between 1-10");

      await expect(
        scheduler.connect(patient1).requestAppointment(1001, 11, 5)
      ).to.be.revertedWith("Urgency level must be between 1-10");
    });

    /**
     * Test input validation for surgery type
     * @test Should validate surgery type range (1-20)
     */
    it("Should reject invalid surgery types", async function () {
      await expect(
        scheduler.connect(patient1).requestAppointment(1001, 5, 0)
      ).to.be.revertedWith("Invalid surgery type");

      await expect(
        scheduler.connect(patient1).requestAppointment(1001, 5, 21)
      ).to.be.revertedWith("Invalid surgery type");
    });

    /**
     * Test duplicate request prevention
     * @test Should prevent same patient from requesting twice
     */
    it("Should prevent duplicate requests from same patient", async function () {
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);

      await expect(
        scheduler.connect(patient1).requestAppointment(1002, 8, 6)
      ).to.be.revertedWith("Already requested for this slot");
    });

    /**
     * Test capacity enforcement
     * @test Should enforce maximum slot capacity
     */
    it("Should enforce slot capacity limits", async function () {
      // Create slot with capacity of 2
      await scheduler.connect(admin).processAssignments(); // Complete current slot
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 2);

      // Fill capacity
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
      await scheduler.connect(patient2).requestAppointment(1002, 8, 5);

      // Third request should fail
      await expect(
        scheduler.connect(patient3).requestAppointment(1003, 9, 5)
      ).to.be.revertedWith("Slot capacity reached");
    });

    /**
     * Test unauthorized access
     * @test Should prevent unauthorized users from requesting appointments
     */
    it("Should prevent unauthorized users from requesting", async function () {
      await expect(
        scheduler.connect(unauthorized).requestAppointment(1001, 7, 5)
      ).to.be.revertedWith("Not authorized patient");
    });
  });

  /**
   * Test suite: Assignment Processing
   * Demonstrates processing encrypted data and slot assignment
   * @chapter: encrypted-operations
   */
  describe("Assignment Processing", function () {
    beforeEach(async function () {
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 5);
    });

    /**
     * Test successful assignment
     * @test Should process assignments and select patient
     * @note: In production, would use FHE comparisons to maintain privacy
     */
    it("Should process and assign slot to a patient", async function () {
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
      await scheduler.connect(patient2).requestAppointment(1002, 9, 5);

      await expect(scheduler.connect(admin).processAssignments())
        .to.emit(scheduler, "SlotAssigned");

      const slotInfo = await scheduler.getCurrentSlotInfo();
      expect(slotInfo.slotAssigned).to.be.true;
    });

    /**
     * Test no requests scenario
     * @test Should handle case with no appointment requests
     */
    it("Should handle no requests gracefully", async function () {
      await expect(scheduler.connect(admin).processAssignments())
        .to.emit(scheduler, "NoAssignment")
        .withArgs(1, "No requests received");
    });

    /**
     * Test duplicate processing prevention
     * @test Should prevent processing same slot twice
     */
    it("Should prevent duplicate assignment processing", async function () {
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
      await scheduler.connect(admin).processAssignments();

      await expect(
        scheduler.connect(admin).processAssignments()
      ).to.be.revertedWith("Slot already assigned");
    });
  });

  /**
   * Test suite: Emergency Override
   * Tests administrative emergency functions
   * @chapter: admin-functions
   */
  describe("Emergency Assignment", function () {
    beforeEach(async function () {
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 5);
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
    });

    /**
     * Test emergency assignment
     * @test Should allow admin to manually assign in emergencies
     */
    it("Should allow admin emergency assignment", async function () {
      await expect(
        scheduler.connect(admin).emergencyAssignment(1, patient1.address)
      )
        .to.emit(scheduler, "SlotAssigned")
        .withArgs(1, patient1.address, 10);

      const history = await scheduler.getSlotHistory(1);
      expect(history.assignedPatient).to.equal(patient1.address);
    });

    /**
     * Test emergency restrictions
     * @test Should prevent non-admin emergency assignments
     */
    it("Should prevent non-admin emergency assignments", async function () {
      await expect(
        scheduler.connect(unauthorized).emergencyAssignment(1, patient1.address)
      ).to.be.revertedWith("Not authorized hospital admin");
    });

    /**
     * Test emergency validation
     * @test Should only allow emergency assignment for requesting patients
     */
    it("Should require patient to have requested the slot", async function () {
      await expect(
        scheduler.connect(admin).emergencyAssignment(1, patient2.address)
      ).to.be.revertedWith("Patient did not request this slot");
    });
  });

  /**
   * Test suite: View Functions and Queries
   * Tests read-only functions for retrieving state
   * @chapter: queries
   */
  describe("View Functions", function () {
    beforeEach(async function () {
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 5);
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
    });

    /**
     * Test slot info retrieval
     * @test Should return accurate current slot information
     */
    it("Should return current slot information", async function () {
      const info = await scheduler.getCurrentSlotInfo();
      expect(info.slotId).to.equal(1);
      expect(info.slotGenerated).to.be.true;
      expect(info.requestCount).to.equal(1);
      expect(info.maxCapacity).to.equal(5);
    });

    /**
     * Test patient status retrieval
     * @test Should return patient request status
     */
    it("Should return patient request status", async function () {
      const status = await scheduler.getPatientRequestStatus(patient1.address);
      expect(status.hasRequested).to.be.true;
      expect(status.requestTimestamp).to.be.greaterThan(0);
    });

    /**
     * Test slot history retrieval
     * @test Should return historical slot data
     */
    it("Should return slot history", async function () {
      await scheduler.connect(admin).processAssignments();

      const history = await scheduler.getSlotHistory(1);
      expect(history.slotAssigned).to.be.true;
      expect(history.requestCount).to.equal(1);
    });

    /**
     * Test requesting patients list (admin only)
     * @test Should return list of requesting patients to admin
     */
    it("Should return requesting patients list to admin", async function () {
      await scheduler.connect(patient2).requestAppointment(1002, 8, 5);

      const patients = await scheduler.connect(admin).getRequestingPatients(1);
      expect(patients.length).to.equal(2);
      expect(patients[0]).to.equal(patient1.address);
      expect(patients[1]).to.equal(patient2.address);
    });

    /**
     * Test requesting patients list access control
     * @test Should prevent non-admin from viewing requesting patients
     */
    it("Should prevent non-admin from viewing requesting patients", async function () {
      await expect(
        scheduler.connect(unauthorized).getRequestingPatients(1)
      ).to.be.revertedWith("Not authorized hospital admin");
    });
  });

  /**
   * Test suite: Multi-Slot Workflow
   * Tests complete workflow across multiple surgery slots
   * @chapter: workflow
   */
  describe("Multi-Slot Workflow", function () {
    /**
     * Test complete multi-slot lifecycle
     * @test Should handle multiple slots sequentially
     * @workflow: Create -> Request -> Assign -> Repeat
     */
    it("Should handle multiple surgery slots", async function () {
      // Slot 1
      await scheduler.connect(surgeon).createSurgerySlot(1, 1234567890, 3);
      await scheduler.connect(patient1).requestAppointment(1001, 7, 5);
      await scheduler.connect(admin).processAssignments();

      let info = await scheduler.getCurrentSlotInfo();
      expect(info.slotId).to.equal(2); // Moved to next slot

      // Slot 2
      await scheduler.connect(surgeon).createSurgerySlot(2, 1234567900, 3);
      await scheduler.connect(patient2).requestAppointment(1002, 8, 6);
      await scheduler.connect(admin).processAssignments();

      info = await scheduler.getCurrentSlotInfo();
      expect(info.slotId).to.equal(3); // Moved to next slot

      // Verify history
      const history1 = await scheduler.getSlotHistory(1);
      const history2 = await scheduler.getSlotHistory(2);
      expect(history1.slotAssigned).to.be.true;
      expect(history2.slotAssigned).to.be.true;
    });
  });
});
