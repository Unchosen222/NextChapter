import React from 'react';
import { Award, Shield, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  contractAddress: string;
}

export const Footer: React.FC<FooterProps> = ({ contractAddress }) => {
  const { t } = useLanguage();
  const etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

  return (
    <footer className="bg-brand-primary text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">NextChapter Academy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {t.footerDesc}
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-1">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t.footerZeroPii}</span>
            </div>
          </div>

          {/* Quick Technology & Security Badges */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t.footerSecTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                <span>{t.footerSha256}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                <span>{t.footerRbac}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                <span>{t.footerDualMode}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                <span>{t.footerImmutableRevoke}</span>
              </li>
            </ul>
          </div>

          {/* Smart Contract Ledger Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t.footerLedgerTitle}
            </h4>
            <p className="text-[11px] text-slate-400 mb-1.5">{t.footerContractAddr}</p>
            {contractAddress ? (
              <a
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-brand-accent hover:text-blue-400 font-mono bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10 break-all transition-colors"
              >
                <span className="truncate max-w-[170px]">{contractAddress}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Not deployed yet</span>
            )}
            <p className="text-[11px] text-slate-500 mt-2">
              {t.footerChainId}
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 space-y-2 sm:space-y-0">
          <p>{t.footerCopyright}</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.footerVerifiedBadge}</span>
            </span>
            <span>{t.footerHostedOn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
