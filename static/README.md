# Confidential Surgery Scheduler

A secure and private medical appointment scheduling system using Fully Homomorphic Encryption (FHE) technology built on Ethereum blockchain.

## Features

- **Privacy-Preserving**: Patient data is encrypted using FHE technology
- **Role-Based Access**: Separate interfaces for surgeons and patients
- **Smart Scheduling**: Automated assignment based on encrypted urgency levels
- **Zero Dependencies**: Static frontend using CDN resources only
- **Mobile Responsive**: Works on all device sizes

## Deployment

### Vercel Deployment

1. Push this directory to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import the repository
4. Set the root directory to this folder
5. Deploy

### Manual Deployment

1. Upload all files to any static hosting service
2. Ensure `index.html` is served as the default page
3. Configure your web server to serve all routes to `index.html`

## Usage

1. **Deploy your smart contract** to a compatible blockchain network (Sepolia recommended for testing)
2. **Connect your wallet** (MetaMask or compatible)
3. **Enter the contract address** in the application
4. **For Surgeons**: Create surgery slots and process assignments
5. **For Patients**: Request appointments with encrypted urgency levels

## Smart Contract

The `ConfidentialSurgeryScheduler.sol` contract implements:

- Encrypted patient data storage
- Time-based business rules
- Role-based authorization
- Automated assignment processing

## Security Features

- Patient IDs, urgency levels, and surgery types are encrypted using FHE
- Only assignment results are publicly visible
- Role-based access control for different user types
- Secure timestamp-based scheduling rules

## Browser Requirements

- Modern web browser with ES6 support
- MetaMask or compatible Web3 wallet
- Connection to Ethereum network

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Blockchain**: Ethereum with FHE support
- **Privacy**: Fully Homomorphic Encryption (FHE)
- **Web3**: Ethers.js v5.7.2
- **Deployment**: Vercel/Static hosting ready

## License

MIT License - See contract header for details.