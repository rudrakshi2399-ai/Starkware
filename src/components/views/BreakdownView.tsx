import React, { useState } from 'react';
import { Calculator, CheckCircle2, Copy, Check, ChevronDown, ChevronUp, Share2, Info, ArrowRight } from 'lucide-react';
import { Bill } from '../../types';
import { useHouse } from '../../context/HouseContext';
import { calculateBillSplit } from '../../utils/splitEngine';
import { formatCurrency, formatDateShort } from '../../utils/dateUtils';
import { CategoryIcon, getCategoryLabel } from '../CategoryIcon';

export const BreakdownView: React.FC = () => {
  const { bills, roommates, settings, selectedBillId, setSelectedBillId } = useHouse();

  const [activeBillId, setActiveBillId] = useState<string>(
    selectedBillId || (bills[0]?.id || '')
  );
  const [expandedRoommateId, setExpandedRoommateId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeBill = bills.find((b) => b.id === activeBillId) || bills[0];

  if (!activeBill) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
        <Calculator className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Bills Recorded</h3>
        <p className="text-xs text-slate-500 mt-1">Add a bill to inspect transparent calculations.</p>
      </div>
    );
  }

  const splitResult = calculateBillSplit(activeBill, roommates, settings);
  const payer = roommates.find((r) => r.id === activeBill.paidById);

  const handleCopyReceipt = (share: typeof splitResult.shares[0]) => {
    let text = `🧾 *EQUISHARE BILL BREAKDOWN: ${activeBill.title}*\n`;
    text += `👤 Flatmate: ${share.roommateName}\n`;
    text += `💰 Total Bill: ${formatCurrency(activeBill.amount, settings.currency.symbol)}\n`;
    text += `📅 Active Days: ${share.daysActive} of ${share.totalBillDays} days\n`;
    text += `⚖️ Weighting: ${share.weightLabel}\n`;
    text += `✨ Owed Share: *${formatCurrency(share.owedAmount, settings.currency.symbol)}* (${share.sharePercentage.toFixed(1)}%)\n\n`;
    text += `📝 Explanation: ${share.plainLanguageExplanation}\n`;

    navigator.clipboard.writeText(text);
    setCopiedId(share.roommateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            "Why You Owe This" Calculation Breakdown
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zero-black-box mathematical transparency for each flatmate on every invoice
          </p>
        </div>
      </div>

      {/* Bill Selector Ribbon */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {bills.map((b) => {
          const isSelected = b.id === activeBill.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                setActiveBillId(b.id);
                setSelectedBillId(b.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <CategoryIcon category={b.category} className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{b.title}</span>
              <span className="font-mono font-semibold text-[11px] text-slate-500 dark:text-slate-400 ml-1">
                {formatCurrency(b.amount, settings.currency.symbol)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Bill Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <CategoryIcon category={activeBill.category} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeBill.title}
                </h2>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {getCategoryLabel(activeBill.category)}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Cycle: {formatDateShort(activeBill.startDate)} – {formatDateShort(activeBill.endDate)} ({splitResult.totalBillDays} days) · Fronted by{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {payer?.name || 'Flatmate'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(activeBill.amount, settings.currency.symbol)}
            </div>
            <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
              Engine:{' '}
              {activeBill.splitMode === 'room_size_weighted'
                ? 'Days × Room Size (sq ft)'
                : activeBill.splitMode === 'electricity_weighted'
                ? 'Days × (AC hours + Devices)'
                : activeBill.splitMode === 'equal'
                ? 'Equal 1/N'
                : 'Pro-Rata Days Stayed'}
            </div>
          </div>
        </div>

        {/* Roommate Plain-Language Breakdown Cards */}
        <div className="mt-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Individual Flatmate Calculation Cards
          </h3>

          <div className="space-y-3">
            {splitResult.shares.map((share) => {
              const isExpanded = expandedRoommateId === share.roommateId;
              const isCopied = copiedId === share.roommateId;

              return (
                <div
                  key={share.roommateId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 overflow-hidden transition-all"
                >
                  {/* Card Main Row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: share.avatarColor }}
                      >
                        {share.roommateName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {share.roommateName}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            ({share.daysActive} of {share.totalBillDays} days active)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {share.plainLanguageExplanation}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700/60">
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(share.owedAmount, settings.currency.symbol)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {share.sharePercentage.toFixed(1)}% share
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyReceipt(share)}
                          title="Copy explanation for WhatsApp"
                          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setExpandedRoommateId(isExpanded ? null : share.roommateId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent rounded-lg transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Math' : 'Verify Math'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Step-by-Step Mathematical Derivation */}
                  {isExpanded && (
                    <div className="px-5 py-4 bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                        <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Step-by-Step Mathematical Derivation</span>
                      </div>

                      <div className="space-y-2">
                        {share.stepByStepMath.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {step.step}: {step.detail}
                              </div>
                            </div>
                            <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
                              {step.formula}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Divergence note */}
                      {share.divergenceAmount !== 0 && (
                        <div className="text-[11px] text-slate-500 pt-1">
                          Naive equal share would have been {formatCurrency(share.naiveEqualAmount, settings.currency.symbol)}. Difference due to pro-rata weighting:{' '}
                          <span className={share.divergenceAmount < 0 ? 'text-emerald-600 font-semibold' : 'text-indigo-600 font-semibold'}>
                            {share.divergenceAmount < 0 ? `Saved ${formatCurrency(Math.abs(share.divergenceAmount), settings.currency.symbol)}` : `+${formatCurrency(share.divergenceAmount, settings.currency.symbol)}`}
                          </span>.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
