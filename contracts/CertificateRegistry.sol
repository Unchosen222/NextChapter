// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateRegistry
 * @dev Smart Contract for SkilTrust Academy's Blockchain Digital Certificate Verification System.
 * Records tamper-proof certificate hashes and issuance metadata on Ethereum without storing PII on-chain.
 */
contract CertificateRegistry is Ownable {

    struct Certificate {
        string certId;
        string courseId;
        address recipient;
        bytes32 certHash;
        uint256 issueDate;
        bool isRevoked;
        string revokeReason;
        uint256 revokedAt;
    }

    // Mapping from unique certificate ID to Certificate details
    mapping(string => Certificate) private certificates;
    
    // Mapping to track certificate ID uniqueness
    mapping(string => bool) private isCertRegistered;

    // Mapping from recipient address to array of their certificate IDs
    mapping(address => string[]) private recipientCertificates;

    // Array of all certificate IDs for administrative audit
    string[] private allCertIds;

    // Events
    event CertificateIssued(
        string indexed certIdIndex,
        string certId,
        string courseId,
        address indexed recipient,
        bytes32 certHash,
        uint256 issueDate
    );

    event CertificateRevoked(
        string indexed certIdIndex,
        string certId,
        string reason,
        uint256 revokedAt
    );

    /**
     * @dev Constructor initializes the contract setting the deployer as the initial owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Issue a new digital certificate.
     * @param certId Unique certificate reference ID (e.g. SKIL-2026-AI01)
     * @param courseId Identifier of the training course
     * @param recipient Ethereum address of the recipient/trainee
     * @param certHash Cryptographic SHA-256 hash of the generated certificate document/metadata
     */
    function issueCertificate(
        string calldata certId,
        string calldata courseId,
        address recipient,
        bytes32 certHash
    ) external onlyOwner {
        require(bytes(certId).length > 0, "Certificate ID cannot be empty");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        require(recipient != address(0), "Invalid recipient address");
        require(certHash != bytes32(0), "Certificate hash cannot be zero");
        require(!isCertRegistered[certId], "Certificate ID already exists");

        Certificate memory newCert = Certificate({
            certId: certId,
            courseId: courseId,
            recipient: recipient,
            certHash: certHash,
            issueDate: block.timestamp,
            isRevoked: false,
            revokeReason: "",
            revokedAt: 0
        });

        certificates[certId] = newCert;
        isCertRegistered[certId] = true;
        recipientCertificates[recipient].push(certId);
        allCertIds.push(certId);

        emit CertificateIssued(
            certId,
            certId,
            courseId,
            recipient,
            certHash,
            block.timestamp
        );
    }

    /**
     * @notice Revoke an existing certificate in case of error or fraud.
     * @param certId Unique certificate reference ID
     * @param reason Detailed audit reason for revocation
     */
    function revokeCertificate(
        string calldata certId,
        string calldata reason
    ) external onlyOwner {
        require(isCertRegistered[certId], "Certificate does not exist");
        require(!certificates[certId].isRevoked, "Certificate is already revoked");
        require(bytes(reason).length > 0, "Revocation reason cannot be empty");

        Certificate storage cert = certificates[certId];
        cert.isRevoked = true;
        cert.revokeReason = reason;
        cert.revokedAt = block.timestamp;

        emit CertificateRevoked(certId, certId, reason, block.timestamp);
    }

    /**
     * @notice Check if a certificate ID is registered.
     */
    function isCertificateRegistered(string calldata certId) external view returns (bool) {
        return isCertRegistered[certId];
    }

    /**
     * @notice Fetch certificate details by certificate ID.
     */
    function getCertificate(string calldata certId) external view returns (Certificate memory) {
        require(isCertRegistered[certId], "Certificate does not exist");
        return certificates[certId];
    }

    /**
     * @notice Verify certificate authenticity and integrity against a provided SHA-256 hash.
     * @param certId Unique certificate reference ID
     * @param hashToVerify SHA-256 hash calculated from document/file
     * @return isValid True if certificate exists and hash strictly matches
     * @return isRevoked True if certificate has been revoked
     * @return revokeReason Reason for revocation if revoked
     * @return issueDate Timestamp when certificate was issued
     * @return recipient Wallet address of the recipient
     * @return courseId Identifier of the training course
     */
    function verifyCertificate(
        string calldata certId,
        bytes32 hashToVerify
    ) external view returns (
        bool isValid,
        bool isRevoked,
        string memory revokeReason,
        uint256 issueDate,
        address recipient,
        string memory courseId
    ) {
        if (!isCertRegistered[certId]) {
            return (false, false, "Certificate not found", 0, address(0), "");
        }

        Certificate memory cert = certificates[certId];
        bool hashMatches = (cert.certHash == hashToVerify);

        return (
            hashMatches,
            cert.isRevoked,
            cert.revokeReason,
            cert.issueDate,
            cert.recipient,
            cert.courseId
        );
    }

    /**
     * @notice Fetch all certificates belonging to a specific trainee/recipient address.
     * @param recipient The wallet address of the trainee
     */
    function getCertificatesByRecipient(
        address recipient
    ) external view returns (Certificate[] memory) {
        string[] memory ids = recipientCertificates[recipient];
        Certificate[] memory result = new Certificate[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = certificates[ids[i]];
        }

        return result;
    }

    /**
     * @notice Total number of certificates issued by SkilTrust Academy.
     */
    function getTotalCertificates() external view returns (uint256) {
        return allCertIds.length;
    }

    /**
     * @notice Fetch all certificates for administrative audit overview.
     */
    function getAllCertificates() external view returns (Certificate[] memory) {
        Certificate[] memory result = new Certificate[](allCertIds.length);
        for (uint256 i = 0; i < allCertIds.length; i++) {
            result[i] = certificates[allCertIds[i]];
        }
        return result;
    }
}
