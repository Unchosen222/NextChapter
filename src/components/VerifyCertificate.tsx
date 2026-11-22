import React, { useState, useEffect } from 'react';
import { 
  Search, 
  QrCode, 
  FileCheck, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Award, 
  Hash, 
  Eye, 
  Camera, 
  UploadCloud, 
  File 
} from 'lucide-react';
import { VerificationResult } from '../types';
import { Web3Service } from '../services/web3Service';
import { CryptoService } from '../services/cryptoService';
import { QRScannerModal } from './QRScannerModal';
import { CertificateViewerModal } from './CertificateViewerModal';
import { useLanguage } from '../context/LanguageContext';

interface VerifyCertificateProps {
  initialCertId?: string;
}

export const VerifyCertificate: React.FC<VerifyCertificateProps> = ({ initialCertId = '' }) => {
  const { t, language } = useLanguage();
  const [activeMode, setActiveMode] = useState<'id' | 'qr' | 'pdf'>('id');
  const [certIdInput, setCertIdInput] = useState(initialCertId);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // PDF verification state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [calculatedFileHash, setCalculatedFileHash] = useState<string | null>(null);

  const web3Service = Web3Service.getInstance();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramCertId = params.get('certId') || initialCertId;
    if (paramCertId) {
      setCertIdInput(paramCertId);
      handlePerformVerification(paramCertId);
    }
  }, [initialCertId]);

  const handlePerformVerification = async (certIdToVerify: string, fileHashToMatch?: string) => {
    if (!certIdToVerify || !certIdToVerify.trim()) {
      setErrorMsg(language === 'th' ? 'กรุณากรอกรหัสอ้างอิงใบรับรองที่ถูกต้อง' : 'Please enter a valid Certificate Reference ID.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const result = await web3Service.verifyCertificate(certIdToVerify, fileHashToMatch);
      setVerificationResult(result);
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMsg(err.message || 'Unable to connect to Ethereum network to verify certificate.');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformVerification(certIdInput);
  };

  const handleQRScanSuccess = (scannedText: string) => {
    setCertIdInput(scannedText);
    setActiveMode('id');
    handlePerformVerification(scannedText);
  };

  const handleFileDrop = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg(language === 'th' ? 'กรุณาอัปโหลดไฟล์เอกสาร .pdf ที่ถูกต้อง' : 'Please upload a valid .pdf certificate document.');
      return;
    }

    setUploadedFile(file);
    setErrorMsg(null);
    setLoading(true);

    try {
      const hash = await CryptoService.hashFile(file);
      setCalculatedFileHash(hash);

      let extractedId = certIdInput.trim();
      const match = file.name.match(/(SKIL-[A-Z0-9-]+)/i);
      if (match) {
        extractedId = match[1].toUpperCase();
        setCertIdInput(extractedId);
      }

      if (extractedId) {
        await handlePerformVerification(extractedId, hash);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Failed to compute file SHA-256 hash: ' + err.message);
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!verificationResult) return;
    const url = `${window.location.origin}${window.location.pathname}?certId=${encodeURIComponent(verificationResult.certId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-surface text-brand-secondary border border-slate-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
          <span>{t.verifyBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
          {t.verifyTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.verifySubtitle}
        </p>
      </div>

      {/* Verification Modes Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-brand-surface">
          <button
            onClick={() => setActiveMode('id')}
            className={`py-3.5 px-2 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'id'
                ? 'bg-white text-brand-primary border-b-2 border-brand-accent shadow-sm'
                : 'text-slate-600 hover:text-brand-primary hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-brand-secondary flex-shrink-0" />
            <span className="truncate">{t.tabSearchId}</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('qr');
              setIsScannerOpen(true);
            }}
            className={`py-3.5 px-2 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'qr'
                ? 'bg-white text-brand-primary border-b-2 border-brand-accent shadow-sm'
                : 'text-slate-600 hover:text-brand-primary hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-brand-secondary flex-shrink-0" />
            <span className="truncate">{t.tabScanQr}</span>
          </button>

          <button
            onClick={() => setActiveMode('pdf')}
            className={`py-3.5 px-2 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'pdf'
                ? 'bg-white text-brand-primary border-b-2 border-brand-accent shadow-sm'
                : 'text-slate-600 hover:text-brand-primary hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4 text-brand-secondary flex-shrink-0" />
            <span className="truncate">{t.tabVerifyPdf}</span>
          </button>
        </div>

        {/* Tab 1: Search by ID */}
        {activeMode === 'id' && (
          <div className="p-6 sm:p-8 space-y-4">
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                  {t.certReferenceCode}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={certIdInput}
                      onChange={(e) => setCertIdInput(e.target.value)}
                      placeholder={t.certCodePlaceholder}
                      className="w-full px-4 py-3 pl-11 text-xs sm:text-sm font-mono bg-brand-surface border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent text-slate-900 placeholder:text-slate-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-brand-accent hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 flex-shrink-0"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{t.btnVerifying}</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.btnVerifyAuthenticity}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample quick test tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
                <span className="text-slate-400">{t.quickTestSamples}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCertIdInput('SKIL-2026-AI01');
                    handlePerformVerification('SKIL-2026-AI01');
                  }}
                  className="px-2.5 py-1 rounded-md bg-brand-surface hover:bg-slate-200 text-brand-secondary font-mono text-[11px] font-semibold border border-slate-200 transition-colors"
                >
                  SKIL-2026-AI01 ({t.sampleValid})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCertIdInput('SKIL-2026-SEC01');
                    handlePerformVerification('SKIL-2026-SEC01');
                  }}
                  className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-[11px] font-semibold border border-rose-200 transition-colors"
                >
                  SKIL-2026-SEC01 ({t.sampleRevoked})
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Scan QR Code View */}
        {activeMode === 'qr' && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface text-brand-accent flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-brand-primary">{t.scanQrTitle}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t.scanQrSubtitle}
              </p>
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center space-x-2 shadow"
            >
              <Camera className="w-4 h-4" />
              <span>{t.btnLaunchCamera}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Verify PDF File */}
        {activeMode === 'pdf' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileDrop(file);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-surface/60 transition-colors cursor-pointer"
              onClick={() => document.getElementById('pdf-file-input')?.click()}
            >
              <input
                id="pdf-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileDrop(file);
                }}
              />
              <UploadCloud className="w-10 h-10 text-brand-secondary mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-brand-primary">
                {t.dropPdfText} <span className="text-brand-accent underline">{t.dropPdfBrowse}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.dropPdfSubtext}
              </p>
            </div>

            {uploadedFile && (
              <div className="bg-brand-surface p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-slate-800">
                    <File className="w-4 h-4 text-brand-accent flex-shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-md">{uploadedFile.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] flex-shrink-0">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                {calculatedFileHash && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t.computedFileHash}
                    </span>
                    <span className="text-xs font-mono text-slate-700 break-all">
                      {calculatedFileHash}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2.5 animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden animate-fade-in">
          
          {/* Status Header Banner */}
          {verificationResult.found ? (
            verificationResult.isRevoked ? (
              <div className="bg-rose-600 text-white p-5 flex items-center space-x-3">
                <XCircle className="w-7 h-7 text-rose-200 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base tracking-wide uppercase">
                    {t.statusRevokedTitle}
                  </h3>
                  <p className="text-xs text-rose-100">
                    {t.statusRevokedDesc}
                  </p>
                </div>
              </div>
            ) : verificationResult.isValid ? (
              <div className="bg-emerald-600 text-white p-5 flex items-center space-x-3">
                <ShieldCheck className="w-7 h-7 text-emerald-200 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base tracking-wide uppercase">
                    {t.statusValidTitle}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {t.statusValidDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-600 text-white p-5 flex items-center space-x-3">
                <AlertTriangle className="w-7 h-7 text-amber-200 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base tracking-wide uppercase">
                    {t.statusMismatchTitle}
                  </h3>
                  <p className="text-xs text-amber-100">
                    {t.statusMismatchDesc}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-700 text-white p-5 flex items-center space-x-3">
              <AlertTriangle className="w-7 h-7 text-amber-300 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  {t.statusNotFoundTitle}
                </h3>
                <p className="text-xs text-slate-200">
                  {t.statusNotFoundDesc} {verificationResult.searchedId}.
                </p>
              </div>
            </div>
          )}

          {/* Details Section */}
          {verificationResult.found && (
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Course & Student Header */}
              <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider block">
                    {verificationResult.courseId}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-brand-primary">
                    {verificationResult.courseTitle || 'Specialized Technology Program'}
                  </h2>
                  {verificationResult.studentName && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{t.lblIssuedTo} <strong className="text-slate-800">{verificationResult.studentName}</strong></span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setIsViewerOpen(true)}
                  className="px-4 py-2 bg-brand-surface hover:bg-slate-200 text-brand-primary font-semibold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center space-x-2 self-start sm:self-center shadow-sm flex-shrink-0"
                >
                  <Eye className="w-4 h-4 text-brand-accent" />
                  <span>{t.btnViewDiploma}</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="bg-brand-surface p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                    <span>{t.lblCertId}</span>
                  </span>
                  <p className="font-mono font-bold text-brand-primary text-sm truncate">
                    {verificationResult.certId}
                  </p>
                </div>

                <div className="bg-brand-surface p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                    <span>{t.lblIssueDate}</span>
                  </span>
                  <p className="font-semibold text-slate-800">
                    {new Date(verificationResult.issueDate * 1000).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="bg-brand-surface p-3.5 rounded-xl border border-slate-200 space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                    <span>{t.lblRecipientWallet}</span>
                  </span>
                  <p className="font-mono text-xs text-brand-secondary break-all">
                    {verificationResult.recipient}
                  </p>
                </div>

                {/* Revocation audit details if revoked */}
                {verificationResult.isRevoked && (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2 sm:col-span-2 text-rose-800">
                    <div className="flex items-center space-x-2 font-bold text-rose-700">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{t.lblRevocationReason}</span>
                    </div>
                    <p className="text-xs bg-white p-3 rounded-lg border border-rose-200 font-medium text-slate-800">
                      "{verificationResult.revokeReason || 'Revoked by authorized administrator.'}"
                    </p>
                    <p className="text-[11px] text-rose-600">
                      {t.lblRevocationTime} {new Date(verificationResult.revokedAt * 1000).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                    </p>
                  </div>
                )}

                {/* Cryptographic Hash Comparison */}
                <div className="bg-brand-surface p-4 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                      <Hash className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                      <span>{t.lblOnChainHash}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                      {t.lblRecordedOnEthereum}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-700 break-all bg-white p-2.5 rounded-lg border border-slate-200">
                    {verificationResult.certHash}
                  </p>

                  {verificationResult.calculatedHash && (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {t.lblUploadedHash}
                        </span>
                        {verificationResult.hashMatched ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                            <Check className="w-3 h-3 flex-shrink-0" />
                            <span>{t.lblCryptoMatch}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-1">
                            <XCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{t.lblHashMismatch}</span>
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-slate-700 break-all bg-white p-2.5 rounded-lg border border-slate-200">
                        {verificationResult.calculatedHash}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-surface hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{t.btnCopiedLink}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{t.btnShareLink}</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://sepolia.etherscan.io/address/${web3Service.getContractAddress()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-brand-accent hover:text-blue-700 font-semibold transition-colors"
                >
                  <span>{t.btnViewEtherscan}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      {verificationResult && verificationResult.found && (
        <CertificateViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          certificate={{
            certId: verificationResult.certId,
            courseId: verificationResult.courseId,
            recipient: verificationResult.recipient,
            certHash: verificationResult.certHash,
            issueDate: BigInt(verificationResult.issueDate),
            isRevoked: verificationResult.isRevoked,
            revokeReason: verificationResult.revokeReason,
            revokedAt: BigInt(verificationResult.revokedAt),
          }}
        />
      )}

    </div>
  );
};
