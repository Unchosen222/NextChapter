import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  User, 
  Wallet, 
  Calendar, 
  Sparkles,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ethers } from 'ethers';
import { Course, WalletState, CertificateMetadata } from '../types';
import { Web3Service } from '../services/web3Service';
import { StorageService } from '../services/storageService';
import { PdfService } from '../services/pdfService';
import { useLanguage } from '../context/LanguageContext';

interface IssueCertificateProps {
  wallet: WalletState;
  onConnectWallet: () => void;
  courses: Course[];
}

export const IssueCertificate: React.FC<IssueCertificateProps> = ({
  wallet,
  onConnectWallet,
  courses,
}) => {
  const { t, language } = useLanguage();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'CS-AI-01');
  const [studentName, setStudentName] = useState('Alexander Vance');
  const [studentId, setStudentId] = useState('SPU-6601002');
  const [recipientAddress, setRecipientAddress] = useState('0x30035Ca790093E941bf4AD0f60056c7Bd7995A10');
  const [certId, setCertId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade] = useState('Pass with Distinction');

  // Processing state
  const [issuing, setIssuing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issuedResult, setIssuedResult] = useState<{
    certId: string;
    txHash: string;
    certHash: string;
    pdfDoc: any;
  } | null>(null);

  // Deploying contract state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const web3Service = Web3Service.getInstance();
  const currentContractAddr = web3Service.getContractAddress();
  const isDefaultMockAddress = !currentContractAddr || currentContractAddr.toLowerCase() === '0x5fbdb2315678afecb367f032d93f642f64180aa3';

  const generateUniqueCertId = (courseCode: string) => {
    const year = new Date().getFullYear();
    const cleanCourse = courseCode.replace('CS-', '').replace('-01', '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKIL-${year}-${cleanCourse}${randomHex}`;
  };

  useEffect(() => {
    if (selectedCourseId) {
      setCertId(generateUniqueCertId(selectedCourseId));
    }
  }, [selectedCourseId]);

  const handleDeployContract = async () => {
    try {
      setIsDeploying(true);
      setErrorMsg(null);
      const res = await web3Service.deployContract();
      setDeploySuccess(res.address);
      confetti({ particleCount: 100, spread: 60 });
    } catch (err: any) {
      console.error('Deployment error:', err);
      setErrorMsg(err.reason || err.message || 'Failed to deploy smart contract.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIssuedResult(null);

    if (isDefaultMockAddress && !web3Service.getIsDemoMode()) {
      setErrorMsg(
        language === 'th'
          ? 'ยังไม่ได้ติดตั้ง Smart Contract บน Sepolia กรุณากดปุ่ม "คลิกเดียวติดตั้งลง Sepolia" ด้านบนก่อน เพื่อให้กระเป๋าของคุณเป็น Owner ของสัญญา'
          : 'Smart contract has not been deployed to Sepolia yet. Please click the "1-Click Deploy to Sepolia" button above first so your wallet becomes the official contract owner!'
      );
      return;
    }

    if (!studentName.trim()) {
      setErrorMsg(language === 'th' ? 'กรุณากรอกชื่อ-นามสกุลของผู้รับใบรับรอง' : 'Please enter the student / trainee full name.');
      return;
    }

    if (!recipientAddress.trim() || !ethers.isAddress(recipientAddress.trim())) {
      setErrorMsg(language === 'th' ? 'กรุณาระบุ Ethereum Address ที่ถูกต้องของผู้รับ (0x...)' : 'Please provide a valid Ethereum wallet address (0x...) for the recipient.');
      return;
    }

    if (!certId.trim()) {
      setErrorMsg(language === 'th' ? 'กรุณาระบุรหัสอ้างอิงใบรับรอง' : 'Please enter a valid unique Certificate Reference ID.');
      return;
    }

    const course = StorageService.getCourseById(selectedCourseId);
    if (!course) {
      setErrorMsg(language === 'th' ? 'ไม่พบหลักสูตรที่เลือก' : 'Selected course was not found.');
      return;
    }

    try {
      setIssuing(true);

      setStatusStep(t.stepGenPdf);
      const metadata: CertificateMetadata = {
        certId: certId.trim().toUpperCase(),
        courseId: selectedCourseId,
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        recipientAddress: recipientAddress.trim(),
        issueDate: new Date(issueDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        grade: grade.trim(),
        issuerName: 'SkilTrust Academy Academic Affairs',
      };

      const pdfResult = await PdfService.generateCertificatePdf(metadata, course);

      setStatusStep(t.stepComputeHash);
      const calculatedHash = pdfResult.sha256Hash;
      metadata.generatedPdfHash = calculatedHash;

      setStatusStep(t.stepSubmitTx);
      const txHash = await web3Service.issueCertificate(
        metadata.certId,
        metadata.courseId,
        metadata.recipientAddress,
        calculatedHash
      );

      StorageService.saveCertMetadata(metadata);

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIssuedResult({
        certId: metadata.certId,
        txHash,
        certHash: calculatedHash,
        pdfDoc: pdfResult.doc,
      });

    } catch (err: any) {
      console.error('Issuance failed:', err);
      setErrorMsg(err.reason || err.message || 'Transaction was rejected or failed on the network.');
    } finally {
      setIssuing(false);
      setStatusStep('');
    }
  };

  const handleDownloadIssuedPdf = () => {
    if (issuedResult?.pdfDoc) {
      PdfService.downloadPdf(issuedResult.pdfDoc, `${issuedResult.certId}_Certificate.pdf`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-surface text-brand-secondary border border-slate-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
          <span>{t.issueBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
          {t.issueTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.issueSubtitle}
        </p>
      </div>

      {/* One-Click Sepolia Smart Contract Deployment Banner */}
      {isDefaultMockAddress && wallet.connected && (
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl p-6 shadow-xl border border-blue-400/30 space-y-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">
                {t.deployBannerTitle}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {t.deployBannerDesc}
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-300">
              {t.deployBannerMeta}
            </div>
            <button
              onClick={handleDeployContract}
              disabled={isDeploying}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 flex-shrink-0"
            >
              {isDeploying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t.btnDeployingConfirm}</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>{t.btnDeploySepolia}</span>
                </>
              )}
            </button>
          </div>

          {deploySuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs font-mono break-all">
              {t.deploySuccessMsg} <strong>{deploySuccess}</strong>
            </div>
          )}
        </div>
      )}

      {/* Wallet Warning if not connected */}
      {!wallet.connected && !web3Service.getIsDemoMode() && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm text-amber-900">
            {t.walletReqTitle}
          </h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
            {t.walletReqDesc}
          </p>
          <button
            onClick={onConnectWallet}
            className="px-5 py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow transition-colors inline-flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>{t.btnConnectAdminWallet}</span>
          </button>
        </div>
      )}

      {/* Issuance Form Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-brand-surface border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-secondary flex-shrink-0" />
            <h2 className="font-bold text-sm text-brand-primary">{t.cardIssueDetails}</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {t.zeroPiiNote}
          </span>
        </div>

        <form onSubmit={handleIssue} className="p-6 sm:p-8 space-y-5">
          
          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
              {t.lblSelectCourse}
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.id} — {course.title} ({course.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                {t.lblStudentFullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Student ID / Enrollment No */}
            <div>
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                {t.lblStudentIdOpt}
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. SPU-6601002"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Recipient Ethereum Wallet */}
            <div className="sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                  {t.lblRecipientAddress}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setRecipientAddress('0x30035Ca790093E941bf4AD0f60056c7Bd7995A10')}
                    className="text-[11px] text-brand-secondary hover:underline font-semibold"
                  >
                    {t.btnUseTestWallet}
                  </button>
                  {wallet.connected && (
                    <button
                      type="button"
                      onClick={() => wallet.address && setRecipientAddress(wallet.address)}
                      className="text-[11px] text-brand-accent hover:underline font-semibold"
                    >
                      {t.btnUseConnected}
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm font-mono bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Certificate ID */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                  {t.lblCertRefId}
                </label>
                <button
                  type="button"
                  onClick={() => setCertId(generateUniqueCertId(selectedCourseId))}
                  className="text-[11px] text-brand-accent hover:underline font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t.btnRegenerate}</span>
                </button>
              </div>
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono font-bold bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-brand-primary"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                {t.lblIssuanceDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              {t.noteUniquenessCheck}
            </p>
            <button
              type="submit"
              disabled={issuing}
              className="w-full sm:w-auto px-6 py-3 bg-brand-accent hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 flex-shrink-0"
            >
              {issuing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{statusStep || t.connecting}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.btnGenerateAndRecord}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Success Result Card */}
      {issuedResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-4 animate-fade-in text-emerald-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow flex-shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-900">
                {t.successIssueTitle}
              </h3>
              <p className="text-xs text-emerald-700">
                {t.successIssueDesc}
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-4 border border-emerald-200 space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblCertId}:</span>
              <span className="font-mono font-bold text-brand-primary">{issuedResult.certId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblTxHash}</span>
              <span className="font-mono text-[11px] text-slate-600 break-all">{issuedResult.txHash}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblOnChainHash}:</span>
              <span className="font-mono text-[11px] text-slate-600 break-all">{issuedResult.certHash}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleDownloadIssuedPdf}
              className="px-5 py-2.5 bg-brand-primary hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-2 shadow"
            >
              <Download className="w-4 h-4 text-brand-accent flex-shrink-0" />
              <span>{t.btnDownloadPdf}</span>
            </button>

            <a
              href={`${window.location.origin}${window.location.pathname}?certId=${encodeURIComponent(issuedResult.certId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-accent hover:underline flex items-center space-x-1"
            >
              <span>{t.btnTestVerifyLink}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
