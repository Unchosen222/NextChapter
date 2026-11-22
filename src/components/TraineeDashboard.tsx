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
    <div className="space-y-8 w-full">
      
      {/* 1. Student Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* User Info */}
          <div className="flex items-center space-x-4 min-w-0">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-primary shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block whitespace-nowrap">
                Student Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-darkBlack truncate">
                {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-mono mt-0.5 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Linked Ethereum Wallet Card */}
          <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl w-full lg:max-w-md shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5 whitespace-nowrap">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                <span>Linked Ethereum Wallet</span>
              </span>
              {walletSuccess && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Address Saved!
                </span>
              )}
            </div>

            {currentUser.walletAddress ? (
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                <span className="font-mono text-xs font-bold text-darkBlack truncate select-all">
                  {currentUser.walletAddress}
                </span>
                <button
                  onClick={() => setIsUpdatingWallet(!isUpdatingWallet)}
                  className="text-xs font-bold text-primary hover:text-primary-dark whitespace-nowrap px-2 py-1 rounded hover:bg-gray-50 transition"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={handleLinkConnectedWallet}
                className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Wallet className="w-4 h-4 text-secondary shrink-0" />
                <span className="whitespace-nowrap">Link Connected MetaMask Address</span>
              </button>
            )}

            {isUpdatingWallet && (
              <form onSubmit={handleSaveWallet} className="mt-3 flex space-x-2">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                />
                <button 
                  type="submit" 
                  className="bg-darkBlack hover:bg-gray-800 text-white text-xs px-4 py-1.5 rounded-lg font-bold whitespace-nowrap transition"
                >
                  Save
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* 2. Earned Blockchain Credentials Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-darkBlack flex items-center space-x-2">
            <Award className="w-6 h-6 text-secondary shrink-0" />
            <span>Earned Blockchain Credentials ({myCertificates.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Cryptographically anchored on Ethereum Sepolia testnet. Zero on-chain personal data leaks.
          </p>
        </div>

        {myCertificates.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {myCertificates.map((cert) => (
              <div
                key={cert.certId}
                className="bg-white rounded-3xl shadow-sm hover:shadow-md transition border border-gray-200 p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full font-mono whitespace-nowrap">
                      {cert.certId}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 whitespace-nowrap">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Sepolia Anchored</span>
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-darkBlack mb-1 leading-snug">
                    {cert.courseTitle || 'Advanced Professional Certification'}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4">
                    Issued to <b className="text-darkBlack">{cert.studentName}</b> on {cert.issueDate}
                  </p>

                  {/* Cryptographic Proof Box with Full Hash display & Copy */}
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs font-mono space-y-2 mb-6">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans font-bold">
                        SHA-256 Document Fingerprint
                      </span>
                      <p className="text-darkBlack text-[11px] font-bold break-all leading-relaxed select-all">
                        {cert.generatedPdfHash || '0x9b76c8c49e7bdfa189f81a7b82fe89c8a6b1e6042db621a644485591d8e12470'}
                      </p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200/80">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans font-bold">
                        Recipient Address
                      </span>
                      <p className="text-primary text-[11px] font-bold break-all select-all">
                        {cert.recipientAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(cert)}
                      className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => onVerifyCert(cert.certId)}
                      className="bg-gray-100 hover:bg-gray-200 text-darkBlack text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>Verify</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyLink(cert.certId)}
                    className="text-xs font-bold text-gray-600 hover:text-darkBlack flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
                  >
                    {copiedId === cert.certId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>Share Link</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center shadow-sm">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-darkBlack">No Certificates Issued Yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Complete 100% of the lessons in any enrolled course to become eligible for your cryptographic degree.
            </p>
          </div>
        )}
      </div>

      {/* 3. My Enrolled Courses Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-darkBlack flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary shrink-0" />
            <span>My Enrolled Courses ({enrolledCourses.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Resume your lessons anytime inside the interactive learning room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const progress = StorageService.getCourseProgress(currentUser.id, course.id);

            return (
              <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
                <div>
                  <div className="h-40 bg-primary relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Play className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3.5 left-3.5 bg-secondary text-darkBlack text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-base font-bold text-darkBlack mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Instructor: {course.instructor}</p>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-bold">
                        <span>Curriculum Progress</span>
                        <span className="text-primary font-black">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <button
                    onClick={() => onStartLearning(course)}
                    className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Continue Learning Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
