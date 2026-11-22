import React, { useState } from 'react';
import { User, Course, WalletState, CertificateRecord } from '../types';
import { StorageService } from '../services/storageService';
import { PdfService } from '../services/pdfService';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  Wallet, 
  ShieldCheck, 
  Sparkles,
  Eye
} from 'lucide-react';

interface TraineeDashboardProps {
  currentUser: User;
  courses: Course[];
  wallet: WalletState;
  onConnectWallet: () => void;
  onStartLearning: (course: Course) => void;
  onVerifyCert: (certId: string) => void;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({
  currentUser,
  courses,
  wallet,
  onConnectWallet,
  onStartLearning,
  onVerifyCert,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [walletInput, setWalletInput] = useState(currentUser.walletAddress || '');
  const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState(false);

  const enrollments = StorageService.getEnrollments().filter(e => e.userId === currentUser.id);
  const enrolledCourses = enrollments.map(e => courses.find(c => c.id === e.courseId)).filter(Boolean) as Course[];
  
  // Student's certificates
  const allCerts = StorageService.getCertificates();
  const myCertificates = allCerts.filter(c => 
    c.studentId === currentUser.id || 
    (currentUser.walletAddress && c.recipientAddress.toLowerCase() === currentUser.walletAddress.toLowerCase())
  );

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.startsWith('0x') || walletInput.length !== 42) {
      alert('Please enter a valid 42-character Ethereum address (starting with 0x).');
      return;
    }
    StorageService.updateStudentWallet(currentUser.id, walletInput);
    setWalletSuccess(true);
    setTimeout(() => setWalletSuccess(false), 3000);
    setIsUpdatingWallet(false);
  };

  const handleLinkConnectedWallet = () => {
    if (wallet.connected && wallet.address) {
      StorageService.updateStudentWallet(currentUser.id, wallet.address);
      setWalletInput(wallet.address);
      setWalletSuccess(true);
      setTimeout(() => setWalletSuccess(false), 3000);
    } else {
      onConnectWallet();
    }
  };

  const handleCopyLink = (certId: string) => {
    const url = PdfService.getVerificationUrl(certId);
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadPdf = async (cert: CertificateRecord) => {
    const course = courses.find(c => c.id === cert.courseId) || {
      id: cert.courseId,
      title: cert.courseTitle || 'Advanced Training Course',
      category: 'AI',
      description: '',
      price: 0,
      skills: ['Curriculum Excellence', 'Applied Problem Solving'],
      durationHours: 40,
      instructor: cert.issuerName,
      createdAt: cert.issueDate,
    };

    const res = await PdfService.generateCertificatePdf(cert, course);
    res.doc.save(`${cert.certId}_Certificate.pdf`);
  };

  return (
    <div className="min-h-screen bg-offWhite pb-24">
      
      {/* Student Banner */}
      <div className="bg-white border-b border-gray-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="flex items-center space-x-4">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-sm"
              />
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Student Dashboard</span>
                <h1 className="text-2xl font-extrabold text-darkBlack">
                  {currentUser.name}
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            {/* Wallet Link Widget */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  <span>Linked Ethereum Wallet</span>
                </span>
                {walletSuccess && (
                  <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>
                )}
              </div>

              {currentUser.walletAddress ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-darkBlack bg-white px-2.5 py-1 rounded-lg border border-gray-200 truncate max-w-[200px]">
                    {currentUser.walletAddress}
                  </span>
                  <button
                    onClick={() => setIsUpdatingWallet(!isUpdatingWallet)}
                    className="text-[11px] font-bold text-primary hover:underline ml-2"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLinkConnectedWallet}
                  className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-2"
                >
                  <Wallet className="w-3.5 h-3.5 text-secondary" />
                  <span>Link Connected MetaMask Address</span>
                </button>
              )}

              {isUpdatingWallet && (
                <form onSubmit={handleSaveWallet} className="mt-3 flex space-x-2">
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                  <button type="submit" className="bg-darkBlack text-white text-xs px-3 py-1 rounded-lg font-bold">
                    Save
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        
        {/* Section 1: My Blockchain Credentials */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-darkBlack flex items-center space-x-2">
                <Award className="w-5 h-5 text-secondary" />
                <span>Earned Blockchain Credentials ({myCertificates.length})</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cryptographically anchored on Ethereum Sepolia testnet. Zero on-chain personal data leaks.
              </p>
            </div>
          </div>

          {myCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.certId}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 p-6 flex flex-col relative overflow-hidden"
                >
                  {/* Decorative corner tag */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full font-mono">
                      {cert.certId}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Sepolia Anchored</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-darkBlack mb-1">
                    {cert.courseTitle || 'Advanced Professional Certification'}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4">
                    Issued to <b className="text-darkBlack">{cert.studentName}</b> on {cert.issueDate}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] font-mono text-gray-500 space-y-1 mb-5">
                    <div className="truncate">
                      <span className="text-gray-400">SHA-256 Hash: </span>
                      <span className="text-darkBlack">{cert.generatedPdfHash || '0x...'}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-gray-400">Recipient: </span>
                      <span className="text-primary">{cert.recipientAddress}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadPdf(cert)}
                        className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-secondary" />
                        <span>Download PDF</span>
                      </button>

                      <button
                        onClick={() => onVerifyCert(cert.certId)}
                        className="bg-gray-100 hover:bg-gray-200 text-darkBlack text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyLink(cert.certId)}
                      className="text-xs font-bold text-gray-500 hover:text-darkBlack flex items-center space-x-1 transition"
                    >
                      {copiedId === cert.certId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Share Link</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center shadow-sm">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-darkBlack">No Certificates Issued Yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Complete 100% of the lessons in any enrolled course to become eligible for your cryptographic degree.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-darkBlack flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>My Enrolled Courses ({enrolledCourses.length})</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Resume your interactive learning room lessons.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = StorageService.getCourseProgress(currentUser.id, course.id);

              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-36 bg-primary relative">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Play className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-secondary text-darkBlack text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-darkBlack mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-4">By {course.instructor}</p>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-bold">
                        <span>Progress</span>
                        <span className="text-primary">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                        <div
                          className="bg-secondary h-full rounded-full transition-all"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>

                      <button
                        onClick={() => onStartLearning(course)}
                        className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Continue Learning Room</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
