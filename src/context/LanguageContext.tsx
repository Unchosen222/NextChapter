import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'th';

export interface Translations {
  // Brand & Common
  brandTitle: string;
  brandSubtitle: string;
  badgeAcademy: string;
  connectWallet: string;
  connecting: string;
  disconnectWallet: string;
  demoMode: string;
  demoEvaluation: string;
  demoBannerText: string;
  switchToLive: string;
  sepoliaPublicRpc: string;
  sepoliaTestnet: string;
  close: string;
  cancel: string;
  save: string;
  saved: string;
  copy: string;
  copied: string;
  adminTag: string;
  wrongNetworkTitle: string;
  btnSwitchSepolia: string;
  
  // Navigation
  navPublicGroup: string;
  navAdminGroup: string;
  navVerify: string;
  navVerifyDesc: string;
  navDashboard: string;
  navDashboardDesc: string;
  navCourses: string;
  navCoursesDesc: string;
  navIssue: string;
  navIssueDesc: string;
  navRevoke: string;
  navRevokeDesc: string;

  // Verify Page
  verifyTitle: string;
  verifySubtitle: string;
  verifyBadge: string;
  tabSearchId: string;
  tabScanQr: string;
  tabVerifyPdf: string;
  certReferenceCode: string;
  certCodePlaceholder: string;
  btnVerifyAuthenticity: string;
  btnVerifying: string;
  quickTestSamples: string;
  sampleValid: string;
  sampleRevoked: string;
  scanQrTitle: string;
  scanQrSubtitle: string;
  btnLaunchCamera: string;
  dropPdfText: string;
  dropPdfBrowse: string;
  dropPdfSubtext: string;
  computedFileHash: string;
  statusValidTitle: string;
  statusValidDesc: string;
  statusRevokedTitle: string;
  statusRevokedDesc: string;
  statusMismatchTitle: string;
  statusMismatchDesc: string;
  statusNotFoundTitle: string;
  statusNotFoundDesc: string;
  btnViewDiploma: string;
  lblIssuedTo: string;
  lblCertId: string;
  lblIssueDate: string;
  lblRecipientWallet: string;
  lblRevocationReason: string;
  lblRevocationTime: string;
  lblOnChainHash: string;
  lblUploadedHash: string;
  lblRecordedOnEthereum: string;
  lblCryptoMatch: string;
  lblHashMismatch: string;
  btnShareLink: string;
  btnCopiedLink: string;
  btnViewEtherscan: string;

  // Issue Page
  issueTitle: string;
  issueSubtitle: string;
  issueBadge: string;
  deployBannerTitle: string;
  deployBannerDesc: string;
  deployBannerMeta: string;
  btnDeploySepolia: string;
  btnDeployingConfirm: string;
  deploySuccessMsg: string;
  walletReqTitle: string;
  walletReqDesc: string;
  btnConnectAdminWallet: string;
  cardIssueDetails: string;
  zeroPiiNote: string;
  lblSelectCourse: string;
  lblStudentFullName: string;
  lblStudentIdOpt: string;
  lblRecipientAddress: string;
  btnUseTestWallet: string;
  btnUseConnected: string;
  lblCertRefId: string;
  btnRegenerate: string;
  lblIssuanceDate: string;
  noteUniquenessCheck: string;
  btnGenerateAndRecord: string;
  stepGenPdf: string;
  stepComputeHash: string;
  stepSubmitTx: string;
  successIssueTitle: string;
  successIssueDesc: string;
  lblTxHash: string;
  btnDownloadPdf: string;
  btnTestVerifyLink: string;

  // Revoke Page
  revokeTitle: string;
  revokeSubtitle: string;
  revokeBadge: string;
  step1LocateId: string;
  btnLookupRecord: string;
  searchingRecord: string;
  lblStatusActive: string;
  lblStatusRevoked: string;
  step2EnterReason: string;
  step2ReasonDesc: string;
  reasonPlaceholder: string;
  irreversibleWarningTitle: string;
  irreversibleWarningDesc: string;
  btnSignRevoke: string;
  btnRevokingOnChain: string;

  // Trainee Dashboard
  dashTitle: string;
  dashSubtitle: string;
  dashBadge: string;
  dashConnectPromptTitle: string;
  dashConnectPromptDesc: string;
  btnConnectMetaMask: string;
  btnPreviewDemoPortfolio: string;
  connectedTraineeAccount: string;
  credentialsEarned: string;
  viewingSamplePortfolio: string;
  loadingCertificates: string;
  noCertificatesTitle: string;
  noCertificatesDesc: string;
  btnVerifyProof: string;

