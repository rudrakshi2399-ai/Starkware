import React, { useState } from 'react';
import { X, User, Home, Zap, Phone, Sparkles } from 'lucide-react';
import { Roommate } from '../types';
import { useHouse } from '../context/HouseContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editRoommate?: Roommate | null;
}

const COLOR_PRESETS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#3B82F6', // Blue
];

export const RoommateModal: React.FC<Props> = ({ isOpen, onClose, editRoommate }) => {
  const { addRoommate, updateRoommate } = useHouse();

  const [name, setName] = useState(editRoommate?.name || '');
  const [avatarColor, setAvatarColor] = useState(editRoommate?.avatarColor || COLOR_PRESETS[0]);
  const [roomSizeSqFt, setRoomSizeSqFt] = useState<number>(editRoommate?.roomSizeSqFt || 160);
  const [moveInDate, setMoveInDate] = useState(editRoommate?.moveInDate || '2026-11-01');
  const [isOngoing, setIsOngoing] = useState(editRoommate ? !editRoommate.moveOutDate : true);
  const [moveOutDate, setMoveOutDate] = useState(editRoommate?.moveOutDate || '2026-11-15');
  const [acHours, setAcHours] = useState<number>(editRoommate?.acHeaterHoursPerDay || 4);
  const [heavyDevices, setHeavyDevices] = useState<number>(editRoommate?.heavyDevicesCount || 1);
  const [upiId, setUpiId] = useState(editRoommate?.upiId || '');
  const [phone, setPhone] = useState(editRoommate?.phone || '');
  const [notes, setNotes] = useState(editRoommate?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Roommate name is required.');
      return;
    }
    if (!moveInDate) {
      setError('Move-in date is required.');
      return;
    }
    if (!isOngoing && !moveOutDate) {
      setError('Please provide a move-out date.');
      return;
    }

    const payload = {
      name: name.trim(),
      avatarColor,
      roomSizeSqFt,
      moveInDate,
      moveOutDate: isOngoing ? null : moveOutDate,
      acHeaterHoursPerDay: acHours,
      heavyDevicesCount: heavyDevices,
      upiId: upiId.trim() || undefined,
      phone: phone.trim() || undefined,
      customWeight: 1.0,
      notes: notes.trim() || undefined,
    };

    if (editRoommate) {
      updateRoommate(editRoommate.id, payload);
    } else {
      addRoommate(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editRoommate ? 'Edit Flatmate Profile' : 'Add New Flatmate'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Room dimensions, move-in/out schedule, and consumption habits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
              {error}
            </div>
          )}

          {/* Name & Avatar Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kabir Mehta"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tag Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      avatarColor === color ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Move-in & Move-out dates */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Move-out Date
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOngoing}
                      onChange={(e) => setIsOngoing(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active Tenant</span>
                  </label>
                </div>

                {!isOngoing ? (
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                ) : (
                  <div className="w-full px-3 py-1.5 text-xs rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic">
                    Currently living in apartment
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bills covering dates outside this period will automatically calculate {name || 'this roommate'}'s share as ₹0.
            </p>
          </div>

          {/* Room Area & AC usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Private Bedroom Area
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {roomSizeSqFt} sq ft
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="350"
                step="10"
                value={roomSizeSqFt}
                onChange={(e) => setRoomSizeSqFt(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400">
                Used to pro-rate rent share proportionally
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Daily AC / Heater Usage
                </label>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {acHours} hrs / day
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={acHours}
                onChange={(e) => setAcHours(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                Weights electricity bills fairly for power users
              </span>
            </div>
          </div>

          {/* Heavy Appliances & Payment Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Heavy Devices Count
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={heavyDevices}
                onChange={(e) => setHeavyDevices(Number(e.target.value))}
                placeholder="Gaming PC, mini-fridge, etc."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Workstations, secondary fridges, blow dryers
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                UPI ID / Payment Handle
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. priya@okhdfcbank"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                For 1-click settlement QR generation
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Room Description / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bedroom with attached ensuite balcony"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm transition-colors"
            >
              {editRoommate ? 'Update Flatmate' : 'Add to Flat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
