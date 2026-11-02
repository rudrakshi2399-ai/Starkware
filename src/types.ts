export type BillCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'wifi'
  | 'gas'
  | 'groceries'
  | 'maintenance'
  | 'other';

export type SplitMode =
  | 'pro_rata_days'         // purely based on active days in billing cycle
  | 'room_size_weighted'    // days * room sq ft weight (rent)
  | 'electricity_weighted'  // days * (base + AC hours + devices)
  | 'custom_weighted'       // days * custom tenant weight
  | 'equal';                // naive 1/N equal split

export interface Roommate {
  id: string;
  name: string;
  avatarColor: string;
  roomSizeSqFt: number;
  moveInDate: string;        // YYYY-MM-DD
  moveOutDate: string | null; // YYYY-MM-DD or null if currently active
  acHeaterHoursPerDay: number;
  heavyDevicesCount: number;
  upiId?: string;
  phone?: string;
  customWeight: number;      // default 1.0
  notes?: string;
}

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  amount: number;
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  paidById: string;         // Roommate ID who paid
  splitMode: SplitMode;
  excludedRoommateIds?: string[];
  notes?: string;
  createdAt: string;
}

export interface StepMath {
  step: string;
  detail: string;
  formula: string;
}

export interface CalculationShare {
  roommateId: string;
  roommateName: string;
  avatarColor: string;
  daysActive: number;
  totalBillDays: number;
  activeRatio: number;      // daysActive / totalBillDays
  weight: number;           // attribute weight applied
  weightLabel: string;      // e.g. "220 sq ft (Rent)", "10h AC + 3 Devs (Power)"
  effectiveScore: number;   // daysActive * weight
  sharePercentage: number;  // effectiveScore / sum(effectiveScores) * 100
  owedAmount: number;       // rounded
  naiveEqualAmount: number; // what they'd pay in a naive split
  divergenceAmount: number; // owedAmount - naiveEqualAmount (+ = paying more fairly, - = saved by pro-rata)
  plainLanguageExplanation: string;
  stepByStepMath: StepMath[];
}

export interface BillSplitResult {
  billId: string;
  bill: Bill;
  totalBillDays: number;
  totalActiveRoommates: number;
  sumEffectiveScores: number;
  shares: CalculationShare[];
  naiveEqualShare: number;
  fairnessScore: number;     // 0 - 100
  maxDivergence: number;
}

export interface DebtTransaction {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatarColor: string;
  toId: string;
  toName: string;
  toAvatarColor: string;
  amount: number;
  toUpiId?: string;
  status: 'pending' | 'settled';
  settledAt?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export interface HouseSettings {
  houseName: string;
  currency: Currency;
  electricityBaseWeight: number;
  electricityAcWeightPerHour: number;
  electricityDeviceWeight: number;
}