  // Course Catalog
  courseTitle: string;
  courseSubtitle: string;
  courseBadge: string;
  btnCreateCourse: string;
  searchCoursesPlaceholder: string;
  catAll: string;
  catAI: string;
  catCyber: string;
  catCloud: string;
  catData: string;
  catOther: string;
  lblDurationHours: string;
  btnIssueThisCourse: string;
  modalCreateCourseTitle: string;
  lblCourseCode: string;
  lblCategory: string;
  lblCourseTitle: string;
  lblCourseDesc: string;
  lblSkillsCovered: string;
  btnSaveCourse: string;

  // Footer
  footerDesc: string;
  footerZeroPii: string;
  footerSecTitle: string;
  footerSha256: string;
  footerRbac: string;
  footerDualMode: string;
  footerImmutableRevoke: string;
  footerLedgerTitle: string;
  footerContractAddr: string;
  footerChainId: string;
  footerCopyright: string;
  footerVerifiedBadge: string;
  footerHostedOn: string;

  // Settings Modal
  settingsTitle: string;
  settingsDemoTitle: string;
  settingsDemoDesc: string;
  settingsDeployTitle: string;
  settingsDeployDesc: string;
  settingsActiveContract: string;
  settingsContractDesc: string;
  settingsBackupTitle: string;
  btnExportBackup: string;
  btnImportBackup: string;
}

