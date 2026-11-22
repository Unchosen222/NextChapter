import React, { useState } from 'react';
import { X, Download, ShieldCheck, Award, ExternalLink, Calendar, Hash, User, QrCode } from 'lucide-react';
import { Course, CertificateMetadata, OnChainCertificate } from '../types';
import { PdfService } from '../services/pdfService';
import { StorageService } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';

interface CertificateViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: OnChainCertificate;
  course?: Course;
  metadata?: CertificateMetadata;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  isOpen,
  onClose,
  certificate,
  course,
  metadata,
}) => {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const resolvedCourse = course || StorageService.getCourseById(certificate.courseId) || {
    id: certificate.courseId,
    title: 'Advanced Technology Specialization',
    category: 'Other' as const,
    description: 'Practical technology training program at NextChapter Academy.',
    skills: ['Blockchain', 'Cloud', 'Engineering'],
    durationHours: 60,
    instructor: 'NextChapter Senior Academic Board',
    createdAt: '2026-01-01',
  };

  const resolvedMetadata = metadata || StorageService.getCertMetadata(certificate.certId) || {
    certId: certificate.certId,
    courseId: certificate.courseId,
    studentName: 'Certified Trainee',
    recipientAddress: certificate.recipient,
    issueDate: new Date(Number(certificate.issueDate) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    issuerName: 'NextChapter Academic Affairs',
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const result = await PdfService.generateCertificatePdf(resolvedMetadata, resolvedCourse);
      PdfService.downloadPdf(result.doc, `${certificate.certId}_Certificate.pdf`);
    } catch (err) {
      console.error('Failed to generate and download PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const issueDateFormatted = new Date(Number(certificate.issueDate) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-primary text-white">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-accent" />
            <h3 className="font-bold text-base text-white">{t.btnViewDiploma}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-accent hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? '...' : t.btnDownloadPdf}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Preview Card */}
        <div className="p-6 sm:p-8 bg-brand-surface">
          <div className="bg-white rounded-xl shadow-lg border-4 border-brand-primary p-6 sm:p-10 relative overflow-hidden">
            
            {/* Inner Thin Border */}
            <div className="absolute inset-2 border border-brand-secondary pointer-events-none"></div>

            {/* Corner Blue Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand-accent pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand-accent pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand-accent pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand-accent pointer-events-none"></div>

            {/* Certificate Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary text-brand-accent mb-2 shadow">
                <Award className="w-7 h-7 text-brand-accent" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-primary">
                SKILTRUST ACADEMY
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-brand-secondary uppercase tracking-widest">
                Executive Institute of Technology & Advanced Sciences
              </p>
              <div className="w-24 h-0.5 bg-brand-accent mx-auto mt-2"></div>
            </div>

            {/* Certificate Title */}
            <div className="text-center my-6">
              <h2 className="text-sm sm:text-base font-extrabold text-brand-primary tracking-wider uppercase">
                Certificate of Achievement
              </h2>
              <p className="text-xs text-slate-500 italic mt-1">
                This credential is proud to certify that
              </p>
              
              {/* Student Name */}
              <div className="my-4">
                <p className="text-xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
                  {resolvedMetadata.studentName || 'Certified Trainee'}
                </p>
                <div className="w-48 h-0.5 bg-brand-secondary mx-auto mt-1"></div>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                has successfully fulfilled all rigorous coursework, applied labs, and comprehensive evaluations for
              </p>

              {/* Course Title */}
              <p className="text-base sm:text-lg font-bold text-brand-secondary mt-2">
                {resolvedCourse.title}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Course Code: <span className="font-semibold text-slate-700">{resolvedCourse.id}</span> • 
                Duration: <span className="font-semibold text-slate-700">{resolvedCourse.durationHours} Hours</span>
              </p>
            </div>

            {/* Blockchain Audit Box */}
            <div className="bg-brand-surface rounded-lg p-3.5 border border-slate-200 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate ID</span>
                <span className="text-xs font-mono font-bold text-brand-primary">{certificate.certId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Issue Date</span>
                <span className="text-xs font-medium text-slate-700">{issueDateFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className={`inline-flex items-center text-xs font-bold ${
                  certificate.isRevoked ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {certificate.isRevoked ? 'REVOKED' : 'VALID & AUTHENTIC'}
                </span>
              </div>
              <div className="sm:col-span-3 pt-1 border-t border-slate-200/60">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">On-Chain SHA-256 Hash</span>
                <span className="text-[10px] font-mono text-slate-600 break-all">{certificate.certHash}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 text-center">
              <div className="w-36">
                <div className="h-6 flex items-center justify-center font-serif italic text-sm text-slate-700">
                  R. Sterling
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="text-[10px] font-bold text-brand-primary">Dr. Richard Sterling</p>
                  <p className="text-[9px] text-slate-500">Academic Director</p>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex flex-col items-center justify-center border-2 border-brand-accent shadow">
                <ShieldCheck className="w-5 h-5 text-brand-accent" />
                <span className="text-[7px] font-bold tracking-tighter">VERIFIED</span>
              </div>

              <div className="w-36">
                <div className="h-6 flex items-center justify-center font-serif italic text-sm text-slate-700">
                  {resolvedCourse.instructor.split(' ')[0]}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="text-[10px] font-bold text-brand-primary">{resolvedCourse.instructor.split(',')[0]}</p>
                  <p className="text-[9px] text-slate-500">Course Lead</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            This digital certificate document matches the cryptographic ledger on Ethereum Sepolia.
          </p>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-accent hover:bg-blue-600 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? '...' : t.btnDownloadPdf}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-brand-surface hover:bg-slate-200 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
