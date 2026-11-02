import React, { useState } from 'react';
import { Calendar, UserCheck, UserX, ArrowRight, Info } from 'lucide-react';
import { Bill, Roommate } from '../types';
import { formatDateShort, formatToISO, getDaysInclusive, parseLocalDate } from '../utils/dateUtils';
import { getCategoryColor } from './CategoryIcon';

interface Props {
  roommates: Roommate[];
  bills: Bill[];
  monthStart?: string; // default '2026-11-01'
  monthEnd?: string;   // default '2026-11-30'
}

export const TimelineVisualizer: React.FC<Props> = ({
  roommates,
  bills,
  monthStart = '2026-11-01',
  monthEnd = '2026-11-30',
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Generate day array
  const totalDays = getDaysInclusive(monthStart, monthEnd);
  const startDate = parseLocalDate(monthStart);

  const daysList = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const dayNum = d.getUTCDate();
    const isoString = d.toISOString().split('T')[0];
    const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    return {
      index: i + 1,
      dayNum,
      isoString,
      isWeekend,
    };
  });

  // Calculate each roommate's presence per day
  const roommatePresences = roommates.map((r) => {
    const moveIn = parseLocalDate(r.moveInDate);
    const moveOut = r.moveOutDate ? parseLocalDate(r.moveOutDate) : null;

    const presenceDays = daysList.map((day) => {
      const curDate = parseLocalDate(day.isoString);
      const isPresent = curDate >= moveIn && (!moveOut || curDate <= moveOut);
      const isMoveInDay = curDate.getTime() === moveIn.getTime();
      const isMoveOutDay = moveOut && curDate.getTime() === moveOut.getTime();

      return {
        ...day,
        isPresent,
        isMoveInDay,
        isMoveOutDay,
      };
    });

    const activeCount = presenceDays.filter((p) => p.isPresent).length;

    return {
      roommate: r,
      presenceDays,
      activeCount,
    };
  });

  // Daily head-count
  const dailyHeadCounts = daysList.map((day, idx) => {
    const count = roommatePresences.filter((rp) => rp.presenceDays[idx].isPresent).length;
    return {
      day,
      count,
    };
  });

  const selectedDayInfo = hoveredDay !== null ? daysList[hoveredDay - 1] : null;
  const activeTenantsOnHover = hoveredDay !== null
    ? roommatePresences.filter((rp) => rp.presenceDays[hoveredDay - 1].isPresent).map((rp) => rp.roommate)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Mid-Month Event & Residency Timeline
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatDateShort(monthStart)} – {formatDateShort(monthEnd)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Day-accurate occupancy tracking showing tenant move-ins, move-outs, and overlap windows
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
            <span>Active Residence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-700" />
            <span>Vacant / Inactive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950" />
            <span>Move In/Out</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid Container with horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[760px]">
          {/* Day Numbers Header */}
          <div className="grid grid-cols-[180px_repeat(30,1fr)] gap-1 mb-2 items-center text-[10px] font-mono text-slate-500">
            <span className="font-sans font-medium text-xs text-slate-700 dark:text-slate-300">
              Calendar Day
            </span>
            {daysList.map((day) => (
              <div
                key={day.index}
                onMouseEnter={() => setHoveredDay(day.index)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`text-center py-1 rounded cursor-pointer transition-colors ${
                  hoveredDay === day.index
                    ? 'bg-indigo-600 text-white font-bold'
                    : day.isWeekend
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {day.dayNum}
              </div>
            ))}
          </div>

          {/* Roommate Rows */}
          <div className="space-y-2">
            {roommatePresences.map((rp) => (
              <div
                key={rp.roommate.id}
                className="grid grid-cols-[180px_repeat(30,1fr)] gap-1 items-center"
              >
                {/* Roommate Title Cell */}
                <div className="flex items-center justify-between pr-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: rp.roommate.avatarColor }}
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {rp.roommate.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {rp.activeCount}d
                  </span>
                </div>

                {/* 30 Day Cells */}
                {rp.presenceDays.map((pDay) => {
                  const isHovered = hoveredDay === pDay.index;

                  return (
                    <div
                      key={pDay.index}
                      onMouseEnter={() => setHoveredDay(pDay.index)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${rp.roommate.name}: ${pDay.isPresent ? 'Active' : 'Not living in house'} on ${pDay.isoString}`}
                      className={`h-7 rounded flex items-center justify-center transition-all cursor-pointer relative ${
                        pDay.isPresent
                          ? 'opacity-90 hover:opacity-100'
                          : 'bg-slate-100 dark:bg-slate-800/50 opacity-40 hover:opacity-60'
                      } ${isHovered ? 'ring-2 ring-slate-900 dark:ring-white scale-105 z-10' : ''}`}
                      style={{
                        backgroundColor: pDay.isPresent ? rp.roommate.avatarColor : undefined,
                      }}
                    >
                      {pDay.isMoveInDay && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-emerald-500 shadow-xs"
                          title="Move In Date"
                        />
                      )}
                      {pDay.isMoveOutDay && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-rose-500 shadow-xs"
                          title="Move Out Date"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Co-living Density Strip */}
          <div className="grid grid-cols-[180px_repeat(30,1fr)] gap-1 items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Co-Living Density
            </div>
            {dailyHeadCounts.map((dh) => (
              <div
                key={dh.day.index}
                className={`text-center py-0.5 rounded text-[10px] font-mono font-medium ${
                  dh.count === roommates.length
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {dh.count}p
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Callout Info Bar */}
      {selectedDayInfo && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDateShort(selectedDayInfo.isoString)}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              {activeTenantsOnHover.length} of {roommates.length} roommates in house
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTenantsOnHover.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: r.avatarColor }}
                />
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
