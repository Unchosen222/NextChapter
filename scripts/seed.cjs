const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Seeding sample certificates to network:", hre.network.name);
  console.log("----------------------------------------------------");

  const configPath = path.join(__dirname, "../src/contracts/contractConfig.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("contractConfig.json not found. Run deployment script first.");
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const contractAddress = config.networks[hre.network.name]?.address || config.activeAddress;

  if (!contractAddress) {
    throw new Error(`No deployed contract address found for network: ${hre.network.name}`);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Operating with account:", deployer.address);
  console.log("Contract target address:", contractAddress);

  const registry = await hre.ethers.getContractAt("CertificateRegistry", contractAddress, deployer);

  // Sample certificates representing SkilTrust Academy's flagship IT courses
  const sampleCerts = [
    {
      certId: "SKIL-2026-AI01",
      courseId: "CS-AI-01",
      recipient: deployer.address,
      textForHash: "SkilTrust::CS-AI-01::Advanced Artificial Intelligence & LLMs::" + deployer.address,
    },
    {
      certId: "SKIL-2026-SEC01",
      courseId: "CS-SEC-01",
      recipient: deployer.address,
      textForHash: "SkilTrust::CS-SEC-01::Offensive & Defensive Cybersecurity Engineering::" + deployer.address,
    },
    {
      certId: "SKIL-2026-CLOUD01",
      courseId: "CS-CLOUD-01",
      recipient: deployer.address,
      textForHash: "SkilTrust::CS-CLOUD-01::Cloud Native Architectures & DevOps::" + deployer.address,
    },
  ];

  for (const cert of sampleCerts) {
    const isRegistered = await registry.isCertificateRegistered(cert.certId);
    if (!isRegistered) {
      const certHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(cert.textForHash));
      console.log(`Issuing certificate ${cert.certId} (${cert.courseId})...`);
      const tx = await registry.issueCertificate(
        cert.certId,
        cert.courseId,
        cert.recipient,
        certHash
      );
      await tx.wait();
      console.log(`✓ Issued ${cert.certId} in tx:`, tx.hash);
    } else {
      console.log(`Certificate ${cert.certId} is already registered. Skipping.`);
    }
  }

  console.log("----------------------------------------------------");
  const total = await registry.getTotalCertificates();
  console.log(`Seeding complete. Total certificates on-chain: ${total}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
