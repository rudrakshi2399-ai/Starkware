import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Smartphone, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DebtTransaction } from '../types';
import { useHouse } from '../context/HouseContext';
import { formatCurrency } from '../utils/dateUtils';

interface Props {
  transaction: DebtTransaction | null;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<Props> = ({ transaction, onClose }) => {
  const { markTransactionSettled, settings } = useHouse();
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const upiId = transaction.toUpiId || `${transaction.toName.toLowerCase().replace(/\s+/g, '')}@okaxis`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      markTransactionSettled(transaction.id);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              UPI
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Settle-Up Gateway
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Payment Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Settled Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                NPCI Ref ID: <span className="font-mono text-slate-700 dark:text-slate-300">UPI/2026/9182370192</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Paid to:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{transaction.toName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{transaction.fromName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold">
                <span>Amount Settled:</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(transaction.amount, settings.currency.symbol)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Done & Return to Ledger
            </button>
          </div>
        ) : (
          /* Payment Processing Screen */
          <div className="p-6 space-y-5">
            {/* Beneficiary Card */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Transferring To
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: transaction.toAvatarColor }}
                />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {transaction.toName}
                </span>
              </div>

              <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white my-2">
                {formatCurrency(transaction.amount, settings.currency.symbol)}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                <span>{upiId}</span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* QR Code Graphic Mock */}
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="relative p-2 bg-white rounded-lg shadow-xs">
                {/* Simulated clean QR code matrix */}
                <div className="w-36 h-36 bg-slate-950 p-2 rounded flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-4 border-white rounded-xs p-1">
                      <div className="w-full h-full bg-white" />
                    </div>
                    <div className="w-8 h-8 border-4 border-white rounded-xs p-1">
                      <div className="w-full h-full bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-[9px] font-mono font-bold text-white tracking-widest">
                    EQUISHARE
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-4 border-white rounded-xs p-1">
                      <div className="w-full h-full bg-white" />
                    </div>
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-[10px] text-white">
                      ₹
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                Scan with any UPI app to pay directly
              </span>
            </div>

            {/* App selection buttons */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Payment App
              </span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'gpay', label: 'Google Pay' },
                  { id: 'phonepe', label: 'PhonePe' },
                  { id: 'paytm', label: 'Paytm' },
                  { id: 'bhim', label: 'BHIM UPI' },
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app.id as any)}
                    className={`py-2 px-1 text-center rounded-lg border font-medium text-[11px] transition-all ${
                      selectedApp === app.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {app.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulate button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Authorizing via NPCI Bank Rail...</span>
                </>
              ) : (
                <>
                  <span>Simulate Instant UPI Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero transaction fees · Pro-rata verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
