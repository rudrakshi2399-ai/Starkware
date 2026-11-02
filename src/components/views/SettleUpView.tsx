import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, Smartphone, Share2, Receipt, Users, RotateCcw } from 'lucide-react';
import { DebtTransaction, Roommate } from '../../types';
import { useHouse } from '../../context/HouseContext';
import { formatCurrency } from '../../utils/dateUtils';

interface Props {
  onOpenExport: () => void;
}

export const SettleUpView: React.FC<Props> = ({ onOpenExport }) => {
  const {
    roommates,
    settings,
    settlementData,
    setPayingTransaction,
  } = useHouse();

  const {
    totalHouseSpend,
    totalOwedByRoommate,
    totalPaidByRoommate,
    netBalances,
    simplifiedTransactions,
  } = settlementData;

  const pendingCount = simplifiedTransactions.filter((tx) => tx.status === 'pending').length;
  const settledCount = simplifiedTransactions.filter((tx) => tx.status === 'settled').length;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settle-Up & Debt Simplification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Greedy graph minimization reducing complex roommate webs to minimal peer-to-peer transfers
          </p>
        </div>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export to WhatsApp / Print</span>
        </button>
      </div>

      {/* Settle Status Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total House Volume</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(totalHouseSpend, settings.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All verified invoices</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Required Transfers</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {simplifiedTransactions.length} payments
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Minimized from {roommates.length * (roommates.length - 1)} potential paths
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Settlement Progress</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {settledCount} of {simplifiedTransactions.length} Done
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingCount === 0 ? 'Everything settled! 🎉' : `${pendingCount} pending payment(s)`}
          </div>
        </div>
      </div>

      {/* Minimized Debt Transactions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Minimum Payment Transfers Needed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each debtor pays the optimal creditor directly via UPI
            </p>
          </div>
        </div>

        {simplifiedTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            All roommate balances are exactly ₹0. No transfers required.
          </div>
        ) : (
          <div className="space-y-3">
            {simplifiedTransactions.map((tx) => {
              const isSettled = tx.status === 'settled';

              return (
                <div
                  key={tx.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSettled
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-80'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Sender & Receiver Row */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Debtor */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: tx.fromAvatarColor }}
                      >
                        {tx.fromName.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {tx.fromName}
                        </div>
                        <div className="text-[10px] text-slate-400">Debtor</div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                    {/* Creditor */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: tx.toAvatarColor }}
                      >
                        {tx.toName.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {tx.toName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tx.toUpiId || 'UPI'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="text-left md:text-right">
                      <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(tx.amount, settings.currency.symbol)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {isSettled ? 'Marked as Paid' : 'Pending Transfer'}
                      </div>
                    </div>

                    <div>
                      {isSettled ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPayingTransaction(tx)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Pay via UPI</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flatmate Net Balances Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Overall Flatmate Balance Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2 px-3">Flatmate</th>
                <th className="py-2 px-3 text-right">Total Paid Front</th>
                <th className="py-2 px-3 text-right">Pro-Rata Share Owed</th>
                <th className="py-2 px-3 text-right">Net Settlement Balance</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {roommates.map((r) => {
                const paid = totalPaidByRoommate[r.id] || 0;
                const owed = totalOwedByRoommate[r.id] || 0;
                const net = netBalances[r.id] || 0;
                const isCreditor = net > 1;
                const isDebtor = net < -1;

                return (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: r.avatarColor }}
                      />
                      <span>{r.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCurrency(paid, settings.currency.symbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCurrency(owed, settings.currency.symbol)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                        isCreditor
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isDebtor
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {isCreditor
                        ? `+${formatCurrency(net, settings.currency.symbol)}`
                        : isDebtor
                        ? `-${formatCurrency(Math.abs(net), settings.currency.symbol)}`
                        : `${settings.currency.symbol}0`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {isCreditor ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Gets Refund</span>
                      ) : isDebtor ? (
                        <span className="text-rose-600 dark:text-rose-400">Needs to Pay</span>
                      ) : (
                        <span className="text-slate-400">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
