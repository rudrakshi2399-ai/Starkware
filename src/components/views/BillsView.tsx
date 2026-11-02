import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowRight, Filter, Receipt } from 'lucide-react';
import { Bill, BillCategory } from '../../types';
import { useHouse } from '../../context/HouseContext';
import { formatCurrency, formatDateShort, getDaysInclusive } from '../../utils/dateUtils';
import { CategoryIcon, getCategoryLabel } from '../CategoryIcon';
import { AddBillModal } from '../AddBillModal';

interface Props {
  onOpenAddBill: () => void;
}

export const BillsView: React.FC<Props> = ({ onOpenAddBill }) => {
  const { bills, roommates, settings, deleteBill, setSelectedBillId, setActiveTab } = useHouse();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalFilteredAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            House Bills & Itemized Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every invoice pro-rated by active dates, private room areas, and appliance runtimes
          </p>
        </div>

        <button
          onClick={onOpenAddBill}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills by name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="wifi">Wi-Fi</option>
            <option value="water">Water</option>
            <option value="groceries">Groceries</option>
            <option value="gas">Gas</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 pl-2">
            Total: {formatCurrency(totalFilteredAmount, settings.currency.symbol)}
          </span>
        </div>
      </div>

      {/* Bills Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map((b) => {
          const payer = roommates.find((r) => r.id === b.paidById);
          const duration = getDaysInclusive(b.startDate, b.endDate);

          return (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Top category & actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      <CategoryIcon category={b.category} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        {getCategoryLabel(b.category)}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {b.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingBill(b)}
                      title="Edit bill"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${b.title}?`)) {
                          deleteBill(b.id);
                        }
                      }}
                      title="Delete bill"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount display */}
                <div className="my-3">
                  <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(b.amount, settings.currency.symbol)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatDateShort(b.startDate)} – {formatDateShort(b.endDate)} ({duration} days)
                  </div>
                </div>

                {/* Key metadata */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Fronted by:</span>
                    {payer ? (
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: payer.avatarColor }}
                        />
                        <span>{payer.name}</span>
                      </div>
                    ) : (
                      <span>Unassigned</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Engine:</span>
                    <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {b.splitMode === 'room_size_weighted'
                        ? 'Room Size × Days'
                        : b.splitMode === 'electricity_weighted'
                        ? 'Appliance Load × Days'
                        : b.splitMode === 'equal'
                        ? '1/N Equal'
                        : 'Active Days Pro-Rata'}
                    </span>
                  </div>

                  {b.excludedRoommateIds && b.excludedRoommateIds.length > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-amber-600 dark:text-amber-400">
                      <span>Excluded:</span>
                      <span>{b.excludedRoommateIds.length} flatmate(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View breakdown CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedBillId(b.id);
                    setActiveTab('breakdown');
                  }}
                  className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>"Why You Owe This" Math Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingBill && (
        <AddBillModal
          isOpen={true}
          onClose={() => setEditingBill(null)}
          editBill={editingBill}
        />
      )}
    </div>
  );
};
