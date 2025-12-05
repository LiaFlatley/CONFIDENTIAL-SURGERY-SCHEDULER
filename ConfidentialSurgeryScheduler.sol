// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialSurgeryScheduler is SepoliaConfig {

    address public hospitalAdmin;
    uint16 public currentScheduleId;
    uint256 public lastScheduleTime;

    // Hospital timezone offset (configurable)
    uint256 constant TIMEZONE_OFFSET = 0; // UTC by default

    struct PatientRequest {
        euint8 encryptedUrgencyLevel; // 1-10 scale
        euint16 encryptedPatientId;
        euint8 encryptedSurgeryType; // encoded surgery type
        bool hasRequested;
        uint256 requestTimestamp;
        address patientAddress;
    }

    struct SurgerySlot {
        euint16 encryptedSlotId;
        euint8 encryptedSurgeonId;
        euint32 encryptedScheduleTime; // encrypted timestamp
        bool slotGenerated;
        bool slotAssigned;
        address assignedPatient;
        uint8 revealedUrgencyLevel;
        uint256 creationTime;
        uint256 assignmentTime;
        address[] requestingPatients;
        uint8 maxCapacity;
        uint8 currentBookings;
    }

    mapping(uint16 => SurgerySlot) public surgerySlots;
    mapping(uint16 => mapping(address => PatientRequest)) public patientRequests;
    mapping(address => bool) public authorizedSurgeons;
    mapping(address => bool) public authorizedPatients;

    event SlotCreated(uint16 indexed slotId, uint256 creationTime);
    event AppointmentRequested(address indexed patient, uint16 indexed slotId, uint256 timestamp);
    event SlotAssigned(uint16 indexed slotId, address indexed patient, uint8 urgencyLevel);
    event NoAssignment(uint16 indexed slotId, string reason);
    event SurgeonAuthorized(address indexed surgeon);
    event PatientAuthorized(address indexed patient);

    modifier onlyHospitalAdmin() {
        require(msg.sender == hospitalAdmin, "Not authorized hospital admin");
        _;
    }

    modifier onlyAuthorizedSurgeon() {
        require(authorizedSurgeons[msg.sender], "Not authorized surgeon");
        _;
    }

    modifier onlyAuthorizedPatient() {
        require(authorizedPatients[msg.sender], "Not authorized patient");
        _;
    }

    modifier onlyDuringBusinessHours() {
        require(isBusinessHoursActive(), "Not during business hours");
        _;
    }

    modifier onlyDuringAssignmentTime() {
        require(isAssignmentTimeActive(), "Not during assignment time");
        _;
    }

    constructor() {
        hospitalAdmin = msg.sender;
        currentScheduleId = 1;
        lastScheduleTime = block.timestamp;
        authorizedSurgeons[msg.sender] = true;
        authorizedPatients[msg.sender] = true;
    }

    // Check if current time is during business hours (8 AM - 6 PM)
    function isBusinessHour() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + TIMEZONE_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        return currentHour >= 8 && currentHour < 18;
    }

    // Check if current time is during assignment hours (specific hours for automated assignment)
    function isAssignmentHour() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + TIMEZONE_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        // Assignment happens at 9 AM, 1 PM, 5 PM
        return currentHour == 9 || currentHour == 13 || currentHour == 17;
    }

    // Check if appointment requests are active
    function isBusinessHoursActive() public view returns (bool) {
        if (!surgerySlots[currentScheduleId].slotGenerated) return false;
        if (surgerySlots[currentScheduleId].slotAssigned) return false;
        return isBusinessHour();
    }

    // Check if assignment time is active
    function isAssignmentTimeActive() public view returns (bool) {
        return isAssignmentHour() && surgerySlots[currentScheduleId].slotGenerated && !surgerySlots[currentScheduleId].slotAssigned;
    }

    // Authorize a surgeon
    function authorizeSurgeon(address surgeon) external onlyHospitalAdmin {
        authorizedSurgeons[surgeon] = true;
        emit SurgeonAuthorized(surgeon);
    }

    // Authorize a patient
    function authorizePatient(address patient) external onlyHospitalAdmin {
        authorizedPatients[patient] = true;
        emit PatientAuthorized(patient);
    }

    // Create new surgery slot (only authorized surgeons during business hours)
    function createSurgerySlot(uint8 _surgeonId, uint32 _scheduleTime, uint8 _maxCapacity) external onlyAuthorizedSurgeon {
        require(isBusinessHour(), "Can only create slots during business hours");
        require(!surgerySlots[currentScheduleId].slotGenerated || surgerySlots[currentScheduleId].slotAssigned, "Slot already active");
        require(_maxCapacity > 0 && _maxCapacity <= 10, "Invalid capacity");

        // Encrypt sensitive scheduling data
        euint16 encryptedSlotId = FHE.asEuint16(currentScheduleId);
        euint8 encryptedSurgeonId = FHE.asEuint8(_surgeonId);
        euint32 encryptedScheduleTime = FHE.asEuint32(_scheduleTime);

        surgerySlots[currentScheduleId] = SurgerySlot({
            encryptedSlotId: encryptedSlotId,
            encryptedSurgeonId: encryptedSurgeonId,
            encryptedScheduleTime: encryptedScheduleTime,
            slotGenerated: true,
            slotAssigned: false,
            assignedPatient: address(0),
            revealedUrgencyLevel: 0,
            creationTime: block.timestamp,
            assignmentTime: 0,
            requestingPatients: new address[](0),
            maxCapacity: _maxCapacity,
            currentBookings: 0
        });

        // Grant access permissions
        FHE.allowThis(encryptedSlotId);
        FHE.allowThis(encryptedSurgeonId);
        FHE.allowThis(encryptedScheduleTime);

        emit SlotCreated(currentScheduleId, block.timestamp);
    }

    // Submit appointment request (patients during business hours)
    function requestAppointment(uint16 _patientId, uint8 _urgencyLevel, uint8 _surgeryType) external onlyAuthorizedPatient onlyDuringBusinessHours {
        require(_urgencyLevel >= 1 && _urgencyLevel <= 10, "Urgency level must be between 1-10");
        require(_surgeryType >= 1 && _surgeryType <= 20, "Invalid surgery type");
        require(!patientRequests[currentScheduleId][msg.sender].hasRequested, "Already requested for this slot");
        require(surgerySlots[currentScheduleId].currentBookings < surgerySlots[currentScheduleId].maxCapacity, "Slot capacity reached");

        // Encrypt patient sensitive data
        euint16 encryptedPatientId = FHE.asEuint16(_patientId);
        euint8 encryptedUrgencyLevel = FHE.asEuint8(_urgencyLevel);
        euint8 encryptedSurgeryType = FHE.asEuint8(_surgeryType);

        patientRequests[currentScheduleId][msg.sender] = PatientRequest({
            encryptedUrgencyLevel: encryptedUrgencyLevel,
            encryptedPatientId: encryptedPatientId,
            encryptedSurgeryType: encryptedSurgeryType,
            hasRequested: true,
            requestTimestamp: block.timestamp,
            patientAddress: msg.sender
        });

        surgerySlots[currentScheduleId].requestingPatients.push(msg.sender);
        surgerySlots[currentScheduleId].currentBookings++;

        // Grant ACL permissions
        FHE.allowThis(encryptedUrgencyLevel);
        FHE.allowThis(encryptedPatientId);
        FHE.allowThis(encryptedSurgeryType);
        FHE.allow(encryptedUrgencyLevel, msg.sender);
        FHE.allow(encryptedPatientId, msg.sender);
        FHE.allow(encryptedSurgeryType, msg.sender);

        emit AppointmentRequested(msg.sender, currentScheduleId, block.timestamp);
    }

    // Process appointment assignments (during assignment hours)
    function processAssignments() external onlyDuringAssignmentTime {
        require(surgerySlots[currentScheduleId].slotGenerated, "No slot generated");
        require(!surgerySlots[currentScheduleId].slotAssigned, "Slot already assigned");

        SurgerySlot storage slot = surgerySlots[currentScheduleId];

        if (slot.requestingPatients.length == 0) {
            slot.slotAssigned = true;
            emit NoAssignment(currentScheduleId, "No requests received");
            currentScheduleId++;
            return;
        }

        // For simplicity, assign to first patient with highest urgency
        // In a real implementation, this would use FHE comparisons
        address selectedPatient = _selectPatientByUrgency();

        if (selectedPatient != address(0)) {
            slot.assignedPatient = selectedPatient;
            slot.slotAssigned = true;
            slot.assignmentTime = block.timestamp;

            // Get urgency level for event (this would be done via async decryption in production)
            uint8 urgencyLevel = _getPatientUrgencyLevel(selectedPatient);
            slot.revealedUrgencyLevel = urgencyLevel;

            emit SlotAssigned(currentScheduleId, selectedPatient, urgencyLevel);
        } else {
            slot.slotAssigned = true;
            emit NoAssignment(currentScheduleId, "No suitable candidate found");
        }

        // Move to next schedule slot
        currentScheduleId++;
    }

    // Simplified patient selection (in production, use FHE comparisons)
    function _selectPatientByUrgency() private view returns (address selectedPatient) {
        SurgerySlot storage slot = surgerySlots[currentScheduleId];
        uint8 highestUrgency = 0;
        address currentSelection = address(0);

        // This is simplified - real implementation would use encrypted comparisons
        for (uint i = 0; i < slot.requestingPatients.length; i++) {
            address patient = slot.requestingPatients[i];
            // In production, this comparison would be done using FHE
            uint8 urgency = _getPatientUrgencyLevel(patient);
            if (urgency > highestUrgency) {
                highestUrgency = urgency;
                currentSelection = patient;
            }
        }

        return currentSelection;
    }

    // Get patient urgency level (simplified - in production this would be async decryption)
    function _getPatientUrgencyLevel(address patient) private view returns (uint8) {
        // This is a placeholder - real implementation would decrypt the encrypted urgency level
        // For demo purposes, return a mock value based on address
        return uint8((uint256(uint160(patient)) % 10) + 1);
    }

    // Get current slot information
    function getCurrentSlotInfo() external view returns (
        uint16 slotId,
        bool slotGenerated,
        bool slotAssigned,
        uint256 creationTime,
        uint256 requestCount,
        uint8 maxCapacity,
        uint8 currentBookings
    ) {
        SurgerySlot storage currentSlot = surgerySlots[currentScheduleId];
        return (
            currentScheduleId,
            currentSlot.slotGenerated,
            currentSlot.slotAssigned,
            currentSlot.creationTime,
            currentSlot.requestingPatients.length,
            currentSlot.maxCapacity,
            currentSlot.currentBookings
        );
    }

    // Check patient request status
    function getPatientRequestStatus(address patient) external view returns (
        bool hasRequested,
        uint256 requestTimestamp
    ) {
        PatientRequest storage request = patientRequests[currentScheduleId][patient];
        return (request.hasRequested, request.requestTimestamp);
    }

    // Get current hour in hospital timezone
    function getCurrentHour() external view returns (uint256) {
        uint256 adjustedTime = block.timestamp + TIMEZONE_OFFSET;
        return (adjustedTime / 3600) % 24;
    }

    // Get slot history
    function getSlotHistory(uint16 slotId) external view returns (
        bool slotAssigned,
        address assignedPatient,
        uint8 revealedUrgencyLevel,
        uint256 creationTime,
        uint256 assignmentTime,
        uint256 requestCount
    ) {
        SurgerySlot storage slot = surgerySlots[slotId];
        return (
            slot.slotAssigned,
            slot.assignedPatient,
            slot.revealedUrgencyLevel,
            slot.creationTime,
            slot.assignmentTime,
            slot.requestingPatients.length
        );
    }

    // Emergency override (hospital admin only)
    function emergencyAssignment(uint16 slotId, address patient) external onlyHospitalAdmin {
        require(surgerySlots[slotId].slotGenerated, "Slot not generated");
        require(!surgerySlots[slotId].slotAssigned, "Slot already assigned");
        require(patientRequests[slotId][patient].hasRequested, "Patient did not request this slot");

        surgerySlots[slotId].assignedPatient = patient;
        surgerySlots[slotId].slotAssigned = true;
        surgerySlots[slotId].assignmentTime = block.timestamp;

        emit SlotAssigned(slotId, patient, 10); // Emergency level
    }

    // Get requesting patients for a slot (admin only)
    function getRequestingPatients(uint16 slotId) external view onlyHospitalAdmin returns (address[] memory) {
        return surgerySlots[slotId].requestingPatients;
    }
}