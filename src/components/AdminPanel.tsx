import React, { useState } from 'react';
import { User, Course, Coupon, WalletState } from '../types';
import { StorageService } from '../services/storageService';
import { Web3Service } from '../services/web3Service';
import { 
  ShieldAlert, 
  Users, 
  Tag, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RefreshCw,
  XCircle,
  Wallet
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  courses: Course[];
  wallet: WalletState;
  onConnectWallet: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  courses,
  wallet,
  onConnectWallet,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'certs' | 'coupons' | 'users'>('certs');
  
  // Revocation state
  const [revokeCertId, setRevokeCertId] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeStatus, setRevokeStatus] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Coupon state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('25');

  const web3Service = Web3Service.getInstance();
  const users = StorageService.getAllUsers();
  const coupons = StorageService.getCoupons();
  const certificates = StorageService.getCertificates();

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertId || !revokeReason) return;

    setRevoking(true);
    setRevokeError(null);
    setRevokeStatus(null);

    try {
      // Step 1: On-Chain Revoke
      await web3Service.revokeCertificate(revokeCertId, revokeReason);
      
      // Step 2: Storage Revoke
      StorageService.revokeCertificate(revokeCertId, revokeReason);
      
      setRevokeStatus(`Certificate ${revokeCertId} was revoked successfully on Ethereum Sepolia.`);
      setRevokeCertId('');
      setRevokeReason('');
      onRefreshData();
    } catch (err: any) {
      setRevokeError(err.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountPercentage: parseInt(newCouponDiscount, 10) || 10,
      isActive: true,
      expiryDate: '2026-12-31',
    };

    StorageService.saveCoupon(newCoupon);
    setNewCouponCode('');
    onRefreshData();
  };

  const handleToggleCoupon = (coupon: Coupon) => {
    coupon.isActive = !coupon.isActive;
    StorageService.saveCoupon(coupon);
    onRefreshData();
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">Administrator Center</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-darkBlack mt-0.5">
          System Administration & Security Governance
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Audit cryptographic credentials, revoke compromised diplomas on-chain, and manage platform coupons.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="text-[11px] text-gray-500 font-medium block">Total Users</span>
            <span className="text-2xl font-black text-darkBlack">{users.length}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="text-[11px] text-gray-500 font-medium block">Total Courses</span>
            <span className="text-2xl font-black text-primary">{courses.length}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="text-[11px] text-gray-500 font-medium block">Active Certificates</span>
            <span className="text-2xl font-black text-emerald-600">
              {certificates.filter(c => !c.isRevoked).length}
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="text-[11px] text-gray-500 font-medium block">Revoked Certificates</span>
            <span className="text-2xl font-black text-red-600">
              {certificates.filter(c => c.isRevoked).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('certs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'certs'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Certificate Audit & Revocation</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'coupons'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Discount Coupons ({coupons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users ({users.length})</span>
          </button>
        </div>

        {/* Tab 1: Certificate Audit & Revocation */}
        {activeTab === 'certs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Revoke Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-red-600 flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>On-Chain Revoke Tool</span>
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Revoking marks the certificate permanently invalid on Ethereum Sepolia. This action is irreversible.
              </p>

              {revokeStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs mb-4 font-medium">
                  {revokeStatus}
                </div>
              )}

              {revokeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs mb-4 font-medium">
                  {revokeError}
                </div>
              )}

              <form onSubmit={handleRevoke} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Certificate ID</label>
                  <input
                    type="text"
                    required
                    value={revokeCertId}
                    onChange={(e) => setRevokeCertId(e.target.value)}
                    placeholder="e.g. NC-2026-BC01"
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Revocation Reason (Audit Trail)</label>
                  <textarea
                    rows={3}
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Academic integrity violation or typographical correction."
                    className="w-full px-3 py-2 border rounded-xl focus:border-red-600 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={revoking}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow transition disabled:opacity-50"
                >
                  {revoking ? 'Executing On-Chain Revocation...' : 'Revoke on Ethereum'}
                </button>
              </form>
            </div>

            {/* Certificate Roster */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h4 className="font-bold text-sm text-darkBlack">Issued Certificates Registry</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Cert ID</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Quick Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {certificates.map((c) => (
                      <tr key={c.certId} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-darkBlack">{c.certId}</td>
                        <td className="p-3 font-medium">{c.studentName}</td>
                        <td className="p-3 text-gray-500">{c.courseId}</td>
                        <td className="p-3">
                          {c.isRevoked ? (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              REVOKED
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              VALID
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!c.isRevoked && (
                            <button
                              onClick={() => {
                                setRevokeCertId(c.certId);
                                setRevokeReason('Certificate revoked per administrative audit review.');
                              }}
                              className="text-[11px] text-red-600 font-bold hover:underline"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Coupons */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-darkBlack mb-4">Create Discount Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. SPU50"
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow"
                >
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-sm text-darkBlack mb-4">Active Coupons</h4>
              <div className="space-y-3">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="font-mono font-black text-primary text-sm mr-2">{c.code}</span>
                      <span className="bg-secondary/20 text-amber-900 px-2 py-0.5 rounded font-bold">
                        {c.discountPercentage}% OFF
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleCoupon(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Linked Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-darkBlack">{u.name}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4 font-bold">{u.role}</td>
                    <td className="p-4 font-mono text-[11px] text-primary">
                      {u.walletAddress || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
