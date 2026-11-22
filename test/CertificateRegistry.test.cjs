const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry Smart Contract", function () {
  let CertificateRegistry;
  let registry;
  let owner;
  let issuerOrStudent;
  let student2;
  let stranger;

  const sampleCertId = "SKIL-2026-AI001";
  const sampleCourseId = "CS-AI-01";
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("SkilTrust Certificate Document Mock Bytes"));
  const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("Tampered Certificate Document"));

  beforeEach(async function () {
    [owner, issuerOrStudent, student2, stranger] = await ethers.getSigners();
    CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment & Access Control Initialization", function () {
    it("Should set the correct deployer as the owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should start with 0 total certificates", async function () {
      expect(await registry.getTotalCertificates()).to.equal(0);
    });
  });

  describe("1 & 2. Issue Certificate (Create & Store Hash)", function () {
    it("Should allow the owner to issue a valid certificate", async function () {
      const tx = await registry.issueCertificate(
        sampleCertId,
        sampleCourseId,
        issuerOrStudent.address,
        sampleHash
      );

      await expect(tx)
        .to.emit(registry, "CertificateIssued")
        .withArgs(
          sampleCertId,
          sampleCertId,
          sampleCourseId,
          issuerOrStudent.address,
          sampleHash,
          (val) => val > 0
        );

      expect(await registry.getTotalCertificates()).to.equal(1);
      expect(await registry.isCertificateRegistered(sampleCertId)).to.be.true;

      const cert = await registry.getCertificate(sampleCertId);
      expect(cert.certId).to.equal(sampleCertId);
      expect(cert.courseId).to.equal(sampleCourseId);
      expect(cert.recipient).to.equal(issuerOrStudent.address);
      expect(cert.certHash).to.equal(sampleHash);
      expect(cert.isRevoked).to.be.false;
      expect(cert.revokeReason).to.equal("");
      expect(cert.revokedAt).to.equal(0);
    });

    it("Should revert if a non-owner attempts to issue a certificate", async function () {
      await expect(
        registry.connect(stranger).issueCertificate(
          sampleCertId,
          sampleCourseId,
          issuerOrStudent.address,
          sampleHash
        )
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should enforce unique certificate IDs and prevent overwriting", async function () {
      await registry.issueCertificate(
        sampleCertId,
        sampleCourseId,
        issuerOrStudent.address,
        sampleHash
      );

      await expect(
        registry.issueCertificate(
          sampleCertId,
          "CS-CYBER-01",
          student2.address,
          sampleHash
        )
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Should validate inputs and reject empty parameters or zero addresses", async function () {
      await expect(
        registry.issueCertificate("", sampleCourseId, issuerOrStudent.address, sampleHash)
      ).to.be.revertedWith("Certificate ID cannot be empty");

      await expect(
        registry.issueCertificate(sampleCertId, "", issuerOrStudent.address, sampleHash)
      ).to.be.revertedWith("Course ID cannot be empty");

      await expect(
        registry.issueCertificate(sampleCertId, sampleCourseId, ethers.ZeroAddress, sampleHash)
      ).to.be.revertedWith("Invalid recipient address");

      await expect(
        registry.issueCertificate(sampleCertId, sampleCourseId, issuerOrStudent.address, ethers.ZeroHash)
      ).to.be.revertedWith("Certificate hash cannot be zero");
    });
  });

  describe("4. Verification of Certificates & Hash Matching", function () {
    beforeEach(async function () {
      await registry.issueCertificate(
        sampleCertId,
        sampleCourseId,
        issuerOrStudent.address,
        sampleHash
      );
    });

    it("Should verify successfully when certificate exists and hash matches", async function () {
      const result = await registry.verifyCertificate(sampleCertId, sampleHash);
      expect(result.isValid).to.be.true;
      expect(result.isRevoked).to.be.false;
      expect(result.recipient).to.equal(issuerOrStudent.address);
      expect(result.courseId).to.equal(sampleCourseId);
    });

    it("Should fail validation if hash has been tampered with or modified", async function () {
      const result = await registry.verifyCertificate(sampleCertId, wrongHash);
      expect(result.isValid).to.be.false;
      expect(result.isRevoked).to.be.false;
    });

    it("Should return not found for non-existent certificate ID", async function () {
      const result = await registry.verifyCertificate("NON-EXISTENT", sampleHash);
      expect(result.isValid).to.be.false;
      expect(result.revokeReason).to.equal("Certificate not found");
    });
  });

  describe("5. Revocation of Certificates", function () {
    const revokeReason = "Certificate revoked due to academic misconduct";

    beforeEach(async function () {
      await registry.issueCertificate(
        sampleCertId,
        sampleCourseId,
        issuerOrStudent.address,
        sampleHash
      );
    });

    it("Should allow owner to revoke certificate with a valid audit reason", async function () {
      const tx = await registry.revokeCertificate(sampleCertId, revokeReason);

      await expect(tx)
        .to.emit(registry, "CertificateRevoked")
        .withArgs(
          sampleCertId,
          sampleCertId,
          revokeReason,
          (val) => val > 0
        );

      const cert = await registry.getCertificate(sampleCertId);
      expect(cert.isRevoked).to.be.true;
      expect(cert.revokeReason).to.equal(revokeReason);
      expect(cert.revokedAt).to.be.gt(0);

      // Verify endpoint also flags it as revoked
      const verification = await registry.verifyCertificate(sampleCertId, sampleHash);
      expect(verification.isValid).to.be.true; // Hash still authentic to original issue
      expect(verification.isRevoked).to.be.true; // but flagged as revoked
      expect(verification.revokeReason).to.equal(revokeReason);
    });

    it("Should reject revocation by non-owner", async function () {
      await expect(
        registry.connect(stranger).revokeCertificate(sampleCertId, revokeReason)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should reject revoking an already revoked certificate", async function () {
      await registry.revokeCertificate(sampleCertId, revokeReason);

      await expect(
        registry.revokeCertificate(sampleCertId, "Second revoke attempt")
      ).to.be.revertedWith("Certificate is already revoked");
    });

    it("Should reject empty revocation reason", async function () {
      await expect(
        registry.revokeCertificate(sampleCertId, "")
      ).to.be.revertedWith("Revocation reason cannot be empty");
    });
  });

  describe("6. Trainee Dashboard (Query by Recipient Address)", function () {
    const cert2Id = "SKIL-2026-CYBER002";
    const cert3Id = "SKIL-2026-CLOUD003";

    beforeEach(async function () {
      await registry.issueCertificate(
        sampleCertId,
        sampleCourseId,
        issuerOrStudent.address,
        sampleHash
      );
      await registry.issueCertificate(
        cert2Id,
        "CS-CYBER-01",
        issuerOrStudent.address,
        sampleHash
      );
      await registry.issueCertificate(
        cert3Id,
        "CS-CLOUD-01",
        student2.address,
        sampleHash
      );
    });

    it("Should return all certificates issued to a recipient wallet", async function () {
      const recipientCerts = await registry.getCertificatesByRecipient(issuerOrStudent.address);
      expect(recipientCerts.length).to.equal(2);
      expect(recipientCerts[0].certId).to.equal(sampleCertId);
      expect(recipientCerts[1].certId).to.equal(cert2Id);

      const student2Certs = await registry.getCertificatesByRecipient(student2.address);
      expect(student2Certs.length).to.equal(1);
      expect(student2Certs[0].certId).to.equal(cert3Id);
    });

    it("Should return an empty array for an address with no certificates", async function () {
      const emptyCerts = await registry.getCertificatesByRecipient(stranger.address);
      expect(emptyCerts.length).to.equal(0);
    });

    it("Should allow owner to view all issued certificates", async function () {
      const allCerts = await registry.getAllCertificates();
      expect(allCerts.length).to.equal(3);
    });
  });
});