const enTranslations: Translations = {
  // Brand & Common
  brandTitle: 'NextChapter',
  brandSubtitle: 'Blockchain Credentials',
  badgeAcademy: 'Academy',
  connectWallet: 'Connect Wallet',
  connecting: 'Connecting...',
  disconnectWallet: 'Disconnect Wallet',
  demoMode: 'Demo Evaluation Mode',
  demoEvaluation: 'Demo Evaluation',
  demoBannerText: 'Demo Mode Active: Running simulated blockchain for immediate testing without faucet ETH.',
  switchToLive: 'Switch to Live Sepolia',
  sepoliaPublicRpc: 'Sepolia Public RPC',
  sepoliaTestnet: 'Ethereum Sepolia',
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  saved: 'Saved',
  copy: 'Copy',
  copied: 'Copied',
  adminTag: 'Admin',
  wrongNetworkTitle: 'Connected to unsupported network. Please switch to Ethereum Sepolia Testnet.',
  btnSwitchSepolia: 'Switch to Sepolia',

  // Navigation
  navPublicGroup: 'Public Verification',
  navAdminGroup: 'Administration',
  navVerify: 'Verify Certificate',
  navVerifyDesc: 'ID, QR Code, or PDF',
  navDashboard: 'My Certificates',
  navDashboardDesc: 'Trainee Credential Portfolio',
  navCourses: 'Course Catalog',
  navCoursesDesc: 'Curriculum & Programs',
  navIssue: 'Issue Certificate',
  navIssueDesc: 'Generate & Hash to Chain',
  navRevoke: 'Revoke Certificate',
  navRevokeDesc: 'Manage Revocations',

  // Verify Page
  verifyTitle: 'Verify Digital Certificate',
  verifySubtitle: 'Instantly authenticate degree credentials issued by NextChapter Academy. Check cryptographic integrity and revocation status directly on the public ledger.',
  verifyBadge: 'Ethereum Sepolia Cryptographic Verification',
  tabSearchId: 'Search by ID',
  tabScanQr: 'Scan QR Code',
  tabVerifyPdf: 'Verify PDF File',
  certReferenceCode: 'Certificate Reference Code',
  certCodePlaceholder: 'e.g. SKIL-2026-AI01',
  btnVerifyAuthenticity: 'Verify Authenticity',
  btnVerifying: 'Verifying...',
  quickTestSamples: 'Quick Test Samples:',
  sampleValid: 'Valid',
  sampleRevoked: 'Revoked',
  scanQrTitle: 'Scan QR Code from Certificate',
  scanQrSubtitle: 'Use your device camera to scan the verification QR code embedded at the bottom of the diploma.',
  btnLaunchCamera: 'Launch Camera Scanner',
  dropPdfText: 'Drag & drop your certificate PDF here, or',
  dropPdfBrowse: 'browse',
  dropPdfSubtext: 'Computes client-side SHA-256 hash to prove 100% document immutability',
  computedFileHash: 'Computed Browser SHA-256:',
  statusValidTitle: 'Authentic & Valid Certificate',
  statusValidDesc: 'Verified tamper-proof on Ethereum Sepolia. Hash matches official academic records.',
  statusRevokedTitle: 'Certificate Revoked',
  statusRevokedDesc: 'This certificate was officially issued but has since been revoked by NextChapter Academy administration.',
  statusMismatchTitle: 'Integrity Check Mismatch',
  statusMismatchDesc: 'The uploaded document hash does not match the on-chain certificate record. Document may have been modified.',
  statusNotFoundTitle: 'Certificate Not Found',
  statusNotFoundDesc: 'No record exists on the Ethereum blockchain for Reference ID: ',
  btnViewDiploma: 'View Diploma',
  lblIssuedTo: 'Issued To:',
  lblCertId: 'Certificate Reference ID',
  lblIssueDate: 'Issuance Date',
  lblRecipientWallet: 'Recipient Wallet Address',
  lblRevocationReason: 'Official Revocation Reason',
  lblRevocationTime: 'Revocation Timestamp:',
  lblOnChainHash: 'On-Chain Cryptographic SHA-256 Hash',
  lblUploadedHash: 'Uploaded PDF Hash:',
  lblRecordedOnEthereum: 'Recorded on Ethereum',
  lblCryptoMatch: '100% Cryptographic Match',
  lblHashMismatch: 'Hash Mismatch',
  btnShareLink: 'Share Verification Link',
  btnCopiedLink: 'Copied Verification URL!',
  btnViewEtherscan: 'View Contract on Etherscan',

  // Issue Page
  issueTitle: 'Issue Digital Certificate',
  issueSubtitle: 'Generate an official degree certificate with embedded QR verification and anchor its SHA-256 fingerprint onto Ethereum Sepolia.',
  issueBadge: 'Authorized Academy Administration',
  deployBannerTitle: 'Deploy Official NextChapter Contract to Sepolia',
  deployBannerDesc: 'Your wallet will become the official Contract Owner on Sepolia. This creates your genuine smart contract and prevents MetaMask security flags.',
  deployBannerMeta: 'Network: Ethereum Sepolia • Cost: ~0.003 Sepolia ETH',
  btnDeploySepolia: '1-Click Deploy to Sepolia',
  btnDeployingConfirm: 'Confirming in MetaMask...',
  deploySuccessMsg: '✓ Smart Contract Successfully Deployed at:',
  walletReqTitle: 'Administrator Wallet Connection Required',
  walletReqDesc: 'To issue credentials on Ethereum, please connect your authorized Administrator wallet or enable Demo Mode in settings.',
  btnConnectAdminWallet: 'Connect Administrator Wallet',
  cardIssueDetails: 'Certificate Issuance Details',
  zeroPiiNote: 'Zero PII Stored On-Chain',
  lblSelectCourse: 'Select Training Course *',
  lblStudentFullName: 'Student Full Name *',
  lblStudentIdOpt: 'Student ID / Enrollment No (Optional)',
  lblRecipientAddress: 'Recipient Ethereum Wallet Address *',
  btnUseTestWallet: 'Use Test Wallet (0x30035...)',
  btnUseConnected: 'Use Connected',
  lblCertRefId: 'Certificate Reference ID *',
  btnRegenerate: 'Regenerate',
  lblIssuanceDate: 'Issuance Date *',
  noteUniquenessCheck: 'Contract checks uniqueness on-chain before recording cryptographic evidence.',
  btnGenerateAndRecord: 'Generate & Record on Blockchain',
  stepGenPdf: 'Generating branded high-resolution PDF certificate...',
  stepComputeHash: 'Computing cryptographic SHA-256 document fingerprint...',
  stepSubmitTx: 'Submitting transaction to Ethereum Sepolia Smart Contract...',
  successIssueTitle: 'Certificate Issued & Anchored Successfully!',
  successIssueDesc: 'The cryptographic hash has been permanently written to Ethereum Sepolia.',
  lblTxHash: 'Transaction Hash:',
  btnDownloadPdf: 'Download Official PDF Certificate',
  btnTestVerifyLink: 'Test Public Verification Link',

  // Revoke Page
  revokeTitle: 'Revoke Digital Certificate',
  revokeSubtitle: 'Revoke certificates issued erroneously or flagged for academic misconduct. Revocation is recorded permanently on Ethereum while maintaining the audit trail.',
  revokeBadge: 'Restricted Administrative Action',
  step1LocateId: 'Step 1: Locate Certificate Reference ID',
  btnLookupRecord: 'Lookup Record',
  searchingRecord: 'Searching...',
  lblStatusActive: 'CURRENTLY ACTIVE',
  lblStatusRevoked: 'ALREADY REVOKED',
  step2EnterReason: 'Step 2: Enter Mandatory Audit Revocation Reason *',
  step2ReasonDesc: 'Provide clear justification for this administrative action (e.g., typographical error, academic misconduct, duplicate issuance).',
  reasonPlaceholder: 'e.g. Certificate revoked due to academic integrity violation or incorrect student name.',
  irreversibleWarningTitle: 'Irreversible Blockchain Operation',
  irreversibleWarningDesc: 'Once recorded on Ethereum Sepolia, this certificate will permanently report as REVOKED during any employer or public verification scan.',
  btnSignRevoke: 'Sign & Revoke Certificate',
  btnRevokingOnChain: 'Revoking on Ethereum...',

  // Trainee Dashboard
  dashTitle: 'My Certified Credentials',
  dashSubtitle: 'Connect your Web3 wallet to access your official diploma certificates issued and permanently anchored on Ethereum Sepolia.',
  dashBadge: 'Trainee Credential Portfolio',
  dashConnectPromptTitle: 'Connect Your Wallet to Access Certificates',
  dashConnectPromptDesc: 'Your credentials are cryptographically mapped to your Ethereum wallet address on the smart contract.',
  btnConnectMetaMask: 'Connect with MetaMask',
  btnPreviewDemoPortfolio: 'Preview Demo Student Portfolio (0x30035...)',
  connectedTraineeAccount: 'Connected Trainee Account',
  credentialsEarned: 'Credentials Earned',
  viewingSamplePortfolio: 'Viewing sample student portfolio',
  loadingCertificates: 'Loading certificates from blockchain...',
  noCertificatesTitle: 'No Certificates Found',
  noCertificatesDesc: 'No active credentials have been issued to this wallet address on Ethereum Sepolia yet.',
  btnVerifyProof: 'Verify Proof',

  // Course Catalog
  courseTitle: 'Training Courses',
  courseSubtitle: 'Registered professional curricula verified and certified by NextChapter Academy.',
  courseBadge: 'Academic Curriculum Registry',
  btnCreateCourse: 'Create Training Course',
  searchCoursesPlaceholder: 'Search courses or skills...',
  catAll: 'All',
  catAI: 'AI',
  catCyber: 'Cybersecurity',
  catCloud: 'Cloud Computing',
  catData: 'Data Analytics',
  catOther: 'Other',
  lblDurationHours: 'Hours',
  btnIssueThisCourse: 'Issue Certificate →',
  modalCreateCourseTitle: 'Register New Training Course',
  lblCourseCode: 'Course Code *',
  lblCategory: 'Category *',
  lblCourseTitle: 'Course Title *',
  lblCourseDesc: 'Course Description *',
  lblSkillsCovered: 'Skills Covered (Comma-separated)',
  btnSaveCourse: 'Save Course',

  // Footer
  footerDesc: 'A decentralized credential certification framework developed for NextChapter Academy. Utilizes Ethereum Smart Contracts to ensure tamper-proof authenticity, prevent fraud, and facilitate instant public verification.',
  footerZeroPii: 'Zero On-Chain PII: Personal details are never published on the public ledger.',
  footerSecTitle: 'Security Architecture',
  footerSha256: 'SHA-256 Document Fingerprinting',
  footerRbac: 'OpenZeppelin Ownable RBAC',
  footerDualMode: 'Dual-Mode Public RPC Provider',
  footerImmutableRevoke: 'Immutable Revocation Audit Log',
  footerLedgerTitle: 'Ethereum Sepolia Ledger',
  footerContractAddr: 'Smart Contract Address:',
  footerChainId: 'Sepolia Testnet Chain ID: 11155111',
  footerCopyright: '© 2026 NextChapter Academy. Course Project for CSI301 SPU.',
  footerVerifiedBadge: 'Ethereum Smart Contract Verified',
  footerHostedOn: 'Hosted on GitHub Pages',

  // Settings Modal
  settingsTitle: 'System Settings & Contract Config',
  settingsDemoTitle: 'Demo Evaluation Mode',
  settingsDemoDesc: 'Enables instant in-memory blockchain simulation for evaluators testing without Sepolia faucet ETH.',
  settingsDeployTitle: 'Deploy Contract with Connected Wallet',
  settingsDeployDesc: 'Deploys your genuine CertificateRegistry to Sepolia so you are the contract owner.',
  settingsActiveContract: 'Active Smart Contract Address (Ethereum Sepolia)',
  settingsContractDesc: 'You can manually paste any deployed contract address here.',
  settingsBackupTitle: 'Data Catalog Backup (Courses & Local Metadata)',
  btnExportBackup: 'Export Backup (JSON)',
  btnImportBackup: 'Import Backup',
};

