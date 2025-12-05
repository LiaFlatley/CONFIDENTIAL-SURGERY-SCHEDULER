# Confidential Surgery Scheduler

> Privacy-preserving surgery appointment scheduling system using Fully Homomorphic Encryption (FHEVM)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-blue)](https://zama.ai/)

## Overview

Confidential Surgery Scheduler is a blockchain-based smart contract system that enables privacy-preserving medical appointment scheduling. Using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), sensitive patient data remains encrypted throughout the entire scheduling process, ensuring medical privacy while maintaining operational efficiency.

Video: CONFIDENTIAL SURGERY SCHEDULER.mp4 https://streamable.com/qru9eg

Live : https://confidential-surgery-scheduler.vercel.app/

### Key Features

- **🔒 Privacy-First**: All sensitive patient data (patient IDs, urgency levels, surgery types) encrypted using FHE
- **👥 Role-Based Access**: Separate permissions for hospital administrators, surgeons, and patients
- **⏰ Time-Based Operations**: Configurable business hours and automated assignment scheduling
- **🏥 Medical Workflow**: Realistic surgery scheduling workflow with capacity management
- **🔐 Access Control**: Comprehensive ACL (Access Control List) implementation using FHE.allow()
- **📊 Transparency**: Public assignment results while maintaining patient privacy during the process

## FHEVM Concepts Demonstrated

This project showcases the following FHEVM features:

| Concept | Implementation | Location |
|---------|---------------|----------|
| **Data Encryption** | `FHE.asEuint8()`, `FHE.asEuint16()`, `FHE.asEuint32()` | `createSurgerySlot()`, `requestAppointment()` |
| **Access Control** | `FHE.allowThis()` grants contract access | All encrypted data operations |
| **User Permissions** | `FHE.allow(data, user)` grants user access | `requestAppointment()` |
| **Encrypted Operations** | Operations on encrypted data without decryption | `processAssignments()` |
| **Role-Based Security** | Modifiers and authorization mappings | Throughout contract |
| **Async Decryption** | Pattern for revealing results (production-ready approach documented) | `_getPatientUrgencyLevel()` |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Hospital Administrator                    │
│              (Authorizes users, manages emergency)           │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┴───────────────┐
     │                               │
┌────▼─────────┐            ┌───────▼────────┐
│   Surgeons   │            │    Patients    │
│              │            │                │
│ • Create     │            │ • Request      │
│   surgery    │            │   appointments │
│   slots      │            │   with         │
│              │            │   encrypted    │
│              │            │   data         │
└────┬─────────┘            └───────┬────────┘
     │                              │
     │    ┌─────────────────────────┘
     │    │
┌────▼────▼──────────────────────────────────────┐
│   Confidential Surgery Scheduler Contract      │
│                                                 │
│  • Encrypted patient data storage              │
│  • Privacy-preserving urgency comparison       │
│  • Time-based business rules                   │
│  • Automated slot assignment                   │
└─────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/healthcare-privacy/fhevm-surgery-scheduler.git
cd fhevm-surgery-scheduler
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
```

4. **Compile contracts**

```bash
npm run compile
```

## Usage

### Running Tests

Run the comprehensive test suite:

```bash
npm test
```

Run tests with gas reporting:

```bash
npm run gas-report
```

Run tests with coverage:

```bash
npm run coverage
```

### Deployment

Deploy to Hardhat local network:

```bash
npm run deploy
```

Deploy to Sepolia testnet:

```bash
npm run deploy:sepolia
```

Deploy to Zama Devnet:

```bash
npm run deploy:zama
```

### Interacting with the Contract

After deployment, use the interaction script:

1. Update `CONTRACT_ADDRESS` in `scripts/interact.ts`
2. Run the interaction script:

```bash
npm run interact
```

## Smart Contract API

### Core Functions

#### For Hospital Administrators

```solidity
function authorizeSurgeon(address surgeon) external onlyHospitalAdmin
```
Authorize a surgeon to create surgery slots.

```solidity
function authorizePatient(address patient) external onlyHospitalAdmin
```
Authorize a patient to request appointments.

```solidity
function emergencyAssignment(uint16 slotId, address patient) external onlyHospitalAdmin
```
Emergency override to manually assign a slot to a patient.

#### For Surgeons

```solidity
function createSurgerySlot(
    uint8 _surgeonId,
    uint32 _scheduleTime,
    uint8 _maxCapacity
) external onlyAuthorizedSurgeon
```
Create a new surgery slot with encrypted surgeon ID and schedule time.

**Parameters:**
- `_surgeonId`: Surgeon identifier (1-255)
- `_scheduleTime`: Unix timestamp for surgery
- `_maxCapacity`: Maximum number of patients (1-10)

#### For Patients

```solidity
function requestAppointment(
    uint16 _patientId,
    uint8 _urgencyLevel,
    uint8 _surgeryType
) external onlyAuthorizedPatient onlyDuringBusinessHours
```
Request an appointment with encrypted patient data.

**Parameters:**
- `_patientId`: Patient identifier (encrypted)
- `_urgencyLevel`: Urgency level 1-10 (encrypted)
- `_surgeryType`: Surgery type code 1-20 (encrypted)

#### Assignment Processing

```solidity
function processAssignments() external onlyDuringAssignmentTime
```
Process all appointment requests and assign slot to highest urgency patient.

### View Functions

```solidity
function getCurrentSlotInfo() external view returns (...)
```
Get information about the current surgery slot.

```solidity
function getPatientRequestStatus(address patient) external view returns (...)
```
Check if a patient has requested the current slot.

```solidity
function getSlotHistory(uint16 slotId) external view returns (...)
```
Get historical information about a specific slot.

```solidity
function getCurrentHour() external view returns (uint256)
```
Get current hour in hospital timezone (for debugging business hours).

## Workflow Example

### Complete Surgery Scheduling Workflow

```typescript
// 1. Hospital admin authorizes users
await scheduler.authorizeSurgeon(surgeonAddress);
await scheduler.authorizePatient(patient1Address);
await scheduler.authorizePatient(patient2Address);

