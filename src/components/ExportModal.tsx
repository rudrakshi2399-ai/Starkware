import React, { useState } from 'react';
import { X, Copy, Check, Printer, Share2, MessageSquare, Download } from 'lucide-react';
import { useHouse } from '../context/HouseContext';
import { formatCurrency, formatDateShort } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settlementData, roommates, bills, settings } = useHouse();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { totalHouseSpend, totalOwedByRoommate, simplifiedTransactions } = settlementData;

  // Format WhatsApp Group Message
  const buildWhatsAppMessage = () => {
    let msg = `🏡 *${settings.houseName.toUpperCase()} - MONTHLY PRO-RATA SETTLEMENT*\n`;
    msg += `📅 Billing Period: November 2026\n`;
    msg += `💰 Total Expenses: ${formatCurrency(totalHouseSpend, settings.currency.symbol)} across ${bills.length} bills\n\n`;

    msg += `👥 *ROOMMATE PRO-RATA SHARES (Day & Weight Adjusted):*\n`;
    roommates.forEach((r) => {
      const owed = totalOwedByRoommate[r.id] || 0;
      const moveOutText = r.moveOutDate ? `(Moved out ${formatDateShort(r.moveOutDate)})` : `(Active)`;
      msg += `• ${r.name} ${moveOutText}: *${formatCurrency(owed, settings.currency.symbol)}*\n`;
    });

    msg += `\n⚡ *MINIMUM TRANSFERS NEEDED (Settle-Up):*\n`;
    if (simplifiedTransactions.length === 0) {
      msg += `All balances are settled! 🎉\n`;
    } else {
      simplifiedTransactions.forEach((tx) => {
        msg += `➡️ *${tx.fromName}* pays *${tx.toName}*: ${formatCurrency(tx.amount, settings.currency.symbol)} (UPI: ${tx.toUpiId || 'N/A'})\n`;
      });
    }

    msg += `\n✨ Split transparently calculated on EquiShare (Zero naive-split disputes).`;
    return msg;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Export & Share Settlement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copy to WhatsApp/Slack group or print high-fidelity receipt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* WhatsApp formatted preview box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp & Group Chat Message Preview</span>
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={buildWhatsAppMessage()}
              rows={9}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 resize-none select-all focus:outline-none"
            />
          </div>

          {/* Settle summary stats */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Total House Spend:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalHouseSpend, settings.currency.symbol)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Transactions to Settle Everything:</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {simplifiedTransactions.length} minimal payments
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
