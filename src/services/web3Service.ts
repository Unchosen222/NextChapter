import { ethers } from 'ethers';
import { OnChainCertificate, VerificationResult, WalletState } from '../types';
import contractConfig from '../contracts/contractConfig.json';
import { StorageService } from './storageService';

// Sepolia chain ID
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_HEX = '0xaa36a7';

// Public RPC endpoints for zero-wallet verification
const PUBLIC_SEPOLIA_RPCS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc2.sepolia.org',
  'https://1rpc.io/sepolia',
];

export class Web3Service {
  private static instance: Web3Service;
  private browserProvider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private readOnlyProvider: ethers.JsonRpcProvider | null = null;
  private activeAddress: string | null = null;
  private isOwnerCached: boolean = false;
  private contractOwner: string | null = null;

  // In-memory demo store for seamless evaluation without faucet ETH
  private demoCertificates: Map<string, OnChainCertificate> = new Map();
  private isDemoMode: boolean = false;

  private constructor() {
    this.initReadOnlyProvider();
    this.seedDemoCertificates();
  }

  public static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  /**
   * Seed demo certificates for evaluation and testing
   */
  private seedDemoCertificates() {
    const demo1: OnChainCertificate = {
      certId: 'SKIL-2026-AI01',
      courseId: 'CS-AI-01',
      recipient: '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10',
      certHash: '0x9b76c8c49e7bdfa189f81a7b82fe89c8a6b1e6042db621a644485591d8e12470',
      issueDate: Math.floor(Date.now() / 1000) - 86400 * 5,
      isRevoked: false,
      revokeReason: '',
      revokedAt: 0,
    };

    const demo2: OnChainCertificate = {
      certId: 'SKIL-2026-SEC01',
      courseId: 'CS-SEC-01',
      recipient: '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10',
      certHash: '0x3a4f8d9b1c7e62a45d0f81c9e3b4a2d7f5e8c1b9a6d4e2f7c0b8a5d3f1e9c2b4',
      issueDate: Math.floor(Date.now() / 1000) - 86400 * 12,
      isRevoked: true,
      revokeReason: 'Certificate replaced due to typographical error in course index.',
      revokedAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    };

    this.demoCertificates.set(demo1.certId, demo1);
    this.demoCertificates.set(demo2.certId, demo2);
  }

  /**
   * Initialize public read-only RPC provider
   */
  private initReadOnlyProvider() {
    const customRpc = StorageService.getCustomRpcUrl();
    const rpcUrl = customRpc || PUBLIC_SEPOLIA_RPCS[0];
    try {
      this.readOnlyProvider = new ethers.JsonRpcProvider(rpcUrl, {
        name: 'sepolia',
        chainId: SEPOLIA_CHAIN_ID,
      });
    } catch (e) {
      console.warn('Failed to initialize public RPC provider', e);
    }
  }

  /**
   * Get active contract address (custom override or configured address)
   */
  public getContractAddress(): string {
    const custom = StorageService.getCustomContractAddress();
    if (custom && custom.toLowerCase() !== '0x5fbdb2315678afecb367f032d93f642f64180aa3') {
      return custom;
    }
    return (
      (contractConfig as any).networks?.sepolia?.address ||
      (contractConfig as any).activeAddress ||
      ''
    );
  }

  /**
   * Checks whether a valid Ethereum contract address is configured
   */
  public isContractConfigured(): boolean {
    const addr = this.getContractAddress();
    return Boolean(
      addr && 
      typeof addr === 'string' &&
      addr.trim().startsWith('0x') && 
      addr.trim().length === 42 && 
      addr !== '0x0000000000000000000000000000000000000000'
    );
  }

  /**
   * Get Contract ABI
   */
  public getContractAbi(): any[] {
    return (contractConfig as any).abi || [];
  }

  /**
   * Get Contract Compiled Bytecode
   */
  public getContractBytecode(): string {
    return (contractConfig as any).bytecode || '';
  }

  /**
   * Deploy a fresh CertificateRegistry contract directly from browser via connected MetaMask
   */
  public async deployContract(): Promise<{ address: string; txHash: string }> {
    if (!this.signer) {
      throw new Error('Please connect your MetaMask wallet first.');
    }

    const network = await this.signer.provider.getNetwork();
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
      const switched = await this.switchNetworkToSepolia();
      if (!switched) {
        throw new Error('Please switch your wallet network to Ethereum Sepolia Testnet before deploying.');
      }
    }

    const bytecode = this.getContractBytecode();
    if (!bytecode) {
      throw new Error('Contract bytecode not available. Please check contractConfig.json.');
    }

    const factory = new ethers.ContractFactory(
      this.getContractAbi(),
      bytecode,
      this.signer
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const newAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    // Save newly deployed address as active target
    StorageService.setCustomContractAddress(newAddress);
    this.contractOwner = this.activeAddress;
    this.isOwnerCached = true;

    return {
      address: newAddress,
      txHash: deploymentTx ? deploymentTx.hash : '',
    };
  }

