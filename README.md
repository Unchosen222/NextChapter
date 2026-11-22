# NextChapter — Blockchain Digital Certificate Verification Platform
> **E-Learning & Cryptographic Academic Credentialing System on Ethereum Sepolia**  
> *Course Project for CSI301 (Distributed Systems & Blockchain), Sripatum University (SPU)*

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia%20Testnet-627EEA.svg)](https://sepolia.etherscan.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)

---

## 📖 System Overview & Architecture
**NextChapter** merges a complete modern e-learning platform with an **Ethereum Blockchain Credential Verification System**. 

1. **E-Learning Experience**:
   - Course Discovery & Catalog with categorized technology curricula (AI, Cybersecurity, Cloud Computing, Data Analytics, Decentralized Systems).
   - Interactive Learning Room with embedded video lessons and curriculum notes.
   - Interactive Lesson Progress Tracking with "Mark as Completed" actions and real-time completion percentages.
   - Coupon Discount System (e.g. `NEXT50`, `SPU2026`).

2. **Blockchain Digital Credentialing (CSI301)**:
   - **Zero On-Chain PII**: Student names, grades, and personal data are never exposed on the public blockchain. Only the cryptographic **SHA-256 document fingerprint** and recipient Ethereum wallet address are permanently anchored on Ethereum Sepolia.
   - **Teacher/Admin MetaMask Issuance**: Upon 100% course completion, teachers/instructors sign the on-chain issuance transaction using MetaMask.
   - **Triple-Option Public Verification**:
     1. Search by Certificate Reference ID (`NC-2026-XXXX`).
     2. Real-time Camera QR Code Scanner (`html5-qrcode`).
     3. Drag-and-drop PDF verification (computes SHA-256 client-side and validates against Ethereum).
   - **On-Chain Revocation**: Contract owner can revoke a compromised certificate with a tamper-proof audit reason and timestamp recorded on Ethereum.
   - **Demo Mode**: Built-in toggle to test all blockchain flows offline without MetaMask or Sepolia testnet gas fees.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ or 20+
- MetaMask browser extension (optional for live Sepolia mode; Demo Mode works without it)

### 2. Installation
```bash
cd /Users/bb/SPU/2026-1/CSI301/NextChapter
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploy to Vercel (1-Click)

The repository is already configured with `vercel.json` for seamless Single Page Application routing:

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: NextChapter E-Learning + Blockchain Platform"
   git remote add origin https://github.com/your-username/NextChapter.git
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new) and import the repository.
3. In Environment Variables, enter:
   - `VITE_SUPABASE_URL`: `https://cfklbhhrmxyjawzaqhyc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_EvE0ue9dyAiVys1MwHLdMw_MlZmw91v`
   - `VITE_SEPOLIA_RPC_URL`: `https://ethereum-sepolia-rpc.publicnode.com`
4. Click **Deploy**! Your site is live in ~30 seconds.

---

## 🗄️ Supabase Database Setup

To provision the cloud PostgreSQL tables on Supabase:
1. Log in to [https://supabase.com](https://supabase.com) and open project `cfklbhhrmxyjawzaqhyc`.
2. Go to the **SQL Editor**.
3. Open or copy the script from [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
*(Note: If remote tables are not yet provisioned, the application automatically uses local state storage so all features remain 100% operational).*

---

## 📜 Smart Contract Deployment (Hardhat)

The smart contract is located at `contracts/CertificateRegistry.sol`.

```bash
# Compile smart contract
npm run compile

# Run automated tests
npm run test:contract

# Deploy to local Hardhat node
npm run deploy:local

# Deploy to Ethereum Sepolia Testnet (requires private key in .env)
npm run deploy:sepolia
```
