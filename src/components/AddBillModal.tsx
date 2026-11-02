import React, { useState } from 'react';
import { X, Calendar, DollarSign, Calculator, Users, Info } from 'lucide-react';
import { Bill, BillCategory, SplitMode } from '../types';
import { useHouse } from '../context/HouseContext';
import { calculateBillSplit } from '../utils/splitEngine';
import { formatCurrency, getDaysInclusive } from '../utils/dateUtils';
import { CategoryIcon, getCategoryLabel } from './CategoryIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editBill?: Bill | null;
}

const CATEGORIES: BillCategory[] = [
  'rent',
  'electricity',
  'wifi',
  'water',
  'groceries',
  'gas',
  'maintenance',
  'other',
];

export const AddBillModal: React.FC<Props> = ({ isOpen, onClose, editBill }) => {
  const { roommates, settings, addBill, updateBill } = useHouse();

  const [title, setTitle] = useState(editBill?.title || '');
  const [category, setCategory] = useState<BillCategory>(editBill?.category || 'electricity');
  const [amount, setAmount] = useState<string>(editBill ? String(editBill.amount) : '4500');
  const [startDate, setStartDate] = useState(editBill?.startDate || '2026-11-01');
  const [endDate, setEndDate] = useState(editBill?.endDate || '2026-11-30');
  const [paidById, setPaidById] = useState(editBill?.paidById || (roommates[0]?.id || ''));
  const [splitMode, setSplitMode] = useState<SplitMode>(
    editBill?.splitMode || (category === 'rent' ? 'room_size_weighted' : category === 'electricity' ? 'electricity_weighted' : 'pro_rata_days')
  );
  const [excludedIds, setExcludedIds] = useState<string[]>(editBill?.excludedRoommateIds || []);
  const [notes, setNotes] = useState(editBill?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Change default split mode when category changes
  const handleCategorySelect = (cat: BillCategory) => {
    setCategory(cat);
    if (!editBill) {
      if (cat === 'rent') {
        setSplitMode('room_size_weighted');
        if (!title || title.includes('Bill') || title.includes('Rent')) setTitle('Monthly Rent');
      } else if (cat === 'electricity') {
        setSplitMode('electricity_weighted');
        if (!title || title.includes('Rent')) setTitle('Electricity Bill');
      } else {
        setSplitMode('pro_rata_days');
        if (!title) setTitle(getCategoryLabel(cat));
      }
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const totalDays = getDaysInclusive(startDate, endDate);

  // Live preview calculation
  const mockBill: Bill = {
    id: editBill?.id || 'preview',
    title: title || 'New Bill',
    category,
    amount: parsedAmount,
    startDate,
    endDate,
    paidById,
    splitMode,
    excludedRoommateIds: excludedIds,
    createdAt: '2026-11-01',
  };

  const previewSplit = calculateBillSplit(mockBill, roommates, settings);

  const toggleExclude = (rId: string) => {
    setExcludedIds((prev) =>
      prev.includes(rId) ? prev.filter((id) => id !== rId) : [...prev, rId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the bill.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Bill amount must be greater than zero.');
      return;
    }
    if (totalDays <= 0) {
      setError('End date must be on or after start date.');
      return;
    }
    if (!paidById) {
      setError('Please select who fronted/paid this bill.');
      return;
    }

    if (editBill) {
      updateBill(editBill.id, {
        title: title.trim(),
        category,
        amount: parsedAmount,
        startDate,
        endDate,
        paidById,
        splitMode,
        excludedRoommateIds: excludedIds,
        notes: notes.trim(),
      });
    } else {
      addBill({
        title: title.trim(),
        category,
        amount: parsedAmount,
        startDate,
        endDate,
        paidById,
        splitMode,
        excludedRoommateIds: excludedIds,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editBill ? 'Edit Bill' : 'Add New House Bill'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify billing dates, fronting flatmate, and weighting engine
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

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Bill Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs font-medium ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <CategoryIcon category={cat} className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span className="truncate">{getCategoryLabel(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bill Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. November BESCOM Electricity"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Amount ({settings.currency.symbol})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Billing Period Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Period Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Period End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono -mt-2">
            Duration: {totalDays} inclusive calendar days
          </div>

          {/* Who Paid & Split Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Paid In Advance By
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Split Weighting Algorithm
              </label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as SplitMode)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pro_rata_days">Days Active in Cycle (Equal daily rate)</option>
                <option value="room_size_weighted">Room Area Weighted (Days × sq ft - for rent)</option>
                <option value="electricity_weighted">Electricity Weighted (Days × AC hours + Devices)</option>
                <option value="custom_weighted">Custom Multiplier Weighted</option>
                <option value="equal">Naive Equal Split (1/N)</option>
              </select>
            </div>
          </div>

          {/* Exclude Roommates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Roommate Participation (Uncheck to exclude)
            </label>
            <div className="flex flex-wrap gap-2">
              {roommates.map((r) => {
                const isExcluded = excludedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleExclude(r.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                      !isExcluded
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 font-medium'
                        : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 line-through'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: r.avatarColor }}
                    />
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Calculation Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-2">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                Live Split Preview
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {previewSplit.totalActiveRoommates} active tenants
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {previewSplit.shares.map((share) => (
                <div
                  key={share.roommateId}
                  className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {share.roommateName}
                  </div>
                  <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {formatCurrency(share.owedAmount, settings.currency.symbol)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {share.daysActive}d ({share.sharePercentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
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
              {editBill ? 'Save Changes' : 'Add Bill to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
