import React from 'react';
import { Calendar, UserCheck, UserX, Clock, ArrowRight, Info } from 'lucide-react';
import { useHouse } from '../../context/HouseContext';
import { formatDateShort } from '../../utils/dateUtils';
import { TimelineVisualizer } from '../TimelineVisualizer';

export const TimelineView: React.FC = () => {
  const { roommates, bills } = useHouse();

  const events = [
    {
      date: '2026-11-01',
      type: 'cycle_start',
      title: 'November Billing Cycle Starts',
      description: 'Billing cycle open for all flat expenses. 3 active tenants in residence (Priya, Rahul, Ananya).',
    },
    {
      date: '2026-11-12',
      type: 'move_in',
      title: 'Kabir Mehta Moves In',
      description: 'Kabir joins Flat #402 occupying Bedroom 3 (180 sq ft). Commences pro-rata share from day 12.',
    },
    {
      date: '2026-11-14',
      type: 'move_out',
      title: 'Rahul Verma Relocates to London',
      description: 'Rahul officially vacates room on day 14. EquiShare pro-rates all rent and utilities to exactly 14 days.',
    },
    {
      date: '2026-11-30',
      type: 'cycle_end',
      title: 'Billing Cycle Closes & Final Settle-Up',
      description: 'November ledger closes. All 6 utility and rent invoices calculated with zero dispute.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mid-Month Event Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual day-by-day co-living calendar tracking arrivals, departures, and tenancy transitions
          </p>
        </div>
      </div>

      {/* Main Interactive Timeline */}
      <TimelineVisualizer
        roommates={roommates}
        bills={bills}
        monthStart="2026-11-01"
        monthEnd="2026-11-30"
      />

      {/* Mid-Month Transitions Chronology */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          November Tenancy Event Log
        </h3>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {events.map((evt, idx) => (
            <div key={idx} className="relative pl-8">
              <span
                className={`absolute left-2.5 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                  evt.type === 'move_in'
                    ? 'bg-emerald-500'
                    : evt.type === 'move_out'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
                }`}
              />

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {evt.title}
                  </span>
                  <span className="font-mono text-slate-500 font-medium">
                    {formatDateShort(evt.date)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {evt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
