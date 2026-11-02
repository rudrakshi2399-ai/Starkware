import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bill, Currency, DebtTransaction, HouseSettings, Roommate } from '../types';
import { DEMO_BILLS, DEMO_ROOMMATES, INITIAL_SETTINGS } from '../utils/demoData';
import { calculateSettlement } from '../utils/splitEngine';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AU$)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
];

export type ActiveTab =
  | 'pitch'
  | 'dashboard'
  | 'roommates'
  | 'bills'
  | 'breakdown'
  | 'timeline'
  | 'settleup'
  | 'whatif';

interface HouseContextType {
  roommates: Roommate[];
  bills: Bill[];
  settings: HouseSettings;
  settledTxIds: string[];
  activeTab: ActiveTab;
  darkMode: boolean;
  selectedBillId: string | null;
  payingTransaction: DebtTransaction | null;
  // Computed values
  settlementData: ReturnType<typeof calculateSettlement>;
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedBillId: (id: string | null) => void;
  setPayingTransaction: (tx: DebtTransaction | null) => void;
  addRoommate: (roommate: Omit<Roommate, 'id'>) => void;
  updateRoommate: (id: string, updates: Partial<Roommate>) => void;
  deleteRoommate: (id: string) => void;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markTransactionSettled: (txId: string) => void;
  setCurrency: (currency: Currency) => void;
  updateSettings: (updates: Partial<HouseSettings>) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROOMMATES: 'equishare_roommates_v1',
  BILLS: 'equishare_bills_v1',
  SETTINGS: 'equishare_settings_v1',
  SETTLED_TX: 'equishare_settled_tx_v1',
  DARK_MODE: 'equishare_dark_mode_v1',
};

export const HouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active Screen
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [payingTransaction, setPayingTransaction] = useState<DebtTransaction | null>(null);

  // Core Data
  const [roommates, setRoommates] = useState<Roommate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMMATES);
      return saved ? JSON.parse(saved) : DEMO_ROOMMATES;
    } catch {
      return DEMO_ROOMMATES;
    }
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : DEMO_BILLS;
    } catch {
      return DEMO_BILLS;
    }
  });

  const [settings, setSettings] = useState<HouseSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [settledTxIds, setSettledTxIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTLED_TX);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply dark class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
  }, [darkMode]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMMATES, JSON.stringify(roommates));
  }, [roommates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLED_TX, JSON.stringify(settledTxIds));
  }, [settledTxIds]);

  // Derived calculation
  const rawSettlement = calculateSettlement(bills, roommates, settings);
  const settlementData = {
    ...rawSettlement,
    simplifiedTransactions: rawSettlement.simplifiedTransactions.map((tx) => ({
      ...tx,
      status: settledTxIds.includes(tx.id) ? ('settled' as const) : ('pending' as const),
    })),
  };

  const addRoommate = (newR: Omit<Roommate, 'id'>) => {
    const id = `roommate-${Date.now()}`;
    setRoommates((prev) => [...prev, { ...newR, id }]);
  };

  const updateRoommate = (id: string, updates: Partial<Roommate>) => {
    setRoommates((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRoommate = (id: string) => {
    setRoommates((prev) => prev.filter((r) => r.id !== id));
  };

  const addBill = (newB: Omit<Bill, 'id' | 'createdAt'>) => {
    const id = `bill-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    setBills((prev) => [
      {
        ...newB,
        id,
        createdAt,
      },
      ...prev,
    ]);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const markTransactionSettled = (txId: string) => {
    setSettledTxIds((prev) => (prev.includes(txId) ? prev : [...prev, txId]));
  };

  const setCurrency = (currency: Currency) => {
    setSettings((prev) => ({ ...prev, currency }));
  };

  const updateSettings = (updates: Partial<HouseSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const loadDemoData = () => {
    setRoommates(DEMO_ROOMMATES);
    setBills(DEMO_BILLS);
    setSettings(INITIAL_SETTINGS);
    setSettledTxIds([]);
  };

  const resetAllData = () => {
    setRoommates([]);
    setBills([]);
    setSettledTxIds([]);
  };

  return (
    <HouseContext.Provider
      value={{
        roommates,
        bills,
        settings,
        settledTxIds,
        activeTab,
        darkMode,
        selectedBillId,
        payingTransaction,
        settlementData,
        setActiveTab,
        setDarkMode,
        setSelectedBillId,
        setPayingTransaction,
        addRoommate,
        updateRoommate,
        deleteRoommate,
        addBill,
        updateBill,
        deleteBill,
        markTransactionSettled,
        setCurrency,
        updateSettings,
        loadDemoData,
        resetAllData,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
};

export const useHouse = () => {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
};
