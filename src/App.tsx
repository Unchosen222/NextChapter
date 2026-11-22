import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { LearningRoom } from './components/LearningRoom';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TraineeDashboard } from './components/TraineeDashboard';
import { AdminPanel } from './components/AdminPanel';
import { VerifyCertificate } from './components/VerifyCertificate';
import { Web3Service } from './services/web3Service';
import { StorageService } from './services/storageService';
import { Course, User, WalletState } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(StorageService.getAllUsers());
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  
  // Active course in learning room
  const [activeLearningCourse, setActiveLearningCourse] = useState<Course | null>(null);
  
  // Selected course for enrollment modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  
  // Target certId for public verification
  const [verifyTargetCertId, setVerifyTargetCertId] = useState<string>('');
  
  // Demo Mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // MetaMask Wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    isSepolia: false,
    isOwner: false,
    balance: null,
  });

  const web3Service = Web3Service.getInstance();

  const refreshData = () => {
    setCourses(StorageService.getCourses());
    setAllUsers(StorageService.getAllUsers());
    setCurrentUser(StorageService.getCurrentUser());
  };

  useEffect(() => {
    refreshData();
    setIsDemoMode(web3Service.getIsDemoMode());

    // Check URL parameters for direct verification link (?certId=...)
    const params = new URLSearchParams(window.location.search);
    const paramCertId = params.get('certId');
    if (paramCertId) {
      setVerifyTargetCertId(paramCertId);
      setActiveTab('verify');
    }

    // Set initial active learning course if student has enrollments
    const enrollments = StorageService.getEnrollments().filter(e => e.userId === currentUser.id);
    if (enrollments.length > 0) {
      const firstEnrolled = courses.find(c => c.id === enrollments[0].courseId);
      if (firstEnrolled) setActiveLearningCourse(firstEnrolled);
    }

    // MetaMask Event Listeners
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          web3Service.disconnectWallet();
          setWallet({
            connected: false,
            address: null,
            chainId: null,
            isSepolia: false,
            isOwner: false,
            balance: null,
          });
        } else {
          web3Service.connectWallet().then(setWallet).catch(console.error);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
          (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    try {
      const newWallet = await web3Service.connectWallet();
      setWallet(newWallet);
      if (newWallet.address) {
        // Auto-link to user profile if student
        StorageService.updateStudentWallet(currentUser.id, newWallet.address);
        refreshData();
      }
    } catch (err: any) {
      alert(`Wallet Connection Error: ${err.message || 'MetaMask not installed or rejected.'}`);
    }
  };

  const handleDisconnectWallet = () => {
    web3Service.disconnectWallet();
    setWallet({
      connected: false,
      address: null,
      chainId: null,
      isSepolia: false,
      isOwner: false,
      balance: null,
    });
  };

  const handleToggleDemoMode = () => {
    const updated = web3Service.toggleDemoMode();
    setIsDemoMode(updated);
  };

  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    refreshData();
  };

  const handleStartLearning = (course: Course) => {
    setActiveLearningCourse(course);
    setActiveTab('learning-room');
  };

  const handleVerifyCert = (certId: string) => {
    setVerifyTargetCertId(certId);
    setActiveTab('verify');
  };

  const enrolledCourseIds = StorageService.getEnrollments()
    .filter(e => e.userId === currentUser.id)
    .map(e => e.courseId);

  const certificatesCount = StorageService.getCertificates()
    .filter(c => c.studentId === currentUser.id || c.recipientAddress.toLowerCase() === currentUser.walletAddress?.toLowerCase())
    .length;

  return (
    <div className="min-h-screen flex flex-col bg-offWhite font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        enrolledCoursesCount={enrolledCourseIds.length}
        certificatesCount={certificatesCount}
      />

      {/* Main Tab Routing */}
      <main className="flex-grow">
        {activeTab === 'discover' && (
          <CourseCatalog
            courses={courses}
            currentUser={currentUser}
            onSelectCourse={(course) => setSelectedCourseForModal(course)}
            onStartLearning={handleStartLearning}
            enrolledCourseIds={enrolledCourseIds}
          />
        )}

        {activeTab === 'learning-room' && activeLearningCourse && (
          <LearningRoom
            course={activeLearningCourse}
            currentUser={currentUser}
            wallet={wallet}
            onBackToDashboard={() => setActiveTab(currentUser.role === 'Student' ? 'student-hub' : 'discover')}
            onViewCertificates={() => setActiveTab('student-hub')}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {activeTab === 'student-hub' && (
          <TraineeDashboard
            currentUser={currentUser}
            courses={courses}
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
            onStartLearning={handleStartLearning}
            onVerifyCert={handleVerifyCert}
          />
        )}

        {activeTab === 'teacher-hub' && (
          <TeacherDashboard
            currentUser={currentUser}
            courses={courses}
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'admin-panel' && (
          <AdminPanel
            currentUser={currentUser}
            courses={courses}
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyCertificate initialCertId={verifyTargetCertId} />
        )}
      </main>

      {/* Course Enrollment Modal */}
      {selectedCourseForModal && (
        <CourseDetailsModal
          course={selectedCourseForModal}
          currentUser={currentUser}
          onClose={() => setSelectedCourseForModal(null)}
          onEnrollSuccess={(course) => {
            setSelectedCourseForModal(null);
            handleStartLearning(course);
          }}
        />
      )}

      {/* Footer matching NextChapter */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2 text-base font-bold mb-2">
            <span className="text-secondary">Next</span>
            <span className="text-primary">Chapter</span>
            <span className="text-gray-400 font-normal">|</span>
            <span className="text-gray-600 font-medium text-xs">CSI301 Blockchain Project</span>
          </div>
          <p className="mb-2">Empowering learners and creators with immutable Ethereum credentials.</p>
          <p className="text-gray-400 font-mono text-[11px]">
            Smart Contract: Ethereum Sepolia • Zero-PII SHA-256 Verification • Sripatum University (SPU)
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
