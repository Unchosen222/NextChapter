const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying CertificateRegistry to network:", hre.network.name);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(">>> CertificateRegistry successfully deployed to:", contractAddress);
  console.log("----------------------------------------------------");

  // Read ABI from Hardhat artifacts
  const artifactPath = path.join(__dirname, "../src/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  // Update src/contracts/contractConfig.json
  const configDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configFilePath = path.join(configDir, "contractConfig.json");
  let existingConfig = {};
  if (fs.existsSync(configFilePath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
    } catch {
      existingConfig = {};
    }
  }

  const updatedConfig = {
    ...existingConfig,
    networks: {
      ...(existingConfig.networks || {}),
      [hre.network.name]: {
        address: contractAddress,
        chainId: hre.network.config.chainId || 31337,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
      },
    },
    defaultNetwork: hre.network.name === "sepolia" ? "sepolia" : "localhost",
    activeAddress: contractAddress,
    abi: abi.length > 0 ? abi : (existingConfig.abi || []),
  };

  fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2));
  console.log("Updated contract config at:", configFilePath);
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
