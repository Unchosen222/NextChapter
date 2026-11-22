import React from 'react';
import { User, WalletState } from '../types';
import { 
  ShieldCheck, 
  Wallet, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  enrolledCoursesCount: number;
  certificatesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  activeTab,
  setActiveTab,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  isDemoMode,
  onToggleDemoMode,
  enrolledCoursesCount,
  certificatesCount,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('discover')} 
              className="flex items-center space-x-2 text-2xl font-bold tracking-tight focus:outline-none"
            >
              <span className="text-secondary font-black">Next</span>
              <span className="text-primary font-black">Chapter</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full ml-1">
                Web3
              </span>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                  activeTab === 'discover'
                    ? 'text-primary bg-primary/5 font-bold'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Courses</span>
              </button>

              {currentUser.role === 'Student' && (
                <button
                  onClick={() => setActiveTab('student-hub')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                    activeTab === 'student-hub' || activeTab === 'learning-room'
                      ? 'text-primary bg-primary/5 font-bold'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>My Courses & Certs</span>
                  {certificatesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-secondary text-darkBlack text-xs font-bold rounded-full">
                      {certificatesCount}
                    </span>
                  )}
                </button>
              )}

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setActiveTab('teacher-hub')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                    activeTab === 'teacher-hub'
                      ? 'text-secondary bg-secondary/10 font-bold'
                      : 'text-gray-600 hover:text-secondary hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Instructor Studio</span>
                </button>
              )}

              {currentUser.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('admin-panel')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                    activeTab === 'admin-panel'
                      ? 'text-red-700 bg-red-50 font-bold'
                      : 'text-gray-600 hover:text-red-700 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Admin Hub</span>
                </button>
              )}

              {/* Public Verification Link */}
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center space-x-1.5 ${
                  activeTab === 'verify'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verify Certificate</span>
              </button>
            </nav>
          </div>

          {/* Right Tools: Role Switcher, Demo Mode & Wallet */}
          <div className="flex items-center space-x-3">
            
            {/* Demo Mode Toggle */}
            <button
              onClick={onToggleDemoMode}
              title={isDemoMode ? "Demo Mode Active (Zero Gas Testing)" : "Live Sepolia Mode (Real Blockchain)"}
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                isDemoMode 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isDemoMode ? 'Demo Mode: ON' : 'Sepolia Network'}</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-full cursor-pointer transition">
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={currentUser.name} 
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-darkBlack truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  currentUser.role === 'Student' ? 'bg-primary text-white' :
                  currentUser.role === 'Teacher' ? 'bg-secondary text-darkBlack' : 'bg-red-600 text-white'
                }`}>
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50">
                <p className="text-[11px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Switch Active Role (Evaluation):
                </p>
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      if (user.role === 'Teacher') setActiveTab('teacher-hub');
                      else if (user.role === 'Admin') setActiveTab('admin-panel');
                      else setActiveTab('student-hub');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      currentUser.id === user.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-[10px] text-gray-400">{user.email}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                      user.role === 'Student' ? 'bg-primary/20 text-primary' :
                      user.role === 'Teacher' ? 'bg-secondary/30 text-amber-900' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Connect Button */}
            {wallet.connected && wallet.address ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                <button
                  onClick={onDisconnectWallet}
                  title="Disconnect Wallet"
                  className="text-gray-400 hover:text-red-600 ml-1 font-bold"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition hover:shadow"
              >
                <Wallet className="w-4 h-4 text-secondary" />
                <span>Connect MetaMask</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
