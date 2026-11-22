import React, { useState } from 'react';
import { User, UserRole, WalletState } from '../types';
import { StorageService } from '../services/storageService';
import { 
  X, 
  UserPlus, 
  GraduationCap, 
  LayoutDashboard, 
  Wallet, 
  CheckCircle2, 
  Sparkles,
  Mail,
  User as UserIcon
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newUser: User) => void;
  wallet: WalletState;
  onConnectWallet: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  wallet,
  onConnectWallet,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [walletAddress, setWalletAddress] = useState(wallet.address || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseConnectedWallet = () => {
    if (wallet.connected && wallet.address) {
      setWalletAddress(wallet.address);
    } else {
      onConnectWallet();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (walletAddress.trim() && (!walletAddress.startsWith('0x') || walletAddress.length !== 42)) {
      setErrorMsg('Ethereum address must start with 0x and be 42 characters long.');
      return;
    }

    // Default avatars based on role
    const avatarUrl = role === 'Teacher'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: `user-${role.toLowerCase()}-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      walletAddress: walletAddress.trim() || undefined,
      avatarUrl,
      createdAt: new Date().toISOString(),
    };

    StorageService.addUser(newUser);
    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBlack/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
              Join NextChapter
            </span>
            <h2 className="text-xl font-extrabold text-darkBlack">
              Create New Account
            </h2>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Role Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">I am registering as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  role === 'Student'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold">Student</p>
                  <p className="text-[10px] text-gray-500 font-normal">Earn credentials</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('Teacher')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  role === 'Teacher'
                    ? 'border-secondary bg-secondary/15 text-amber-900 font-bold shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-secondary" />
                <div>
                  <p className="font-bold">Teacher</p>
                  <p className="text-[10px] text-gray-500 font-normal">Teach & issue certs</p>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Somchai Prasert"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-darkBlack"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. somchai@spu.ac.th"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-darkBlack"
              />
            </div>
          </div>

          {/* Ethereum Wallet Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700">Ethereum Wallet (Optional)</label>
              {wallet.connected && (
                <button
                  type="button"
                  onClick={handleUseConnectedWallet}
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  Use Connected
                </button>
              )}
            </div>
            <div className="relative">
              <Wallet className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary font-mono text-xs text-darkBlack"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Used to anchor your certificates onto Ethereum Sepolia. Can also be connected later.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Create Account</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
