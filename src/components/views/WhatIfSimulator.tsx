import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Zap, Calendar, Home } from 'lucide-react';
import { Bill, Roommate } from '../../types';
import { useHouse } from '../../context/HouseContext';
import { calculateSettlement } from '../../utils/splitEngine';
import { formatCurrency } from '../../utils/dateUtils';

export const WhatIfSimulator: React.FC = () => {
  const { roommates, bills, settings } = useHouse();

  // Baseline settlement
  const baselineSettlement = calculateSettlement(bills, roommates, settings);

  // Simulation state
  const [simRoommates, setSimRoommates] = useState<Roommate[]>(roommates);
  const [simBills, setSimBills] = useState<Bill[]>(bills);

  // Re-sync when base data changes
  React.useEffect(() => {
    setSimRoommates(roommates);
    setSimBills(bills);
  }, [roommates, bills]);

  // Recalculate simulation in real-time
  const simSettlement = calculateSettlement(simBills, simRoommates, settings);

  const handleReset = () => {
    setSimRoommates(roommates);
    setSimBills(bills);
  };

  const updateSimRoommate = (id: string, updates: Partial<Roommate>) => {
    setSimRoommates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const updateSimBill = (id: string, updates: Partial<Bill>) => {
    setSimBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  // Find Rahul and Kabir for quick preset triggers
  const rahul = simRoommates.find((r) => r.id === 'roommate-2') || simRoommates[1];
  const kabir = simRoommates.find((r) => r.id === 'roommate-3') || simRoommates[2];
  const elecBill = simBills.find((b) => b.category === 'electricity') || simBills[1];

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              What-If Scenario Sandbox
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag move-out dates, appliance usage, or bill totals to observe immediate reactive share shifts
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Actual</span>
        </button>
      </div>

      {/* Simulator Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slider 1: Move-out date of Rahul */}
        {rahul && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {rahul.name} Move-Out Date
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                {rahul.moveOutDate || 'Ongoing'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              What if Rahul stayed longer in November before relocating?
            </p>

            <input
              type="range"
              min="1"
              max="30"
              value={rahul.moveOutDate ? parseInt(rahul.moveOutDate.split('-')[2]) : 30}
              onChange={(e) => {
                const dayNum = String(e.target.value).padStart(2, '0');
                updateSimRoommate(rahul.id, {
                  moveOutDate: `2026-11-${dayNum}`,
                });
              }}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Nov 1 (1 day)</span>
              <span>Nov 14 (Actual)</span>
              <span>Nov 30 (Full Month)</span>
            </div>
          </div>
        )}

        {/* Slider 2: AC Hours of Kabir */}
        {kabir && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {kabir.name} Daily AC Runtime
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {kabir.acHeaterHoursPerDay} hrs / day
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              What if Kabir switched to a shared common area fan and lowered bedroom AC?
            </p>

            <input
              type="range"
              min="0"
              max="24"
              value={kabir.acHeaterHoursPerDay}
              onChange={(e) => {
                updateSimRoommate(kabir.id, {
                  acHeaterHoursPerDay: Number(e.target.value),
                });
              }}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0 hrs (No AC)</span>
              <span>10 hrs (Actual)</span>
              <span>24 hrs (Continuous)</span>
            </div>
          </div>
        )}

        {/* Slider 3: Electricity Bill Total */}
        {elecBill && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Electricity Utility Total
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(elecBill.amount, settings.currency.symbol)}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Simulate summer heatwave electricity tariff spikes
            </p>

            <input
              type="range"
              min="3000"
              max="20000"
              step="500"
              value={elecBill.amount}
              onChange={(e) => {
                updateSimBill(elecBill.id, {
                  amount: Number(e.target.value),
                });
              }}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>{settings.currency.symbol}3,000 (Winter)</span>
              <span>{settings.currency.symbol}7,850 (Actual)</span>
              <span>{settings.currency.symbol}20,000 (Peak Summer)</span>
            </div>
          </div>
        )}

        {/* Slider 4: Master Bedroom Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {simRoommates[0]?.name || 'Priya'} Room Area
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {simRoommates[0]?.roomSizeSqFt || 220} sq ft
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            What if room partition wall was adjusted or rent recalculated with equal rooms?
          </p>

          <input
            type="range"
            min="100"
            max="350"
            step="10"
            value={simRoommates[0]?.roomSizeSqFt || 220}
            onChange={(e) => {
              if (simRoommates[0]) {
                updateSimRoommate(simRoommates[0].id, {
                  roomSizeSqFt: Number(e.target.value),
                });
              }
            }}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>100 sq ft</span>
            <span>220 sq ft (Actual)</span>
            <span>350 sq ft (Suite)</span>
          </div>
        </div>
      </div>

      {/* Reactive Split Impact Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Simulated Financial Impact vs. Actual Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time delta showing how each flatmate's share shifts in this simulated scenario
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            Total Spend: {formatCurrency(simSettlement.totalHouseSpend, settings.currency.symbol)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {simRoommates.map((r) => {
            const actualOwed = baselineSettlement.totalOwedByRoommate[r.id] || 0;
            const simOwed = simSettlement.totalOwedByRoommate[r.id] || 0;
            const delta = simOwed - actualOwed;

            return (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: r.avatarColor }}
                  />
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {r.name}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xs text-slate-400">Simulated Share:</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(simOwed, settings.currency.symbol)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">vs Actual:</span>
                  {delta > 5 ? (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{formatCurrency(delta, settings.currency.symbol)}
                    </span>
                  ) : delta < -5 ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      -{formatCurrency(Math.abs(delta), settings.currency.symbol)}
                    </span>
                  ) : (
                    <span className="text-slate-400">No shift</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