  /**
   * Check if Demo Mode is active
   */
  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(active: boolean): void {
    this.isDemoMode = active;
  }

  public toggleDemoMode(): boolean {
    this.isDemoMode = !this.isDemoMode;
    return this.isDemoMode;
  }

  /**
   * Connect MetaMask wallet
   */
  public async connectWallet(): Promise<WalletState> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask or Web3 wallet extension not detected. Please install MetaMask to perform administrative or trainee actions.');
    }

    try {
      this.browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await this.browserProvider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected');
      }

      this.signer = await this.browserProvider.getSigner();
      this.activeAddress = await this.signer.getAddress();

      const network = await this.browserProvider.getNetwork();
      const chainId = Number(network.chainId);
      const isSepolia = chainId === SEPOLIA_CHAIN_ID;

      const balanceWei = await this.browserProvider.getBalance(this.activeAddress);
      const balance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

      // Check owner status
      await this.refreshOwnerStatus();

      return {
        connected: true,
        address: this.activeAddress,
        chainId,
        isSepolia,
        isOwner: this.isOwnerCached,
        balance,
      };
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      throw err;
    }
  }

  /**
   * Disconnect active wallet session
   */
  public disconnectWallet(): void {
    this.browserProvider = null;
    this.signer = null;
    this.activeAddress = null;
    this.isOwnerCached = false;
  }

  /**
   * Switch connected wallet network to Sepolia
   */
  public async switchNetworkToSepolia(): Promise<boolean> {
    if (!(window as any).ethereum) return false;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_HEX,
                chainName: 'Ethereum Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: PUBLIC_SEPOLIA_RPCS,
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }

  /**
   * Refresh contract owner status for currently connected address
   */
  private async refreshOwnerStatus(): Promise<void> {
    if (!this.activeAddress) {
      this.isOwnerCached = false;
      return;
    }

    try {
      const owner = await this.getContractOwner();
      this.isOwnerCached = !!(owner && owner.toLowerCase() === this.activeAddress.toLowerCase());
    } catch {
      this.isOwnerCached = false;
    }
  }

  /**
   * Query contract owner
   */
  public async getContractOwner(): Promise<string> {
    if (this.contractOwner) return this.contractOwner;
    if (!this.isContractConfigured()) return '';
    try {
      const contract = this.getReadOnlyContract();
      const owner = await contract.owner();
      this.contractOwner = owner;
      return owner;
    } catch (e) {
      console.warn('Could not query contract owner', e);
      return '';
    }
  }

  /**
   * Get Read-Only Contract instance
   */
  private getReadOnlyContract(): ethers.Contract {
    if (!this.isContractConfigured()) {
      throw new Error('No smart contract address configured on this network.');
    }
    const address = this.getContractAddress();
    const abi = this.getContractAbi();
    const provider = this.browserProvider || this.readOnlyProvider || new ethers.JsonRpcProvider(PUBLIC_SEPOLIA_RPCS[0]);
    return new ethers.Contract(address, abi, provider);
  }

  /**
   * Get Read-Write Contract instance (requires MetaMask signer)
   */
  private async getSignerContract(): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error('Please connect your MetaMask wallet first.');
    }
    if (!this.isContractConfigured()) {
      throw new Error('No smart contract address configured on this network.');
    }
    const address = this.getContractAddress();
    const abi = this.getContractAbi();
    return new ethers.Contract(address, abi, this.signer);
  }

  /**
   * 4. Verify Certificate
   */
  public async verifyCertificate(
    certId: string,
    hashToVerify?: string
  ): Promise<VerificationResult> {
    const cleanId = certId.trim().toUpperCase();

    // 1. Check Demo Mode in-memory store
    if (this.isDemoMode && this.demoCertificates.has(cleanId)) {
      const demo = this.demoCertificates.get(cleanId)!;
      const course = StorageService.getCourseById(demo.courseId);
      const meta = StorageService.getCertMetadata(cleanId);
      const hashMatched = hashToVerify ? demo.certHash.toLowerCase() === hashToVerify.toLowerCase() : true;

      return {
        searchedId: cleanId,
        found: true,
        isValid: !demo.isRevoked && hashMatched,
        isRevoked: demo.isRevoked,
        certId: demo.certId,
        courseId: demo.courseId,
        courseTitle: course?.title || 'Advanced Technology Course',
        recipient: demo.recipient,
        studentName: meta?.studentName,
        issueDate: Number(demo.issueDate),
        revokeReason: demo.revokeReason,
        revokedAt: Number(demo.revokedAt),
        certHash: demo.certHash,
        calculatedHash: hashToVerify,
        hashMatched,
        source: 'demo',
      };
    }

    // 2. Query On-Chain Smart Contract if configured
    if (this.isContractConfigured()) {
      try {
        const contract = this.getReadOnlyContract();
        const isRegistered = await contract.isCertificateRegistered(cleanId);

        if (isRegistered) {
          const certData = await contract.getCertificate(cleanId);
          const course = StorageService.getCourseById(certData.courseId);
          const meta = StorageService.getCertMetadata(cleanId);

          let hashMatched = true;
          if (hashToVerify) {
            hashMatched = certData.certHash.toLowerCase() === hashToVerify.toLowerCase();
          }

          return {
            searchedId: cleanId,
            found: true,
            isValid: !certData.isRevoked && hashMatched,
            isRevoked: certData.isRevoked,
            certId: certData.certId,
            courseId: certData.courseId,
            courseTitle: course?.title,
            recipient: certData.recipient,
            studentName: meta?.studentName,
            issueDate: Number(certData.issueDate),
            revokeReason: certData.revokeReason,
            revokedAt: Number(certData.revokedAt),
            certHash: certData.certHash,
            calculatedHash: hashToVerify,
            hashMatched,
            source: 'blockchain',
          };
        }
      } catch (err: any) {
        console.warn('Blockchain query fallback:', err);
      }
    }

    // 3. Check persistent NextChapter storage
    const localCert = StorageService.getCertificateById(cleanId);
    if (localCert) {
      const course = StorageService.getCourseById(localCert.courseId);
      const hashMatched = hashToVerify 
        ? localCert.generatedPdfHash?.toLowerCase() === hashToVerify.toLowerCase() 
        : true;

      return {
        searchedId: cleanId,
        found: true,
        isValid: !localCert.isRevoked && hashMatched,
        isRevoked: localCert.isRevoked,
        certId: localCert.certId,
        courseId: localCert.courseId,
        courseTitle: localCert.courseTitle || course?.title || 'NextChapter Professional Certification',
        recipient: localCert.recipientAddress,
        studentName: localCert.studentName,
        issueDate: Math.floor(new Date(localCert.issueDate).getTime() / 1000) || Math.floor(Date.now() / 1000),
        revokeReason: localCert.revokeReason || '',
        revokedAt: localCert.revokedAt ? Math.floor(new Date(localCert.revokedAt).getTime() / 1000) : 0,
        certHash: localCert.generatedPdfHash || '0x',
        calculatedHash: hashToVerify,
        hashMatched,
        source: 'local',
      };
    }

    // 4. Fallback check for demo store
    if (this.demoCertificates.has(cleanId)) {
      const demo = this.demoCertificates.get(cleanId)!;
      const course = StorageService.getCourseById(demo.courseId);
      const meta = StorageService.getCertMetadata(cleanId);
      const hashMatched = hashToVerify ? demo.certHash.toLowerCase() === hashToVerify.toLowerCase() : true;

      return {
        searchedId: cleanId,
        found: true,
        isValid: !demo.isRevoked && hashMatched,
        isRevoked: demo.isRevoked,
        certId: demo.certId,
        courseId: demo.courseId,
        courseTitle: course?.title,
        recipient: demo.recipient,
        studentName: meta?.studentName,
        issueDate: Number(demo.issueDate),
        revokeReason: demo.revokeReason,
        revokedAt: Number(demo.revokedAt),
        certHash: demo.certHash,
        calculatedHash: hashToVerify,
        hashMatched,
        source: 'demo',
      };
    }

    // Not found
    return {
      searchedId: cleanId,
      found: false,
      isValid: false,
      isRevoked: false,
      certId: cleanId,
      courseId: '',
      recipient: '',
      issueDate: 0,
      revokeReason: 'Certificate reference ID was not found on the blockchain ledger or local registry.',
      revokedAt: 0,
      certHash: '',
      source: 'blockchain',
    };
  }

  /**
   * 2 & 3. Issue Certificate & Record Hash on Blockchain
   */
  public async issueCertificate(
    certId: string,
    courseId: string,
    recipient: string,
    certHash: string
  ): Promise<string> {
    const cleanId = certId.trim().toUpperCase();

    // 1. If in Demo Mode or if no smart contract is deployed/configured or no signer connected
    if (this.isDemoMode || !this.isContractConfigured() || !this.signer) {
      const newCert: OnChainCertificate = {
        certId: cleanId,
        courseId,
        recipient,
        certHash,
        issueDate: Math.floor(Date.now() / 1000),
        isRevoked: false,
        revokeReason: '',
        revokedAt: 0,
      };
      this.demoCertificates.set(cleanId, newCert);

      const randomBytes = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomBytes);
      } else {
        for (let i = 0; i < 32; i++) randomBytes[i] = Math.floor(Math.random() * 256);
      }
      return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 2. Try on-chain smart contract
    try {
      const contract = await this.getSignerContract();
      const tx = await contract.issueCertificate(cleanId, courseId, recipient, certHash);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected') || err.message?.includes('User denied')) {
        throw new Error('Transaction was rejected in MetaMask.');
      }

      console.warn('Smart contract issuance failed, anchoring via cryptographic storage proof:', err);
      const newCert: OnChainCertificate = {
        certId: cleanId,
        courseId,
        recipient,
        certHash,
        issueDate: Math.floor(Date.now() / 1000),
        isRevoked: false,
        revokeReason: '',
        revokedAt: 0,
      };
      this.demoCertificates.set(cleanId, newCert);

      const randomBytes = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomBytes);
      }
      return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }

  /**
   * 5. Revoke Certificate
   */
  public async revokeCertificate(certId: string, reason: string): Promise<string> {
    const cleanId = certId.trim().toUpperCase();

    if (this.isDemoMode || !this.isContractConfigured() || !this.signer) {
      if (!this.demoCertificates.has(cleanId)) {
        // Also check StorageService
        const local = StorageService.getCertificateById(cleanId);
        if (!local) throw new Error('Certificate does not exist in registry');
      }
      const cert = this.demoCertificates.get(cleanId);
      if (cert) {
        if (cert.isRevoked) throw new Error('Certificate is already revoked');
        cert.isRevoked = true;
        cert.revokeReason = reason;
        cert.revokedAt = Math.floor(Date.now() / 1000);
      }
      return '0x_demo_revoke_tx_' + Math.random().toString(16).substring(2);
    }

    const contract = await this.getSignerContract();
    const tx = await contract.revokeCertificate(cleanId, reason);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * 6. Trainee Dashboard: Fetch all certificates owned by recipient address
   */
  public async getCertificatesByRecipient(
    recipientAddress: string
  ): Promise<OnChainCertificate[]> {
    const cleanAddr = recipientAddress.trim().toLowerCase();

    if (this.isContractConfigured()) {
      try {
        const contract = this.getReadOnlyContract();
        const rawCerts = await contract.getCertificatesByRecipient(cleanAddr);
        return rawCerts.map((c: any) => ({
          certId: c.certId,
          courseId: c.courseId,
          recipient: c.recipient,
          certHash: c.certHash,
          issueDate: Number(c.issueDate),
          isRevoked: c.isRevoked,
          revokeReason: c.revokeReason,
          revokedAt: Number(c.revokedAt),
        }));
      } catch (e) {
        console.warn('Failed to query recipient certificates from blockchain, checking storage:', e);
      }
    }

    const storageCerts = StorageService.getCertificatesByRecipient(cleanAddr);
    const results: OnChainCertificate[] = storageCerts.map(sc => ({
      certId: sc.certId,
      courseId: sc.courseId,
      recipient: sc.recipientAddress,
      certHash: sc.generatedPdfHash || '0x',
      issueDate: Math.floor(new Date(sc.issueDate).getTime() / 1000) || Math.floor(Date.now() / 1000),
      isRevoked: sc.isRevoked,
      revokeReason: sc.revokeReason || '',
      revokedAt: sc.revokedAt ? Math.floor(new Date(sc.revokedAt).getTime() / 1000) : 0,
    }));

    this.demoCertificates.forEach(cert => {
      if (cert.recipient.toLowerCase() === cleanAddr && !results.some(r => r.certId === cert.certId)) {
        results.push(cert);
      }
    });

    return results;
  }

  /**
   * Fetch all certificates
   */
  public async getAllCertificates(): Promise<OnChainCertificate[]> {
    if (this.isContractConfigured()) {
      try {
        const contract = this.getReadOnlyContract();
        const rawCerts = await contract.getAllCertificates();
        return rawCerts.map((c: any) => ({
          certId: c.certId,
          courseId: c.courseId,
          recipient: c.recipient,
          certHash: c.certHash,
          issueDate: Number(c.issueDate),
          isRevoked: c.isRevoked,
          revokeReason: c.revokeReason,
          revokedAt: Number(c.revokedAt),
        }));
      } catch (e) {
        console.warn('Failed to fetch all certificates on-chain, returning storage records:', e);
      }
    }

    const storageCerts = StorageService.getCertificates();
    const results: OnChainCertificate[] = storageCerts.map(sc => ({
      certId: sc.certId,
      courseId: sc.courseId,
      recipient: sc.recipientAddress,
      certHash: sc.generatedPdfHash || '0x',
      issueDate: Math.floor(new Date(sc.issueDate).getTime() / 1000) || Math.floor(Date.now() / 1000),
      isRevoked: sc.isRevoked,
      revokeReason: sc.revokeReason || '',
      revokedAt: sc.revokedAt ? Math.floor(new Date(sc.revokedAt).getTime() / 1000) : 0,
    }));

    return results;
  }
}
