import React, { useState } from 'react';
import { 
  Ban, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Wallet 
} from 'lucide-react';
import { WalletState, VerificationResult } from '../types';
import { Web3Service } from '../services/web3Service';
import { useLanguage } from '../context/LanguageContext';

interface RevokeCertificateProps {
  wallet: WalletState;
  onConnectWallet: () => void;
}

export const RevokeCertificate: React.FC<RevokeCertificateProps> = ({
  wallet,
  onConnectWallet,
}) => {
  const { t, language } = useLanguage();
  const [searchCertId, setSearchCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [certDetails, setCertDetails] = useState<VerificationResult | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const web3Service = Web3Service.getInstance();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCertId.trim()) return;

    try {
      setLoading(true);
      setStatusMsg(null);
      const result = await web3Service.verifyCertificate(searchCertId);
      setCertDetails(result);

      if (!result.found) {
        setStatusMsg({
          type: 'error',
          text: language === 'th'
            ? `ไม่พบข้อมูลใบรับรอง ${searchCertId} บนบล็อกเชน`
            : `Certificate ${searchCertId} was not found on the blockchain.`
        });
      } else if (result.isRevoked) {
        setStatusMsg({
          type: 'error',
          text: language === 'th'
            ? `ใบรับรอง ${searchCertId} ได้รับการเพิกถอนไปก่อนหน้านี้แล้ว`
            : `Certificate ${searchCertId} has ALREADY been revoked.`
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to query certificate.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certDetails || !revokeReason.trim()) {
      setStatusMsg({
        type: 'error',
        text: language === 'th'
          ? 'กรุณาระบุเหตุผลการเพิกถอนอย่างเป็นทางการ'
          : 'Please provide a detailed audit reason for revocation.'
      });
      return;
    }

    try {
      setRevoking(true);
      setStatusMsg(null);
      const txHash = await web3Service.revokeCertificate(certDetails.certId, revokeReason.trim());
      
      setStatusMsg({
        type: 'success',
        text: language === 'th'
          ? `เพิกถอนใบรับรอง ${certDetails.certId} สำเร็จแล้ว! หมายเลขธุรกรรม: ${txHash.slice(0, 16)}...`
          : `Certificate ${certDetails.certId} was successfully revoked! Transaction: ${txHash.slice(0, 16)}...`,
      });

      const refreshed = await web3Service.verifyCertificate(certDetails.certId);
      setCertDetails(refreshed);
      setRevokeReason('');
    } catch (err: any) {
      console.error('Revocation failed:', err);
      setStatusMsg({
        type: 'error',
        text: err.reason || err.message || 'Revocation transaction failed on Ethereum.',
      });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span>{t.revokeBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
          {t.revokeTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.revokeSubtitle}
        </p>
      </div>

      {/* Wallet Warning */}
      {!wallet.connected && !web3Service.getIsDemoMode() && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
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

      {/* Lookup Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
            {t.step1LocateId}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCertId}
                onChange={(e) => setSearchCertId(e.target.value)}
                placeholder="e.g. SKIL-2026-AI01 or SKIL-2026-SEC01"
                className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm font-mono bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-primary hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 flex-shrink-0"
            >
              {loading ? (
                <span>{t.searchingRecord}</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t.btnLookupRecord}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Certificate Details & Revocation Action Card */}
      {certDetails && certDetails.found && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
          
          <div className="px-6 py-4 bg-brand-surface border-b border-slate-200 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-brand-primary">
              {certDetails.certId}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              certDetails.isRevoked
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {certDetails.isRevoked ? t.lblStatusRevoked : t.lblStatusActive}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-brand-surface p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblSelectCourse.replace('*', '')}:</span>
                <span className="font-semibold text-slate-800">{certDetails.courseTitle || certDetails.courseId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblIssueDate}:</span>
                <span className="text-slate-700">
                  {new Date(certDetails.issueDate * 1000).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lblRecipientWallet}:</span>
                <span className="font-mono text-[11px] text-brand-secondary break-all">{certDetails.recipient}</span>
              </div>
              {certDetails.isRevoked && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 text-rose-800">
                  <span className="text-[10px] uppercase font-bold text-rose-500 block">{t.lblRevocationReason}:</span>
                  <p className="font-medium mt-0.5">"{certDetails.revokeReason}"</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {t.lblRevocationTime} {new Date(certDetails.revokedAt * 1000).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                  </p>
                </div>
              )}
            </div>

            {/* Revoke Form if still active */}
            {!certDetails.isRevoked && (
              <form onSubmit={handleRevoke} className="space-y-4 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                    {t.step2EnterReason}
                  </label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t.step2ReasonDesc}
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
                ></textarea>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-800 text-xs space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>{t.irreversibleWarningTitle}</span>
                  </p>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    {t.irreversibleWarningDesc}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={revoking}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {revoking ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{t.btnRevokingOnChain}</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>{t.btnSignRevoke}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
