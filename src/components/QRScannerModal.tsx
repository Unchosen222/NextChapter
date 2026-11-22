import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrRegionId = 'html5qr-code-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setError(null);

    const startScanner = async () => {
      try {
        const qrCode = new Html5Qrcode(qrRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = qrCode;

        await qrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              // Parse out certId from either raw text or URL
              let certId = decodedText.trim();
              try {
                if (certId.includes('certId=')) {
                  const url = new URL(certId);
                  const param = url.searchParams.get('certId');
                  if (param) certId = param;
                }
              } catch {
                // Keep raw decodedText
              }

              // Stop scanner & trigger success callback
              qrCode.stop().then(() => {
                onScanSuccess(certId);
                onClose();
              }).catch(() => {
                onScanSuccess(certId);
                onClose();
              });
            }
          },
          () => {
            // Frame scan failure (ignored)
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.error('QR Scanner start error:', err);
        if (isMounted) {
          setError(
            err.message || 'Unable to access camera. Please grant camera permission or verify using Certificate ID search.'
          );
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              html5QrCodeRef.current?.clear();
            } catch {}
          });
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-primary text-white">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-brand-accent" />
            <h3 className="font-bold text-base text-white">{t.scanQrTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Region */}
        <div className="p-6">
          <p className="text-xs text-slate-600 mb-4 text-center">
            {t.scanQrSubtitle}
          </p>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[280px] flex items-center justify-center">
            <div id={qrRegionId} className="w-full"></div>
            
            {error && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <p className="text-xs text-slate-700 font-medium">{error}</p>
                <p className="text-[11px] text-slate-500">
                  Tip: You can still verify this certificate by typing the Certificate ID directly in the search bar.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-brand-surface hover:bg-slate-200 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
