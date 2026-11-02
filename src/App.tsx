/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HouseProvider, useHouse } from './context/HouseContext';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { RoommatesView } from './components/views/RoommatesView';
import { BillsView } from './components/views/BillsView';
import { BreakdownView } from './components/views/BreakdownView';
import { TimelineView } from './components/views/TimelineView';
import { SettleUpView } from './components/views/SettleUpView';
import { WhatIfSimulator } from './components/views/WhatIfSimulator';
import { PitchView } from './components/views/PitchView';
import { AddBillModal } from './components/AddBillModal';
import { RoommateModal } from './components/RoommateModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { ExportModal } from './components/ExportModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, payingTransaction, setPayingTransaction, settings } = useHouse();

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddRoommateOpen, setIsAddRoommateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Header
        onOpenAddBill={() => setIsAddBillOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddBill={() => setIsAddBillOpen(true)}
            onOpenAddRoommate={() => setIsAddRoommateOpen(true)}
          />
        )}
        {activeTab === 'roommates' && (
          <RoommatesView onOpenAddRoommate={() => setIsAddRoommateOpen(true)} />
        )}
        {activeTab === 'bills' && (
          <BillsView onOpenAddBill={() => setIsAddBillOpen(true)} />
        )}
        {activeTab === 'breakdown' && <BreakdownView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'settleup' && (
          <SettleUpView onOpenExport={() => setIsExportOpen(true)} />
        )}
        {activeTab === 'whatif' && <WhatIfSimulator />}
        {activeTab === 'pitch' && <PitchView />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">EquiShare</span>
            <span aria-hidden="true">·</span>
            <span>Transparent Pro-Rata Roommate Billing Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('pitch')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Why Pro-Rata Matters
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Export Group Summary
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{settings.currency.label}</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
      />

      <RoommateModal
        isOpen={isAddRoommateOpen}
        onClose={() => setIsAddRoommateOpen(false)}
      />

      <UpiPaymentModal
        transaction={payingTransaction}
        onClose={() => setPayingTransaction(null)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HouseProvider>
      <AppContent />
    </HouseProvider>
  );
}
