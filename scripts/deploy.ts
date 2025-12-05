import { ethers } from "hardhat";

/**
 * @title Deployment Script for Confidential Surgery Scheduler
 * @notice Deploys the ConfidentialSurgeryScheduler contract to the specified network
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network <network-name>
 *
 * Supported networks:
 *   - hardhat (local)
 *   - sepolia (Ethereum testnet)
 *   - zamaDevnet (Zama FHEVM devnet)
 *
 * Requirements:
 *   - Set PRIVATE_KEY in .env file
 *   - Ensure sufficient funds for deployment
 *   - Network RPC URLs configured in hardhat.config.ts
 */
async function main() {
  console.log("🏥 Deploying Confidential Surgery Scheduler...\n");

  // Get deployment account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("📋 Deployment Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network:        ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID:       ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Deployer:       ${deployerAddress}`);
  console.log(`Balance:        ${ethers.formatEther(await ethers.provider.getBalance(deployerAddress))} ETH`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy contract
  console.log("🚀 Deploying contract...");
  const SchedulerFactory = await ethers.getContractFactory("ConfidentialSurgeryScheduler");
  const scheduler = await SchedulerFactory.deploy();

  await scheduler.waitForDeployment();
  const contractAddress = await scheduler.getAddress();

  console.log("✅ Contract deployed successfully!\n");

  // Display deployment results
  console.log("📄 Deployment Results:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Hospital Admin:   ${deployerAddress}`);
  console.log(`Transaction Hash: ${scheduler.deploymentTransaction()?.hash}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Verify initial state
  console.log("🔍 Verifying initial state...");
  const hospitalAdmin = await scheduler.hospitalAdmin();
  const currentScheduleId = await scheduler.currentScheduleId();
  const isSurgeonAuthorized = await scheduler.authorizedSurgeons(deployerAddress);
  const isPatientAuthorized = await scheduler.authorizedPatients(deployerAddress);

  console.log(`✓ Hospital Admin:       ${hospitalAdmin}`);
  console.log(`✓ Current Schedule ID:  ${currentScheduleId}`);
  console.log(`✓ Deployer is Surgeon:  ${isSurgeonAuthorized}`);
  console.log(`✓ Deployer is Patient:  ${isPatientAuthorized}\n`);

  // Display next steps
  console.log("📝 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Save the contract address for future interactions");
  console.log("2. Authorize surgeons using: authorizeSurgeon(address)");
  console.log("3. Authorize patients using: authorizePatient(address)");
  console.log("4. Create surgery slots using: createSurgerySlot(...)");
  console.log("5. Test the contract using: npx hardhat test");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress: contractAddress,
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: scheduler.deploymentTransaction()?.hash,
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/deployment-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${filename}\n`);

  console.log("✨ Deployment complete!");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
