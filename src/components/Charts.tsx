import React, { useState } from 'react';
import { BillCategory, BillSplitResult, Roommate } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { getCategoryColor, getCategoryLabel } from './CategoryIcon';

interface DonutProps {
  billSplits: BillSplitResult[];
  roommates: Roommate[];
  currencySymbol: string;
}

export const ExpenseCharts: React.FC<DonutProps> = ({ billSplits, roommates, currencySymbol }) => {
  const [viewMode, setViewMode] = useState<'roommate' | 'category'>('roommate');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalAmount = billSplits.reduce((acc, b) => acc + b.bill.amount, 0);

  // Group by Roommate
  const roommateData: { id: string; name: string; color: string; amount: number; percentage: number }[] =
    roommates.map((r) => {
      let rOwed = 0;
      billSplits.forEach((split) => {
        const share = split.shares.find((s) => s.roommateId === r.id);
        if (share) rOwed += share.owedAmount;
      });
      return {
        id: r.id,
        name: r.name,
        color: r.avatarColor,
        amount: rOwed,
        percentage: totalAmount > 0 ? (rOwed / totalAmount) * 100 : 0,
      };
    }).filter((r) => r.amount > 0);

  // Group by Category
  const categoryMap = new Map<BillCategory, number>();
  billSplits.forEach((split) => {
    const prev = categoryMap.get(split.bill.category) || 0;
    categoryMap.set(split.bill.category, prev + split.bill.amount);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([cat, amt]) => ({
    id: cat,
    name: getCategoryLabel(cat),
    color: getCategoryColor(cat),
    amount: amt,
    percentage: totalAmount > 0 ? (amt / totalAmount) * 100 : 0,
  }));

  const activeData = viewMode === 'roommate' ? roommateData : categoryData;

  // SVG Donut Path Builder
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const segments = activeData.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle;
    cumulativeAngle += (item.percentage / 100) * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      index: idx,
    };
  });

  const hoveredItem = hoveredIndex !== null ? activeData[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Expense Allocation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pro-rata breakdown across {roommates.length} flatmates
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setViewMode('roommate')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'roommate'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            By Person
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'category'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            By Bill Type
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Donut */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[220px] h-[220px]">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Segments */}
              {segments.map((seg) => (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={hoveredIndex === seg.index ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer origin-center"
                  onMouseEnter={() => setHoveredIndex(seg.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Center Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {hoveredItem ? (
                <>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {hoveredItem.name}
                  </span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(hoveredItem.amount, currencySymbol)}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {hoveredItem.percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                    Total House Spend
                  </span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(totalAmount, currencySymbol)}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {billSplits.length} bills
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="md:col-span-6 space-y-2.5">
          {activeData.map((item, idx) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                hoveredIndex === idx
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'
                  : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, currencySymbol)}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