const thTranslations: Translations = {
  // Brand & Common
  brandTitle: 'NextChapter',
  brandSubtitle: 'ระบบใบรับรองบล็อกเชน',
  badgeAcademy: 'อะคาเดมี่',
  connectWallet: 'เชื่อมต่อ Wallet',
  connecting: 'กำลังเชื่อมต่อ...',
  disconnectWallet: 'ตัดการเชื่อมต่อ',
  demoMode: 'โหมดทดสอบจำลอง (Demo)',
  demoEvaluation: 'โหมดประเมินผล',
  demoBannerText: 'กำลังใช้งานโหมดจำลอง: ทดสอบระบบได้ทันทีโดยไม่ต้องใช้ Sepolia ETH',
  switchToLive: 'สลับไปใช้งาน Sepolia จริง',
  sepoliaPublicRpc: 'Sepolia Public RPC',
  sepoliaTestnet: 'Ethereum Sepolia',
  close: 'ปิด',
  cancel: 'ยกเลิก',
  save: 'บันทึก',
  saved: 'บันทึกแล้ว',
  copy: 'คัดลอก',
  copied: 'คัดลอกแล้ว',
  adminTag: 'ผู้ดูแล',
  wrongNetworkTitle: 'กำลังเชื่อมต่อกับเครือข่ายที่ไม่รองรับ กรุณาสลับไปยัง Ethereum Sepolia Testnet',
  btnSwitchSepolia: 'สลับไปยัง Sepolia',

  // Navigation
  navPublicGroup: 'การตรวจสอบสาธารณะ',
  navAdminGroup: 'การจัดการระบบ',
  navVerify: 'ตรวจสอบใบรับรอง',
  navVerifyDesc: 'ด้วยรหัส, QR Code หรือไฟล์ PDF',
  navDashboard: 'ใบรับรองของฉัน',
  navDashboardDesc: 'พอร์ตโฟลิโอคุณวุฒิของผู้เรียน',
  navCourses: 'หลักสูตรอบรม',
  navCoursesDesc: 'หลักสูตรและวิชาที่เปิดสอน',
  navIssue: 'ออกใบรับรองดิจิทัล',
  navIssueDesc: 'สร้างเอกสารและบันทึก Hash บนเชน',
  navRevoke: 'เพิกถอนใบรับรอง',
  navRevokeDesc: 'ยกเลิกใบรับรองที่มีข้อผิดพลาด',

  // Verify Page
  verifyTitle: 'ตรวจสอบความถูกต้องใบรับรอง',
  verifySubtitle: 'ตรวจสอบความถูกต้องของใบรับรองที่ออกโดย NextChapter Academy ได้ทันที โดยตรวจเช็กความถูกต้องของข้อมูลและสถานะการเพิกถอนบน Ethereum Blockchain',
  verifyBadge: 'ระบบตรวจสอบความถูกต้องด้วยการเข้ารหัสบน Ethereum Sepolia',
  tabSearchId: 'ค้นหาด้วยรหัสใบรับรอง',
  tabScanQr: 'สแกน QR Code',
  tabVerifyPdf: 'ตรวจสอบไฟล์เอกสาร PDF',
  certReferenceCode: 'รหัสอ้างอิงใบรับรอง (Certificate Reference Code)',
  certCodePlaceholder: 'เช่น SKIL-2026-AI01',
  btnVerifyAuthenticity: 'ตรวจสอบความถูกต้อง',
  btnVerifying: 'กำลังตรวจสอบ...',
  quickTestSamples: 'ตัวอย่างสำหรับทดสอบ:',
  sampleValid: 'ใช้งานได้',
  sampleRevoked: 'ถูกเพิกถอน',
  scanQrTitle: 'สแกน QR Code จากใบรับรอง',
  scanQrSubtitle: 'ใช้กล้องของอุปกรณ์เพื่อสแกน QR Code ตรวจสอบที่อยู่ด้านล่างของใบรับรอง',
  btnLaunchCamera: 'เปิดกล้องเพื่อสแกน',
  dropPdfText: 'ลากและวางไฟล์ใบรับรอง PDF ที่นี่ หรือ',
  dropPdfBrowse: 'เลือกไฟล์',
  dropPdfSubtext: 'คำนวณค่า SHA-256 Hash บนเบราว์เซอร์ เพื่อพิสูจน์ว่าเอกสารไม่เคยถูกแก้ไข',
  computedFileHash: 'ค่า SHA-256 ที่คำนวณได้จากไฟล์:',
  statusValidTitle: 'ใบรับรองเป็นของแท้และมีผลใช้งาน',
  statusValidDesc: 'ตรวจสอบแล้วว่าข้อมูลไม่ถูกแก้ไขบน Ethereum Sepolia ค่า Hash ตรงกับบันทึกของสถาบัน',
  statusRevokedTitle: 'ใบรับรองนี้ถูกเพิกถอนแล้ว',
  statusRevokedDesc: 'ใบรับรองนี้เคยได้รับการออกอย่างเป็นทางการ แต่ถูกเพิกถอนโดยผู้ดูแลระบบของ NextChapter Academy',
  statusMismatchTitle: 'ข้อมูลเอกสารไม่ตรงกับบันทึกบนบล็อกเชน',
  statusMismatchDesc: 'ค่า Hash ของไฟล์ที่อัปโหลดไม่ตรงกับที่บันทึกไว้ เอกสารอาจมีการแก้ไข ดัดแปลง หรือปลอมแปลง',
  statusNotFoundTitle: 'ไม่พบข้อมูลใบรับรอง',
  statusNotFoundDesc: 'ไม่มีบันทึกบน Ethereum Blockchain สำหรับรหัสอ้างอิง: ',
  btnViewDiploma: 'ดูใบรับรอง',
  lblIssuedTo: 'ออกให้แก่:',
  lblCertId: 'รหัสอ้างอิงใบรับรอง',
  lblIssueDate: 'วันที่ออกใบรับรอง',
  lblRecipientWallet: 'กระเป๋าเงินดิจิทัลของผู้รับ (Wallet)',
  lblRevocationReason: 'เหตุผลการเพิกถอนอย่างเป็นทางการ',
  lblRevocationTime: 'เวลาที่ทำการเพิกถอน:',
  lblOnChainHash: 'ค่า Cryptographic SHA-256 Hash บนเชน',
  lblUploadedHash: 'ค่า Hash ของไฟล์ PDF ที่อัปโหลด:',
  lblRecordedOnEthereum: 'บันทึกบน Ethereum แล้ว',
  lblCryptoMatch: 'ค่า Hash ตรงกัน 100% (เอกสารแท้)',
  lblHashMismatch: 'ค่า Hash ไม่ตรงกัน',
  btnShareLink: 'คัดลอกลิงก์ตรวจสอบ',
  btnCopiedLink: 'คัดลอกลิงก์เรียบร้อยแล้ว!',
  btnViewEtherscan: 'ดู Smart Contract บน Etherscan',

  // Issue Page
  issueTitle: 'ออกใบรับรองดิจิทัล',
  issueSubtitle: 'สร้างใบรับรองมาตรฐานสถาบันพร้อม QR Code ตรวจสอบ และบันทึกค่าลายพิมพ์นิ้วมือดิจิทัล (SHA-256) ลงบน Ethereum Sepolia',
  issueBadge: 'ส่วนงานผู้ดูแลระบบที่ได้รับอนุญาต',
  deployBannerTitle: 'ติดตั้ง Smart Contract ของ NextChapter บน Sepolia',
  deployBannerDesc: 'กระเป๋าเงินของคุณจะเป็นเจ้าของสัญญา (Owner) บน Sepolia ช่วยสร้างสัญญาจริงและป้องกันการแจ้งเตือนความปลอดภัยจาก MetaMask',
  deployBannerMeta: 'เครือข่าย: Ethereum Sepolia • ค่าธรรมเนียมแก๊ส: ~0.003 Sepolia ETH',
  btnDeploySepolia: 'คลิกเดียวติดตั้งลง Sepolia',
  btnDeployingConfirm: 'กรุณายืนยันใน MetaMask...',
  deploySuccessMsg: '✓ ติดตั้ง Smart Contract สำเร็จที่แอดเดรส:',
  walletReqTitle: 'จำเป็นต้องเชื่อมต่อ Wallet ผู้ดูแลระบบ',
  walletReqDesc: 'หากต้องการออกใบรับรองบนบล็อกเชน กรุณาเชื่อมต่อกระเป๋าเงินผู้ดูแล หรือเปิดโหมดทดสอบจำลอง (Demo Mode) ในการตั้งค่า',
  btnConnectAdminWallet: 'เชื่อมต่อ Wallet ผู้ดูแลระบบ',
  cardIssueDetails: 'รายละเอียดการออกใบรับรอง',
  zeroPiiNote: 'ไม่มีข้อมูลส่วนบุคคลถูกเก็บขึ้นเชน',
  lblSelectCourse: 'เลือกหลักสูตรการฝึกอบรม *',
  lblStudentFullName: 'ชื่อ-นามสกุล ผู้เข้ารับการอบรม *',
  lblStudentIdOpt: 'รหัสนักศึกษา / รหัสประจำตัว (ระบุหรือไม่ก็ได้)',
  lblRecipientAddress: 'กระเป๋าเงินดิจิทัลของผู้รับ (Ethereum Address) *',
  btnUseTestWallet: 'ใช้กระเป๋าทดสอบ (0x30035...)',
  btnUseConnected: 'ใช้กระเป๋าที่เชื่อมต่อ',
  lblCertRefId: 'รหัสอ้างอิงใบรับรอง *',
  btnRegenerate: 'สุ่มรหัสใหม่',
  lblIssuanceDate: 'วันที่ออกใบรับรอง *',
  noteUniquenessCheck: 'ระบบจะตรวจสอบความไม่ซ้ำกันของรหัสบน Smart Contract ก่อนบันทึกหลักฐาน',
  btnGenerateAndRecord: 'สร้างเอกสารและบันทึกลงบล็อกเชน',
  stepGenPdf: 'กำลังสร้างไฟล์เอกสาร PDF ความละเอียดสูง...',
  stepComputeHash: 'กำลังคำนวณลายพิมพ์นิ้วมือเอกสาร SHA-256...',
  stepSubmitTx: 'กำลังส่งธุรกรรมไปยัง Ethereum Smart Contract...',
  successIssueTitle: 'ออกใบรับรองและบันทึกบนบล็อกเชนสำเร็จ!',
  successIssueDesc: 'ค่าหลักฐานดิจิทัลถูกบันทึกอย่างถาวรและไม่สามารถแก้ไขได้บน Ethereum Sepolia',
  lblTxHash: 'หมายเลขธุรกรรม (Transaction Hash):',
  btnDownloadPdf: 'ดาวน์โหลดใบรับรองดิจิทัล (PDF)',
  btnTestVerifyLink: 'ทดสอบลิงก์ตรวจสอบสาธารณะ',

  // Revoke Page
  revokeTitle: 'เพิกถอนใบรับรองดิจิทัล',
  revokeSubtitle: 'ยกเลิกใบรับรองที่ออกผิดพลาดหรือมีการทุจริตทางวิชาการ โดยยังคงประวัติการออกไว้บนบล็อกเชนอย่างโปร่งใส',
  revokeBadge: 'การดำเนินการเฉพาะผู้ดูแลระบบ',
  step1LocateId: 'ขั้นตอนที่ 1: ค้นหารหัสอ้างอิงใบรับรอง',
  btnLookupRecord: 'ค้นหาบันทึก',
  searchingRecord: 'กำลังค้นหา...',
  lblStatusActive: 'สถานะ: ใช้งานได้ปกติ',
  lblStatusRevoked: 'สถานะ: ถูกเพิกถอนแล้ว',
  step2EnterReason: 'ขั้นตอนที่ 2: ระบุเหตุผลการเพิกถอนเพื่อการตรวจสอบ *',
  step2ReasonDesc: 'ระบุคำชี้แจงที่ชัดเจนสำหรับการเพิกถอนครั้งนี้ (เช่น ข้อมูลชื่อผิดพลาด, ทุจริตการสอบ, หรือออกซ้ำซ้อน)',
  reasonPlaceholder: 'เช่น เพิกถอนเนื่องจากสะกดชื่อผิดพลาด หรือมีการทุจริตการสอบ',
  irreversibleWarningTitle: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
  irreversibleWarningDesc: 'เมื่อบันทึกลงบน Ethereum Sepolia แล้ว ใบรับรองนี้จะแสดงสถานะเป็น "ถูกเพิกถอน" ถาวรเมื่อมีการตรวจสอบจากนายจ้างหรือบุคคลภายนอก',
  btnSignRevoke: 'ลงนามเพิกถอนใบรับรอง',
  btnRevokingOnChain: 'กำลังบันทึกการเพิกถอนลงเชน...',

  // Trainee Dashboard
  dashTitle: 'ประวัติและคุณวุฒิของฉัน',
  dashSubtitle: 'เชื่อมต่อ Web3 Wallet เพื่อดูรายการใบรับรองดิจิทัลของคุณที่ผูกกับบัญชีและบันทึกบน Ethereum Sepolia',
  dashBadge: 'พอร์ตโฟลิโอคุณวุฒิของผู้เข้าอบรม',
  dashConnectPromptTitle: 'เชื่อมต่อ Wallet เพื่อดูรายการใบรับรองของคุณ',
  dashConnectPromptDesc: 'ใบรับรองของคุณจะผูกกับ Ethereum Wallet Address บน Smart Contract โดยตรง',
  btnConnectMetaMask: 'เชื่อมต่อผ่าน MetaMask',
  btnPreviewDemoPortfolio: 'ดูตัวอย่างพอร์ตโฟลิโอผู้เรียน (0x30035...)',
  connectedTraineeAccount: 'บัญชีผู้เรียนที่เชื่อมต่ออยู่',
  credentialsEarned: 'คุณวุฒิที่ได้รับ',
  viewingSamplePortfolio: 'กำลังดูพอร์ตโฟลิโอตัวอย่าง',
  loadingCertificates: 'กำลังโหลดข้อมูลจากบล็อกเชน...',
  noCertificatesTitle: 'ไม่พบรายการใบรับรอง',
  noCertificatesDesc: 'ยังไม่มีใบรับรองที่ออกให้แก่บัญชี Wallet นี้บน Ethereum Sepolia',
  btnVerifyProof: 'ตรวจสอบหลักฐาน',

  // Course Catalog
  courseTitle: 'หลักสูตรการฝึกอบรม',
  courseSubtitle: 'หลักสูตรพัฒนาทักษะเฉพาะทางด้านเทคโนโลยีที่ได้รับการรับรองมาตรฐานโดย NextChapter Academy',
  courseBadge: 'ทะเบียนหลักสูตรสถาบัน',
  btnCreateCourse: 'ลงทะเบียนหลักสูตรใหม่',
  searchCoursesPlaceholder: 'ค้นหาหลักสูตรหรือทักษะที่สอน...',
  catAll: 'ทั้งหมด',
  catAI: 'ปัญญาประดิษฐ์ (AI)',
  catCyber: 'ความมั่นคงไซเบอร์',
  catCloud: 'คลาวด์คอมพิวติง',
  catData: 'การวิเคราะห์ข้อมูล',
  catOther: 'อื่นๆ',
  lblDurationHours: 'ชั่วโมง',
  btnIssueThisCourse: 'ออกใบรับรองหลักสูตรนี้ →',
  modalCreateCourseTitle: 'ลงทะเบียนหลักสูตรใหม่',
  lblCourseCode: 'รหัสหลักสูตร *',
  lblCategory: 'หมวดหมู่หลักสูตร *',
  lblCourseTitle: 'ชื่อหลักสูตร *',
  lblCourseDesc: 'รายละเอียดหลักสูตร *',
  lblSkillsCovered: 'ทักษะที่ได้รับ (คั่นด้วยจุลภาค ,)',
  btnSaveCourse: 'บันทึกหลักสูตร',

  // Footer
  footerDesc: 'ระบบออกและตรวจสอบใบรับรองดิจิทัลสำหรับ NextChapter Academy โดยใช้ Ethereum Smart Contract เพื่อให้ตรวจสอบความถูกต้องได้อย่างน่าเชื่อถือ ป้องกันการปลอมแปลง และลดขั้นตอนการตรวจสอบคุณวุฒิ',
  footerZeroPii: 'Zero On-Chain PII: ไม่มีการจัดเก็บข้อมูลส่วนบุคคลบนบล็อกเชนสาธารณะอย่างเด็ดขาด',
  footerSecTitle: 'สถาปัตยกรรมความปลอดภัย',
  footerSha256: 'ลายพิมพ์นิ้วมือดิจิทัล SHA-256',
  footerRbac: 'การควบคุมสิทธิ์ OpenZeppelin Ownable',
  footerDualMode: 'ตรวจสอบผ่าน Public RPC ได้โดยไม่ต้องมี Wallet',
  footerImmutableRevoke: 'ประวัติการเพิกถอนที่แก้ไขไม่ได้',
  footerLedgerTitle: 'ข้อมูลบน Ethereum Sepolia',
  footerContractAddr: 'แอดเดรส Smart Contract:',
  footerChainId: 'Sepolia Testnet Chain ID: 11155111',
  footerCopyright: '© 2026 NextChapter Academy. โครงงานรายวิชา CSI301 มหาวิทยาลัยศรีปทุม (SPU)',
  footerVerifiedBadge: 'ตรวจสอบความถูกต้องด้วย Ethereum Smart Contract',
  footerHostedOn: 'เผยแพร่บน GitHub Pages',

  // Settings Modal
  settingsTitle: 'การตั้งค่าระบบและ Smart Contract',
  settingsDemoTitle: 'โหมดทดสอบจำลอง (Demo Evaluation Mode)',
  settingsDemoDesc: 'เปิดใช้งานการจำลองบล็อกเชนในหน่วยความจำ สำหรับผู้ตรวจงานหรืออาจารย์ที่ไม่มี Sepolia ETH',
  settingsDeployTitle: 'ติดตั้ง Smart Contract ด้วย Wallet ที่เชื่อมต่อ',
  settingsDeployDesc: 'ติดตั้งสัญญา CertificateRegistry บน Sepolia เพื่อให้กระเป๋าของคุณเป็น Owner ของสัญญา',
  settingsActiveContract: 'แอดเดรส Smart Contract ที่ใช้งานอยู่ (Ethereum Sepolia)',
  settingsContractDesc: 'สามารถระบุแอดเดรสสัญญาที่ติดตั้งบน Sepolia ได้ที่นี่',
  settingsBackupTitle: 'สำรองข้อมูลหลักสูตรและข้อมูลใบรับรอง',
  btnExportBackup: 'ส่งออกข้อมูลสำรอง (JSON)',
  btnImportBackup: 'นำเข้าข้อมูลสำรอง',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: enTranslations,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('skiltrust_lang');
      if (stored === 'th' || stored === 'en') return stored;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('skiltrust_lang', lang);
    } catch {}
  };

  const t = language === 'th' ? thTranslations : enTranslations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
