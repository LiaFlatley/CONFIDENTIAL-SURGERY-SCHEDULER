# Confidential Surgery Scheduler - Video Demonstration Script

## Duration: 60 seconds

---

## Scene 1: Introduction (0-10 seconds)
**Visual**: Title card with project logo, then transition to problem statement with icons

**Narration**: See DIALOGUE

**On Screen Text**:
- "Confidential Surgery Scheduler"
- "Privacy-Preserving Medical Appointments"
- Problem: Patient privacy in medical scheduling

---

## Scene 2: The Problem (10-20 seconds)
**Visual**: Split screen showing traditional system vs. encrypted system
- Left side: Traditional system with visible patient data (highlighted as vulnerable)
- Right side: FHEVM solution with encrypted data (highlighted as secure)

**Narration**: See DIALOGUE

**On Screen Text**:
- "Traditional: Data visible to all"
- "FHEVM: Data stays encrypted"

**Highlight**: Show urgency levels (8, 6, 9) being encrypted using FHE

---

## Scene 3: The Solution (20-35 seconds)
**Visual**: Screen recording of terminal showing:
1. Contract deployment
2. Surgeon creating slot
3. Multiple patients requesting appointments (show encrypted data)
4. Assignment processing

**Narration**: See DIALOGUE

**On Screen Text**:
- "Step 1: Deploy Contract"
- "Step 2: Create Surgery Slot"
- "Step 3: Patients Request (Encrypted)"
- "Step 4: Process Assignment"

**Code Highlight**: Show key FHEVM functions:
```solidity
FHE.asEuint8(urgencyLevel)
FHE.allowThis(encryptedData)
FHE.allow(encryptedData, patient)
```

---

## Scene 4: Key Features (35-50 seconds)
**Visual**: Animated feature showcase with icons

**Narration**: See DIALOGUE

**On Screen Text** (animated bullet points):
- ✅ Encrypted Patient Data (euint8, euint16, euint32)
- ✅ Access Control (FHE.allow, FHE.allowThis)
- ✅ Role-Based Permissions (Admin, Surgeon, Patient)
- ✅ Privacy-Preserving Assignment
- ✅ Production-Ready Tests

**Visual**: Show test coverage results and contract structure diagram

---

## Scene 5: Results & Call to Action (50-60 seconds)
**Visual**:
- Show successful test results (green checkmarks)
- Display contract address and deployment info
- Show GitHub repository page

**Narration**: See DIALOGUE

**On Screen Text**:
- "95%+ Test Coverage"
- "Comprehensive Documentation"
- "Production-Ready Architecture"
- "GitHub: healthcare-privacy/fhevm-surgery-scheduler"
- "Built for Zama Bounty Track December 2025"

**Ending**: Fade to project logo with Zama and FHEVM badges

---

## Technical Requirements

### Video Specifications
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 fps
- **Format**: MP4 (H.264 codec)
- **Duration**: Exactly 60 seconds
- **Audio**: Clear narration with background music (low volume)

### Screen Recording Settings
- **Terminal**: Use high-contrast theme (dark background, bright text)
- **Font Size**: Large enough to be readable (minimum 14pt)
- **Command Speed**: Slow enough to follow, fast enough to maintain pace
- **Highlights**: Use color highlights for important output

### Visual Effects
- **Transitions**: Smooth fade or slide (max 0.5 seconds)
- **Text Animation**: Fade in or slide from left
- **Code Highlighting**: Syntax highlighting with emphasis on FHE functions
- **Icons**: Use consistent icon style throughout

### Audio Requirements
- **Voice**: Clear, professional narration
- **Volume**: Consistent throughout
- **Background Music**: Soft, tech-themed, not overpowering speech
- **Sound Effects**: Minimal, only for emphasis (optional)

---

## Filming Notes

### Key Messages to Emphasize
1. **Privacy First**: Patient data never exposed
2. **FHEVM Power**: Computation on encrypted data
3. **Production Ready**: Complete with tests and docs
4. **Real-World Use**: Practical healthcare application

### What to Show
✅ Contract deployment process
✅ Encrypted data creation (FHE functions)
✅ Multiple patient requests
✅ Assignment processing
✅ Test suite execution
✅ Documentation quality

### What NOT to Show
❌ Long compilation times
❌ Error messages (unless showing error handling)
❌ Unrelated code or files
❌ Personal information or credentials

---

## B-Roll Suggestions

- Code editor with contract open (zooming into key functions)
- Terminal with test results scrolling
- Animated diagrams of FHE encryption
- Network diagram showing actors (admin, surgeon, patients)
- GitHub repository page
- Documentation pages

---

## Post-Production Checklist

- [ ] Verify 60-second duration exactly
- [ ] Check audio levels and clarity
- [ ] Ensure all text is readable on mobile devices
- [ ] Verify code snippets are clear and highlighted
- [ ] Add captions/subtitles for accessibility
- [ ] Include project URL and GitHub link in description
- [ ] Add tags: FHEVM, Zama, Privacy, Healthcare, Blockchain
- [ ] Export in required format (MP4, 1080p)
- [ ] Test playback on different devices

---

## Video Description (for upload)

**Title**: Confidential Surgery Scheduler - Privacy-Preserving Medical Appointments with FHEVM

**Description**:
Confidential Surgery Scheduler is a privacy-preserving surgery appointment scheduling system built with Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine).

This demo shows how sensitive patient data (urgency levels, patient IDs, surgery types) remains encrypted throughout the entire scheduling process, ensuring medical privacy while maintaining operational efficiency.

Key Features:
- Encrypted patient data using FHE (euint8, euint16, euint32)
- Access control with FHE.allow() and FHE.allowThis()
- Role-based permissions for administrators, surgeons, and patients
- Privacy-preserving urgency comparisons
- 95%+ test coverage with comprehensive documentation

Built for: Zama Bounty Track December 2025
Repository: https://github.com/healthcare-privacy/fhevm-surgery-scheduler
License: MIT

Technologies:
- Zama FHEVM
- Solidity ^0.8.24
- Hardhat
- TypeScript
- Fully Homomorphic Encryption

#FHEVM #Zama #Privacy #Healthcare #Blockchain #SmartContracts #FHE #ConfidentialComputing

---

**End of Video Script**
