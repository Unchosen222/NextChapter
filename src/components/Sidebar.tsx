import React, { useState } from 'react';
import { User, WalletState } from '../types';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Wallet, 
  CheckCircle2, 
  ChevronDown, 
  Menu, 
  X, 
  Play, 
  Award,
  Layers,
  LogOut,
  ExternalLink,
  UserPlus
} from 'lucide-react';

interface SidebarProps {
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
  certificatesCount: number;
  hasActiveLearningCourse: boolean;
  onOpenRegister: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  certificatesCount,
  hasActiveLearningCourse,
  onOpenRegister,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1e1329] text-white border-r border-purple-950/60 shadow-2xl select-none">
      
      {/* 1. Brand Logo Header */}
      <div className="p-4 py-5 border-b border-white/10 flex items-center justify-center">
        <div 
          onClick={() => handleNavClick('discover')}
          className="cursor-pointer group flex items-center justify-center w-full"
        >
          <img 
            src="/logo.png" 
            alt="NextChapter Logo" 
            className="h-16 lg:h-20 w-auto max-w-[200px] object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>

      {/* 2. Active User & Role Switcher Card */}
      <div className="p-4 border-b border-white/10 relative">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          <span>Active Account</span>
          <button
            onClick={onOpenRegister}
            className="text-secondary hover:text-secondary-light flex items-center space-x-1 font-black transition hover:underline"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Register</span>
          </button>
        </div>

        <button
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/20"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate whitespace-nowrap">
                {currentUser.name}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded whitespace-nowrap ${
                  currentUser.role === 'Student' ? 'bg-primary text-white' :
                  currentUser.role === 'Teacher' ? 'bg-secondary text-darkBlack' : 'bg-red-500 text-white'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-gray-400 truncate font-mono">
                  {currentUser.walletAddress ? formatAddress(currentUser.walletAddress) : 'No wallet'}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown for Role Switching */}
        {roleDropdownOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-[#2a1b39] border border-purple-500/30 rounded-xl shadow-2xl p-2 z-50 space-y-1">
            <p className="text-[10px] text-gray-400 px-2 py-1 font-semibold uppercase">
              Switch User Role:
            </p>
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser(u);
                  setRoleDropdownOpen(false);
                  if (u.role === 'Teacher') handleNavClick('teacher-hub');
                  else if (u.role === 'Admin') handleNavClick('admin-panel');
                  else handleNavClick('student-hub');
                }}
                className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                  currentUser.id === u.id ? 'bg-primary text-white font-bold' : 'hover:bg-white/10 text-gray-200'
                }`}
              >
                <div className="truncate mr-2">
                  <p className="font-bold truncate whitespace-nowrap">{u.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{u.email}</p>
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${
                  u.role === 'Student' ? 'bg-primary/50 text-white' :
                  u.role === 'Teacher' ? 'bg-secondary text-darkBlack' : 'bg-red-600 text-white'
                }`}>
                  {u.role}
                </span>
              </button>
            ))}

            {/* Register New Account Action */}
            <div className="pt-2 border-t border-white/10 mt-1">
              <button
                onClick={() => {
                  setRoleDropdownOpen(false);
                  onOpenRegister();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary-dark text-darkBlack text-xs font-black transition shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation Links List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Academic Navigation
        </div>

        {/* Explore Courses */}
        <button
          onClick={() => handleNavClick('discover')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
            activeTab === 'discover'
              ? 'bg-secondary text-darkBlack font-bold shadow-md shadow-secondary/20'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate whitespace-nowrap">Explore Courses</span>
        </button>

        {/* My Courses & Credentials (Student Only) */}
        {currentUser.role === 'Student' && (
          <button
            onClick={() => handleNavClick('student-hub')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
              activeTab === 'student-hub'
                ? 'bg-secondary text-darkBlack font-bold shadow-md shadow-secondary/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">My Courses & Certs</span>
            </div>
            {certificatesCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                {certificatesCount}
              </span>
            )}
          </button>
        )}

        {/* Active Learning Room Shortcut */}
        {hasActiveLearningCourse && (
          <button
            onClick={() => handleNavClick('learning-room')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
              activeTab === 'learning-room'
                ? 'bg-primary text-white font-bold shadow-md shadow-primary/30'
                : 'text-purple-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate whitespace-nowrap">Interactive Room</span>
          </button>
        )}

        {/* Instructor Studio (Teacher Only) */}
        {currentUser.role === 'Teacher' && (
          <button
            onClick={() => handleNavClick('teacher-hub')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
              activeTab === 'teacher-hub'
                ? 'bg-secondary text-darkBlack font-bold shadow-md shadow-secondary/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate whitespace-nowrap">Instructor Studio</span>
          </button>
        )}

        {/* Admin Hub (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => handleNavClick('admin-panel')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
              activeTab === 'admin-panel'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span className="truncate whitespace-nowrap">Admin Governance</span>
          </button>
        )}

        <div className="pt-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Public Tools
        </div>

        {/* Verify Certificate (Public) */}
        <button
          onClick={() => handleNavClick('verify')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
            activeTab === 'verify'
              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="truncate whitespace-nowrap">Verify Certificate</span>
        </button>

      </div>

      {/* 4. Bottom Controls: Demo Mode & Wallet Connect */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
        
        {/* Network & Demo Mode Toggle */}
        <button
          onClick={onToggleDemoMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition border ${
            isDemoMode
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate whitespace-nowrap">
              {isDemoMode ? 'Demo Mode (Zero Gas)' : 'Sepolia Testnet'}
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono shrink-0">
            {isDemoMode ? 'TEST' : 'LIVE'}
          </span>
        </button>

        {/* Wallet Connect Box */}
        {wallet.connected && wallet.address ? (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>MetaMask Connected</span>
              </span>
              <button
                onClick={onDisconnectWallet}
                title="Disconnect Wallet"
                className="text-gray-400 hover:text-red-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-mono text-xs text-white font-bold truncate">
              {formatAddress(wallet.address)}
            </p>
            {wallet.balance && (
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {parseFloat(wallet.balance).toFixed(4)} ETH
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 bg-secondary hover:bg-secondary-dark text-darkBlack rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition"
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Connect MetaMask</span>
          </button>
        )}

        <div className="text-center pt-1">
          <p className="text-[10px] text-gray-400 font-mono">
            NextChapter • CSI301 SPU
          </p>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#1e1329] text-white border-b border-purple-950/80 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => handleNavClick('discover')}
        >
          <img 
            src="/logo.png" 
            alt="NextChapter Logo" 
            className="h-10 w-auto object-contain shrink-0"
          />
        </div>

        <div className="flex items-center space-x-2">
          {wallet.connected && wallet.address ? (
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/10 text-emerald-300 font-bold border border-white/10">
              {formatAddress(wallet.address)}
            </span>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-2.5 py-1 rounded-lg bg-secondary text-darkBlack text-xs font-bold"
            >
              Connect
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-darkBlack/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 h-screen sticky top-0 border-r border-purple-950/60 shadow-xl z-30">
        <SidebarContent />
      </aside>
    </>
  );
};
