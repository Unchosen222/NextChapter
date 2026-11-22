import React, { useState } from 'react';
import { 
  Award, 
  SearchCheck, 
  PlusCircle, 
  Ban, 
  BookOpen, 
  UserCheck, 
  Wallet, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Menu, 
  X,
  Globe
} from 'lucide-react';
import { WalletState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenConfig: () => void;
  isDemoMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onOpenConfig,
  isDemoMode,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const navGroups: {
    group: string;
    items: {
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      description: string;
      adminOnly?: boolean;
    }[];
  }[] = [
    {
      group: t.navPublicGroup,
      items: [
        { id: 'verify', label: t.navVerify, icon: SearchCheck, description: t.navVerifyDesc },
        { id: 'dashboard', label: t.navDashboard, icon: UserCheck, description: t.navDashboardDesc },
        { id: 'courses', label: t.navCourses, icon: BookOpen, description: t.navCoursesDesc },
      ],
    },
    {
      group: t.navAdminGroup,
      items: [
        { id: 'issue', label: t.navIssue, icon: PlusCircle, adminOnly: true, description: t.navIssueDesc },
        { id: 'revoke', label: t.navRevoke, icon: Ban, adminOnly: true, description: t.navRevokeDesc },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-brand-primary text-white select-none">
      
      {/* Top: Brand Header & Language Switch */}
      <div>
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            {/* Brand Logo & Name */}
            <div 
              onClick={() => handleNavClick('verify')}
              className="flex items-center space-x-2.5 cursor-pointer group min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                    {t.brandTitle}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-accent/25 text-brand-accent border border-brand-accent/40 font-bold uppercase tracking-wider whitespace-nowrap">
                    {t.badgeAcademy}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                  {t.brandSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Bilingual Language Switcher Pill */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-1 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 pl-2 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-accent" />
              <span>Language:</span>
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('th')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'th'
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                ไทย
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 sm:px-4 py-4 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-brand-accent text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.adminOnly && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 ml-1 flex-shrink-0">
                          {t.adminTag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Network Status & Wallet Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800 space-y-2.5">
        
        {/* Network & Mode Status Pill */}
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isDemoMode 
                ? 'bg-amber-400 animate-pulse'
                : wallet.connected
                ? wallet.isSepolia ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
                : 'bg-emerald-400'
            }`}></span>
            <span className="text-[11px] font-medium text-slate-300 truncate">
              {isDemoMode 
                ? t.demoEvaluation 
                : wallet.connected 
                ? (wallet.isSepolia ? t.sepoliaTestnet : `Chain: ${wallet.chainId}`)
                : t.sepoliaPublicRpc
              }
            </span>
          </div>

          <button
            onClick={onOpenConfig}
            title="Contract Settings & Demo Switch"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wallet Account Box */}
        {wallet.connected && wallet.address ? (
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate font-mono">
                    {formatAddress(wallet.address)}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate font-mono">
                    {wallet.balance} ETH
                  </p>
                </div>
              </div>
              <button
                onClick={onDisconnectWallet}
                title={t.disconnectWallet}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-brand-accent hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Wallet className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t.connectWallet}</span>
          </button>
        )}

        <div className="pt-0.5 text-center">
          <p className="text-[10px] text-slate-400">
            SkilTrust • Sepolia Testnet
          </p>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-brand-primary text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleNavClick('verify')}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">{t.brandTitle}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Language Toggle */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                language === 'en' ? 'bg-brand-accent text-white' : 'text-slate-300'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('th')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                language === 'th' ? 'bg-brand-accent text-white' : 'text-slate-300'
              }`}
            >
              ไทย
            </button>
          </div>

          {wallet.connected ? (
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/10 text-slate-200 border border-white/10">
              {wallet.address ? formatAddress(wallet.address) : ''}
            </span>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-2.5 py-1 rounded-lg bg-brand-accent text-white text-xs font-semibold"
            >
              Connect
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl z-30">
        <SidebarContent />
      </aside>
    </>
  );
};
