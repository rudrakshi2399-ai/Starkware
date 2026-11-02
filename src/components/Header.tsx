import React, { useState } from 'react';
import { Plus, Moon, Sun, RotateCcw, Share2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ActiveTab, SUPPORTED_CURRENCIES, useHouse } from '../context/HouseContext';

interface Props {
  onOpenAddBill: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<Props> = ({ onOpenAddBill, onOpenExport }) => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    setDarkMode,
    settings,
    setCurrency,
    loadDemoData,
  } = useHouse();

  const [currencyOpen, setCurrencyOpen] = useState(false);

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roommates', label: 'Roommates' },
    { id: 'bills', label: 'Bills' },
    { id: 'breakdown', label: 'Why You Owe' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'settleup', label: 'Settle Up' },
    { id: 'whatif', label: 'What-If Lab' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="group flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                E
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                EquiShare
              </span>
            </button>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 dark:text-slate-500">
              pro-rata engine
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Demo Data Button */}
            <button
              onClick={loadDemoData}
              title="Reload sample flatmates and mid-month bills"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Demo Flat</span>
            </button>

            {/* Currency Picker */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                title="Change currency"
              >
                {settings.currency.symbol} {settings.currency.code}
              </button>

              {currencyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 text-xs">
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr);
                          setCurrencyOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                          settings.currency.code === curr.code
                            ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{curr.label}</span>
                        <span className="font-mono">{curr.symbol}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle theme"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Share / Export Summary */}
            <button
              onClick={onOpenExport}
              title="Share or Export Roommate Summary"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Primary Action: Add Bill */}
            <button
              onClick={onOpenAddBill}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bill</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto pb-2 gap-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/60 pt-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
