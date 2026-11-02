import React from 'react';
import { Scale, ShieldCheck, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';
import { Roommate } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { calculateSettlement } from '../utils/splitEngine';

interface Props {
  settlementData: ReturnType<typeof calculateSettlement>;
  roommates: Roommate[];
  currencySymbol: string;
}

export const FairnessCard: React.FC<Props> = ({
  settlementData,
  roommates,
  currencySymbol,
}) => {
  const { totalHouseSpend, totalOwedByRoommate, totalUnfairnessAvoided, billSplits } = settlementData;

  const activeRoommatesCount = roommates.length;
  const naivePerPerson = activeRoommatesCount > 0 ? Math.round(totalHouseSpend / activeRoommatesCount) : 0;

  // Compute divergence per roommate
  const roommateDivergences = roommates.map((r) => {
    const fairOwed = totalOwedByRoommate[r.id] || 0;
    const diff = fairOwed - naivePerPerson; // positive = paying more (undercharged naive), negative = saved (overcharged naive)
    return {
      roommate: r,
      fairOwed,
      naiveOwed: naivePerPerson,
      diff,
      saved: diff < -10,
      more: diff > 10,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Fairness Index & Discrepancy Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measuring the financial distortion of a naive 1/N equal split vs. EquiShare pro-rata
            </p>
          </div>
        </div>

        {/* Total unfair shift avoided */}
        <div className="text-left sm:text-right shrink-0">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
            Unfair Subsidies Prevented
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalUnfairnessAvoided, currencySymbol)}
          </div>
        </div>
      </div>

      {/* Comparative Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {roommateDivergences.map((rd) => (
          <div
            key={rd.roommate.id}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: rd.roommate.avatarColor }}
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {rd.roommate.name}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Fair Pro-Rata:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(rd.fairOwed, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-[11px]">
                <span>Naive Equal Split:</span>
                <span className="font-mono tabular-nums line-through">
                  {formatCurrency(rd.naiveOwed, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Impact tag */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
              {rd.saved ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Saved {formatCurrency(Math.abs(rd.diff), currencySymbol)}</span>
                </div>
              ) : rd.more ? (
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fairly +{formatCurrency(rd.diff, currencySymbol)}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-[11px]">Perfect parity</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Explanatory summary */}
      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Why Naive Splits Break Flatmate Friendships:
          </span>{' '}
          In a standard equal 4-way split of {formatCurrency(totalHouseSpend, currencySymbol)}, each flatmate would blindly pay{' '}
          {formatCurrency(naivePerPerson, currencySymbol)}. That would severely punish Rahul (who moved out on the 14th) by overcharging him by{' '}
          {formatCurrency(Math.abs(roommateDivergences.find((r) => r.roommate.id === 'roommate-2')?.diff || 0), currencySymbol)}, while unfairly subsidizing heavier consumption and larger master bedroom suites.
        </div>
      </div>
    </div>
  );
};