// 2. Surgeon creates a surgery slot
await scheduler.connect(surgeon).createSurgerySlot(
  1,                                    // surgeonId
  Math.floor(Date.now()/1000) + 86400, // tomorrow
  5                                     // maxCapacity
);

// 3. Patients request appointments (data encrypted)
await scheduler.connect(patient1).requestAppointment(
  1001,  // patientId (encrypted)
  8,     // urgencyLevel (encrypted)
  5      // surgeryType (encrypted)
);

await scheduler.connect(patient2).requestAppointment(
  1002,  // patientId (encrypted)
  6,     // urgencyLevel (encrypted)
  5      // surgeryType (encrypted)
);

// 4. System processes assignments (compares encrypted urgency)
await scheduler.processAssignments();

// 5. Check results
const history = await scheduler.getSlotHistory(1);
console.log("Assigned to:", history.assignedPatient);
console.log("Urgency Level:", history.revealedUrgencyLevel);
```

## Security Considerations

### Privacy Guarantees

- **Patient Data**: Patient IDs, urgency levels, and surgery types remain encrypted throughout the process
- **Surgeon Data**: Surgeon IDs and schedule times are encrypted
- **Comparison Privacy**: Urgency comparisons happen on encrypted data (in production with FHE operations)
- **Access Control**: Only authorized parties can access their own encrypted data

### Access Control Model

```
┌──────────────────┬──────────┬──────────┬──────────┐
│    Permission    │  Admin   │ Surgeon  │ Patient  │
├──────────────────┼──────────┼──────────┼──────────┤
│ Authorize Users  │    ✓     │    ✗     │    ✗     │
│ Create Slots     │    ✓     │    ✓     │    ✗     │
│ Request Appt.    │    ✓     │    ✗     │    ✓     │
│ Process Assign.  │    ✓     │    ✓     │    ✓     │
│ Emergency Assign │    ✓     │    ✗     │    ✗     │
│ View Requesters  │    ✓     │    ✗     │    ✗     │
└──────────────────┴──────────┴──────────┴──────────┘
```

### Production Considerations

For production deployment:

1. **Async Decryption**: Implement async decryption gateway for revealing urgency levels
2. **FHE Comparisons**: Use `FHE.lt()`, `FHE.gt()` for privacy-preserving comparisons
3. **Key Management**: Properly manage FHE keys and access control
4. **Time Synchronization**: Use reliable time oracles for business hours
5. **Emergency Procedures**: Implement comprehensive emergency override procedures

## Testing

The test suite covers:

- ✅ Contract deployment and initialization
- ✅ Authorization and access control
- ✅ Surgery slot creation with encryption
- ✅ Appointment requests with encrypted data
- ✅ Assignment processing
- ✅ Emergency override functionality
- ✅ View functions and queries
- ✅ Multi-slot workflows
- ✅ Edge cases and error handling

### Test Coverage

Run coverage report:

```bash
npm run coverage
```

Expected coverage:
- Statements: > 95%
- Branches: > 90%
- Functions: > 95%
- Lines: > 95%

## Project Structure

```
fhevm-surgery-scheduler/
├── contracts/
│   └── ConfidentialSurgeryScheduler.sol  # Main contract
├── test/
│   └── ConfidentialSurgeryScheduler.test.ts  # Comprehensive tests
├── scripts/
│   ├── deploy.ts                         # Deployment script
│   └── interact.ts                       # Interaction examples
├── hardhat.config.ts                     # Hardhat configuration
├── tsconfig.json                         # TypeScript configuration
├── package.json                          # Dependencies and scripts
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

## Gas Optimization

The contract is optimized for gas efficiency:

- ✅ Efficient storage packing for structs
- ✅ Minimal storage operations
- ✅ Batch operations where possible
- ✅ Optimized loops and iterations
- ✅ Events for off-chain indexing

Run gas reporter:

```bash
npm run gas-report
```

## Troubleshooting

### Common Issues

**Issue**: "Not during business hours" error

**Solution**: The contract enforces business hours (8 AM - 6 PM UTC). Adjust `TIMEZONE_OFFSET` or use test network with time manipulation.

**Issue**: "Slot already active" error

**Solution**: Complete the current slot assignment before creating a new one using `processAssignments()`.

**Issue**: Compilation errors with FHEVM

**Solution**: Ensure you're using the correct version of `@fhevm/solidity` (^0.3.0).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Zama** - For the FHEVM technology and bounty program
- **Hardhat** - For the development framework
- **OpenZeppelin** - For security patterns and best practices

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Fully Homomorphic Encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption)

## Support

For questions and support:

- 📧 Email: support@healthcare-privacy.example
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/healthcare-privacy/fhevm-surgery-scheduler/issues)

## Roadmap

### Phase 1 (Current)
- ✅ Basic scheduling functionality
- ✅ FHE encryption implementation
- ✅ Access control system
- ✅ Comprehensive testing

### Phase 2 (Planned)
- ⏳ Async decryption integration
- ⏳ Advanced FHE comparisons
- ⏳ Multi-surgeon scheduling
- ⏳ Cancellation and rescheduling

### Phase 3 (Future)
- 📋 Frontend application
- 📋 Real-time notifications
- 📋 Analytics dashboard
- 📋 Integration with EHR systems

---

**Built with ❤️ for the Zama Bounty Track December 2025**

*Protecting patient privacy while enabling efficient healthcare operations*
