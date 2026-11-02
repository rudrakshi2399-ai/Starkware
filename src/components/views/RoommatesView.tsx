import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Home, Zap, Calendar, UserCheck, Smartphone } from 'lucide-react';
import { Roommate } from '../../types';
import { useHouse } from '../../context/HouseContext';
import { formatDateShort } from '../../utils/dateUtils';
import { RoommateModal } from '../RoommateModal';

interface Props {
  onOpenAddRoommate: () => void;
}

export const RoommatesView: React.FC<Props> = ({ onOpenAddRoommate }) => {
  const { roommates, deleteRoommate } = useHouse();
  const [editingRoommate, setEditingRoommate] = useState<Roommate | null>(null);

  const totalSqFt = roommates.reduce((sum, r) => sum + r.roomSizeSqFt, 0);
  const totalAcHours = roommates.reduce((sum, r) => sum + r.acHeaterHoursPerDay, 0);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            House & Flatmates Setup
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure private room sizes, residency schedules, and appliance consumption weights
          </p>
        </div>

        <button
          onClick={onOpenAddRoommate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Flatmate</span>
        </button>
      </div>

      {/* House Space Proportion Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Room Size Floor Distribution
            </span>
            <span className="text-slate-400 ml-2">Total private area: {totalSqFt} sq ft</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {roommates.length} bedrooms
          </span>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {roommates.map((r) => {
            const pct = totalSqFt > 0 ? (r.roomSizeSqFt / totalSqFt) * 100 : 0;
            return (
              <div
                key={r.id}
                title={`${r.name}: ${r.roomSizeSqFt} sq ft (${pct.toFixed(1)}%)`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: r.avatarColor,
                }}
                className="h-full transition-all duration-300 hover:opacity-90"
              />
            );
          })}
        </div>

        {/* Small legend below bar */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
          {roommates.map((r) => {
            const pct = totalSqFt > 0 ? (r.roomSizeSqFt / totalSqFt) * 100 : 0;
            return (
              <div key={r.id} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: r.avatarColor }}
                />
                <span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span>
                <span className="font-mono text-[11px]">
                  {r.roomSizeSqFt} sq ft ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roommate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roommates.map((r) => {
          const isMidMonthMoveOut = !!r.moveOutDate;
          const isMidMonthMoveIn = r.moveInDate.startsWith('2026-11') && !r.moveInDate.endsWith('-01');

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between relative group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: r.avatarColor }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {r.notes || 'Flatmate'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingRoommate(r)}
                      title="Edit flatmate"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {roommates.length > 2 && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${r.name} from the house?`)) {
                            deleteRoommate(r.id);
                          }
                        }}
                        title="Remove flatmate"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  {isMidMonthMoveOut ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-mono font-medium border border-rose-200 dark:border-rose-900">
                      Moved out: {formatDateShort(r.moveOutDate!)}
                    </span>
                  ) : isMidMonthMoveIn ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono font-medium border border-emerald-200 dark:border-emerald-900">
                      Moved in: {formatDateShort(r.moveInDate)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                      Full-Cycle Resident
                    </span>
                  )}
                  {r.upiId && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                      UPI: {r.upiId}
                    </span>
                  )}
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Home className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Room Area</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {r.roomSizeSqFt} sq ft
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Daily AC Runtime</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {r.acHeaterHoursPerDay} hrs / day
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Smartphone className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Heavy Devices</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {r.heavyDevicesCount} units
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Move-in Date</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatDateShort(r.moveInDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingRoommate && (
        <RoommateModal
          isOpen={true}
          onClose={() => setEditingRoommate(null)}
          editRoommate={editingRoommate}
        />
      )}
    </div>
  );
};
