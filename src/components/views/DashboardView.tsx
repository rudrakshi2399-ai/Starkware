import React from 'react';
import { Plus, ArrowRight, ShieldCheck, Scale, Users, Receipt, Calendar, Sparkles } from 'lucide-react';
import { useHouse } from '../../context/HouseContext';
import { formatCurrency, formatDateShort } from '../../utils/dateUtils';
import { CategoryIcon, getCategoryLabel } from '../CategoryIcon';
import { ExpenseCharts } from '../Charts';
import { TimelineVisualizer } from '../TimelineVisualizer';
import { FairnessCard } from '../FairnessCard';

interface Props {
  onOpenAddBill: () => void;
  onOpenAddRoommate: () => void;
}

export const DashboardView: React.FC<Props> = ({ onOpenAddBill, onOpenAddRoommate }) => {
  const {
    roommates,
    bills,
    settings,
    settlementData,
    setActiveTab,
    setSelectedBillId,
    setPayingTransaction,
  } = useHouse();

  const {
    totalHouseSpend,
    totalOwedByRoommate,
    totalPaidByRoommate,
    netBalances,
    simplifiedTransactions,
    totalUnfairnessAvoided,
    billSplits,
  } = settlementData;

  const pendingTransactions = simplifiedTransactions.filter((tx) => tx.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {settings.houseName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pro-rata billing cycle: November 1 – November 30, 2026 · Dynamic weighted math
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('whatif')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>What-If Sandbox</span>
          </button>
          <button
            onClick={onOpenAddBill}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Total Month Spend</span>
            <Receipt className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(totalHouseSpend, settings.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {bills.length} itemized bills
          </div>
        </div>

        {/* Roommates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Flatmates</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {roommates.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            2 mid-month transitions tracked
          </div>
        </div>

        {/* Unfairness Avoided */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Unfairness Prevented</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalUnfairnessAvoided, settings.currency.symbol)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            vs. naive 1/N equal split
          </div>
        </div>

        {/* Settle Transfers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Pending Settle-Ups</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {pendingTransactions.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Simplified debt transfers
          </div>
        </div>
      </div>

      {/* Mid-Month Event Timeline Preview */}
      <TimelineVisualizer
        roommates={roommates}
        bills={bills}
        monthStart="2026-11-01"
        monthEnd="2026-11-30"
      />

      {/* Charts & Balances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expense Allocation Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ExpenseCharts
            billSplits={billSplits}
            roommates={roommates}
            currencySymbol={settings.currency.symbol}
          />
        </div>

        {/* Flatmate Net Balances Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Flatmate Balances
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paid upfront vs. Fair pro-rata share owed
                </p>
              </div>
              <button
                onClick={() => setActiveTab('settleup')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Settle Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {roommates.map((r) => {
                const paid = totalPaidByRoommate[r.id] || 0;
                const owed = totalOwedByRoommate[r.id] || 0;
                const net = netBalances[r.id] || 0;
                const isCreditor = net > 1;
                const isDebtor = net < -1;

                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: r.avatarColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Paid {formatCurrency(paid, settings.currency.symbol)} · Share {formatCurrency(owed, settings.currency.symbol)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono tabular-nums font-bold text-xs ${
                          isCreditor
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isDebtor
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isCreditor ? `+${formatCurrency(net, settings.currency.symbol)}` : isDebtor ? `-${formatCurrency(Math.abs(net), settings.currency.symbol)}` : 'Settled'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isCreditor ? 'Gets back' : isDebtor ? 'Owes flat' : 'All clear'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick settle-up CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('settleup')}
              className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View {pendingTransactions.length} Instant UPI Settlements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fairness Score Breakdown Card */}
      <FairnessCard
        settlementData={settlementData}
        roommates={roommates}
        currencySymbol={settings.currency.symbol}
      />

      {/* Itemized Bills Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Itemized Expenses ({bills.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any bill to view the transparent "Why You Owe This" calculation card
            </p>
          </div>
          <button
            onClick={() => setActiveTab('bills')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Bills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Bill</th>
                <th className="py-2.5 px-3">Billing Cycle</th>
                <th className="py-2.5 px-3">Fronted By</th>
                <th className="py-2.5 px-3">Weight Engine</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {bills.map((b) => {
                const payer = roommates.find((r) => r.id === b.paidById);
                return (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedBillId(b.id);
                      setActiveTab('breakdown');
                    }}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={b.category} className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {b.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {getCategoryLabel(b.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {formatDateShort(b.startDate)} – {formatDateShort(b.endDate)}
                    </td>
                    <td className="py-3 px-3">
                      {payer ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: payer.avatarColor }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {payer.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">House</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {b.splitMode === 'room_size_weighted'
                          ? 'Days × Room Size'
                          : b.splitMode === 'electricity_weighted'
                          ? 'Days × (AC + Devices)'
                          : b.splitMode === 'equal'
                          ? '1/N Equal'
                          : 'Pro-Rata Days'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.amount, settings.currency.symbol)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Why You Owe →
                      </span>
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
