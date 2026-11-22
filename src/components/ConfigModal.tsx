import React, { useState } from 'react';
import { X, Settings, Database, Download, Upload, Check, Rocket } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Web3Service } from '../services/web3Service';
import { useLanguage } from '../context/LanguageContext';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: string;
  onContractAddressChange: (newAddress: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  contractAddress,
  onContractAddressChange,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const { t, language } = useLanguage();
  const [addressInput, setAddressInput] = useState(contractAddress);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onContractAddressChange(addressInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeployWithConnectedWallet = async () => {
    try {
      setDeploying(true);
      setDeployMessage(null);
      const web3 = Web3Service.getInstance();
      const res = await web3.deployContract();
      setAddressInput(res.address);
      onContractAddressChange(res.address);
      setDeployMessage(
        language === 'th'
          ? `ติดตั้ง Smart Contract สำเร็จ! แอดเดรสใหม่: ${res.address}`
          : `Contract successfully deployed! New address: ${res.address}`
      );
    } catch (err: any) {
      setDeployMessage(err.reason || err.message || 'Deployment failed.');
    } finally {
      setDeploying(false);
    }
  };

  const handleExportBackup = () => {
    const json = StorageService.exportDataBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skiltrust_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = StorageService.importDataBackup(content);
        if (success) {
          setImportStatus(
            language === 'th'
              ? 'กู้คืนข้อมูลสำรองสำเร็จ! กำลังรีโหลด...'
              : 'Backup restored successfully! Reloading...'
          );
          setTimeout(() => window.location.reload(), 1200);
        } else {
          setImportStatus(language === 'th' ? 'รูปแบบไฟล์สำรองไม่ถูกต้อง' : 'Invalid backup file format.');
        }
      } catch {
        setImportStatus(language === 'th' ? 'ไม่สามารถอ่านไฟล์สำรองได้' : 'Failed to read backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-primary text-white">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-brand-accent flex-shrink-0" />
            <h3 className="font-bold text-base text-white">{t.settingsTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Demo Mode Toggle */}
          <div className="bg-brand-surface p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-brand-primary flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-brand-secondary flex-shrink-0" />
                <span>{t.settingsDemoTitle}</span>
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t.settingsDemoDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
            </label>
          </div>

          {/* 1-Click Deploy Contract Section */}
          <div className="bg-gradient-to-r from-brand-surface to-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-brand-primary flex items-center space-x-1.5">
                  <Rocket className="w-4 h-4 text-brand-accent flex-shrink-0" />
                  <span>{t.settingsDeployTitle}</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {t.settingsDeployDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeployWithConnectedWallet}
                disabled={deploying}
                className="px-4 py-2 bg-brand-accent hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {deploying ? 'Deploying...' : 'Deploy Contract'}
              </button>
            </div>
            {deployMessage && (
              <p className="text-[11px] font-mono text-brand-secondary break-all pt-1">
                {deployMessage}
              </p>
            )}
          </div>

          {/* Smart Contract Address Override */}
          <div>
            <form onSubmit={handleSaveAddress} className="space-y-2">
              <label className="block text-xs font-bold text-brand-primary">
                {t.settingsActiveContract}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 flex-shrink-0"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.saved}</span>
                    </>
                  ) : (
                    <span>{t.save}</span>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {t.settingsContractDesc}
              </p>
            </form>
          </div>

          {/* Data Backup & Restore */}
          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-xs font-bold text-brand-primary mb-2">
              {t.settingsBackupTitle}
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-surface hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                <span>{t.btnExportBackup}</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-surface hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
                <span>{t.btnImportBackup}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-xs text-brand-accent mt-2 font-medium">{importStatus}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-brand-surface border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
