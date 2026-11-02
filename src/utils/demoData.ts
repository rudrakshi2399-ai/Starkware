import { Bill, HouseSettings, Roommate } from '../types';

export const INITIAL_SETTINGS: HouseSettings = {
  houseName: 'Palm Grove Flat #402, Indiranagar',
  currency: {
    code: 'INR',
    symbol: '₹',
    label: 'Indian Rupee (₹)',
  },
  electricityBaseWeight: 1.0,
  electricityAcWeightPerHour: 0.15,
  electricityDeviceWeight: 0.25,
};

export const DEMO_ROOMMATES: Roommate[] = [
  {
    id: 'roommate-1',
    name: 'Priya Sharma',
    avatarColor: '#6366F1', // Indigo
    roomSizeSqFt: 220,
    moveInDate: '2026-01-01',
    moveOutDate: null,
    acHeaterHoursPerDay: 7,
    heavyDevicesCount: 2,
    upiId: 'priya.sharma@okhdfcbank',
    phone: '+91 98765 43210',
    customWeight: 1.0,
    notes: 'Master Bedroom with attached ensuite balcony',
  },
  {
    id: 'roommate-2',
    name: 'Rahul Verma',
    avatarColor: '#EC4899', // Pink
    roomSizeSqFt: 160,
    moveInDate: '2026-01-01',
    moveOutDate: '2026-11-14', // Left mid-month for overseas relocation
    acHeaterHoursPerDay: 3,
    heavyDevicesCount: 1,
    upiId: 'rahul.verma@paytm',
    phone: '+91 98451 12345',
    customWeight: 1.0,
    notes: 'Moved out Nov 14 (stayed 14 days in cycle)',
  },
  {
    id: 'roommate-3',
    name: 'Kabir Mehta',
    avatarColor: '#10B981', // Emerald
    roomSizeSqFt: 180,
    moveInDate: '2026-11-12', // Moved in on Nov 12 (19 days in cycle)
    moveOutDate: null,
    acHeaterHoursPerDay: 10,
    heavyDevicesCount: 3,
    upiId: 'kabir.tech@axl',
    phone: '+91 97112 34567',
    customWeight: 1.0,
    notes: 'Work-from-home engineer with dual monitor + workstation rig',
  },
  {
    id: 'roommate-4',
    name: 'Ananya Iyer',
    avatarColor: '#F59E0B', // Amber
    roomSizeSqFt: 120,
    moveInDate: '2026-03-01',
    moveOutDate: null,
    acHeaterHoursPerDay: 2,
    heavyDevicesCount: 1,
    upiId: 'ananya.iyer@icici',
    phone: '+91 99001 87654',
    customWeight: 1.0,
    notes: 'Cozy study room, in-office consultant',
  },
];

export const DEMO_BILLS: Bill[] = [
  {
    id: 'bill-1',
    title: 'November Flat Rent',
    category: 'rent',
    amount: 64000,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-1', // Priya paid owner
    splitMode: 'room_size_weighted',
    notes: 'Weighted by private bedroom square footage and active days',
    createdAt: '2026-11-02',
  },
  {
    id: 'bill-2',
    title: 'BESCOM Electricity Bill',
    category: 'electricity',
    amount: 7850,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-3', // Kabir paid power utility
    splitMode: 'electricity_weighted',
    notes: 'Calculated using base load + daily AC runtime + heavy devices',
    createdAt: '2026-11-05',
  },
  {
    id: 'bill-3',
    title: 'ACT Gigabit Fiber Wi-Fi',
    category: 'wifi',
    amount: 1599,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-4', // Ananya paid
    splitMode: 'pro_rata_days',
    notes: '300 Mbps unlimited optical connection, split by active calendar days',
    createdAt: '2026-11-03',
  },
  {
    id: 'bill-4',
    title: 'Cauvery Water Tankers (2 Loads)',
    category: 'water',
    amount: 2400,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-2', // Rahul paid before leaving
    splitMode: 'pro_rata_days',
    notes: 'Borewell emergency water supply replenishment',
    createdAt: '2026-11-08',
  },
  {
    id: 'bill-5',
    title: 'Monthly Common Groceries & Cleaning Supplies',
    category: 'groceries',
    amount: 6500,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-1', // Priya
    splitMode: 'pro_rata_days',
    notes: 'Olive oil, pulses, spices, detergent, trash bags, dish soap',
    createdAt: '2026-11-10',
  },
  {
    id: 'bill-6',
    title: 'Indane Piped Gas Cylinder',
    category: 'gas',
    amount: 920,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    paidById: 'roommate-4', // Ananya
    splitMode: 'pro_rata_days',
    notes: 'Kitchen cooking cylinder connection',
    createdAt: '2026-11-15',
  },
];
