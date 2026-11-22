import React, { useState } from 'react';
import { Course, User, WalletState, CertificateRecord } from '../types';
import { StorageService } from '../services/storageService';
import { PdfService } from '../services/pdfService';
import { Web3Service } from '../services/web3Service';
import confetti from 'canvas-confetti';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  Wallet
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  courses: Course[];
  wallet: WalletState;
  onConnectWallet: () => void;
  onRefreshData: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  courses,
  wallet,
  onConnectWallet,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'courses'>('roster');
  
  // Issuance State
  const [issuingStudentId, setIssuingStudentId] = useState<string | null>(null);
  const [issueStatus, setIssueStatus] = useState<string>('');
  const [issueError, setIssueError] = useState<string | null>(null);
  const [lastIssued, setLastIssued] = useState<{ certId: string; txHash: string } | null>(null);

  // New Course Modal State
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Course['category']>('AI');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('990');
  const [newSkills, setNewSkills] = useState('PyTorch, LLM, Python');

  const web3Service = Web3Service.getInstance();
  const allUsers = StorageService.getAllUsers();
  const enrollments = StorageService.getEnrollments();
  const certificates = StorageService.getCertificates();

  // Teacher's courses
  const myCourses = courses.filter(c => 
    c.instructor.toLowerCase().includes(currentUser.name.toLowerCase()) || 
    c.instructorWallet?.toLowerCase() === currentUser.walletAddress?.toLowerCase() ||
    currentUser.role === 'Teacher' // For demonstration purposes, allow teacher to oversee courses
  );

  // Build Student Roster across courses
  const rosterItems = enrollments.map(enroll => {
    const student = allUsers.find(u => u.id === enroll.userId) || {
      id: enroll.userId,
      name: 'Alexander Vance',
      email: 'alex@nextchapter.edu',
      walletAddress: '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10',
    };
    const course = courses.find(c => c.id === enroll.courseId);
    const progress = StorageService.getCourseProgress(enroll.userId, enroll.courseId);
    const existingCert = certificates.find(c => 
      c.courseId === enroll.courseId && 
      (c.studentId === enroll.userId || c.recipientAddress.toLowerCase() === student.walletAddress?.toLowerCase())
    );

    return {
      enrollment: enroll,
      student,
      course,
      progress,
      certificate: existingCert,
    };
  }).filter(item => item.course !== undefined);

  // Stats calculation
  const totalStudents = rosterItems.length;
  const issuedCertsCount = certificates.length;
  const totalRevenue = enrollments.reduce((sum, e) => sum + e.purchasePrice, 0);

  /**
   * Handle 1-Click Blockchain Certificate Issuance
   */
  const handleIssueCertificate = async (item: typeof rosterItems[0]) => {
    if (!item.course) return;

    const studentWallet = item.student.walletAddress || '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10';
    const certId = `NC-2026-${item.course.id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    setIssuingStudentId(item.student.id);
    setIssueError(null);
    setLastIssued(null);

    try {
      // Step 1: Generate branded PDF
      setIssueStatus('1/3: Rendering NextChapter High-Res Certificate PDF...');
      const metadata = {
        certId,
        courseId: item.course.id,
        courseTitle: item.course.title,
        studentId: item.student.id,
        studentName: item.student.name,
        recipientAddress: studentWallet,
        issueDate: new Date().toISOString().slice(0, 10),
        grade: 'Pass with Distinction',
        issuerName: currentUser.name,
        notes: `Completed all curriculum modules for ${item.course.title}.`,
      };

      const pdfResult = await PdfService.generateCertificatePdf(metadata, item.course);
      
      // Step 2: Anchor on Ethereum Sepolia
      setIssueStatus('2/3: Anchoring SHA-256 fingerprint to Ethereum Sepolia...');
      const txHash = await web3Service.issueCertificate(
        certId,
        item.course.id,
        studentWallet,
        pdfResult.sha256Hash
      );

      // Step 3: Record in Storage & Cloud
      setIssueStatus('3/3: Saving official certificate record to NextChapter database...');
      const certRecord: CertificateRecord = {
        id: `cert-${Date.now()}`,
        certId,
        courseId: item.course.id,
        courseTitle: item.course.title,
        studentId: item.student.id,
        studentName: item.student.name,
        recipientAddress: studentWallet,
        issuerName: currentUser.name,
        issueDate: metadata.issueDate,
        grade: metadata.grade,
        notes: metadata.notes,
        generatedPdfHash: pdfResult.sha256Hash,
        txHash: txHash,
        isRevoked: false,
      };

      StorageService.saveCertificate(certRecord);

      setLastIssued({ certId, txHash });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      setIssueError(err.message || 'Blockchain transaction rejected or failed.');
    } finally {
      setIssuingStudentId(null);
      setIssueStatus('');
    }
  };

  /**
   * Handle Create Course
   */
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = `CS-${newCategory.toUpperCase().slice(0, 3)}-0${courses.length + 1}`;
    const newCourse: Course = {
      id: courseId,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      price: parseFloat(newPrice) || 0,
      skills: newSkills.split(',').map(s => s.trim()),
      durationHours: 45,
      instructor: currentUser.name,
      instructorWallet: currentUser.walletAddress,
      createdAt: new Date().toISOString().slice(0, 10),
      lessons: [
        {
          id: `lesson-${Date.now()}-1`,
          courseId,
          title: 'Introduction & Core Foundations',
          youtubeUrl: 'https://www.youtube.com/embed/aircAruvnKk',
          instruction: 'Welcome to the course! In this module we cover the fundamental concepts.',
          orderNumber: 1,
        },
      ],
    };

    StorageService.saveCourse(newCourse);
    setIsNewCourseOpen(false);
    setNewTitle('');
    setNewDescription('');
    onRefreshData();
  };

  return (
    <div className="min-h-screen bg-offWhite pb-24">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Instructor Portal</span>
              <h1 className="text-3xl font-extrabold text-darkBlack">
                Teacher Dashboard & Certificate Studio
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Oversee student curriculum completion and issue cryptographic Ethereum credentials.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNewCourseOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[11px] text-gray-500 font-medium block">Total Courses</span>
              <span className="text-2xl font-black text-darkBlack">{myCourses.length}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[11px] text-gray-500 font-medium block">Enrolled Students</span>
              <span className="text-2xl font-black text-primary">{totalStudents}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[11px] text-gray-500 font-medium block">Certificates Issued</span>
              <span className="text-2xl font-black text-emerald-600">{issuedCertsCount}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[11px] text-gray-500 font-medium block">Platform Revenue</span>
              <span className="text-2xl font-black text-secondary">฿{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Studio Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-4 mb-6">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'roster'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Students & Certificate Issuance Queue ({rosterItems.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'courses'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Courses ({myCourses.length})</span>
          </button>
        </div>

        {/* Global Notifications */}
        {issueStatus && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-xl mb-6 text-xs font-bold flex items-center space-x-3 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span>{issueStatus}</span>
          </div>
        )}

        {issueError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 text-xs font-bold flex items-center space-x-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{issueError}</span>
          </div>
        )}

        {lastIssued && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl mb-6 text-xs">
            <div className="flex items-center space-x-2 font-black text-sm mb-1 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Certificate Anchored to Ethereum Successfully!</span>
            </div>
            <p className="font-mono text-[11px] text-gray-600">
              Certificate ID: <b className="text-darkBlack">{lastIssued.certId}</b> | Tx Hash:{' '}
              <span className="text-primary">{lastIssued.txHash.slice(0, 20)}...</span>
            </p>
          </div>
        )}

        {/* Tab 1: Students & Certificate Issuance Queue */}
        {activeSubTab === 'roster' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-darkBlack">Course Completion & Credential Queue</h3>
                <p className="text-xs text-gray-500">Students with 100% completed lessons are automatically marked as Eligible.</p>
              </div>

              {!wallet.connected && (
                <button
                  onClick={onConnectWallet}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-2 self-start sm:self-auto"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect MetaMask to Sign On-Chain</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200">
                    <th className="p-4">Student</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Curriculum Progress</th>
                    <th className="p-4">Recipient Wallet</th>
                    <th className="p-4">Certificate Status</th>
                    <th className="p-4 text-right">Blockchain Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {rosterItems.map((item) => {
                    const isEligible = item.progress.isEligible;
                    const hasCert = item.certificate !== undefined;
                    const isProcessing = issuingStudentId === item.student.id;

                    return (
                      <tr key={`${item.student.id}-${item.course?.id}`} className="hover:bg-gray-50/70 transition">
                        
                        {/* Student Info */}
                        <td className="p-4 font-bold text-darkBlack">
                          <p>{item.student.name}</p>
                          <p className="text-[11px] text-gray-400 font-normal">{item.student.email}</p>
                        </td>

                        {/* Course */}
                        <td className="p-4">
                          <span className="font-semibold text-darkBlack block">{item.course?.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{item.course?.id}</span>
                        </td>

                        {/* Progress */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isEligible ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                                style={{ width: `${item.progress.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-600">
                              {item.progress.completed}/{item.progress.total} ({item.progress.percentage}%)
                            </span>
                          </div>
                        </td>

                        {/* Recipient Wallet */}
                        <td className="p-4 font-mono text-[11px] text-gray-600">
                          {item.student.walletAddress ? (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              {item.student.walletAddress.slice(0, 6)}...{item.student.walletAddress.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-sans font-medium text-[11px]">
                              Not Linked Yet
                            </span>
                          )}
                        </td>

                        {/* Certificate Status */}
                        <td className="p-4">
                          {hasCert ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Issued ({item.certificate?.certId})</span>
                            </span>
                          ) : isEligible ? (
                            <span className="inline-flex items-center space-x-1 bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-secondary" />
                              <span>Eligible (100%)</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium text-[11px]">
                              In Progress
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-4 text-right">
                          {hasCert ? (
                            <button
                              onClick={() => {
                                const cert = item.certificate;
                                if (cert && item.course) {
                                  PdfService.generateCertificatePdf(cert, item.course).then(res => {
                                    res.doc.save(`${cert.certId}_Certificate.pdf`);
                                  });
                                }
                              }}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-darkBlack px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ml-auto"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIssueCertificate(item)}
                              disabled={isProcessing}
                              className={`text-xs px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center space-x-1.5 ml-auto ${
                                isEligible
                                  ? 'bg-secondary hover:bg-secondary-dark text-darkBlack'
                                  : 'bg-primary hover:bg-primary-dark text-white'
                              } disabled:opacity-50`}
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{isProcessing ? 'Anchoring...' : 'Issue Certificate'}</span>
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: My Courses */}
        {activeSubTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">{c.category}</span>
                <h4 className="text-base font-bold text-darkBlack mb-2">{c.title}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-black text-primary text-base">฿{(c.price ?? 0).toLocaleString()}</span>
                  <span className="text-gray-400 font-medium">{c.lessons?.length || 0} Lessons</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Course Modal */}
      {isNewCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBlack/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-darkBlack mb-4">Create New Technology Course</h3>
            
            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Ledger Systems & Solidity"
                  className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                >
                  <option value="AI">AI</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Price (THB)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Course syllabus and expected outcomes..."
                  className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewCourseOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
